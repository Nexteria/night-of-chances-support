// Load npm modules.
import basicAuth from 'basic-auth';
import httpStatus from 'http-status';

// Expose middleware for single name-password pairs.
export default (realm, name, password) => {
	return (req, res, next) => {
		const credentials = basicAuth(req);
		if (credentials && (credentials.name === name) && (credentials.pass === password)) {
			return next();
		}

		res.setHeader('WWW-Authenticate', `Basic realm="${realm}"`);
		return res
			.status(httpStatus.UNAUTHORIZED)
			.send('Stránka nie je prístupná bez prihlásenia');
	};
};
