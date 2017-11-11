// Load local modules.
import env from '.../src/.env'
import basicAuth from '.../src/app/basic_auth'
import * as colorCrm from '.../src/google/color_crm'

// Load scoped modules.
import { promiseWrapper as middlewarePromiseWrapper } from '@player1os/express-utility'

// Load npm modules.
import { Router } from 'express'
import * as httpStatus from 'http-status'

// Create router instance.
const router = Router()

router.use(basicAuth(
	env.APP_BASIC_AUTH_REALM,
	env.APP_BASIC_AUTH_NAME,
	env.APP_BASIC_AUTH_PASSWORD,
))

router.get('/before/buddy/:google_sheet_id', middlewarePromiseWrapper(async (req, res) => {
	// Retrieve the current parameters.
	const {
		google_sheet_id: googleSheetId,
		field_type: fieldType,
		ws_id: workshopId,
	} = req.params
	const currentStudentWorkshopField = workshopId + fieldType
	// const currentStudentWorkshopField2 = workshopId + 'Final'

	// Load all of the workshop and student documents.
	const [
		workshopDocuments,
		mappedStudentDocuments,
	] = await Promise.all([
		colorCrm.loadWorkshopDocuments(googleSheetId),
		colorCrm.loadStudentDocuments(googleSheetId),
	])

	// Verify if the selected workshop id exists.
	if (!(workshopId in workshopDocuments)) {
		return res.status(httpStatus.BAD_REQUEST).send('Zadane workshop id neexistuje')
	}

	// Filter student documents.
	const studentDocuments = Object.keys(mappedStudentDocuments)
		.map((studentId) => {
			return mappedStudentDocuments[studentId]
		})
		.filter((studentDocument) => {
			return (
				(studentDocument[currentStudentWorkshopField] !== undefined)
				&& (studentDocument[currentStudentWorkshopField].toString() === '1')
			)
			/* || (
				(studentDocument[currentStudentWorkshopField2] !== undefined)
				&& (studentDocument[currentStudentWorkshopField2].toString() === '1')
			)*/

		})
		/*
		.map((studentDocument) => {
			return {
				...studentDocument,
				isConfirmed: (studentDocument[currentStudentWorkshopField2] !== undefined)
					&& (studentDocument[currentStudentWorkshopField2].toString() === '1'),
			}
		})
		*/

	// Sort the student documents according to the is confirmed.
	// studentDocuments.sort((a, b) => {
	// 	if (a.isConfirmed && !b.isConfirmed) {
	// 		return -1
	// 	}
	// 	if (!a.isConfirmed && b.isConfirmed) {
	// 		return 1
	// 	}
	// 	return 0
	// })

	// Render the response.
	return res.status(httpStatus.OK).render('export', {
		title: `${fieldType} Before Buddy -> Workshop export ${workshopId}`,
		type: 'Workshop',
		fieldType,
		eventDocument: workshopDocuments[workshopId],
		studentDocuments,
	})
}))

router.get('/before/firm/:google_sheet_id', middlewarePromiseWrapper(async (req, res) => {
}))

router.get('/after/firm/:google_sheet_id', middlewarePromiseWrapper(async (req, res) => {
}))

// router.get('/sd/:google_sheet_id/:field_type/:sd_id', middlewarePromiseWrapper(async (req, res) => {
// 	// Retrieve the current parameters.
// 	const {
// 		google_sheet_id: googleSheetId,
// 		field_type: fieldType,
// 		sd_id: speedDateId,
// 	} = req.params
// 	const currentStudentSpeedDateField = speedDateId + fieldType

// 	// Load all of the speed date and student documents.
// 	const [
// 		speedDateDocuments,
// 		mappedStudentDocuments,
// 	] = await Promise.all([
// 		colorCrm.loadSpeedDateDocuments(googleSheetId),
// 		colorCrm.loadStudentDocuments(googleSheetId),
// 	])

// 	// Verify if the selected workshop id exists.
// 	if (!(speedDateId in speedDateDocuments)) {
// 		return res.status(httpStatus.BAD_REQUEST).send('Zadane speed date id neexistuje')
// 	}

// 	// Filter student documents.
// 	const studentDocuments = Object.keys(mappedStudentDocuments)
// 		.map((studentId) => {
// 			return mappedStudentDocuments[studentId]
// 		})
// 		.filter((studentDocument) => {
// 			return studentDocument[currentStudentSpeedDateField] !== ''
// 		})
// 		.map((studentDocument) => {
// 			return {
// 				...studentDocument,
// 				isConfirmed: studentDocument[currentStudentSpeedDateField] === 'P',
// 			}
// 		})

// 	// Sort the student documents according to the is confirmed.
// 	studentDocuments.sort((a, b) => {
// 		if (a.isConfirmed && !b.isConfirmed) {
// 			return -1
// 		}
// 		if (!a.isConfirmed && b.isConfirmed) {
// 			return 1
// 		}
// 		return 0
// 	})

// 	// Render the response.
// 	return res.status(httpStatus.OK).render('export', {
// 		title: `${fieldType} Speed date export ${speedDateId}`,
// 		type: 'Speed date',
// 		fieldType,
// 		eventDocument: speedDateDocuments[speedDateId],
// 		studentDocuments,
// 	})
// }))

// Expose the router instance.
export default router
