#!/usr/bin/env node

// Load local modules.
import env from '.../src/.env'
import * as googleAuth from '.../src/google/auth'

// Load scoped modules.
import executePromise from '@player1os/execute-promise'

// Load node modules.
import * as readline from 'readline'

executePromise(async () => {
	// Generate and output the auth url for the specified scopes.
	console.log( // tslint:disable-line:no-console
		`Authorize this app by visiting this url:\n${googleAuth.generateAuthUrl(env.APP_GOOGLE_API_SCOPES)}`,
	)

	// Prompt user to enter the authorization code.
	const readlineInterface = readline.createInterface({
		input: process.stdin,
		output: process.stdout,
	})
	const code = await (new Promise((resolve: (result: string) => void) => {
		readlineInterface.question('Enter the code from that page here:\n', (result) => {
			resolve(result)
		})
	}))
	readlineInterface.close()

	// Attempt to retrieve the google api token based on the entered code.
	const token = await googleAuth.retrieveToken(code)

	// Output success message.
	console.log('Google Api token successfully stored:') // tslint:disable-line:no-console
	console.log(token) // tslint:disable-line:no-console
})
