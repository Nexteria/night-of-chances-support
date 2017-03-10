// Load app modules.
import BaseError from '@/src/common/error/base';

// Expose error class.
export default class UnidentifiedUserError extends BaseError {
	constructor() {
		// Call parent constructor.
		super('The user cannot be identified');
	}
}
