import { __ } from "@wordpress/i18n";
import clsx from "clsx";
import "./editor.scss";

import {
	BlockControls,
	BlockIcon,
	useBlockProps,
} from "@wordpress/block-editor";

import {
	ToolbarGroup,
	ToolbarButton,
	Placeholder,
	SVG,
	Path,
	Button,
	__experimentalVStack as VStack,
	__experimentalInputControl as InputControl,
} from "@wordpress/components";

import { useState } from "@wordpress/element";

import { trash } from "@wordpress/icons";

const yticon = (
	<SVG viewBox="0 0 24 24">
		<Path d="M21.8 8s-.195-1.377-.795-1.984c-.76-.797-1.613-.8-2.004-.847-2.798-.203-6.996-.203-6.996-.203h-.01s-4.197 0-6.996.202c-.39.046-1.242.05-2.003.846C2.395 6.623 2.2 8 2.2 8S2 9.62 2 11.24v1.517c0 1.618.2 3.237.2 3.237s.195 1.378.795 1.985c.76.797 1.76.77 2.205.855 1.6.153 6.8.2 6.8.2s4.203-.005 7-.208c.392-.047 1.244-.05 2.005-.847.6-.607.795-1.985.795-1.985s.2-1.618.2-3.237v-1.517C22 9.62 21.8 8 21.8 8zM9.935 14.595v-5.62l5.403 2.82-5.403 2.8z" />
	</SVG>
);

export default function MediaEdit({ attributes, className, setAttributes }) {
	const { src, id } = attributes;

	const [url, setURL] = useState(src);

	const [cannotEmbed, setCannotEmbed] = useState(false);

	const blockProps = useBlockProps({
		className: clsx(className, "cwc-block-youtube-media"),
	});

	// 削除
	const handleDelete = () => {
		if (confirm("データを削除します。よろしいですか？")) {
			setAttributes({ src: "", id: "" });
		}
		return false;
	};

	return (
		<>
			<div {...blockProps}>
				{src ? (
					<>
						<BlockControls>
							<ToolbarGroup>
								<ToolbarButton
									icon={trash}
									label="削除"
									onClick={handleDelete}
								/>
							</ToolbarGroup>
						</BlockControls>
						<div className="youtube-media-container">
							<img
								src={`https://img.youtube.com/vi/${id}/maxresdefault.jpg`}
								alt="YouTube Thumbnail"
							/>
						</div>
					</>
				) : (
					<Placeholder
						icon={<BlockIcon icon={yticon} />}
						label={__("Youtube動画URL", "cwc-blocks")}
						className="wp-block-youtube-media"
						instructions={__(
							"サイトに表示したいコンテンツのリンクを貼り付けてください。",
						)}
					>
						<form
							onSubmit={(event) => {
								if (event) event.preventDefault();

								const matchYoutubeUrl = (url) => {
									var p =
										/^(?:https?:\/\/)?(?:www\.)?(?:youtu\.be\/|youtube\.com\/(?:embed\/|v\/|watch\?v=|watch\?.+&v=))((\w|-){11})(?:\S+)?$/;
									var matches = url.match(p);
									return matches ? matches[1] : false;
								};

								const youtubeId = matchYoutubeUrl(url);
								if (!youtubeId) {
									setCannotEmbed(true);
									return;
								}

								setAttributes({ id: youtubeId, src: url });
							}}
						>
							<InputControl
								type="url"
								value={src || ""}
								className="wp-block-youtube-media__input"
								placeholder={__("リンクを貼り付けてください...", "cwc-blocks")}
								onChange={(value) => setURL(value)}
							/>
							<Button
								variant="primary"
								className="wp-block-youtube-media__button"
								type="submit"
							>
								{__("埋め込み", "button label")}
							</Button>
						</form>

						{cannotEmbed && (
							<VStack spacing={3} className="components-placeholder__error">
								{__("埋め込むことができませんでした。")}
							</VStack>
						)}
					</Placeholder>
				)}
			</div>
		</>
	);
}
