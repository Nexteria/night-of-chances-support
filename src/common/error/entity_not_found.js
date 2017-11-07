// Load local modules.
import BaseError from '@/src/common/error/base';

// Expose error class.
export default class EntityNotFoundError extends BaseError {
	constructor() {
		// Call parent constructor.
		super('No entity exists that matches the submitted query');
	}
}
