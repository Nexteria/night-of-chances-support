/* eslint-disable no-console */

// Load app modules.
import * as googleAuth from '@/src/server/google/auth';
import * as googleSheet from '@/src/server/google/sheet';
import config from '@/src/server/lib/config';

// Initialize google auth client.
googleAuth.createClient()
	.then((googleAuthClient) => {
		// Set authentication client for the google sheet module.
		googleSheet.setAuth(googleAuthClient);

		// Load data from the preferences sheet.
		return googleSheet.getValues(
			config.GOOGLE_SHEET_PREFERENCES_SPREADSHEET_ID,
			'A:N',
		);
	})
	.then((preferenceValues) => {
		// Store the retrieved preference values.
		// TODO: Implement.
		console.log(preferenceValues[0]);
		console.log(preferenceValues.length);
	})
	.catch((err) => {
		// Crash and report error on failure.
		throw err;
	});
