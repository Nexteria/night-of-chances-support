// // Load local modules.
// import AttributeModel from '@/src/server/model/attribute';

// // Load npm modules.
// import Joi from 'joi';

// // Expose project model.
// export default AttributeModel.extend({
// 	table: 'event',
// 	fields: {
// 		name: {
// 			isRequired: true,
// 			schema: Joi.string().max(256),
// 		},
// 		token: {
// 			isRequired: true,
// 			schema: Joi.string().max(256),
// 		},
// 		project_key: {
// 			isRequired: true,
// 			schema: Joi.number().integer().min(0).max(2147483647),
// 		},
// 	},
// });
