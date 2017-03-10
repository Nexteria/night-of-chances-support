/* eslint-disable no-console */

// Load app modules.
import * as expressRequest from '@/src/server/lib/express_request';

// Load npm modules.
import httpStatus from 'http-status';

// Define basic behaviour.
export default (req, res) => {
	console.log(expressRequest.getIpAddress(req));
	console.log(req.httpVersion);
	console.log(req.method);
	console.log(expressRequest.getFullUrl(req));
	console.log(req.headers);
	console.log(req.rawBody);

	res.status(httpStatus.OK).send();
};
