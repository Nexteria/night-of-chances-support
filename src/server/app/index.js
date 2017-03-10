// Load app modules.
import apiMiddleware from '@/src/server/app/middleware/api';
import errorMiddleware from '@/src/server/app/middleware/error';
import frontendMiddleware from '@/src/server/app/middleware/frontend';
import * as paths from '@/src/server/lib/paths';

// Load npm modules.
import bodyParser from 'body-parser';
import express from 'express';

// Initialize app.
const app = express();

// Trust the proxy when retrieving the remote client's ip address.
app.enable('trust proxy');

// Apply settings that enables the parsing of incoming request bodies.
const rawBodyCreator = (req, res, buf) => {
	req.rawBody = buf.toString();
};

// Parse application/json bodies.
app.use(bodyParser.json({
	verify: rawBodyCreator,
}));

// Add serving of static content.
app.use(express.static(paths.buildBrowser));

// Add api middleware.
app.use('/api', apiMiddleware);

// Add frontend rendering middleware.
app.use('*', frontendMiddleware);

// Add error handling middleware.
app.use(errorMiddleware);

// Expose app.
export default app;
