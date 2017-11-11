// Load local modules.
import env from '.../src/.env'
// import apiMiddleware from '.../src/app/api'
// import confirmMiddleware from '.../src/app/confirm'
import exportMiddleware from '.../src/app/export'

// Load scoped modules.
import {
	createApplication,
	errorMiddleware,
	jsonBodyParserMiddleware,
} from '@player1os/express-utility'

// Load npm modules.
import * as ejs from 'ejs'
import * as express from 'express'
import * as httpStatus from 'http-status'

// Load node modules.
import * as path from 'path'

// Initialize app.
const app = createApplication()

// Start view engine that correctly parses and loads templates.
app.set('view engine', 'ejs')
app.set('views', path.join(env.APP_ROOT_PATH, 'view'))
app.engine('ejs', ejs.renderFile)

// Parse application/json bodies.
app.use(jsonBodyParserMiddleware((_err, _req, res, _next) => {
	res.status(httpStatus.INTERNAL_SERVER_ERROR).send('invalid_json_payload')
}))

// Add serving of static content.
app.use(express.static(path.join(env.APP_ROOT_PATH, 'static')))

// // Add api middleware.
// app.use('/api', apiMiddleware)

// // Add confirm middleware.
// app.use('/confirm', confirmMiddleware)

// Add export middleware.
app.use('/export', exportMiddleware)

// Add error handling middleware.
app.use(errorMiddleware())

// Expose express app.
export default app
