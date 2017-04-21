// Load app modules.
import * as dataTypes from '@/src/common/data_type';
import * as colorCrm from '@/src/server/google/color_crm';
import config from '@/src/server/lib/config';
import expressBasicAuth from '@/src/server/lib/express_basic_auth';
import expressPromise from '@/src/server/lib/express_promise';
import knex from '@/src/server/knex';

// Load npm modules.
import Promise from 'bluebird';
import {
	Router as expressRouter,
} from 'express';
import httpStatus from 'http-status';

// Create router instance.
const router = expressRouter();

router.get('/submit/:ws_id', expressPromise(async (req, res) => {
	// Retrieve parameters from the request.
	const ws_id = req.params.ws_id;
	const {
		barcode,
		is_confirmed,
	} = req.query;

	// Validate the inputs.
	const isInputValid = dataTypes.string.validate(barcode)
		&& dataTypes.string.validate(ws_id)
		&& ((is_confirmed === 'true') || (is_confirmed === 'false'));
	if (!isInputValid) {
		return res.status(httpStatus.BAD_REQUEST).send('Odkaz neobsahuje požadované parametre.\n'
			+ `Prosím kontaktujte <${config.APP_CONTACT_MAIL}>`);
	}

	const [
		stateChangeResult,
		mappedWorkshopDocuments,
	] = await Promise.all([
		// Update the state in the confirmation list.
		knex.instance('assignment_list')
			.update({
				date_time_submitted: new Date(),
				is_confirmed: is_confirmed === 'true',
			})
			.where({
				barcode,
				ws_id,
			}),
		// Load all of the workshop documents.
		colorCrm.loadWorkshopDocuments(),
	]);

	// Load all of the current student's confirmed workshop ids.
	const confirmedWorkshopIdsResult = await knex.instance('assignment_list')
		.select('ws_id')
		.where({
			barcode,
		});
	const confirmedWorkshopIds = confirmedWorkshopIdsResult
		.map((result) => {
			return result.ws_id;
		});

	// Filter out only the current student's confirmed workshop documents.
	const workshopDocuments = Object.keys(mappedWorkshopDocuments)
		.map((workshopId) => {
			return mappedWorkshopDocuments[workshopId];
		})
		.filter((workshopDocument) => {
			return confirmedWorkshopIds.indexOf(workshopDocument.Id) !== -1;
		});

	return res.status(httpStatus.OK).render('confirm_submit', {
		currentWorkshopDocument: mappedWorkshopDocuments[ws_id],
		workshopDocuments,
		isValid: stateChangeResult.length > 0,
		contactMail: config.APP_CONTACT_MAIL,
	});
}));

router.use(expressBasicAuth(
	config.APP_BASIC_AUTH_REALM,
	config.APP_BASIC_AUTH_NAME,
	config.APP_BASIC_AUTH_PASSWORD,
));

router.get('/list/:ws_id', expressPromise(async (req, res) => {
	// Retrieve parameters from the request.
	const ws_id = req.params.ws_id;

	// Validate the inputs.
	if (!dataTypes.string.validate(ws_id)) {
		return res.status(httpStatus.BAD_REQUEST).send('Odkaz neobsahuje požadované parametre.');
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
		knex.instance('assignment_list')
			.select('barcode')
			.where({
				ws_id,
				is_confirmed: null,
			})
			.orderBy('ws_id'),
		// Load the list of pending workshop assignments.
		knex.instance('assignment_list')
			.select('barcode')
			.where({
				ws_id,
				is_confirmed: true,
			})
			.orderBy('date_time_submitted', 'desc'),
		// Load the list of pending workshop assignments.
		knex.instance('assignment_list')
			.select('barcode')
			.where({
				ws_id,
				is_confirmed: false,
			})
			.orderBy('date_time_submitted', 'desc'),
		// Load all of the workshop documents.
		colorCrm.loadWorkshopDocuments(),
		// Load all of the student documents.
		colorCrm.loadStudentDocuments(),
	]);

	return res.status(httpStatus.OK).render('lists', {
		title: 'Zoznam respondentov',
		workshopDocument: workshopDocuments[ws_id],
		pendingList: pendingListResult
			.map((barcode) => {
				return studentDocuments[barcode];
			}),
		confirmedList: confirmedListResult
			.map((barcode) => {
				return studentDocuments[barcode];
			}),
		rejectedList: rejectedListResult
			.map((barcode) => {
				return studentDocuments[barcode];
			}),
	});
}));

router.get('/reset', expressPromise(async (req, res) => {
	// Load all the workshop and student documents.
	const [
		workshopDocuments,
		mappedStudentDocuments,
	] = await Promise.all([
		colorCrm.loadWorkshopDocuments(),
		colorCrm.loadStudentDocuments(),
	]);

	// Determine the workshop assignment fields.
	const workshopAssignmentFieldsMap = Object.keys(workshopDocuments)
		.reduce((map, workshopId) => {
			map[`${workshopId}Final`] = workshopId;
			return map;
		}, {});

	// Transform the mapped student documents into an array.
	const studentDocuments = Object.keys(mappedStudentDocuments)
		.map((studentBarcode) => {
			return mappedStudentDocuments[studentBarcode];
		});

	// Clear all of the assignments.
	await knex.instance('assignment_list').delete();

	// Insert new records into the assignment list.
	await knex.instance('assignment_list')
		.insert(studentDocuments.reduce((array, studentDocument) => {
			Object.keys(workshopAssignmentFieldsMap).forEach((workshopAssignmentField) => {
				if (workshopAssignmentField in studentDocument) {
					if (studentDocument[workshopAssignmentField] === '1') {
						array.push({
							barcode: studentDocument.Barcode,
							ws_id: workshopAssignmentFieldsMap[workshopAssignmentField],
						});
					}
				}
			});

			return array;
		}, []));

	// Respond with a csv export suitable for importing.
	res.header({
		'Content-Type': 'text/plain',
	});
	res.status(httpStatus.OK).send(studentDocuments.map((studentDocument) => {
		const result = [studentDocument.FirstName, studentDocument.LastName, studentDocument.Email];
		Object.keys(workshopAssignmentFieldsMap).forEach((workshopAssignmentField) => {
			if (workshopAssignmentField in studentDocument) {
				if (studentDocument[workshopAssignmentField] === '1') {
					const workshopDocument = workshopDocuments[workshopAssignmentFieldsMap[workshopAssignmentField]];
					result.push(
						`${
							workshopDocument.StartTime.split(' ')[1]
						} ${
							workshopDocument.Name1} ${workshopDocument.Name2
						}`,
						workshopDocument.Prerequisites,
					//`http://138.68.85.91/confirm/submit/${workshopDocument.Id}?barcode=${studentDocument.Barcode}`,
					);
				}
			}
		});
		return result.join(',');
	}).join('\n'));
}));

router.get('/mail', expressPromise(async (req, res) => {
	// Render the confirmation email.
	res.send(httpStatus.OK).render('confirm_mail');
}));

// Expose the router instance.
export default router;
