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

const appendRoutes = (router, model) => {
	router
		.post(expressPromise((req, res) => {
			return model.create(req.body)
				.then((result) => {
					res.status(httpStatus.CREATED).send(result);
				})
				.catch(ValidationError, EntityExistsError, (err) => {
					res.status(httpStatus.BAD_REQUEST).send(err.details);
				});
		}))
		.get(expressPromise((req, res) => {
			return model.find(req.query)
				.then((result) => {
					res.status(httpStatus.OK).send(result);
				})
				.catch(ValidationError, (err) => {
					res.status(httpStatus.BAD_REQUEST).send(err.details);
				});
		}))
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
		.put(expressPromise((req, res) => {
			return model.update(req.query, req.body)
				.then((result) => {
					res.status(httpStatus.OK).send(result);
				})
				.catch(ValidationError, (err) => {
					res.status(httpStatus.BAD_REQUEST).send(err.details);
				});
		}))
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
		.delete(expressPromise((req, res) => {
			return model.destroy(req.query)
				.then((result) => {
					res.status(httpStatus.OK).send(result);
				})
				.catch(ValidationError, (err) => {
					res.status(httpStatus.BAD_REQUEST).send(err.details);
				});
		}))
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

export default (model) => {
	const router = expressRouter();

	appendRoutes(router, model);
	appendRoutes(router.route('/attribute'), model.attributeModel);

	return router;
};
