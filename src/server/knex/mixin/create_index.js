// Load local modules.
import RawMixin from '@/src/server/knex/mixin/raw';

// Expose mixin class for create index.
export default (knex) => {
	return class CreateIndexMixin extends RawMixin {
		constructor(name) {
			super();

			this.name = name;
		}

		on(tableName, columns) {
			this.tableName = tableName;
			this.columns = columns;

			return this;
		}

		_finalize() {
			const columnPlaceholders = this.columns.map(() => {
				return '??';
			}).join(', ');

			return knex.raw(`create index ?? on ?? (${columnPlaceholders})`, [
				this.name,
				this.tableName,
				...this.columns,
			]);
		}
	};
};
