import StringDataType from '@/src/common/data_types/string';

export default class NumberDataType {
	static validate(value) {
		return (typeof value === 'number'); // Test: is number.
	}

	static pad(value, size) {
		return StringDataType.pad(value.toString(), size, '0');
	}

	static randomInt(low, high) {
		return Math.floor((Math.random() * (high - low)) + low);
	}
}
