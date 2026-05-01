import { useBlockProps } from "@wordpress/block-editor";
import clsx from "clsx";

export default function save({ attributes }) {
	const { src, align, widthSize, alt, caption, captionAlign, nameDefinition } =
		attributes;
	if (!src) return null;
	const className = clsx({ [`image-align-${align}`]: align });

	const w = !isNaN(parseInt(widthSize)) ? `${parseInt(widthSize)}%` : "auto";
	return (
		<div className="wp-image-block">
			<figure {...useBlockProps.save({ className })} id={nameDefinition}>
				<img src={src} alt={alt} style={{ width: w, maxWidth: "100%" }} />
			</figure>
			{caption && (
				<span
					className={`image-caption caption-align-${captionAlign}`}
					style={{ whiteSpace: "pre-line" }}
				>
					{caption}
				</span>
			)}
		</div>
	);
}
