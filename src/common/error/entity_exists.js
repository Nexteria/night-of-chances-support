// Load app modules.
import BaseError from '@/src/common/error/base';

// Expose error class.
export default class EntityExistsError extends BaseError {
	constructor(knexError) {
		// Call parent constructor.
		super('An entity already exists with the submitted unique field values');

		// Parse knex error.
		const matches = knexError.detail.match(/^Key \((.*)\)=\((.*)\) already exists.$/);
		const field = matches[1];
		const value = matches[2];

		// Fill error properties.
		this.constraint = knexError.constraint;
		this.field = `${knexError.table}.${field}`;
		this.value = value;

		this.detail = {
			[field]: {
				input: this.value,
				type: 'any.db_unique_constraint',
				message: `A "${knexError.table}" entity already exists with the same value in the "${field}" field`,
			},
		};
	}
}
