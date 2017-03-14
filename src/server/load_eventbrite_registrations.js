// Load app modules.
import * as dataType from '@/src/common/data_type';
import eventbriteCollectPaginatedData from '@/src/server/eventbrite/collect_paginated_data';
import knex from '@/src/server/knex';
import ProjectModel from '@/src/server/model/project';

// Load npm modules.
import Promise from 'bluebird';

// Define variable for storing the active project documents.
let activeProjectDocuments = [];

// Initialize database connection.
knex.connect()
	.then(() => {
		// Load all project documents.
		return ProjectModel.find();
	})
	.then((projectDocuments) => {
		// Verify if all project documents contain the eventbrite_event_id and is_active attribute.
		projectDocuments.forEach((projectDocument) => {
			if (!projectDocument.eventbrite_event_id) {
				throw new Error(`The project '${projectDocument.name}' is missing the 'eventbrite_event_id' attribute`);
			}

			if (!projectDocument.is_active) {
				throw new Error(`The project '${projectDocument.name}' is missing the 'is_active' attribute`);
			}
		});

		// Filter only active project documents.
		activeProjectDocuments = projectDocuments.filter((projectDocument) => {
			return projectDocument.is_active === 'TRUE';
		});

		console.log(activeProjectDocuments);
		return Promise.all(activeProjectDocuments.map((activeProjectDocument) => {
			return eventbriteCollectPaginatedData(
				`/events/${activeProjectDocument.eventbrite_event_id}/attendees/`,
				'attendees',
			);
		}));
	})/*
	.then((projectAttendeeData) => {
		// Merge attendee data into active project documents.
		activeProjectDocuments = dataType.array.shallowLeftMerge(
			activeProjectDocuments, projectAttendeeData.map((attendees) => {
				return { attendees };
			}));

		console.log(activeProjectDocuments);
	})*/
	.then(() => {
		return knex.disconnect();
	})
	.catch((err) => {
		throw err;
	});
