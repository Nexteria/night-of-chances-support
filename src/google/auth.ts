// Load local modules.
import env from '.../src/.env'

// Load npm modules.
import * as fse from 'fs-extra'
import * as google from 'googleapis'

// Load node modules.
import * as path from 'path'

// Creates OAuth2 client based on config.
const createOAuth2Client = () => {
	return new google.auth.OAuth2(
		env.APP_GOOGLE_API_CLIENT_ID,
		env.APP_GOOGLE_API_CLIENT_SECRET,
		env.APP_GOOGLE_API_REDIRECT_URI,
	)
}

// Define token storage file path.
const tokenStorageFilePath = path.join(env.APP_ROOT_PATH, '.google_api_token')

// Generate a url for retrieving the token code.
export const generateAuthUrl = (scope: object) => {
	return createOAuth2Client().generateAuthUrl({
		access_type: 'offline',
		scope,
	})
}

// Get a token from the google api and store it.
export const retrieveToken = async (code: string) => {
	const token = await Promise.promisify(createOAuth2Client().getToken)(code) as string
	return fse.writeJson(tokenStorageFilePath, token)
}

// Create a client that uses a stored google api token.
export const createClient = async () => {
	const token = await fse.readJson(tokenStorageFilePath)
	const auth = createOAuth2Client()
	auth.credentials = token
	return auth
}
