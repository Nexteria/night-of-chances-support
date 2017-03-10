// Load app modules.
import BaseError from '@/src/common/error/base';

// Expose error class.
export default class InvalidTokenError extends BaseError {
	constructor(jwtError) {
		// Call parent constructor.
		super('The submitted token cannot be deciphered');

		// Retrieve jwt error reason.
		this.reason = jwtError.message;
	}
}
