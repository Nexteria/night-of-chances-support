/* eslint-disable no-console */

// Load app modules.
import attendeeApiMiddleware from '@/src/server/app/middleware/api/attendee';
import eventApiMiddleware from '@/src/server/app/middleware/api/event';
import projectApiMiddleware from '@/src/server/app/middleware/api/project';
import expressPromise from '@/src/server/lib/express_promise';
import * as expressRequest from '@/src/server/lib/express_request';

// Load npm modules.
import {
	Router as expressRouter,
} from 'express';
import httpStatus from 'http-status';

const router = expressRouter();

router.use('/attendee', attendeeApiMiddleware);
router.use('/event', attendeeApiMiddleware);
router.use('/project', attendeeApiMiddleware);

router.use((req, res) => {
	res.status(httpStatus.NOT_FOUND).send('Not Found');
});

export default router;

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
