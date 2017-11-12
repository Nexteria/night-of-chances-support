// // The initial value and all subsequent values are feeded to the generator callback.
// // The generator returns a promise, which resolves to a { Boolean: done, any value } object.
// // When the promise is resolved the 'done' property of the result is checked.
// // If true the 'value' property is returned as the result of the promise loop.
// // Otherwise the function is called recursively with the 'value' property as the new initial value.
// const promiseLoop = (initialValue, generator) => {
// 	return generator(initialValue)
// 		.then(({
// 			done,
// 			value,
// 		}) => {
// 			return done
// 				? value
// 				: promiseLoop(value, generator)
// 		})
// }

// // Expose the recursive loop function.
// export default promiseLoop
