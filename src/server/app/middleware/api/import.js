// Load app modules.
import {
	EntityNotFound as EntityNotFoundError,
	Validation as ValidationError,
} from '@/src/common/error';
import eventbriteImportProjectAttendees from '@/src/server/eventbrite/import_project_attendees';
import jotformImportProjectPreferences from '@/src/server/google/import_project_preferences';
import expressPromise from '@/src/server/lib/express_promise';
import ProjectModel from '@/src/server/model/project';

// Load npm modules.
import {
	Router as expressRouter,
} from 'express';
import httpStatus from 'http-status';

// Create router instance.
const router = expressRouter();

// Define a route for importing eventbrite registrations for a specific project.
router.post('/eventbrite_registrations', expressPromise((req, res) => {
	// Validate the sent payload.
	if (!req.body) {
		// Reponse with an invalid input error and the details.
		return res.status(httpStatus.BAD_REQUEST).send({
			project_key: "The request must contain the 'project_key' parameter.",
		});
	}

	// Load the project.
	return ProjectModel.findByKey(req.body.project_key)
		.then((projectDocument) => {
			// Execute the import project procedure.
			return eventbriteImportProjectAttendees(projectDocument);
		})
		.then(() => {
			// Repond with an OK status.
			return res.status(httpStatus.OK).send();
		})
		.catch(ValidationError, (err) => {
			// Respond with an invalid input error and the details.
			return res.status(httpStatus.BAD_REQUEST).send(err.details);
		})
		.catch(EntityNotFoundError, () => {
			// Repond with a project not found error.
			return res.status(httpStatus.NOT_FOUND).send();
		});
}));

// Define a route for importing jotform preferences for a specific project.
router.post('/jotform_preferences', expressPromise((req, res) => {
	// Validate the sent payload.
	if (!req.body) {
		// Reponse with an invalid input error and the details.
		return res.status(httpStatus.BAD_REQUEST).send({
			project_key: "The request must contain the 'project_key' parameter.",
		});
	}

	// Load the project.
	return ProjectModel.findByKey(req.body.project_key)
		.then((projectDocument) => {
			// Execute the import project procedure.
			return jotformImportProjectPreferences(projectDocument);
		})
		.then(() => {
			// Repond with an OK status.
			return res.status(httpStatus.OK).send();
		})
		.catch(ValidationError, (err) => {
			// Respond with an invalid input error and the details.
			return res.status(httpStatus.BAD_REQUEST).send(err.details);
		})
		.catch(EntityNotFoundError, () => {
			// Repond with a project not found error.
			return res.status(httpStatus.NOT_FOUND).send();
		});
}));

// Expose router instance.
export default router;
