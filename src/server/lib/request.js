// Load npm module.
import requestPromise from 'request-promise';

// Expose promisified request object with predefined defaults.
export default requestPromise.defaults({
	simple: false,
	resolveWithFullResponse: true,
});
