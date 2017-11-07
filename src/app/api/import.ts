// Load local modules.
import eventbriteImportProjectAttendees from '.../src/eventbrite/import_project_attendees'
import jotformImportProjectPreferences from '.../src/google/import_project_preferences'
import projectModel from '.../src/model/project'

// Load scoped modules.
import {
	EntityNotFoundError,
	ValidationError,
} from '@/src/common/error'
import { promiseWrapper as middlewarePromiseWrapper } from '@player1os/express-utility'

// Load npm modules.
import {
	Request,
	Router,
} from 'express'
import * as httpStatus from 'http-status'
import * as lodash from 'lodash'

// Create router instance.
const router = Router()

// Declare a request interface.
interface IRequest extends Request {
	locals: {
		projectDocument: object,
	},
}

// Define a preprocessing wrapper.
const preprocessMiddleware = middlewarePromiseWrapper(async (req: IRequest, res, next) => {
	// Validate the sent payload.
	if (lodash.isEmpty(req.body)) {
		// Reponse with an invalid input error and the details.
		res.status(httpStatus.BAD_REQUEST).send({
			project_key: "The request must contain the 'project_key' parameter.",
		})
	}

	try {
		// Load the project.
		req.locals.projectDocument = await projectModel.findByKey(req.body.project_key)

		// Proceed to the next middleware.
		return next
	} catch (err) {
		if (err instanceof ValidationError) {
			// Respond with an invalid input error and the details.
			res.status(httpStatus.BAD_REQUEST).send(err.details)
		} else if (err instanceof EntityNotFoundError) {
			// Repond with a project not found error.
			res.status(httpStatus.NOT_FOUND).send()
		} else {
			// Rethrow the error.
			throw err
		}
	}
})

// Define a route for importing eventbrite registrations for a specific project.
router.post('/eventbrite_registrations', preprocessMiddleware, middlewarePromiseWrapper(async (req: IRequest, res) => {
	try {
		// Execute the import project procedure.
		await eventbriteImportProjectAttendees(req.locals.projectDocument)

		// Repond with an OK status.
		res.status(httpStatus.OK).send()
	} catch (err) {
		if (err instanceof ValidationError) {
			// Respond with an invalid input error and the details.
			res.status(httpStatus.BAD_REQUEST).send(err.details)
		} else if (err instanceof EntityNotFoundError) {
			// Repond with a project not found error.
			res.status(httpStatus.NOT_FOUND).send()
		} else {
			// Rethrow the error.
			throw err
		}
	}
}))

// Define a route for importing jotform preferences for a specific project.
router.post('/jotform_preferences', preprocessMiddleware, middlewarePromiseWrapper(async (req: IRequest, res) => {
	try {
		// Execute the import project procedure.
		await jotformImportProjectPreferences(req.locals.projectDocument)

		// Repond with an OK status.
		res.status(httpStatus.OK).send()
	} catch (err) {
		if (err instanceof ValidationError) {
			// Respond with an invalid input error and the details.
			res.status(httpStatus.BAD_REQUEST).send(err.details)
		} else if (err instanceof EntityNotFoundError) {
			// Repond with a project not found error.
			res.status(httpStatus.NOT_FOUND).send()
		} else {
			// Rethrow the error.
			throw err
		}
	}
}))

// Expose router instance.
export default router
