// Load app modules.
import BaseError from '@/src/common/error/base';

// Expose error class.
export default class MutipleEntitiesFoundError extends BaseError {
	constructor() {
		// Call parent constructor.
		super('More than a single entity exists that matches the submitted query');
	}
}
