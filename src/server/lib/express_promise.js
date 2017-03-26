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
// If any of the special objects is returned as the result of the promise the next function is called.
// Otherwise no following middleware is executed.
const factory = (promiseCreator) => {
	return (req, res, next) => {
		Promise.resolve(promiseCreator(req, res))
			.then((result) => {
				if (result === nextRouteObject) {
					// If the nextRouteObject was returned, the next middleware
					// (passed in the same router call) is executed.
					next('route');
				} else if (result === nextObject) {
					// If the nextObject was returned, the next middleware
					// (passed in the following router call) is executed.
					next();
				}
			})
			.catch((err) => {
				// If an error is thrown within the promise the error middleware is executed.
				next(err);
			});
	};
};

// Append the passthrough objects to the factory function.
factory.nextRoute = nextRouteObject;
factory.next = nextObject;

// Expose the factory function.
export default factory;
