import RegExpStringDataTypeTemplate from '@/src/common/data_type/template/reg_exp';

const regExp = new RegExp(
	'^'
	+ "[-a-z0-9~!$%^&*_=+}{\\'?]+(\\.[-a-z0-9~!$%^&*_=+}{\\'?]+)*"
	+ '@'
	+ '([a-z0-9_][-a-z0-9_]*(\\.[-a-z0-9_]+)*'
	+ '\\.'
	+ '(aero|arpa|biz|com|coop|edu|gov|info|int|mil|museum|name|net|org|pro|travel|mobi|[a-z][a-z])'
	+ '|([0-9]{1,3}\\.[0-9]{1,3}\\.[0-9]{1,3}\\.[0-9]{1,3}))(:[0-9]{1,5})?'
	+ '$',
	'i',
);

export default class EmailAddressString extends RegExpStringDataTypeTemplate(regExp) {
	static get invalidMessage() {
		return 'Must be a valid email address';
	}
}
