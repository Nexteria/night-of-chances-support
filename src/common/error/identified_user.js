// Load local modules.
import BaseError from '@/src/common/error/base';

// Expose error class.
export default class IdentifiedUserError extends BaseError {
	constructor() {
		// Call parent constructor.
		super("The user mustn't be logged on to access the given entity");
	}
}
