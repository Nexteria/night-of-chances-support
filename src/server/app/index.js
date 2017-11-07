// Load local modules.
// import apiMiddleware from '@/src/server/app/middleware/api';
import confirmMiddleware from '@/src/server/app/middleware/confirm';
import errorMiddleware from '@/src/server/app/middleware/error';
import exportMiddleware from '@/src/server/app/middleware/export';
// import frontendMiddleware from '@/src/server/app/middleware/frontend';
import config from '@/src/server/lib/config';
import * as paths from '@/src/server/lib/paths';

// Load npm modules.
import bodyParser from 'body-parser';
import ejs from 'ejs';
import express from 'express';

// Initialize app.
const app = express();

// Start view engine that correctly parses and loads templates.
app.set('view engine', 'ejs');
app.set('views', paths.srcServerView);
app.engine('ejs', ejs.renderFile);

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
app.use(express.static(paths.srcBrowserStatic));

// Add export middleware.
app.use('/export', exportMiddleware);

// Add confirm middleware.
app.use('/confirm', confirmMiddleware);

// Add api middleware.
// app.use('/api', apiMiddleware);

// Add frontend rendering middleware.
// app.use(frontendMiddleware);

// Add error handling middleware.
app.use(errorMiddleware);

// Expose express app.
export default app;
