// Load app modules.
import * as googleAuth from '@/src/server/google/auth';
import * as googleSheet from '@/src/server/google/sheet';
import config from '@/src/server/lib/config';
import expressBasicAuth from '@/src/server/lib/express_basic_auth';
import expressPromise from '@/src/server/lib/express_promise';

// Load npm modules.
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

router.get('/:ws_id', expressPromise(async (req, res) => {
	// Initialize google auth client.
	const googleAuthClient = await googleAuth.createClient();

	// Set authentication client for the google sheet module.
	googleSheet.setAuth(googleAuthClient);

	// Load data from the crm workshop sheet.
	const workshopSheet = await googleSheet.getValues(
		'1f5_8hDlC7Y81ZRsVPjnIwcBiMPnA3JbD2be3y5ficYE',
		"'Workshop-y'!A5:BY100",
	);

	const workshopDocument = workshopSheet.reduce((value, workshopValues) => {
		if (value === null) {
			if (workshopValues[0] === req.params.ws_id) {
				return {
					id: workshopValues[0],
					name: workshopValues[2],
					firm: workshopValues[1],
					time: `${workshopValues[3].split(' ')[1]} - ${workshopValues[4].split(' ')[1]}`,
					buddy: workshopValues[5],
					room: workshopValues[6],
				};
			}
		}

		return value;
	}, null);

	if (workshopDocument === null) {
		return res.status(httpStatus.BAD_REQUEST).send('Zadane workshop id neexistuje');
	}

	// Load data from the crm student sheet.
	const studentSheet = await googleSheet.getValues(
		'1f5_8hDlC7Y81ZRsVPjnIwcBiMPnA3JbD2be3y5ficYE',
		"'Studenti'!A8:CT1000",
	);

	const studentColumnOffsets = studentSheet[0].reduce((offsets, sheetHeader, sheetHeaderIndex) => {
		switch (sheetHeader) {
			case 'FirstName':
				offsets.FirstName = sheetHeaderIndex;
				break;
			case 'LastName':
				offsets.LastName = sheetHeaderIndex;
				break;
			case 'Email':
				offsets.Email = sheetHeaderIndex;
				break;
			case 'Number':
				offsets.Number = sheetHeaderIndex;
				break;
			case 'School':
				offsets.School = sheetHeaderIndex;
				break;
			case 'Grade':
				offsets.Grade = sheetHeaderIndex;
				break;
			case 'CVLink':
				offsets.CVLink = sheetHeaderIndex;
				break;
			case `${workshopDocument.id}Final`:
				offsets.workshopAssign = sheetHeaderIndex;
				break;
			default:
				break;
		}

		return offsets;
	}, {});

	const studentDocuments = studentSheet
		.filter((studentValues, index) => {
			return (index > 0) && (studentValues[studentColumnOffsets.workshopAssign] !== '');
		})
		.map((studentValues) => {
			const studentDocument = Object.keys(studentColumnOffsets).reduce((document, studentHeaderName) => {
				document[studentHeaderName] = studentValues[studentColumnOffsets[studentHeaderName]];
				return document;
			}, {});

			return {
				...studentDocument,
				isConfirmed: studentDocument.workshopAssign === 'P',
			};
		});

	return res.status(httpStatus.OK).render('export', {
		title: `Export ${workshopDocument.id}`,
		workshopDocument,
		studentDocuments,
	});
}));

// Expose router instance.
export default router;
