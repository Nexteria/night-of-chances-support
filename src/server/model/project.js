// Load app modules.
import AttributeModel from '@/src/server/model/attribute';

// Load npm modules.
import Joi from 'joi';

// Expose project model.
export default AttributeModel.extend({
	table: 'project',
	fields: {
		name: {
			isRequired: true,
			schema: Joi.string().max(256),
		},
		token: {
			isRequired: true,
			schema: Joi.string().max(256),
		},
	},
});
