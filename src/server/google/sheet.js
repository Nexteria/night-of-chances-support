// Load npm modules.
import Promise from 'bluebird';
import google from 'googleapis';

// Initialize sheets api object.
const sheetsApi = google.sheets('v4');

// Defined stored auth instance.
let auth = null;

// Dynamically set auth instance.
export const setAuth = (newAuth) => {
	auth = newAuth;
};

// Retrieve values from the given range within the given spreadsheet.
export const getValues = (spreadsheetId, range) => {
	return Promise.promisify(sheetsApi.spreadsheets.values.get)({
		auth,
		spreadsheetId,
		range,
	})
		.then((res) => {
			return res.values;
		});
};
