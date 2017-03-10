class ErrorClass extends Error {
	constructor(message) {
		// Call parent constructor.
		super(message);

		// Set error name.
		this.name = this.constructor.name;

		// Set error stack.
		if (Object.prototype.hasOwnProperty.call(Error, 'captureStackTrace')) {
			Error.captureStackTrace(this, this.constructor);
		} else {
			this.stack = (new Error()).stack;
		}
	}
}

export class EntityExistsError extends ErrorClass {
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
			[matches[1]]: {
				input: this.value,
				type: 'any.db_unique_constraint',
				message: `A "${knexError.table}" entity already exists with the same value in the "${field}" field`,
			},
		};
	}
}

export class EntityNotFoundError extends ErrorClass {
	constructor() {
		// Call parent constructor.
		super('No entity exists that matches the submitted query');
	}
}

export class IdentifiedUserError extends ErrorClass {
	constructor() {
		// Call parent constructor.
		super("The user mustn't be logged on to access the given entity");
	}
}

export class IncorrectPasswordError extends ErrorClass {
	constructor() {
		// Call parent constructor.
		super('An incorrect password was submitted');
	}
}

export class InvalidTokenError extends ErrorClass {
	constructor(jwtError) {
		// Call parent constructor.
		super('The submitted token cannot be deciphered');

		// Retrieve jwt error reason.
		this.reason = jwtError.message;
	}
}

export class UnauthorizedAccessError extends ErrorClass {
	constructor() {
		// Call parent constructor.
		super('The verified user is not authorized to access the given entity');
	}
}

export class UnidentifiedUserError extends ErrorClass {
	constructor() {
		// Call parent constructor.
		super('The user cannot be identified');
	}
}

export class ValidationError extends ErrorClass {
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
