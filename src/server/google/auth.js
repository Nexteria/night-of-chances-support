// Load app modules.
import config from '@/src/server/lib/config';
import * as paths from '@/src/server/lib/paths';

// Load npm modules.
import Promise from 'bluebird';
import google from 'googleapis';
import fse from 'fs-extra';

// Load node modules.
import path from 'path';

// Promisify libraries.
Promise.promisifyAll(fs);

// Creates OAuth2 client based on config.
const createOAuth2Client = () => {
	return new google.auth.OAuth2(
		config.GOOGLE_API_CLIENT_ID,
		config.GOOGLE_API_CLIENT_SECRET,
		config.GOOGLE_API_REDIRECT_URI,
	);
};

// Define token storage file path.
const tokenStorageFilePath = path.join(paths.root, '.google_api_token');

// Generate a url for retrieving the token code.
export const generateAuthUrl = (scope) => {
	return createOAuth2Client().generateAuthUrl({
		access_type: 'offline',
		scope,
	});
};

// Get a token from the google api and store it.
export const retrieveToken = (code) => {
	return (new Promise((resolve, reject) => {
		createOAuth2Client().getToken(code, (err, token) => {
			if (err) {
				reject(err);
			} else {
				resolve(token);
			}
		});
	}))
		.then((token) => {
			return fse.writeJsonAsync(tokenStorageFilePath, token, 'utf-8');
		})
};

// Create a client that uses a stored google api token.
export const createClient = () => {
	return fse.readJsonAsync(tokenStorageFilePath, 'utf-8')
		.then((token) => {
			return Object.assign(createOAuth2Client(), {
				credentials: token,
			});
		})
};
