// // Load local modules.
// import Model from '@/src/server/model'

// // Load npm modules.
// import Joi from 'joi'

// // Expose project model.
// export default Model.extend({
// 	table: 'attendee_event_score',
// 	fields: {
// 		value: {
// 			isRequired: true,
// 			schema: Joi.string().max(512),
// 		},
// 		score: {
// 			isRequired: true,
// 			schema: Joi.number().integer(),
// 		},
// 		attendee_attribute_key: {
// 			isRequired: true,
// 			schema: Joi.number().integer().min(0).max(2147483647),
// 		},
// 		event_key: {
// 			isRequired: true,
// 			schema: Joi.number().integer().min(0).max(2147483647),
// 		},
// 	},
// })
