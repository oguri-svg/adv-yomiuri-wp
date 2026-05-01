import {
	useBlockProps,
	__experimentalGetElementClassName,
} from "@wordpress/block-editor";
import Tracks from "./tracks";
import EmbedPreview from "./embed-preview";

export default function save({ attributes }) {
	const { controls, src, iframe, tracks } = attributes;
	if (!src) return null;
	return (
		<figure {...useBlockProps.save()}>
			{iframe ? (
				<EmbedPreview src={src} />
			) : (
				<video controls={controls} src={src}>
					<Tracks tracks={tracks} />
				</video>
			)}
		</figure>
	);
}
