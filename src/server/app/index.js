// Load app modules.
import * as requestLib from '@/src/server/lib/request';

// Load npm modules.
import bodyParser from 'body-parser';
import express from 'express';
import httpStatus from 'http-status';

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

// Define basic behaviour.
app.use((req, res) => {
	console.log(requestLib.getIpAddress(req));
	console.log(req.httpVersion);
	console.log(req.method);
	console.log(requestLib.getFullUrl(req));
	console.log(req.headers);
	console.log(req.rawBody);

	res.status(httpStatus.OK).send();
});

// Expose app.
export default app;
