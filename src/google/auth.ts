// Load local modules.
import env from '.../src/.env'

// Load npm modules.
import * as google from 'googleapis'

// Creates OAuth2 client based on config.
const createOAuth2Client = () => {
	return new google.auth.OAuth2(
		env.APP_GOOGLE_API_CLIENT_ID,
		env.APP_GOOGLE_API_CLIENT_SECRET,
		'urn:ietf:wg:oauth:2.0:oob',
	)
}

// Generate a url for retrieving the token code.
export const generateAuthUrl = (scope: object) => {
	return createOAuth2Client().generateAuthUrl({
		access_type: 'offline',
		scope,
	})
}

// Get a token from the google api and store it.
export const retrieveToken = async (code: string) => {
	const token = await new Promise((resolve: (result: string) => void, reject) => {
		createOAuth2Client().getToken(code, (err, result) => {
			if (err !== null) {
				reject(err)
			} else {
				resolve(result)
			}
		})
	})
	return token
}

// Create a client that uses a stored google api token.
export const createClient = async () => {
	const auth = createOAuth2Client()
	auth.credentials = env.APP_GOOGLE_API_TOKEN
	return auth
}
