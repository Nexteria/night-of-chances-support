// Load npm modules.
import * as basicAuth from 'basic-auth'
import {
	NextFunction,
	Request,
	Response,
} from 'express'
import * as httpStatus from 'http-status'

// Expose middleware for single name-password pairs.
export default (realm: string, name: string, password: string) => {
	return (req: Request, res: Response, next: NextFunction) => {
		const credentials = basicAuth(req)
		if ((credentials !== undefined) && (credentials.name === name) && (credentials.pass === password)) {
			return next()
		}

		res.setHeader('WWW-Authenticate', `Basic realm="${realm}"`)
		res.status(httpStatus.UNAUTHORIZED).send('Stránka nie je prístupná bez prihlásenia')
	}
}
