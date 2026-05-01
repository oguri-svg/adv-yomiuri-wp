/**
 * WordPress dependencies
 */
import { __ } from "@wordpress/i18n";
import { toggleFormat } from "@wordpress/rich-text";
import { RichTextToolbarButton } from "@wordpress/block-editor";

const name = "cwc/underline";
const title = __("下線");

export const underline = {
	name,
	title,
	tagName: "u",
	className: null,
	edit({ isActive, value, onChange }) {
		const onToggle = () => {
			onChange(
				toggleFormat(value, {
					type: name,
					title,
				}),
			);
		};

		return (
			<RichTextToolbarButton
				icon="editor-underline"
				title={title}
				onClick={onToggle}
				isActive={isActive}
			/>
		);
	},
};
