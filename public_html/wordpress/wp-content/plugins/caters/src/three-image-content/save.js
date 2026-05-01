import { useBlockProps, RichText } from "@wordpress/block-editor";

export default function save({ attributes }) {
	const { data } = attributes;

	return (
		<div {...useBlockProps.save()}>
			{data?.map(({ src, alt, caption, captionAlign, content }, index) => (
				<div className="col">
					{src && (
						<>
							<figure class="photo">
								<img src={src} alt={alt} loading="lazy" decoding="async" />
							</figure>
							{caption && (
								<span
									className={`image-caption caption-align-${captionAlign}`}
									style={{ whiteSpace: "pre-line" }}
								>
									{caption}
								</span>
							)}
							<div className="content">
								<RichText.Content value={content} />
							</div>
						</>
					)}
				</div>
			))}
		</div>
	);
}
