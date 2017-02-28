// Load app modules.
import * as googleAuth from '@/src/server/google/auth';
import config from '@/src/server/lib/config';

// Load npm modules.
import Promise from 'bluebird';

// Load node modules.
import readline from 'readline';

// Generate and output the auth url for the specified scopes.
console.log('Authorize this app by visiting this url:\n'
	+ googleAuth.generateAuthUrl(config.GOOGLE_API_REDIRECT_SCOPES));

// Prompt user to enter the authorization code.
const readlineInterface = readline.createInterface({
	input: process.stdin,
	output: process.stdout,
});
(new Promise((resolve) => {
	readlineInterface.question('Enter the code from that page here:\n', resolve);
}))
	.then((code) => {
		// Close the cli read line interface.
		readlineInterface.close();

		// Attempt to retrieve the google api token based on the entered code.
		return googleAuth.retrieveToken(code);
	})
	.then(() => {
		// Output success message.
		console.log('Google Api token successfully stored.');
	})
	.catch((err) => {
		// Crash and report error on failure.
		throw err;
	});
