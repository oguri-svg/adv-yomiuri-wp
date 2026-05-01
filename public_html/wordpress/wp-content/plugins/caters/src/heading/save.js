import { useBlockProps } from "@wordpress/block-editor";
import clsx from "clsx";

export default function save({ attributes }) {
	const { align, text, level, isIndex, customId } = attributes;

	const TagName = "h" + level;
	const className = clsx({
		[`text-align-${align}`]: align,
		["mokuji"]: isIndex
	});

	if (!text) return null;
	return (
		<TagName
			{...useBlockProps.save({ className })}
			id={customId}
			dangerouslySetInnerHTML={{ __html: text }}
		/>
	);
}
