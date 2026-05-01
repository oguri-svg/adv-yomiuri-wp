/**
 * WordPress dependencies
 */
import { __ } from "@wordpress/i18n";
import { Fragment } from "@wordpress/element";

const name = "cwc/rt";
const title = __("rtタグ");

export const rt = {
	name,
	title,
	tagName: "rt",
	className: null,
	attributes: { ctx: "" },
	edit({ isActive, value, onChange }) {
		return <Fragment></Fragment>;
	},
};
