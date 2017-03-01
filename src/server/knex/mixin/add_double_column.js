// Load app modules.
import RawMixin from '@/src/server/knex/mixin/raw';

// Expose mixin class for add double column.
export default (knex) => {
	return class AddDoubleColumnMixin extends RawMixin {
		constructor(name) {
			super();

			this.name = name;
		}

		to(tableName) {
			this.tableName = tableName;

			return this;
		}

		_finalize() {
			return knex.raw('alter table ?? add column ?? double precision', [
				this.tableName,
				this.name,
			]);
		}
	};
};
