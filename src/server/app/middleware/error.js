// Load npm modules.
import httpStatus from 'http-status';

export default (err, req, res, next) => { // eslint-disable-line no-unused-vars
	// There was an error somewhere during route matching
	res.status(httpStatus.INTERNAL_SERVER_ERROR).send(err.message);

	// Throw error.
	process.nextTick = () => {
		throw err;
	};
};
