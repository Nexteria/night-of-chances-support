// Load app modules.
import expressPromise from '@/src/server/lib/express_promise';
import {
	EntityExists as EntityExistsError,
	EntityNotFound as EntityNotFoundError,
	Validation as ValidationError,
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
			return model.create(req.body)
				.then((result) => {
					res.status(httpStatus.CREATED).send(result);
				})
				.catch(ValidationError, EntityExistsError, (err) => {
					res.status(httpStatus.BAD_REQUEST).send(err.details);
				});
		}))
		// Define the read endpoint.
		.get(expressPromise((req, res) => {
			return model.find(req.query)
				.then((result) => {
					res.status(httpStatus.OK).send(result);
				})
				.catch(ValidationError, (err) => {
					res.status(httpStatus.BAD_REQUEST).send(err.details);
				});
		}))
		// Define the single read endpoint.
		.get('/:key', expressPromise((req, res) => {
			return model.findByKey(req.params.key)
				.then((result) => {
					res.status(httpStatus.OK).send(result);
				})
				.catch(ValidationError, (err) => {
					res.status(httpStatus.BAD_REQUEST).send(err.details);
				})
				.catch(EntityNotFoundError, () => {
					res.status(httpStatus.NOT_FOUND).send();
				});
		}))
		// Define the update endpoint.
		.put(expressPromise((req, res) => {
			return model.update(req.query, req.body)
				.then((result) => {
					res.status(httpStatus.OK).send(result);
				})
				.catch(ValidationError, (err) => {
					res.status(httpStatus.BAD_REQUEST).send(err.details);
				});
		}))
		// Define the single update endpoint.
		.put('/:key', expressPromise((req, res) => {
			return model.update({
				[model.primaryKeyField.name]: req.params.key,
			}, req.body)
				.then((result) => {
					res.status(httpStatus.OK).send(result);
				})
				.catch(ValidationError, (err) => {
					res.status(httpStatus.BAD_REQUEST).send(err.details);
				});
		}))
		// Define the delete endpoint.
		.delete(expressPromise((req, res) => {
			return model.destroy(req.query)
				.then((result) => {
					res.status(httpStatus.OK).send(result);
				})
				.catch(ValidationError, (err) => {
					res.status(httpStatus.BAD_REQUEST).send(err.details);
				});
		}))
		// Define the single delete endpoint.
		.delete('/:key', expressPromise((req, res) => {
			return model.destroy({
				[model.primaryKeyField.name]: req.params.key,
			})
				.then((result) => {
					res.status(httpStatus.OK).send(result);
				})
				.catch(ValidationError, (err) => {
					res.status(httpStatus.BAD_REQUEST).send(err.details);
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
