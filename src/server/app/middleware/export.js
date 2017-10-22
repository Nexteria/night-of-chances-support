// Load app modules.
import * as colorCrm from '@/src/server/google/color_crm';
import config from '@/src/server/lib/config';
import expressBasicAuth from '@/src/server/lib/express_basic_auth';
import expressPromise from '@/src/server/lib/express_promise';

// Load npm modules.
import Promise from 'bluebird';
import {
	Router as expressRouter,
} from 'express';
import httpStatus from 'http-status';

// Create router instance.
const router = expressRouter();

router.use(expressBasicAuth(
	config.APP_BASIC_AUTH_REALM,
	config.APP_BASIC_AUTH_NAME,
	config.APP_BASIC_AUTH_PASSWORD,
));

router.get('/:google_sheet_id/:field_type/ws/:ws_id', expressPromise(async (req, res) => {
	// Retrieve the current parameters.
	const {
		google_sheet_id: googleSheetId,
		field_type: fieldType,
		ws_id: workshopId,
	} = req.params;
	const currentStudentWorkshopField = workshopId + fieldType;

	// Load all of the workshop and student documents.
	const [
		workshopDocuments,
		mappedStudentDocuments,
	] = await Promise.all([
		colorCrm.loadWorkshopDocuments(googleSheetId),
		colorCrm.loadStudentDocuments(googleSheetId),
	]);

	// Verify if the selected workshop id exists.
	if (!(workshopId in workshopDocuments)) {
		return res.status(httpStatus.BAD_REQUEST).send('Zadane workshop id neexistuje');
	}

	// Filter student documents.
	const studentDocuments = Object.keys(mappedStudentDocuments)
		.map((studentId) => {
			return mappedStudentDocuments[studentId];
		})
		.filter((studentDocument) => {
			return studentDocument[currentStudentWorkshopField] !== '';
		})/*
		.map((studentDocument) => {
			return {
				...studentDocument,
				isConfirmed: studentDocument[currentStudentWorkshopField] === 'P',
			};
		});
		*/

	/*
	// Sort the student documents according to the is confirmed.
	studentDocuments.sort((a, b) => {
		if (a.isConfirmed && !b.isConfirmed) {
			return -1;
		}
		if (!a.isConfirmed && b.isConfirmed) {
			return 1;
		}
		return 0;
	});
	*/

	// Render the response.
	return res.status(httpStatus.OK).render('export', {
		title: `${fieldType} Workshop export ${workshopId}`,
		type: 'Workshop',
		fieldType,
		eventDocument: workshopDocuments[workshopId],
		studentDocuments,
	});
}));

router.get('/:google_sheet_id/:field_type/sd/:sd_id', expressPromise(async (req, res) => {
	// Retrieve the current parameters.
	const {
		google_sheet_id: googleSheetId,
		field_type: fieldType,
		sd_id: speedDateId,
	} = req.params;
	const currentStudentSpeedDateField = speedDateId + fieldType;

	// Load all of the speed date and student documents.
	const [
		speedDateDocuments,
		mappedStudentDocuments,
	] = await Promise.all([
		colorCrm.loadSpeedDateDocuments(googleSheetId),
		colorCrm.loadStudentDocuments(googleSheetId),
	]);

	// Verify if the selected workshop id exists.
	if (!(speedDateId in speedDateDocuments)) {
		return res.status(httpStatus.BAD_REQUEST).send('Zadane speed date id neexistuje');
	}

	// Filter student documents.
	const studentDocuments = Object.keys(mappedStudentDocuments)
		.map((studentId) => {
			return mappedStudentDocuments[studentId];
		})
		.filter((studentDocument) => {
			return studentDocument[currentStudentSpeedDateField] !== '';
		})
		.map((studentDocument) => {
			return {
				...studentDocument,
				isConfirmed: studentDocument[currentStudentSpeedDateField] === 'P',
			};
		});

	// Sort the student documents according to the is confirmed.
	studentDocuments.sort((a, b) => {
		if (a.isConfirmed && !b.isConfirmed) {
			return -1;
		}
		if (!a.isConfirmed && b.isConfirmed) {
			return 1;
		}
		return 0;
	});

	// Render the response.
	return res.status(httpStatus.OK).render('export', {
		title: `${fieldType} Speed date export ${speedDateId}`,
		type: 'Speed date',
		fieldType,
		eventDocument: speedDateDocuments[speedDateId],
		studentDocuments,
	});
}));

// Expose the router instance.
export default router;
