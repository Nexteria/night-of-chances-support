// Load npm modules.
import bodyParser from 'body-parser';
import express from 'express';
import httpStatus from 'http-status';

// Initialize app.
const app = express();

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
	console.log(req.rawBody);

	res.status(httpStatus.OK).send();
});

// Expose app.
export default app;