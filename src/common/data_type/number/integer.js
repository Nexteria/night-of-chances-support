import NumberDataType from '@/src/common/data_type/number';

export default class IntegerNumberDataType extends NumberDataType {
	static validate(value) {
		return super.validate(value) // Test: is number.
			&& ((value % 1) === 0); // Test: if the remainder is zero.
	}
}
