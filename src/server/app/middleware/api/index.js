/* eslint-disable no-console */

// Load app modules.
import baseApiMiddleware from '@/src/server/lib/base_api_middleware';
import * as expressRequest from '@/src/server/lib/express_request';
import attendeeModel from '@/src/server/model/attendee';
import eventModel from '@/src/server/model/event';
import projectModel from '@/src/server/model/project';

// Load npm modules.
import {
	Router as expressRouter,
} from 'express';
import httpStatus from 'http-status';

const router = expressRouter();

router.use('/attendee', baseApiMiddleware(attendeeModel));
router.use('/event', baseApiMiddleware(eventModel));
router.use('/project', baseApiMiddleware(projectModel));

router.use((req, res) => {
	res.status(httpStatus.NOT_FOUND).send('Not Found');
});

// Define basic behaviour.
router.use((req, res) => {
	console.log(expressRequest.getIpAddress(req));
	console.log(req.httpVersion);
	console.log(req.method);
	console.log(expressRequest.getFullUrl(req));
	console.log(req.headers);
	console.log(req.rawBody);

	res.status(httpStatus.OK).send();
});

export default router;
