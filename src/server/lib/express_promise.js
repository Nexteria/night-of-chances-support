// Load npm modules.
import Promise from 'bluebird';

// Declare the passthrough objects.
const nextRouteObject = {
	next_route: true,
};
const nextObject = {
	next: true,
};

// Converts a promise into a callback that is acceptable by express.
// Depending on the result of the promise the following outcomes may occur:
// - nextRouteObject: the next middleware (passed in the same router call) is executed.
// - nextObject: the next middleware (passed in the following router call) is executed.
// - anything else: no middleware is executed.
// If an error is thrown within the promise the error middleware is executed.
const factory = (promiseCreator) => {
	return (req, res, next) => {
		Promise.resolve(promiseCreator(req, res))
			.then((result) => {
				if (result === nextRouteObject) {
					next('route');
				} else if (result === nextObject) {
					next();
				}
			})
			.catch((err) => {
				next(err);
			});
	};
};

// Append the passthrough objects to the factory function.
factory.nextRoute = nextRouteObject;
factory.next = nextObject;

// Expose the factory function.
export default factory;
