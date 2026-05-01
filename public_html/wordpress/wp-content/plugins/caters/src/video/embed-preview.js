import youtubeUrlToEmbed from "./embed-url";

export default function EmbedPreview({ src, ...props }) {
	return (
		<iframe
			src={youtubeUrlToEmbed(src)}
			allow="autoplay; encrypted-media"
			{...props}
		/>
	);
}
