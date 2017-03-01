/* eslint-disable no-console */

// Load app modules.
import app from '@/src/server/app';
import knex from '@/src/server/knex';
import config from '@/src/server/lib/config';

// Load npm modules.
import Promise from 'bluebird';

// Load node modules.
import http from 'http';

// Promisify libraries.
Promise.promisifyAll(http);

// Initialize database.
knex.connect()
	.then((result) => {
		// Output success message.
		console.log(`Connected to database (Host: ${result.host} | Port: ${result.port} | Database: ${result.name})`);

		// Initialize http server.
		return http.createServer(app).listenAsync(config.APP_HTTP_PORT);
	})
	.then(() => {
		// Output success message.
		console.log(`Http server listening on port ${config.APP_HTTP_PORT.toString()}`);
	})
	.catch((err) => {
		// Crash and report error on failure.
		throw err;
	});
