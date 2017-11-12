// Load local modules.
import env from '.../src/.env'
import basicAuth from '.../src/app/basic_auth'
import * as colorCrm from '.../src/google/color_crm'

// Load scoped modules.
import { promiseWrapper as middlewarePromiseWrapper } from '@player1os/express-utility'

// Load npm modules.
import { Router } from 'express'
import * as httpStatus from 'http-status'
import * as lodash from 'lodash'

// Create router instance.
const router = Router()

router.use(basicAuth(
	env.APP_BASIC_AUTH_REALM,
	env.APP_BASIC_AUTH_NAME,
	env.APP_BASIC_AUTH_PASSWORD,
))

const exportMiddlewareGenerator = (
	title: string,
	exportType: string,
	exportStudentsExtractor: (
		studentDocuments: { [barcode: string]: colorCrm.IStudentDocument },
		eventId: string,
	) => colorCrm.IStudentDocument[],
) => {
	return middlewarePromiseWrapper(async (req, res) => {
		// Retrieve the current parameters.
		const { google_sheet_id: googleSheetId } = req.params
		const {
			title: documentTitle,
			logo: logoUri,
			id: filterEventId,
		} = req.query

		// Load all of the event and student documents.
		const [
			eventDocuments,
			studentDocuments,
		] = await Promise.all([
			colorCrm.loadEventDocuments(googleSheetId),
			colorCrm.loadStudentDocuments(googleSheetId),
		])

		// Filter the export event documents.
		const exportEventDocuments = lodash.filter(eventDocuments, ({ Id, Export }) => {
			return colorCrm.isTrue(Export)
				&& ((filterEventId === undefined) || (filterEventId === '') || (filterEventId === Id))
		})

		// Filter the relevant student documents for each export event document.
		const exportStudentDocuments: { [eventId: string]: colorCrm.IStudentDocument[] } = {}
		exportEventDocuments.forEach(({ Id: eventId }) => {
			// Extract the relevant student documents.
			exportStudentDocuments[eventId] = exportStudentsExtractor(studentDocuments, eventId)
		})

		// Render the response.
		res.status(httpStatus.OK).render('export', {
			exportType,
			title,
			googleSheetId,
			documentTitle,
			logoUri,
			eventDocuments: exportEventDocuments,
			studentDocuments: exportStudentDocuments,
		})
	})
}

router.get('/before-firm/:google_sheet_id', exportMiddlewareGenerator(
	'Before Firm -> Export',
	'before-firm',
	(studentDocuments, eventId) => {
		// Extract the relevant student documents.
		const result = lodash.filter(studentDocuments, (studentDocument) => {
			return colorCrm.isTrue(studentDocument[`${eventId}Auto`]) && (studentDocument[`${eventId}Final`] !== '0')
		})

		// Sort the student documents according to the is confirmed.
		result.sort((a, b) => {
			const aIsConfirmend = colorCrm.isTrue(a[`${eventId}Final`])
			const bIsConfirmend = colorCrm.isTrue(b[`${eventId}Final`])

			if (aIsConfirmend && !bIsConfirmend) {
				return -1
			}
			if (!aIsConfirmend && bIsConfirmend) {
				return 1
			}

			return `${a.LastName} ${a.FirstName}`.localeCompare(`${b.LastName} ${b.FirstName}`)
		})

		return result
	}))

router.get('/before-buddy/:google_sheet_id', exportMiddlewareGenerator(
	'Before Buddy -> Export',
	'before-buddy',
	(studentDocuments, eventId) => {
		// Extract the relevant student documents.
		const result = lodash.filter(studentDocuments, (studentDocument) => {
			return colorCrm.isTrue(studentDocument[`${eventId}Auto`]) && (studentDocument[`${eventId}Final`] !== '0')
		})

		// Sort the student documents according to the is confirmed.
		result.sort((a, b) => {
			const aIsConfirmend = colorCrm.isTrue(a[`${eventId}Final`])
			const bIsConfirmend = colorCrm.isTrue(b[`${eventId}Final`])

			if (aIsConfirmend && !bIsConfirmend) {
				return -1
			}
			if (!aIsConfirmend && bIsConfirmend) {
				return 1
			}

			return `${a.LastName} ${a.FirstName}`.localeCompare(`${b.LastName} ${b.FirstName}`)
		})

		return result
	}))

router.get('/after-firm/:google_sheet_id', exportMiddlewareGenerator(
	'After Firm -> Export',
	'after-firm',
	(studentDocuments, eventId) => {
		// Extract the relevant student documents.
		const result = lodash.filter(studentDocuments, (studentDocument) => {
			return colorCrm.isTrue(studentDocument[`${eventId}Real`])
		})

		// Sort the student documents according to the is confirmed.
		result.sort((a, b) => {
			const aIsConfirmend = colorCrm.isTrue(a[`${eventId}Real`])
			const bIsConfirmend = colorCrm.isTrue(b[`${eventId}Real`])

			if (aIsConfirmend && !bIsConfirmend) {
				return -1
			}
			if (!aIsConfirmend && bIsConfirmend) {
				return 1
			}

			return `${a.LastName} ${a.FirstName}`.localeCompare(`${b.LastName} ${b.FirstName}`)
		})

		return result
	}))

// Expose the router instance.
export default router
