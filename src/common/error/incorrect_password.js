// Load app modules.
import BaseError from '@/src/common/error/base';

// Expose error class.
export default class IncorrectPasswordError extends BaseError {
	constructor() {
		// Call parent constructor.
		super('An incorrect password was submitted');
	}
}
