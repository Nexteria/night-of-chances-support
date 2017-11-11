// // Load local modules.
// import AttributeModel from '@/src/server/model/attribute';

// // Load npm modules.
// import Joi from 'joi';

// // Expose project model.
// export default AttributeModel.extend({
// 	table: 'attendee',
// 	fields: {
// 		first_name: {
// 			isRequired: true,
// 			schema: Joi.string().max(256),
// 		},
// 		last_name: {
// 			isRequired: true,
// 			schema: Joi.string().max(256),
// 		},
// 		email: {
// 			isRequired: true,
// 			schema: Joi.string().max(256),
// 		},
// 		project_key: {
// 			isRequired: true,
// 			schema: Joi.number().integer().min(0).max(2147483647),
// 		},
// 	},
// });
