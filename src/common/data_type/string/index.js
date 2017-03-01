export default class StringDataType {
	static validate(value) {
		return (typeof value === 'string'); // Test: is string.
	}

	static pad(value, size, padding) {
		let newValue = value;
		while (newValue.length < size) {
			newValue = padding + newValue;
		}
		return newValue;
	}
}
