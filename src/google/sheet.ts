// Load npm modules.
import * as google from 'googleapis'

// Initialize sheets api object.
const sheetsApi = google.sheets('v4')

// Defined stored auth instance.
let auth: google.auth.OAuth2 | null = null

// Dynamically set auth instance.
export const setAuth = (newAuth: google.auth.OAuth2) => {
	auth = newAuth
}

// Retrieve values from the given range within the given spreadsheet.
const getAsync = Promise.promisify(sheetsApi.spreadsheets.values.get)
export const getValues = async (spreadsheetId: string, range: string) => {
	if (auth === null) {
		throw new Error('The auth object has not been set')
	}

	const res = await getAsync({
		auth,
		spreadsheetId,
		range,
	})
	return res.values
}
