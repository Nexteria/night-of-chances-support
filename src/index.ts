#!/usr/bin/env node

// Load local modules.
import env from '.../src/.env'
import app from '.../src/app'
// import knexConnection from '.../src/knex_connection'

// Load scoped modules.
import executePromise from '@player1os/execute-promise'
import { HttpServer } from '@player1os/express-utility'
import { gracefulShutdown } from '@player1os/node-js-application-support'

// Instantiate the server.
const httpServer = new HttpServer(app, env.APP_GRACEFUL_SHUTDOWN_HTTP_CONNECTION_TIMEOUT_MS)

// Startup the application.
executePromise(async () => {
	// // Initialize database.
	// await knexConnection.connect()

	// // Output success message.
	// console.log( // tslint:disable-line:no-console
	// 	'Database connection established',
	// 	`(Host: ${env.APP_DATABASE_HOST} | Port: ${env.APP_DATABASE_PORT} | Database: ${env.APP_DATABASE_NAME})`,
	// )

	// Initialize the http server.
	await httpServer.listen(env.APP_HTTP_PORT, env.APP_HTTP_IP)

	// Output success message.
	console.log( // tslint:disable-line:no-console
		'Http server initialized',
		`(IP Address: ${env.APP_HTTP_IP} | Port ${env.APP_HTTP_PORT.toString()})`,
	)
})

// Setup the graceful shutdown handler.
gracefulShutdown(async () => {
	// Terminate the http server.
	await httpServer.stop()

	// // Terminate the database.
	// await knexConnection.disconnect()
}, env.APP_GRACEFUL_SHUTDOWN_TIMEOUT_MS)
