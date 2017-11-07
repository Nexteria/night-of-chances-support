// Load local modules.
import BaseError from '@/src/common/error/base';

// Expose error class.
export default class UnauthorizedAccessError extends BaseError {
	constructor() {
		// Call parent constructor.
		super('The verified user is not authorized to access the given entity');
	}
}
