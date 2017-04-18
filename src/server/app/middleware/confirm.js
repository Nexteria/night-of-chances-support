// Load app modules.
import * as dataTypes from '@/src/common/data_type';
import * as googleAuth from '@/src/server/google/auth';
import * as googleSheet from '@/src/server/google/sheet';
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
	const ws_id = req.params.ws_id;
	const {
		name,
		email,
		is_confirmed,
	} = req.query;

	const isInputValid = dataTypes.emailAddressString.validate(email)
		&& dataTypes.string.validate(ws_id)
		&& ((is_confirmed === 'true') || (is_confirmed === 'false'));
	if (!isInputValid) {
		return res.status(httpStatus.BAD_REQUEST).send('Odkaz neobsahuje požadované parametre.\n'
			+ `Prosím kontaktujte <${config.APP_CONTACT_MAIL}>`);
	}

	const result = await knex.instance('mailer_list')
		.update({
			email,
			ws_id,
			date_time_submitted: new Date(),
			is_confirmed,
		})
		.returning([ws_id, is_confirmed]);

	if (result.length === 0) {
		return res.status(httpStatus.BAD_REQUEST).send('Na dany workshop ste neboli pôvodne priradení.\n'
			+ `Ak došlo k chybe, prosím kontaktujte <${config.APP_CONTACT_MAIL}>`);
	}

	return res.status(httpStatus.OK).send(`Boli ste úspešne ${
			is_confirmed ? 'zaradení' : 'vyradení'
		} zo zoznamu účastníkov workshopu ${name}.`);
}));

router.use(expressBasicAuth(
	config.APP_BASIC_AUTH_REALM,
	config.APP_BASIC_AUTH_NAME,
	config.APP_BASIC_AUTH_PASSWORD,
));

router.get('/view/:ws_id', expressPromise(async (req, res) => {
	const ws_id = req.params.ws_id;

	if (!dataTypes.string.validate(ws_id)) {
		return res.status(httpStatus.BAD_REQUEST).send('Odkaz neobsahuje požadované parametre.');
	}

	const [
		pendingList,
		confirmedList,
		rejectedList,
	] = await Promise.all([
		knex.instance('mailer_list')
			.where({
				ws_id,
				is_confirmed: null,
			})
			.orderBy('ws_id')
			.orderBy('email'),
		knex.instance('mailer_list')
			.where({
				ws_id,
				is_confirmed: true,
			})
			.orderBy('date_time_submitted', 'desc')
			.orderBy('ws_id')
			.orderBy('email'),
		knex.instance('mailer_list')
			.where({
				ws_id,
				is_confirmed: false,
			})
			.orderBy('date_time_submitted', 'desc')
			.orderBy('ws_id')
			.orderBy('email'),
	]);

	return res.status(httpStatus.OK).render('lists', {
		title: 'Zoznam respondentov',
		pendingList,
		confirmedList,
		rejectedList,
	});
}));

router.get('/send', expressPromise(async (req, res) => {
	// Initialize google auth client.
	const googleAuthClient = await googleAuth.createClient();

	// Set authentication client for the google sheet module.
	googleSheet.setAuth(googleAuthClient);

	// Load data from the crm workshop sheet.
	const workshopSheet = await googleSheet.getValues(
		'1f5_8hDlC7Y81ZRsVPjnIwcBiMPnA3JbD2be3y5ficYE',
		"'Workshop-y'!A5:BY100",
	);

	const workshopColumnOffsets = workshopSheet[0].reduce((offsets, sheetHeader, sheetHeaderIndex) => {
		switch (sheetHeader) {
			case 'Id':
				offsets.Id = sheetHeaderIndex;
				break;
			case 'Name1':
				offsets.Name1 = sheetHeaderIndex;
				break;
			case 'Name2':
				offsets.Name2 = sheetHeaderIndex;
				break;
			case 'Prerequisites':
				offsets.Prerequisites = sheetHeaderIndex;
				break;
			default:
				break;
		}

		return offsets;
	}, {});

	const workshopDocumentMap = workshopSheet
		.filter((studentValues, index) => {
			return index > 0;
		})
		.map((workshopValues) => {
			return Object.keys(workshopColumnOffsets).reduce((document, workshopHeaderName) => {
				document[workshopHeaderName] = workshopValues[workshopColumnOffsets[workshopHeaderName]];
				return document;
			}, {});
		})
		.reduce((map, workshopDocument) => {
			map[workshopDocument.Id] = workshopDocument;
			return map;
		}, {});

	// Load data from the crm student sheet.
	const studentSheet = await googleSheet.getValues(
		'1f5_8hDlC7Y81ZRsVPjnIwcBiMPnA3JbD2be3y5ficYE',
		"'Studenti'!A8:CT1000",
	);

	const workshopPrefIdMap = Object.keys(workshopDocumentMap).reduce((map, workshopId) => {
		map[`${workshopId}Štud`] = workshopId;
		return map;
	}, {});

	const studentColumnOffsets = studentSheet[0].reduce((offsets, sheetHeader, sheetHeaderIndex) => {
		if (sheetHeader === 'Email') {
			offsets.Email = sheetHeaderIndex;
		} else if (sheetHeader in workshopPrefIdMap) {
			offsets[workshopPrefIdMap[sheetHeader]] = sheetHeaderIndex;
		}

		return offsets;
	}, {});

	const studentDocuments = studentSheet
		.filter((studentValues, index) => {
			return index > 0;
		})
		.map((studentValues) => {
			return Object.keys(studentColumnOffsets).reduce((document, studentHeaderName) => {
				document[studentHeaderName] = studentValues[studentColumnOffsets[studentHeaderName]];
				return document;
			}, {});
		});

	const listItems = studentDocuments.reduce((array, studentDocument) => {
		const email = studentDocument.Email;

		Object.keys(studentDocument).forEach((studentDocumentKey) => {
			if (studentDocumentKey in workshopDocumentMap) {
				if (studentDocument[studentDocumentKey] === '1') {
					const workshopDocument = workshopDocumentMap[studentDocumentKey];
					array.push({
						email,
						ws_id: workshopDocument.Id,
						ws_name: `${workshopDocument.Name1} - ${workshopDocument.Name2}`,
					});
				}
			}
		});

		return array;
	}, []);

	const result = await knex.instance('mailer_list')
		.insert(listItems)
		.returning(['email', 'ws_id', 'ws_name']);

	res.send(`Pridane do databazy\n${JSON.stringify(result, null, 2)}`);
}));


export default router;

