// Expose abstract mixin class for processing knex.raw statements.
export default class RawMixin {
	toString() {
		return this._finalize().toString();
	}

	toSQL() {
		return this._finalize().toSQL();
	}

	then(callback) {
		return this._finalize().then(callback);
	}
}
