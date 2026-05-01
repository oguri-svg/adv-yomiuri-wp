import { useBlockProps } from "@wordpress/block-editor";

export default function save({ attributes }) {
	const { id } = attributes;
	if (!id) return null;
	return (
		<figure {...useBlockProps.save()}>
			<iframe
				width="560"
				height="315"
				src={`https://www.youtube.com/embed/${id}`}
				title="YouTube video player"
				allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
				allowFullScreen
			></iframe>
		</figure>
	);
}
