// Load local modules.
import BaseError from '@/src/common/error/base';

// Expose error class.
export default class ValidationError extends BaseError {
	constructor(joiError) {
		// Call parent constructor.
		super('The submitted input failed to pass the required validation tests');

		// Retrieve original input.
		this.input = joiError._object;

		// Retrieve validation failures.
		this.detail = joiError.details.reduce((previousValue, currentValue) => {
			previousValue[currentValue.path] = {
				input: this.input[currentValue.path],
				type: currentValue.type,
				message: currentValue.message,
			};

			return previousValue;
		}, {});
	}
}
