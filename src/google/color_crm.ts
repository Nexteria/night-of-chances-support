// Load local modules.
import * as googleAuth from '.../src/google/auth'
import * as googleSheet from '.../src/google/sheet'

const getColumnOffsets = (sheetValues: string[][], fields: string[]) => {
	return sheetValues[0].reduce((offsets, sheetHeader, sheetHeaderIndex) => {
		if (fields.indexOf(sheetHeader) !== -1) {
			offsets[sheetHeader] = sheetHeaderIndex
		}
		return offsets
	}, {} as { [header: string]: number })
}

const loadDocuments = async (googleSheetId: string, googleSheetRange: string, fields: string[], idField: string) => {
	// Initialize google auth client.
	const googleAuthClient = await googleAuth.createClient()

	// Set authentication client for the google sheet module.
	googleSheet.setAuth(googleAuthClient)

	// Load data from the designated sheet.
	const sheetValues = await googleSheet.getValues(googleSheetId, googleSheetRange)

	// Determine the column offsets for the selected fields.
	const columnOffsets = getColumnOffsets(sheetValues, fields)

	return sheetValues.slice(1).map((workshopValues) => {
		return Object.keys(columnOffsets).reduce((document, headerName) => {
			document[headerName] = workshopValues[columnOffsets[headerName]] || ''
			return document
		}, {} as { [name: string]: string })
	})
	.reduce((map, document) => {
		map[document[idField]] = document
		return map
	}, {} as { [id: string]: { [name: string]: string }})
}

export const loadWorkshopDocuments = (googleSheetId: string) => {
	return loadDocuments(
		googleSheetId,
		"'Workshop-y'!A1:G100",
		[
			'Id', 'Name1', 'Name2', /* 'Prerequisites', */
			'StartTime', 'EndTime', 'Buddy', 'Room',
			'Type', /* 'Prerequisites', 'CapacityMin', 'CapacityMax', */
		],
		'Id',
	)
}

export const loadSpeedDateDocuments = (googleSheetId: string) => {
	return loadDocuments(
		googleSheetId,
		"'Speed date-y'!A4:O100",
		[
			'Id', 'Name1', 'Name2', 'StartTime', 'EndTime',
			'Room', 'Type', 'CapacityMin', 'CapacityMax',
		],
		'Id',
	)
}

export const loadStudentDocuments = async (googleSheetId: string) => {
	const workshopDocuments = await loadWorkshopDocuments(googleSheetId)
	// const speedDateDocuments = await loadSpeedDateDocuments(googleSheetId)

	const fields = [
		'FirstName', 'LastName', 'Barcode', 'Email', /* 'OrderDate', */
		/* 'TicketType', */ 'CVLink', /* 'SDMotivation', 'CommentScreen', */
		/* 'Number', */ 'NumberScreen', /* 'Rating', 'CVSumar', 'SpeedDateSumar', */
		/* 'School', */ 'SchoolScreen', /* 'Grade', */ 'GradeScreen',
	]
	Object.keys(workshopDocuments).forEach((workshopId) => {
		fields.push(
			`${workshopId}Štud`,
			`${workshopId}Skóre`,
			`${workshopId}Auto`,
			`${workshopId}Final`,
			`${workshopId}Real`,
		)
	})
	// Object.keys(speedDateDocuments).forEach((speedDateId) => {
	// 	fields.push(
	// 		`${speedDateId}Štud`,
	// 		`${speedDateId}Skóre`,
	// 		`${speedDateId}Final`,
	// 		`${speedDateId}Real`,
	// 	)
	// })

	return loadDocuments(
		googleSheetId,
		"'Studenti'!A8:IT1000",
		fields, 'Barcode',
	)
}
