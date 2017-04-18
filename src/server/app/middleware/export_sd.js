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

router.get('/:sd_id', expressPromise(async (req, res) => {
	// Initialize google auth client.
	const googleAuthClient = await googleAuth.createClient();

	// Set authentication client for the google sheet module.
	googleSheet.setAuth(googleAuthClient);

	// Load data from the crm speed date sheet.
	const speedDateSheet = await googleSheet.getValues(
		'1f5_8hDlC7Y81ZRsVPjnIwcBiMPnA3JbD2be3y5ficYE',
		"'Speed date-y'!A4:O100",
	);

	const speedDateDocument = speedDateSheet.reduce((value, speedDateValues) => {
		if (value === null) {
			if (speedDateValues[0] === req.params.sd_id) {
				return {
					id: speedDateValues[0],
					name: speedDateValues[2],
					firm: speedDateValues[1],
					time: `${speedDateValues[3].split(' ')[1]} - ${speedDateValues[4].split(' ')[1]}`,
					buddy: speedDateValues[5],
					room: speedDateValues[6],
				};
			}
		}

		return value;
	}, null);

	if (speedDateDocument === null) {
		return res.status(httpStatus.BAD_REQUEST).send('Zadane speed date id neexistuje');
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
			case 'NumberScreen':
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
			case `${speedDateDocument.id}Final`:
				offsets.speedDateAssign = sheetHeaderIndex;
				break;
			default:
				break;
		}

		return offsets;
	}, {});

	const studentDocuments = studentSheet
		.filter((studentValues, index) => {
			return (index > 0) && (studentValues[studentColumnOffsets.speedDateAssign] !== '');
		})
		.map((studentValues) => {
			const studentDocument = Object.keys(studentColumnOffsets).reduce((document, studentHeaderName) => {
				document[studentHeaderName] = studentValues[studentColumnOffsets[studentHeaderName]];
				return document;
			}, {});

			return {
				...studentDocument,
				isConfirmed: studentDocument.speedDateAssign === 'P',
			};
		});

	studentDocuments.sort((a, b) => {
		if (a.isConfirmed && !b.isConfirmed) {
			return -1;
		}
		if (!a.isConfirmed && b.isConfirmed) {
			return 1;
		}
		return 0;
	});

	return res.status(httpStatus.OK).render('export', {
		title: `Export ${speedDateDocument.id}`,
		type: 'Speed date',
		eventDocument: speedDateDocument,
		studentDocuments,
	});
}));

// Expose router instance.
export default router;
