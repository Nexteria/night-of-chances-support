// // Load local modules.
// import attributeModelMiddleware from '.../src/app/middleware/api/attribute_model'
// import importMiddleware from '.../src/app/middleware/api/import'
// import attendeeModel from '.../src/model/attendee'
// import eventModel from '.../src/model/event'
// import projectModel from '.../src/model/project'

// // Load npm modules.
// import { Router } from 'express'
// import * as httpStatus from 'http-status'

// // Create router instance.
// const router = Router()

// // Add import middleware.
// router.use('/import', importMiddleware)

// // Add attendee model middleware.
// router.use('/attendee', attributeModelMiddleware(attendeeModel))

// // Add event model middleware.
// router.use('/event', attributeModelMiddleware(eventModel))

// // Add project model middleware.
// router.use('/project', attributeModelMiddleware(projectModel))

// // Declare not found usecase.
// router.use((_req, res) => {
// 	res.status(httpStatus.NOT_FOUND).send('API resource not found')
// })

// // Expose router instance.
// export default router
