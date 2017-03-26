// Load app modules.
import expressPromise from '@/src/server/lib/express_promise';
import {
	EntityExistsError,
	EntityNotFoundError,
	ValidationError,
} from '@/src/common/error';

// Load npm modules.
import {
	Router as expressRouter,
} from 'express';
import httpStatus from 'http-status';

// Declare function for appending model routes.
const appendRoutes = (router, model) => {
	router
		// Define the single create endpoint.
		.post(expressPromise((req, res) => {
			// Use model to create an entity.
			return model.create(req.body)
				.then((result) => {
					// Repond with a CREATED status and the created entity.
					return res.status(httpStatus.CREATED).send(result);
				})
				.catch(ValidationError, EntityExistsError, (err) => {
					// Respond with an invalid input error and the details.
					return res.status(httpStatus.BAD_REQUEST).send(err.details);
				});
		}))
		// Define the read endpoint.
		.get(expressPromise((req, res) => {
			// Use model to find the matching entities.
			return model.find(req.query)
				.then((result) => {
					// Repond with an OK status and the found entities.
					return res.status(httpStatus.OK).send(result);
				})
				.catch(ValidationError, (err) => {
					// Respond with an invalid input error and the details.
					return res.status(httpStatus.BAD_REQUEST).send(err.details);
				});
		}))
		// Define the single read endpoint.
		.get('/:key', expressPromise((req, res) => {
			// Use model to find the matching entity.
			return model.findByKey(req.params.key)
				.then((result) => {
					// Repond with an OK status and the found entity.
					return res.status(httpStatus.OK).send(result);
				})
				.catch(ValidationError, (err) => {
					// Respond with an invalid input error and the details.
					return res.status(httpStatus.BAD_REQUEST).send(err.details);
				})
				.catch(EntityNotFoundError, () => {
					// Repond with an entity not found error.
					return res.status(httpStatus.NOT_FOUND).send();
				});
		}))
		// Define the update endpoint.
		.put(expressPromise((req, res) => {
			// Use model to alter the matching entities.
			return model.update(req.query, req.body)
				.then((result) => {
					// Repond with an OK status and the altered entities.
					return res.status(httpStatus.OK).send(result);
				})
				.catch(ValidationError, (err) => {
					// Respond with an invalid input error and the details.
					return res.status(httpStatus.BAD_REQUEST).send(err.details);
				});
		}))
		// Define the single update endpoint.
		.put('/:key', expressPromise((req, res) => {
			// Use model to alter the matching entity.
			return model.updateByKey(req.params.key, req.body)
				.then((result) => {
					// Repond with an OK status and the altered entity.
					return res.status(httpStatus.OK).send(result);
				})
				.catch(ValidationError, (err) => {
					// Respond with an invalid input error and the details.
					return res.status(httpStatus.BAD_REQUEST).send(err.details);
				})
				.catch(EntityNotFoundError, () => {
					// Repond with an entity not found error.
					return res.status(httpStatus.NOT_FOUND).send();
				});
		}))
		// Define the delete endpoint.
		.delete(expressPromise((req, res) => {
			// Use model to remove the matching entities.
			return model.destroy(req.query)
				.then((result) => {
					// Repond with an OK status and the removed entities.
					return res.status(httpStatus.OK).send(result);
				})
				.catch(ValidationError, (err) => {
					// Respond with an invalid input error and the details.
					return res.status(httpStatus.BAD_REQUEST).send(err.details);
				});
		}))
		// Define the single delete endpoint.
		.delete('/:key', expressPromise((req, res) => {
			// Use model to remove the matching entity.
			return model.destroyByKey(req.params.key)
				.then((result) => {
					// Repond with an OK status and the removed entity.
					return res.status(httpStatus.OK).send(result);
				})
				.catch(ValidationError, (err) => {
					// Respond with an invalid input error and the details.
					return res.status(httpStatus.BAD_REQUEST).send(err.details);
				})
				.catch(EntityNotFoundError, () => {
					// Repond with an entity not found error.
					return res.status(httpStatus.NOT_FOUND).send();
				});
		}));
};

// Expose router factory.
export default (model) => {
	// Create router instance.
	const router = expressRouter();

	// Append endpoints for the model itself.
	appendRoutes(router, model);

	// Append endpoints for the model's attribute model.
	appendRoutes(router.route('/attribute'), model.attributeModel);

	// Return router instance.
	return router;
};
