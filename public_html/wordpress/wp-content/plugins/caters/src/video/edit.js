import { __ } from "@wordpress/i18n";
import clsx from "clsx";
import { useSelect } from "@wordpress/data";
import { useEffect, useRef, useState } from "@wordpress/element";
import {
	MediaPlaceholder,
	BlockIcon,
	useBlockProps,
	MediaReplaceFlow,
} from "@wordpress/block-editor";
import "./editor.scss";
import { video } from "@wordpress/icons";
import Tracks from "./tracks";
import EmbedPreview from "./embed-preview";

const ALLOWED_MEDIA_TYPES = ["video"];

export default function VideoEdit({ attributes, className, setAttributes }) {
	const { id, controls, iframe, src, tracks } = attributes;
	const videoPlayer = useRef();
	const blockProps = useBlockProps({
		className: clsx(className, "cwc-block-video"),
	});

	const onSelectVideo = (e) => {
		setAttributes({
			blob: undefined,
			src: e.url,
			id: e.id,
			controls: true,
			iframe: false,
		});
	};

	const onSelectUrl = (url) => {
		const regex = /^(https?\:\/\/)?(www\.)?(youtube\.com|youtu\.be)\/.+$/;
		setAttributes({
			src: url,
			id: undefined,
			controls: true,
			iframe: regex.test(url) ? true : false,
		});
	};

	const onUploadError = () => {
		console.log("onUploadError");
	};

	return (
		<>
			{src ? (
				<figure {...blockProps}>
					{iframe ? (
						<EmbedPreview src={src} title="video" />
					) : (
						<video controls={controls} src={src} ref={videoPlayer}>
							<Tracks tracks={tracks} />
						</video>
					)}
				</figure>
			) : (
				<div {...blockProps}>
					<MediaPlaceholder
						icon={<BlockIcon icon={video} />}
						labels={{
							title: __("Video"),
							instructions: __(
								"Upload a video file, pick one from your media library, or add one with a URL.",
								"cwc-blocks",
							),
						}}
						onSelect={onSelectVideo}
						onSelectURL={onSelectUrl}
						accept="video/*"
						allowedTypes={ALLOWED_MEDIA_TYPES}
						onError={onUploadError}
						value={attributes}
					/>
				</div>
			)}
		</>
	);
}
