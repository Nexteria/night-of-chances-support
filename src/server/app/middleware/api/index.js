// Load app modules.
import importMiddleware from '@/src/server/app/middleware/api/import';
import attributeModelMiddleware from '@/src/server/app/middleware/api/attribute_model';
import attendeeModel from '@/src/server/model/attendee';
import eventModel from '@/src/server/model/event';
import projectModel from '@/src/server/model/project';

// Load npm modules.
import {
	Router as expressRouter,
} from 'express';
import httpStatus from 'http-status';

// Create router instance.
const router = expressRouter();

// Add import middleware.
router.use('/import', importMiddleware);

// Add attendee model middleware.
router.use('/attendee', attributeModelMiddleware(attendeeModel));

// Add event model middleware.
router.use('/event', attributeModelMiddleware(eventModel));

// Add project model middleware.
router.use('/project', attributeModelMiddleware(projectModel));

// Declare not found usecase.
router.use((req, res) => {
	res.status(httpStatus.NOT_FOUND).send('API resource not found');
});

// Expose router instance.
export default router;
