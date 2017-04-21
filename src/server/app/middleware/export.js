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

router.get('/ws/:ws_id', expressPromise(async (req, res) => {
	// Retrieve the current workshop id.
	const currentWorkshopId = req.params.ws_id;
	const currentStudentWorkshopFinalField = `${currentWorkshopId}Final`;

	// Load all of the workshop and student documents.
	const [
		workshopDocuments,
		mappedStudentDocuments,
	] = await Promise.all([
		colorCrm.loadWorkshopDocuments(),
		colorCrm.loadStudentDocuments(),
	]);

	// Verify if the selected workshop id exists.
	if (!(currentWorkshopId in workshopDocuments)) {
		return res.status(httpStatus.BAD_REQUEST).send('Zadane workshop id neexistuje');
	}

	// Filter student documents.
	const studentDocuments = Object.keys(mappedStudentDocuments)
		.map((studentId) => {
			return mappedStudentDocuments[studentId];
		})
		.filter((studentDocument) => {
			return studentDocument[currentStudentWorkshopFinalField] !== '';
		})
		.map((studentDocument) => {
			return {
				...studentDocument,
				isConfirmed: studentDocument[currentStudentWorkshopFinalField] === 'P',
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
		title: `Workshop export ${currentWorkshopId}`,
		type: 'Workshop',
		eventDocument: workshopDocuments[currentWorkshopId],
		studentDocuments,
	});
}));

router.get('/sd/:sd_id', expressPromise(async (req, res) => {
	// Retrieve the current speed date id.
	const currentSpeedDateId = req.params.sd_id;
	const currentStudentSpeedDateFinalField = `${currentSpeedDateId}Final`;

	// Load all of the speed date and student documents.
	const [
		speedDateDocuments,
		mappedStudentDocuments,
	] = await Promise.all([
		colorCrm.loadSpeedDateDocuments(),
		colorCrm.loadStudentDocuments(),
	]);

	// Verify if the selected workshop id exists.
	if (!(currentSpeedDateId in speedDateDocuments)) {
		return res.status(httpStatus.BAD_REQUEST).send('Zadane speed date id neexistuje');
	}

	// Filter student documents.
	const studentDocuments = Object.keys(mappedStudentDocuments)
		.map((studentId) => {
			return mappedStudentDocuments[studentId];
		})
		.filter((studentDocument) => {
			return studentDocument[currentStudentSpeedDateFinalField] !== '';
		})
		.map((studentDocument) => {
			return {
				...studentDocument,
				isConfirmed: studentDocument[currentStudentSpeedDateFinalField] === 'P',
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
		title: `Speed date export ${currentSpeedDateId}`,
		type: 'Speed date',
		eventDocument: speedDateDocuments[currentSpeedDateId],
		studentDocuments,
	});
}));

// Expose the router instance.
export default router;
