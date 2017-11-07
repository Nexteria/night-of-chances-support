// Load local modules.
import * as dataType from '@/src/common/data_type';
import eventbriteCollectPaginatedData from '@/src/server/eventbrite/collect_paginated_data';
import knex from '@/src/server/knex';
import AttendeeModel from '@/src/server/model/attendee';
import EventbriteAttendeeModel from '@/src/server/model/eventbrite_attendee';
import EventbriteAttributeTransformationModel from '@/src/server/model/eventbrite_attribute_transformation';

// Load npm modules.
import Promise from 'bluebird';

// Declare the creation procedure for a single attendee.
const createAttendee = (attendeeValues, projectKey) => {
	// Initialize a transtaction.
	return knex.instance.transaction((trx) => {
		// Create a new attendee entity.
		return AttendeeModel.create(attendeeValues, {
			transaction: trx,
		})
			.then((createdAttendeeDocument) => {
				// Add a record to the eventbrite attendees.
				return EventbriteAttendeeModel.create({
					eventbrite_id: createdAttendeeDocument.attributes.eventbrite_id,
					project_key: projectKey,
				}, {
					transaction: trx,
				});
			});
	});
};

// Expose the import procedure for a single given project.
export default (projectDocument) => {
	// Define the required project attributes.
	const requiredAttributes = [
		'eventbrite_event_id',
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

	// Declare a variable for the raw attendees.
	const rawAttendees = [];

	// Execute parallel operation.
	return Promise.all([
		// Retrieve project specific attendee data from eventbrite.
		eventbriteCollectPaginatedData(
			`/events/${projectDocument.attributes.eventbrite_event_id}/attendees/`,
			'attendees',
		),
		// Retrieve the eventbrite attendees that were already imported for the given project.
		EventbriteAttendeeModel.find({
			project_key: projectDocument.key,
		}),
	])
		.then((result) => {
			// Transform the eventbrite response into a map of raw attendees.
			const rawAttendeesMap = result[0];
			// TODO: Transform response into the following:
			// - hash(eventbrite_id => hash(raw_name => raw_value (string))).

			// Transform the eventbrite attendees into a map of eventbrite ids.
			const eventbriteIdsMap = result[1].reduce((hash, eventbriteAttendeeDocument) => {
				hash[eventbriteAttendeeDocument.eventbrite_id] = null;
				return hash;
			}, {});

			// Fill the raw attendees array.
			dataType.object.forEach(rawAttendeesMap, (retrievedEvenbriteId, retrievedAttendeeAttributes) => {
				if (!(retrievedEvenbriteId in eventbriteIdsMap)) {
					rawAttendees.push(retrievedAttendeeAttributes);
				}
			});

			// Find all eventbrite transformation rules for the given project.
			return EventbriteAttributeTransformationModel.find({
				project_key: projectDocument.key,
			});
		})
		.then((transformationRules) => {
			return Promise.all(rawAttendees.map((rawAttendee) => {
				// Instantiate and fill attendee attributes by applying the transformation rules.
				const attributes = {};
				dataType.object.forEach(rawAttendee, (rawName, rawValue) => {
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

				// Create an attendee values object from the filled attributes.
				const attendeeValues = {
					first_name: attributes.first_name || '',
					last_name: attributes.last_name || '',
					email: attributes.email || '',
					attributes,
				};

				// Remove unnecessary attributes.
				delete attributes.first_name;
				delete attributes.last_name;
				delete attributes.email;

				// Execute the attendee creation procedure.
				return createAttendee(attendeeValues, projectDocument.key);
			}));
		});
};
