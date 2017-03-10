// Expose extendable error class.
export default class BaseError extends Error {
	constructor(message) {
		// Call parent constructor.
		super(message);

		// Set error name.
		this.name = this.constructor.name;

		// Set error stack.
		if (Object.prototype.hasOwnProperty.call(Error, 'captureStackTrace')) {
			Error.captureStackTrace(this, this.constructor);
		} else {
			this.stack = (new Error()).stack;
		}
	}
}
