import RegExpStringDataTypeTemplate from '@/src/common/data_type/template/reg_exp';

const regExp = new RegExp(
	'^'
	+ '(?:(25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)\\.){3}'
	+ '(25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)'
	+ '$',
);

export default class IpAddressString extends RegExpStringDataTypeTemplate(regExp) {
	static get invalidMessage() {
		return 'Must be a valid ip address';
	}
}
