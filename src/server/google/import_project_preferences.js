// Load local modules.
import * as dataType from '@/src/common/data_type';
import * as googleAuth from '@/src/server/google/auth';
import * as googleSheet from '@/src/server/google/sheet';
import knex from '@/src/server/knex';
import AttendeeModel from '@/src/server/model/attendee';
import JotformPreferenceModel from '@/src/server/model/jotform_preference';
import JotformAttributeTransformationModel from '@/src/server/model/jotform_attribute_transformation';
import JorformUnresolvedPreferenceModel from '@/src/server/model/jotform_unresolved_preference';

// Load npm modules.
import Promise from 'bluebird';

// Declare the creation procedure for a single unresolved preference.
const createUnresolvedPreference = (unresolvedPreferenceAttributes, projectKey) => {
	// Initialize a transtaction.
	return knex.instance.transaction((trx) => {
		// Create an unresolved preference entity.
		return JorformUnresolvedPreferenceModel.create({
			project_key: projectKey,
			attributes: unresolvedPreferenceAttributes,
		}, {
			transaction: trx,
		})
			.then((createdUnresolvedPreferenceDocument) => {
				// Add a record to the jotform preferences.
				return JotformPreferenceModel.create({
					jotform_id: createdUnresolvedPreferenceDocument.attributes.jotform_id,
					project_key: projectKey,
				}, {
					transaction: trx,
				});
			});
	});
};

// Declare the update procedure for a single attendee.
const updateAttendee = (attendeeDocument, projectKey) => {
	// Initialize a transtaction.
	return knex.instance.transaction((trx) => {
		// Create an unresolved preference entity.
		return AttendeeModel.save(attendeeDocument, {
			transaction: trx,
		})
			.then((savedAttendeeDocument) => {
				// Add a record to the jotform preferences.
				return JotformPreferenceModel.create({
					jotform_id: savedAttendeeDocument.attributes.jotform_id,
					project_key: projectKey,
				}, {
					transaction: trx,
				});
			});
	});
};


// Declare the import procedure for a single project.
export default (projectDocument) => {
	// Define the required project attributes.
	const requiredAttributes = [
		'jotform_export_google_spreadsheet_id',
		'jotform_export_google_spreadsheet_range',
		'is_active',
	];

	// Verify the the project document contains each of the required attributes.
	requiredAttributes.forEach((requiredAttribute) => {
		if (!projectDocument.attributes[requiredAttribute]) {
			throw new Error(
				`The project '${projectDocument.name}' is missing the '${requiredAttribute}' attribute`);
		}
	});

	// Stop execution if the active project is not active.
	if (projectDocument.attributes.is_active === 'TRUE') {
		return Promise.resolve(null);
	}

	// Declare a variable for the raw preferences.
	const rawPreferences = [];
	const processedPreferences = [];

	// Initialize google auth client.
	return googleAuth.createClient()
		.then((googleAuthClient) => {
			// Set authentication client for the google sheet module.
			googleSheet.setAuth(googleAuthClient);

			// Execute parallel operation.
			return Promise.all([
				// Load data from the preferences sheet.
				googleSheet.getValues(
					projectDocument.attributes.jotform_export_google_spreadsheet_id,
					projectDocument.attributes.jotform_export_google_spreadsheet_range,
				),
				// Retrieve the jotform preferences that were already imported for the given project.
				JotformPreferenceModel.find({
					project_key: projectDocument.key,
				}),
			]);
		})
		.then((result) => {
			// Transform the jotform response into a map of raw preferences.
			const rawPreferenceAttributeNames = result[0][0];
			const rawPreferencesMap = {};
			for (let i = 1, length = result[0].length; i < length; ++i) {
				const rawPreferencesRow = result[0][i];

				const rawPreferenceAttributes = {};
				for (let j = 0; j < rawPreferenceAttributeNames.length; ++j) {
					rawPreferenceAttributes[rawPreferenceAttributeNames[j]] = rawPreferencesRow[j];
				}

				rawPreferencesMap[rawPreferenceAttributes['Submission ID']] = rawPreferenceAttributes;
			}

			// Transform the jotform preferences into a map of jotform ids.
			const jotformIdsMap = result[1].reduce((hash, jotformPreferenceDocument) => {
				hash[jotformPreferenceDocument.jotform_id] = null;
				return hash;
			}, {});

			// Fill the raw preferences array.
			dataType.object.forEach(rawPreferencesMap, (retrievedJotformId, retrievedPreferenceAttributes) => {
				if (!(retrievedJotformId in jotformIdsMap)) {
					rawPreferences.push(retrievedPreferenceAttributes);
				}
			});

			// Find all jotform transformation rules for the given project.
			return JotformAttributeTransformationModel.find({
				project_key: projectDocument.key,
			});
		})
		.then((transformationRules) => {
			rawPreferences.forEach((rawPreference) => {
				// Instantiate and fill preference attributes by applying the transformation rules.
				const attributes = {};
				dataType.object.forEach(rawPreference, (rawName, rawValue) => {
					// Apply every transformation rule on the given raw name and value pair.
					transformationRules.forEach((transformationRule) => {
						// Only apply the rule if the raw name matches.
						if (rawName === transformationRule.raw_name) {
							// Only transform the raw value if the rule defines it.
							if (transformationRule.raw_value === null) {
								attributes[transformationRule.name] = rawValue;
							} else if (transformationRule.raw_value === rawValue) {
								attributes[transformationRule.name] = transformationRule.value || '';
							}
						}
					});
				});

				// Store processed preference attributes.
				processedPreferences.push(attributes);
			});

			// Retrieve all attendees for the given project.
			return AttendeeModel.find({
				project_key: projectDocument.key,
			});
		})
		.then((attendeeDocuments) => {
			// Declare an array for the unresolved prefrences.
			const unresolvedPreferences = [];

			// Declare a map for preference emails.
			const preferenceEmailsMap = {};

			// Declare a map for the unique email preferences.
			const uniqueEmailPreferencesMap = {};

			// Sort the processed preferences.
			processedPreferences.forEach((preferenceAttributes) => {
				// Store the current email.
				const currentEmail = preferenceAttributes.jotform_email;

				if (!currentEmail) {
					// If no email is specified, the preference attributes are unresolved.
					unresolvedPreferences.push(preferenceAttributes);
				}

				if (currentEmail in preferenceEmailsMap) {
					// If the email was found before, the preference attributes are unresolved.
					unresolvedPreferences.push(preferenceAttributes);

					// Remove from the unique email preferences if this is a first occurence.
					if (currentEmail in uniqueEmailPreferencesMap) {
						unresolvedPreferences.push(uniqueEmailPreferencesMap[currentEmail]);
						delete uniqueEmailPreferencesMap[currentEmail];
					}
				} else {
					// Set the current email in the map of seen preference emails.
					preferenceEmailsMap[currentEmail] = null;

					// Add to the map of unique email preferences.
					uniqueEmailPreferencesMap[currentEmail] = preferenceAttributes;
				}
			});

			// Declare a map for attendee emails.
			const attendeeEmailsMap = {};

			// Declare a map for the unique email attendees.
			const uniqueEmailAttendeesMap = {};

			// Sort the attendee documents.
			attendeeDocuments.forEach((attendeeDocument) => {
				// Store the current email.
				const currentEmail = attendeeDocument.email;

				if (currentEmail in attendeeEmailsMap) {
					// Remove from the unique email attendees.
					delete uniqueEmailAttendeesMap[currentEmail];
				} else {
					// Set the current email in the map of seen attendee emails.
					attendeeEmailsMap[currentEmail] = null;

					// Add to the map of unique email attendees.
					uniqueEmailAttendeesMap[currentEmail] = attendeeDocument;
				}
			});

			// Declare an array for the updated attendee documents.
			const updatedAttendeeDocuments = [];

			// Attempt to pair the preferences with the attendees.
			dataType.object.forEach(uniqueEmailPreferencesMap, (preferenceEmail, preferenceAttributes) => {
				// Load the matching attendee document.
				const matchedAttendeeDocument = uniqueEmailAttendeesMap[preferenceEmail];

				// Check if the matching attendee document exists and whether a pairing had previously occured.
				if (matchedAttendeeDocument && !matchedAttendeeDocument.attributes.jotform_id) {
					// Expand the matched attendee document's attributes with the preference attributes.
					Object.assign(matchedAttendeeDocument.attributes, preferenceAttributes);

					// Add the matched attendee to the array of updated attendee documents.
					updatedAttendeeDocuments.push(matchedAttendeeDocument);
				} else {
					// If no attendee document match was found or a pairing had previously occured
					// consider the preference attributes unresolved.
					unresolvedPreferences.push(preferenceAttributes);
				}
			});

			// Execute parallel operation.
			return Promise.all([
				// Execute the unresolved preference creation procedure.
				Promise.all(unresolvedPreferences.map((unresolvedPreferenceAttributes) => {
					return createUnresolvedPreference(unresolvedPreferenceAttributes, projectDocument.key);
				})),
				// Execute the attendee update procedure.
				Promise.all(updatedAttendeeDocuments.map((updatedAttendeeDocument) => {
					return updateAttendee(updatedAttendeeDocument, projectDocument.key);
				})),
			]);
		});
};
