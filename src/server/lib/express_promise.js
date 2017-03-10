// Load npm modules.
import Promise from 'bluebird';

// Converts a promise into a callback that is acceptable by express.
// Depending on the result of the promise the following outcomes may occur:
// - true: the next middleware (passed in the same router call) is executed.
// - false: the next middleware (passed in the following router call) is executed.
// - anything else: no middleware is executed.
// If an error is thrown within the promise the error middleware is executed.
export default (promiseCreator) => {
	return (req, res, next) => {
		Promise.resolve(promiseCreator(req, res))
			.then((result) => {
				if (result === true) {
					next('route');
				} else if (result === false) {
					next();
				}
			})
			.catch((err) => {
				next(err);
			});
	};
};
