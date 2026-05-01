import { RichText, useBlockProps } from "@wordpress/block-editor";

export default function save({ attributes }) {
	const { src, alt, caption, captionAlign, content, imagePostion } = attributes;
	if (!src && !content) return null;

	return (
		<div
			{...useBlockProps.save({
				className: imagePostion == "right" && "revert",
			})}
		>
			<div className="image">
				<figure>
					<img src={src} alt={alt} />
				</figure>
				{caption && (
					<span className={`image-caption caption-align-${captionAlign}`}>
						{caption}
					</span>
				)}
			</div>
			<div className="content">
				<RichText.Content value={content} />
			</div>
		</div>
	);
}
