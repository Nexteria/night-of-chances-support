// Load app modules.
import apiMiddleware from '@/src/server/app/middleware/api';
import errorMiddleware from '@/src/server/app/middleware/error';
import frontendMiddleware from '@/src/server/app/middleware/frontend';
import config from '@/src/server/lib/config';
import * as paths from '@/src/server/lib/paths';

// Load npm modules.
import bodyParser from 'body-parser';
import express from 'express';

// Initialize app.
const app = express();

// Parse application/json bodies.
app.use(bodyParser.json());

// Enable logger if set.
if (config.APP_HTTP_ENABLE_LOGGER) {
	app.use((req, res, next) => {
		// Log request data.
		console.log({ // eslint-disable-line no-console
			ip_address: req.ip,
			http_version: req.httpVersion,
			http_method: req.method,
			url_path: req.originalUrl,
			headers: req.headers,
			parsed_body: req.body,
		});

		// Continue execution.
		next();
	});
}

// Add serving of static content.
app.use(express.static(paths.buildBrowser));

// Add api middleware.
app.use('/api', apiMiddleware);

// Add frontend rendering middleware.
app.use(frontendMiddleware);

// Add error handling middleware.
app.use(errorMiddleware);

// Expose express app.
export default app;
