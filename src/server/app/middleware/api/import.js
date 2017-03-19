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
			if (!projectDocument.attributes.eventbrite_event_id) {
				throw new Error(`The project '${projectDocument.name}' is missing the 'eventbrite_event_id' attribute`);
			}

			if (!projectDocument.attributes.is_active) {
				throw new Error(`The project '${projectDocument.name}' is missing the 'is_active' attribute`);
			}
		});

		// Filter only active project documents.
		activeProjectDocuments = projectDocuments.filter((projectDocument) => {
			return projectDocument.attributes.is_active === 'TRUE';
		});

		return Promise.all(activeProjectDocuments.map((activeProjectDocument) => {
			return eventbriteCollectPaginatedData(
				`/events/${activeProjectDocument.attributes.eventbrite_event_id}/attendees/`,
				'attendees',
			);
		}));
	})
	.then((projectAttendeeData) => {
		// Merge attendee data into active project documents.
		activeProjectDocuments = dataType.array.shallowLeftMerge(
			activeProjectDocuments, projectAttendeeData.map((attendees) => {
				return { attendees };
			}));
	})
	.then(() => {
		return knex.disconnect();
	})
	.catch((err) => {
		throw err;
	});

/* eslint-disable no-console */

// Load app modules.
import * as googleAuth from '@/src/server/google/auth';
import * as googleSheet from '@/src/server/google/sheet';
import config from '@/src/server/lib/config';

// Initialize google auth client.
googleAuth.createClient()
	.then((googleAuthClient) => {
		// Set authentication client for the google sheet module.
		googleSheet.setAuth(googleAuthClient);

		// Load data from the preferences sheet.
		return googleSheet.getValues(
			config.GOOGLE_SHEET_PREFERENCES_SPREADSHEET_ID,
			config.GOOGLE_SHEET_PREFERENCES_RANGE,
		);
	})
	.then((preferenceValues) => {
		// Store the retrieved preference values.
		// TODO: Implement.
		console.log(preferenceValues[0]);
		console.log(preferenceValues.length);
	})
	.catch((err) => {
		// Crash and report error on failure.
		throw err;
	});

