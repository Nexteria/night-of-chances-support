import StringDataType from '@/src/common/data_type/string';

const invalidCharacterRegExp = /[^a-z0-9_-]/;
const invalidCharactersRegExp = /[^a-z0-9_-]/g;

export default class CanonicalStringDataType extends StringDataType {
	static get invalidMessage() {
		return 'All characters must be lowercase alphanumeric, an underscore or a dash';
	}

	static validate(value) {
		return super.validate(value) // Test: is string.
			&& (value) && (value.length <= 255) // Test: has a length of 1 to 255 characters.
			&& !value.match(invalidCharacterRegExp); // Test: does not contain invalid characters.
	}

	static fromString(value) {
		return value.toLowerCase().replace(invalidCharactersRegExp, '');
	}
}
