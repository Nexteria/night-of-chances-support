// Load app modules.
import {
	ValidationError,
} from '@/src/common/error';

// Load npm modules.
import Joi from 'joi';

// Define a validator for joi schemas.
export default class {
	constructor(schema) {
		this.schema = schema;
	}

	validate(input, isThrowDisabled) {
		const error = Joi.validate(input, this.schema, {
			abortEarly: false,
			convert: false,
		}).error;

		if (!isThrowDisabled && error) {
			throw new ValidationError(error);
		}

		return error;
	}
}
