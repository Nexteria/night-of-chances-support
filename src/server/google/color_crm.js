// Load app modules.
import * as googleAuth from '@/src/server/google/auth';
import * as googleSheet from '@/src/server/google/sheet';

const getColumnOffsets = (sheetValues, fields) => {
	return sheetValues[0].reduce((offsets, sheetHeader, sheetHeaderIndex) => {
		if (fields.indexOf(sheetHeader) !== -1) {
			offsets[sheetHeader] = sheetHeaderIndex;
		}
		return offsets;
	}, {});
};

const loadDocuments = async (googleSheetId, googleSheetRange, fields, idField) => {
	// Initialize google auth client.
	const googleAuthClient = await googleAuth.createClient();

	// Set authentication client for the google sheet module.
	googleSheet.setAuth(googleAuthClient);

	// Load data from the designated sheet.
	const sheetValues = await googleSheet.getValues(googleSheetId, googleSheetRange);

	// Determine the column offsets for the selected fields.
	const columnOffsets = getColumnOffsets(sheetValues, fields);

	return sheetValues
		.filter((workshopValues, index) => {
			return index > 0;
		})
		.map((workshopValues) => {
			return Object.keys(columnOffsets).reduce((document, headerName) => {
				document[headerName] = workshopValues[columnOffsets[headerName]] || '';
				return document;
			}, {});
		})
		.reduce((map, document) => {
			map[document[idField]] = document;
			return map;
		}, {});
};

export const loadWorkshopDocuments = (googleSheetId) => {
	return loadDocuments(
		googleSheetId,
		"'Workshop-y'!A5:BY100",
		[
			'Id', 'Name1', 'Name2', 'Prerequisites',
			'StartTime', 'EndTime', 'Buddy', 'Room',
			'Type', 'Prerequisites', 'CapacityMin', 'CapacityMax',
		],
		'Id',
	);
};

export const loadSpeedDateDocuments = (googleSheetId) => {
	return loadDocuments(
		googleSheetId,
		"'Speed date-y'!A4:O100",
		[
			'Id', 'Name1', 'Name2', 'StartTime', 'EndTime',
			'Room', 'Type', 'CapacityMin', 'CapacityMax',
		],
		'Id',
	);
};

export const loadStudentDocuments = async (googleSheetId) => {
	const workshopDocuments = await loadWorkshopDocuments(googleSheetId);
	const speedDateDocuments = await loadSpeedDateDocuments(googleSheetId);

	const fields = [
		'FirstName', 'LastName', 'Barcode', 'Email', 'OrderDate',
		'TicketType', 'CVLink', 'SDMotivation', 'CommentScreen',
		'Number', 'NumberScreen', 'Rating', 'CVSumar', 'SpeedDateSumar',
		'School', 'SchoolScreen', 'Grade', 'GradeScreen',
	];
	Object.keys(workshopDocuments).forEach((workshopId) => {
		fields.push(
			`${workshopId}Štud`,
			`${workshopId}Skóre`,
			`${workshopId}Final`,
			`${workshopId}Real`,
		);
	});
	Object.keys(speedDateDocuments).forEach((speedDateId) => {
		fields.push(
			`${speedDateId}Štud`,
			`${speedDateId}Skóre`,
			`${speedDateId}Final`,
			`${speedDateId}Real`,
		);
	});

	return loadDocuments(
		googleSheetId,
		"'Studenti'!A8:CT1000",
		fields, 'Barcode',
	);
};
