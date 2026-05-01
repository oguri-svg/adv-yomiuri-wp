import { useBlockProps } from "@wordpress/block-editor";
import clsx from "clsx";

export default function save({ attributes }) {
	const { align, text, url, target } = attributes;

	const className = clsx({ [`button-align-${align}`]: align });

	if (!text) return null;
	return (
		<div {...useBlockProps.save({ className })}>
			<a href={url} target={target}>
				{text}
			</a>
		</div>
	);
}
