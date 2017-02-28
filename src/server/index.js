/* eslint-disable no-console */

// Load app modules.
import app from '@/src/server/app';
import config from '@/src/server/lib/config';

// Load npm modules.
import Promise from 'bluebird';

// Load node modules.
import http from 'http';

// Promisify libraries.
Promise.promisifyAll(http);

// Initialize server.
http.createServer(app).listenAsync(config.APP_HTTP_PORT)
	.then(() => {
		console.log(`Http server listening on port ${config.APP_HTTP_PORT.toString()}`);
	})
	.catch((err) => {
		throw err;
	});
