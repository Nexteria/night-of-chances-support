import StringDataType from '@/src/common/data_type/string';

export default (regExp) => {
	return class extends StringDataType {
		static validate(value) {
			return super.validate(value) // Test: is string.
				&& value.match(regExp); // Test: validation reg exp.
		}
	};
};
