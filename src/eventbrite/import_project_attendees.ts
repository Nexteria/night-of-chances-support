// // Load local modules.
// import eventbriteCollectPaginatedData from '.../src/eventbrite/collect_paginated_data'
// import attendeeModel from '.../src/model/attendee'
// import eventbriteAttendeeModel from '.../src/model/eventbrite_attendee'
// import eventbriteAttributeTransformationModel from '.../src/model/eventbrite_attribute_transformation'

// // Load scoped modules.
// import knexConnection from '.../src/knex_connection'

// // Load npm modules.
// import * as lodash from 'lodash'

// // Expose the import procedure for a single given project.
// export default async (projectDocument: object) => {
// 	// Define the required project attributes.
// 	const requiredAttributes = [
// 		'eventbrite_event_id',
// 		'is_active',
// 	]

// 	// Verify the the project document contains each of the required attributes.
// 	requiredAttributes.forEach((requiredAttribute) => {
// 		if (!projectDocument.attributes[requiredAttribute]) {
// 			throw new Error(
// 				`The project '${projectDocument.name}' is missing the '${requiredAttribute}' attribute`)
// 		}
// 	})

// 	// Stop execution if the active project is not active.
// 	if (projectDocument.attributes.is_active === 'TRUE') {
// 		return Promise.resolve(null)
// 	}

// 	// Declare a variable for the raw attendees.
// 	const rawAttendees = []

// 	// Execute parallel operation.
// 	const result = await Promise.all([
// 		// Retrieve project specific attendee data from eventbrite.
// 		eventbriteCollectPaginatedData(
// 			`/events/${projectDocument.attributes.eventbrite_event_id}/attendees/`,
// 			'attendees',
// 		),
// 		// Retrieve the eventbrite attendees that were already imported for the given project.
// 		eventbriteAttendeeModel.find({
// 			project_key: projectDocument.key,
// 		}),
// 	])

// 	// Transform the eventbrite response into a map of raw attendees.
// 	const rawAttendeesMap = result[0]
// 	// TODO: Transform response into the following:
// 	// - hash(eventbrite_id => hash(raw_name => raw_value (string))).

// 	// Transform the eventbrite attendees into a map of eventbrite ids.
// 	const eventbriteIdsMap = result[1].reduce((hash, eventbriteAttendeeDocument) => {
// 		hash[eventbriteAttendeeDocument.eventbrite_id] = null
// 		return hash
// 	}, {})

// 	// Fill the raw attendees array.
// 	lodash.forEach(rawAttendeesMap, (retrievedAttendeeAttributes, retrievedEvenbriteId) => {
// 		if (!(retrievedEvenbriteId in eventbriteIdsMap)) {
// 			rawAttendees.push(retrievedAttendeeAttributes)
// 		}
// 	})

// 	// Find all eventbrite transformation rules for the given project.
// 	const transformationRules = await eventbriteAttributeTransformationModel.find({
// 		project_key: projectDocument.key,
// 	})

// 	return Promise.all(rawAttendees.map(async (rawAttendee) => {
// 		// Instantiate and fill attendee attributes by applying the transformation rules.
// 		const attributes = {}
// 		lodash.forEach(rawAttendee, (rawValue, rawName) => {
// 			// Apply every transformation rule on the given raw name and value pair.
// 			transformationRules.forEach((transformationRule) => {
// 				// Only apply the rule if the raw name matches.
// 				if (rawName === transformationRule.raw_name) {
// 					// Only transform the raw value if the rule defines it.
// 					if (transformationRule.raw_value === null) {
// 						attributes[transformationRule.name] = rawValue
// 					} else if (transformationRule.raw_value === rawValue) {
// 						attributes[transformationRule.name] = transformationRule.value || ''
// 					}
// 				}
// 			})
// 		})

// 		// Create an attendee values object from the filled attributes.
// 		const attendeeValues = {
// 			first_name: attributes.first_name || '',
// 			last_name: attributes.last_name || '',
// 			email: attributes.email || '',
// 			attributes,
// 		}

// 		// Remove unnecessary attributes.
// 		delete attributes.first_name
// 		delete attributes.last_name
// 		delete attributes.email

// 		// Execute the attendee creation procedure.
// 		return knexConnection.transaction(async (transaction) => {
// 			// Create a new attendee entity.
// 			const createdAttendeeDocument = await attendeeModel.create(attendeeValues, { transaction })

// 			// Add a record to the eventbrite attendees.
// 			return eventbriteAttendeeModel.create({
// 				eventbrite_id: createdAttendeeDocument.attributes.eventbrite_id,
// 				project_key: projectDocument.key,
// 			}, { transaction })
// 		})
// 	}))
// }
