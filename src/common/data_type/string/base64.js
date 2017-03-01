import RegExpStringDataTypeTemplate from '@/src/common/data_type/template/reg_exp';

const regExp = new RegExp(
	'^'
	+ '([A-Za-z0-9+/]{4})*'
	+ '([A-Za-z0-9+/]{4}|[A-Za-z0-9+/]{3}=|[A-Za-z0-9+/]{2}==)'
	+ '$',
);

export default class Base64StringDataType extends RegExpStringDataTypeTemplate(regExp) {
	static encode(value) {
		return new Buffer(value).toString('base64');
	}

	static decode(value) {
		return new Buffer(value, 'base64').toString();
	}
}
