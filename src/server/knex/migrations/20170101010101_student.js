import knexMixin from '@/src/server/knex/mixin';

export const up = (originalKnex) => {
	const knex = knexMixin(originalKnex);
};

export const down = (originalKnex) => {
	const knex = knexMixin(originalKnex);
};
