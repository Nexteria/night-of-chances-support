// Load app modules.
import importMiddleware from '@/src/server/app/middleware/api/import';
import baseApiMiddleware from '@/src/server/app/lib/base_api_middleware';
import attendeeModel from '@/src/server/model/attendee';
import eventModel from '@/src/server/model/event';
import projectModel from '@/src/server/model/project';

// Load npm modules.
import {
	Router as expressRouter,
} from 'express';
import httpStatus from 'http-status';

const router = expressRouter();

router.use('/import', importMiddleware);
router.use('/attendee', baseApiMiddleware(attendeeModel));
router.use('/event', baseApiMiddleware(eventModel));
router.use('/project', baseApiMiddleware(projectModel));

router.use((req, res) => {
	res.status(httpStatus.NOT_FOUND).send('Not Found');
});

export default router;
