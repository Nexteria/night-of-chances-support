// // Load scoped modules.
// import { promiseWrapper as middlewarePromiseWrapper } from '@player1os/express-utility'
// import { AttributeModel } from '@player1os/knex-utility'
// import {
// 	EntityExistsError,
// 	EntityNotFoundError,
// 	ValidationError,
// } from '@/src/common/error'

// // Load npm modules.
// import { Router } from 'express'
// import * as httpStatus from 'http-status'

// // Declare a unifying model.
// type TAttributeModel = AttributeModel

// // Declare function for appending model routes.
// const appendRoutes = (router: Router, model: TAttributeModel) => {
// 	router
// 		// Define the single create endpoint.
// 		.post('/', middlewarePromiseWrapper(async (req, res) => {
// 			try {
// 				// Use model to create an entity.
// 				const result = await model.create(req.body)

// 				// Repond with a CREATED status and the created entity.
// 				res.status(httpStatus.CREATED).send(result)
// 			} catch (err) {
// 				if ((err instanceof ValidationError) || (err instanceof EntityExistsError)) {
// 					// Respond with an invalid input error and the details.
// 					res.status(httpStatus.BAD_REQUEST).send(err.details)
// 				} else {
// 					// Rethrow the error.
// 					throw err
// 				}
// 			}
// 		}))
// 		// Define the read endpoint.
// 		.get('/', middlewarePromiseWrapper(async (req, res) => {
// 			try {
// 				// Use model to find the matching entities.
// 				const result = await model.find(req.query)

// 				// Repond with an OK status and the found entities.
// 				res.status(httpStatus.CREATED).send(result)
// 			} catch (err) {
// 				if (err instanceof ValidationError) {
// 					// Respond with an invalid input error and the details.
// 					res.status(httpStatus.BAD_REQUEST).send(err.details)
// 				} else {
// 					// Rethrow the error.
// 					throw err
// 				}
// 			}
// 		}))
// 		// Define the single read endpoint.
// 		.get('/:key', middlewarePromiseWrapper(async (req, res) => {
// 			try {
// 				// Use model to find the matching entity.
// 				const result = await model.findByKey(req.params.key)

// 				// Repond with an OK status and the found entity.
// 				res.status(httpStatus.OK).send(result)
// 			} catch (err) {
// 				if (err instanceof ValidationError) {
// 					// Respond with an invalid input error and the details.
// 					res.status(httpStatus.BAD_REQUEST).send(err.details)
// 				} else if (err instanceof EntityNotFoundError) {
// 					// Repond with an entity not found error.
// 					res.status(httpStatus.NOT_FOUND).send()
// 				} else {
// 					// Rethrow the error.
// 					throw err
// 				}
// 			}
// 		}))
// 		// Define the update endpoint.
// 		.put('/', middlewarePromiseWrapper(async (req, res) => {
// 			try {
// 				// Use model to alter the matching entities.
// 				const result = await model.update(req.query, req.body)

// 				// Repond with an OK status and the altered entities.
// 				return res.status(httpStatus.OK).send(result)
// 			} catch (err) {
// 				if (err instanceof ValidationError) {
// 					// Respond with an invalid input error and the details.
// 					res.status(httpStatus.BAD_REQUEST).send(err.details)
// 				} else {
// 					// Rethrow the error.
// 					throw err
// 				}
// 			}
// 		}))
// 		// Define the single update endpoint.
// 		.put('/:key', middlewarePromiseWrapper(async (req, res) => {
// 			try {
// 				// Use model to alter the matching entity.
// 				const result = await model.updateByKey(req.params.key, req.body)

// 				// Repond with an OK status and the altered entity.
// 				res.status(httpStatus.OK).send(result)
// 			} catch (err) {
// 				if (err instanceof ValidationError) {
// 					// Respond with an invalid input error and the details.
// 					res.status(httpStatus.BAD_REQUEST).send(err.details)
// 				} else if (err instanceof EntityNotFoundError) {
// 					// Repond with an entity not found error.
// 					res.status(httpStatus.NOT_FOUND).send()
// 				} else {
// 					// Rethrow the error.
// 					throw err
// 				}
// 			}
// 		}))
// 		// Define the delete endpoint.
// 		.delete('/', middlewarePromiseWrapper(async (req, res) => {
// 			try {
// 				// Use model to remove the matching entities.
// 				const result = await model.destroy(req.query)

// 				// Repond with an OK status and the removed entities.
// 				res.status(httpStatus.OK).send(result)
// 			} catch (err) {
// 				if (err instanceof ValidationError) {
// 					// Respond with an invalid input error and the details.
// 					res.status(httpStatus.BAD_REQUEST).send(err.details)
// 				} else {
// 					// Rethrow the error.
// 					throw err
// 				}
// 			}
// 		}))
// 		// Define the single delete endpoint.
// 		.delete('/:key', middlewarePromiseWrapper(async (req, res) => {
// 			try {
// 				// Use model to remove the matching entity.
// 				const result = await model.destroyByKey(req.params.key)

// 				// Repond with an OK status and the removed entity.
// 				res.status(httpStatus.OK).send(result)
// 			} catch (err) {
// 				if (err instanceof ValidationError) {
// 					// Respond with an invalid input error and the details.
// 					res.status(httpStatus.BAD_REQUEST).send(err.details)
// 				} else if (err instanceof EntityNotFoundError) {
// 					// Repond with an entity not found error.
// 					res.status(httpStatus.NOT_FOUND).send()
// 				} else {
// 					// Rethrow the error.
// 					throw err
// 				}
// 			}
// 		}))
// }

// // Expose router factory.
// export default (model: TAttributeModel) => {
// 	// Create the main router instance.
// 	const router = Router()

// 	// Append endpoints for the model itself.
// 	appendRoutes(router, model)

// 	// Create the attribute router instance.
// 	const attributeRouter = Router()

// 	// Append endpoints for the model's attribute model.
// 	appendRoutes(attributeRouter, model.attributeModel)
// 	router.all('/attribute', attributeRouter)

// 	// Return router instance.
// 	return router
// }
