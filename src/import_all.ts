// #!/usr/bin/env node

// // Load local modules.
// import eventbriteImportProjectAttendees from '.../src/eventbrite/import_project_attendees'
// import jotformImportProjectPreferences from '.../src/google/import_project_preferences'
// import knexConnection from '.../src/knex_connection'
// import ProjectModel from '.../src/model/project'

// // Load scoped modules.
// import executePromise from '@player1os/execute-promise'

// executePromise(async () => {
// 	// Initialize the database connection.
// 	await knexConnection.connect()

// 	try {
// 		// Load all active projects.
// 		const projectDocuments = await ProjectModel.find({
// 			attributes: {
// 				is_active: 'TRUE',
// 			},
// 		})

// 		// Individually process each active project.
// 		await Promise.all(projectDocuments.map(async (projectDocument: object) => {
// 			await eventbriteImportProjectAttendees(projectDocument)
// 			await jotformImportProjectPreferences(projectDocument)
// 		}))

// 		// Announce success.
// 		console.log('All imports performed successfully') // tslint:disable-line:no-console
// 	} catch (err) {
// 		// Rethrow the error.
// 		throw err
// 	} finally {
// 		// Terminate the database connection.
// 		await knexConnection.disconnect()
// 	}
// })
