import clsx from "clsx";
import { InnerBlocks, useBlockProps } from "@wordpress/block-editor";

export default function WrapperSave({ attributes, className }) {
	const { innerBlocks_length } = attributes;
	const blockProps = useBlockProps.save({
		className: clsx(className, "scene"),
	});
	if (innerBlocks_length < 1) {
		return null;
	} else {
		return (
			<section {...blockProps}>
				<InnerBlocks.Content />
			</section>
		);
	}
}
