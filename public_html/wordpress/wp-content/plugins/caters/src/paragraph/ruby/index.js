/**
 * WordPress dependencies
 */
import { __ } from "@wordpress/i18n";
import { toggleFormat, insert, applyFormat } from "@wordpress/rich-text";
import { RichTextToolbarButton } from "@wordpress/block-editor";
import { Modal, TextControl, Button } from "@wordpress/components";
import { useState } from "@wordpress/element";
import rubyicon from "./furigana.svg";

const name = "cwc/ruby";
const rt_name = "cwc/rt";
const title = __("ふりがな");

export const ruby = {
	name,
	title,
	tagName: "ruby",
	className: null,

	edit({ isActive, value, onChange }) {
		const [isOpen, setIsOpen] = useState(false);
		const [furiganaText, setFuriganaText] = useState("");

		const applyFurigana = () => {
			let ruby = furiganaText;
			if (isActive) {
				value = toggleFormat(value, { type: name });
			} else {
				const rubyEnd = value.end;
				const rubyStart = value.start;

				value = insert(value, ruby, rubyEnd);
				value.start = rubyStart;
				value.end = rubyEnd + ruby.length;

				value = applyFormat(
					value,
					{ type: name },
					rubyStart,
					rubyEnd + ruby.length,
				);

				value = applyFormat(
					value,
					{ type: rt_name },
					rubyEnd,
					rubyEnd + ruby.length,
				);
			}
			onChange(value);
			setIsOpen(false);
		};

		return (
			<>
				<RichTextToolbarButton
					icon={<img src={rubyicon} />}
					title={title}
					onClick={() => setIsOpen(true)}
					isActive={isActive}
				/>

				{isOpen && (
					<Modal title={title} onRequestClose={() => setIsOpen(false)}>
						<TextControl
							value={furiganaText}
							onChange={(value) => setFuriganaText(value)}
						/>
						<Button variant="primary" onClick={applyFurigana}>
							{__("更新する")}
						</Button>
					</Modal>
				)}
			</>
		);
	},
};
