export default function unescape(str) {
	str = str.replace(/&lt;/g, '<');
	str = str.replace(/&gt;/g, '>');
	str = str.replace(/&quot;/g, '"');
	str = str.replace(/&#39;/g, "'");
	str = str.replace(/&amp;/g, '&');
	return str;
}
