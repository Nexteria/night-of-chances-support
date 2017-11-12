// Load local modules.
import * as googleAuth from '.../src/google/auth'
import * as googleSheet from '.../src/google/sheet'

// Load npm modules.
import * as lodash from 'lodash'

export const isTrue = (value?: string) => {
	return value === '1'
}

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
			document[headerName] = workshopValues[columnOffsets[headerName]] === undefined
				? ''
				: workshopValues[columnOffsets[headerName]].trim()
			return document
		}, {} as { [name: string]: string })
	})
	.reduce((map, document) => {
		map[document[idField]] = document
		return map
	}, {} as { [id: string]: { [name: string]: string }})
}

export interface IEventDocument {
	Id: string,
	Export: string,
	Type: string,
	Name1: string,
	Name2: string,
	StartTime: string,
	EndTime: string,
	Buddy: string,
	Room: string,

	[name: string]: string,
}

export const loadEventDocuments = async (googleSheetId: string) => {
	const result = await loadDocuments(
		googleSheetId,
		"'Eventy'!A1:I100",
		[
			'Id',
			'Export',
			'Type',
			'Name1',
			'Name2',
			'StartTime',
			'EndTime',
			'Buddy',
			'Room',
		],
		'Id',
	)

	return result as { [id: string]: IEventDocument }
}

export interface IStudentDocument {
	Barcode: string,
	FirstName: string,
	LastName: string,
	Email: string,
	CVLink: string,
	NumberScreen: string,
	SchoolScreen: string,
	GradeScreen: string,

	[name: string]: string,
}

export const loadStudentDocuments = async (googleSheetId: string) => {
	const eventDocuments = await loadEventDocuments(googleSheetId)

	const fields = [
		'FirstName',
		'LastName',
		'Barcode',
		'Email',
		'CVLink',
		'NumberScreen',
		'SchoolScreen',
		'GradeScreen',
	]

	lodash.forEach(eventDocuments, (evenDocument, eventId) => {
		if (isTrue(evenDocument.Export)) {
			fields.push(
				`${eventId}Auto`,
				`${eventId}Final`,
				`${eventId}Real`,
			)
		}
	})

	const result = await loadDocuments(
		googleSheetId,
		"'Studenti'!A8:XX1000",
		fields,
		'Barcode',
	)

	return result as { [barcode: string]: IStudentDocument }
}
