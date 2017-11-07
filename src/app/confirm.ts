// Load local modules.
import env from '.../src/.env'
import basicAuth from '.../src/app/basic_auth'
import * as colorCrm from '.../src/google/color_crm'
import knexConnection from '.../src/knex_connection'

// Load scoped modules.
import { promiseWrapper as middlewarePromiseWrapper } from '@player1os/express-utility'

// Load npm modules.
import { Router } from 'express'
import * as httpStatus from 'http-status'

// Create router instance.
const router = Router()

router.get('/submit/:google_sheet_id/:ws_id', middlewarePromiseWrapper(async (req, res) => {
	// Retrieve parameters from the request.
	const {
		google_sheet_id: googleSheetId,
		ws_id: wsId,
	} = req.params
	const {
		barcode,
		is_confirmed,
	} = req.query

	// Validate the inputs.
	const isInputValid = (typeof barcode === 'string')
		&& (typeof wsId === 'string')
		&& ((is_confirmed === 'true') || (is_confirmed === 'false'))
	if (!isInputValid) {
		return res.status(httpStatus.BAD_REQUEST).send('Odkaz neobsahuje požadované parametre.\n'
			+ `Prosím kontaktujte <${env.APP_CONTACT_EMAIL}>`)
	}

	const [
		stateChangeResult,
		mappedWorkshopDocuments,
	] = await Promise.all([
		// Update the state in the confirmation list.
		knexConnection.instance('assignment_list')
			.update({
				date_time_submitted: new Date(),
				is_confirmed: is_confirmed === 'true',
			})
			.where({
				barcode,
				wsId,
			}),
		// Load all of the workshop documents.
		colorCrm.loadWorkshopDocuments(googleSheetId),
	])

	// Load all of the current student's confirmed workshop ids.
	const confirmedWorkshopIdsResult = await knexConnection.instance('assignment_list')
		.select('ws_id')
		.where({
			barcode,
		}) as { ws_id: string }[]
	const confirmedWorkshopIds = confirmedWorkshopIdsResult
		.map(({ ws_id }) => {
			return ws_id
		})

	// Filter out only the current student's confirmed workshop documents.
	const workshopDocuments = Object.keys(mappedWorkshopDocuments)
		.map((workshopId) => {
			return mappedWorkshopDocuments[workshopId]
		})
		.filter((workshopDocument) => {
			return confirmedWorkshopIds.indexOf(workshopDocument.Id) !== -1
		})

	return res.status(httpStatus.OK).render('confirm_submit', {
		currentWorkshopDocument: mappedWorkshopDocuments[wsId],
		workshopDocuments,
		isValid: stateChangeResult.length > 0,
		contactMail: env.APP_CONTACT_EMAIL,
	})
}))

router.use(basicAuth(
	env.APP_BASIC_AUTH_REALM,
	env.APP_BASIC_AUTH_NAME,
	env.APP_BASIC_AUTH_PASSWORD,
))

router.get('/list/:google_sheet_id/:ws_id', middlewarePromiseWrapper(async (req, res) => {
	// Retrieve parameters from the request.
	const {
		google_sheet_id: googleSheetId,
		ws_id: wsId,
	} = req.params

	// Validate the inputs.
	if (typeof wsId !== 'string') {
		return res.status(httpStatus.BAD_REQUEST).send('Odkaz neobsahuje požadované parametre.')
	}

	// Load resources in parallel.
	const [
		pendingListResult,
		confirmedListResult,
		rejectedListResult,
		workshopDocuments,
		studentDocuments,
	] = await Promise.all([
		// Load the list of pending workshop assignments.
		knexConnection.instance('assignment_list')
			.select('barcode')
			.where({
				wsId,
				is_confirmed: null,
			})
			.orderBy('ws_id') as PromiseLike<{ barcode: string }[]>,
		// Load the list of pending workshop assignments.
		knexConnection.instance('assignment_list')
			.select('barcode')
			.where({
				wsId,
				is_confirmed: true,
			})
			.orderBy('date_time_submitted', 'desc') as PromiseLike<{ barcode: string }[]>,
		// Load the list of pending workshop assignments.
		knexConnection.instance('assignment_list')
			.select('barcode')
			.where({
				wsId,
				is_confirmed: false,
			})
			.orderBy('date_time_submitted', 'desc') as PromiseLike<{ barcode: string }[]>,
		// Load all of the workshop documents.
		colorCrm.loadWorkshopDocuments(googleSheetId),
		// Load all of the student documents.
		colorCrm.loadStudentDocuments(googleSheetId),
	])

	return res.status(httpStatus.OK).render('lists', {
		title: 'Zoznam respondentov',
		workshopDocument: workshopDocuments[wsId],
		pendingList: pendingListResult
			.map(({ barcode }) => {
				return studentDocuments[barcode]
			}),
		confirmedList: confirmedListResult
			.map(({ barcode }) => {
				return studentDocuments[barcode]
			}),
		rejectedList: rejectedListResult
			.map(({ barcode }) => {
				return studentDocuments[barcode]
			}),
	})
}))

router.get('/reset/:google_sheet_id/', middlewarePromiseWrapper(async (req, res) => {
	// Retrieve the current parameters.
	const googleSheetId = req.params.google_sheet_id

	// Load all the workshop and student documents.
	const [
		workshopDocuments,
		mappedStudentDocuments,
	] = await Promise.all([
		colorCrm.loadWorkshopDocuments(googleSheetId),
		colorCrm.loadStudentDocuments(googleSheetId),
	])

	// Determine the workshop assignment fields.
	const workshopAssignmentFieldsMap = Object.keys(workshopDocuments)
		.reduce((map, workshopId) => {
			map[`${workshopId}Final`] = workshopId
			return map
		}, {} as { [field: string]: string })

	// Transform the mapped student documents into an array.
	const studentDocuments = Object.keys(mappedStudentDocuments)
		.map((studentBarcode) => {
			return mappedStudentDocuments[studentBarcode]
		})

	// Clear all of the assignments.
	await knexConnection.instance('assignment_list').delete()

	// Insert new records into the assignment list.
	await knexConnection.instance('assignment_list')
		.insert(studentDocuments.reduce((array, studentDocument) => {
			Object.keys(workshopAssignmentFieldsMap).forEach((workshopAssignmentField) => {
				if (workshopAssignmentField in studentDocument) {
					if (studentDocument[workshopAssignmentField] === '1') {
						array.push({
							barcode: studentDocument.Barcode,
							ws_id: workshopAssignmentFieldsMap[workshopAssignmentField],
						})
					}
				}
			})

			return array
		}, [] as {
			barcode: string,
			ws_id: string,
		}[]))

	// Respond with a csv export suitable for importing.
	res.header({
		'Content-Type': 'text/plain',
	})
	res.status(httpStatus.OK).send(studentDocuments.map((studentDocument) => {
		const result = [studentDocument.FirstName, studentDocument.LastName, studentDocument.Email]
		Object.keys(workshopAssignmentFieldsMap).forEach((workshopAssignmentField) => {
			if (workshopAssignmentField in studentDocument) {
				if (studentDocument[workshopAssignmentField] === '1') {
					const workshopDocument = workshopDocuments[workshopAssignmentFieldsMap[workshopAssignmentField]]
					result.push(
						`${
							workshopDocument.StartTime.split(' ')[1]
						} ${
							workshopDocument.Name1} ${workshopDocument.Name2
						}`,
						workshopDocument.Prerequisites,
						// `http://138.68.85.91/confirm/submit/${workshopDocument.Id}?barcode=${studentDocument.Barcode}`,
					)
				}
			}
		})
		return result.join(',')
	}).join('\n'))
}))

router.get('/mail', middlewarePromiseWrapper(async (_req, res) => {
	// Render the confirmation email.
	res.send(httpStatus.OK).render('confirm_mail')
}))

// Expose the router instance.
export default router
