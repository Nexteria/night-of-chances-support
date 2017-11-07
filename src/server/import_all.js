/* eslint-disable no-console */

// Load local modules.
import eventbriteImportProjectAttendees from '@/src/server/eventbrite/import_project_attendees';
import jotformImportProjectPreferences from '@/src/server/google/import_project_preferences';
import knex from '@/src/server/knex';
import ProjectModel from '@/src/server/model/project';

// Load npm modules.
import Promise from 'bluebird';

// Define stored error variable.
let storedError = null;

// Define the procedure for processing a single project.
const processProject = (projectDocument) => {
	return eventbriteImportProjectAttendees(projectDocument)
		.then(() => {
			return jotformImportProjectPreferences(projectDocument);
		});
};

// Initialize the database connection.
knex.connect()
	.then(() => {
		// Load all active projects.
		return ProjectModel.find({
			attributes: {
				is_active: 'TRUE',
			},
		});
	})
	.then((projectDocuments) => {
		// Individually process each active project.
		return Promise.all(projectDocuments.map(processProject));
	})
	.then(() => {
		// Announce success.
		console.log('All imports performed successfully');
	})
	.catch((err) => {
		storedError = err;
	})
	.then(() => {
		// Terminate the database connection.
		return knex.disconnect();
	})
	.then(() => {
		// Rethrow stored error.
		if (storedError) {
			throw storedError;
		}
	})
	.catch((err) => {
		// Crash process on error.
		throw err;
	});
