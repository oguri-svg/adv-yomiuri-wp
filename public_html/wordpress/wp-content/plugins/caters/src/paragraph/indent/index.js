/**
 * WordPress dependencies
 */
import { __ } from "@wordpress/i18n";
import { toggleFormat } from "@wordpress/rich-text";
import { RichTextToolbarButton } from "@wordpress/block-editor";

const name = "cwc/indent";
const title = __("インデント");

const applyIndent = (value) => {
	return toggleFormat(value, {
		type: "cwc/indent",
	});
};

export const indent = {
	name,
	title,
	tagName: "span",
	className: "indent-left",
	edit({ isActive, value, onChange }) {
		const onToggle = () => {
			onChange(applyIndent(value));
		};

		return (
			<RichTextToolbarButton
				icon="editor-indent"
				title={__("インデント", "cwc")}
				onClick={onToggle}
				isActive={isActive}
			/>
		);
	},
};
