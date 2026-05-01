import { __ } from "@wordpress/i18n";
import clsx from "clsx";
import "./editor.scss";
import {
	BlockControls,
	MediaPlaceholder,
	BlockIcon,
	useBlockProps,
	InspectorControls,
	RichText,
} from "@wordpress/block-editor";
import {
	ToolbarGroup,
	ToolbarButton,
	PanelBody,
	TextControl,
	SelectControl,
	RadioControl,
	__experimentalVStack as VStack,
} from "@wordpress/components";
import { image, trash } from "@wordpress/icons";
import { useState } from "@wordpress/element";

const ALLOWED_IMAGE_TYPES = [
	"image/jpeg",
	"image/jpg",
	"image/png",
	"image/gif",
	"image/webp",
	"image/tiff",
	"image/x-tiff",
];

export default function Edit({ attributes, className, setAttributes }) {
	const { src, alt, caption, captionAlign, content, imagePostion } = attributes;
	const [cannotUpload, setCannotUpload] = useState(false);

	// メディアから又はアップロードした画像を選択する
	const onSelectImage = (media) => {
		if (media.mime || media.mime_type) {
			if (
				ALLOWED_IMAGE_TYPES.includes(media.mime) ||
				ALLOWED_IMAGE_TYPES.includes(media.mime_type)
			) {
				setAttributes({
					src: media.url,
					alt: media.alt || "",
					caption: media.caption || "",
				});
			} else setCannotUpload(true);
		}
	};

	// ブロックの属性を設定する
	const blockProps = useBlockProps({
		className: clsx(className, "cwc-block-content-image"),
	});

	// 削除
	const handleDelete = () => {
		if (confirm("データを削除します。よろしいですか？")) {
			setAttributes({
				src: "",
				alt: "",
				caption: "",
				content: "",
				captionAlign: "center",
				imagePostion: "left",
			});
		}
		return false;
	};

	// 削除イメージ
	const deleteImage = () => {
		if (confirm("削除します。よろしいですか？")) {
			setAttributes({
				src: "",
				alt: "",
				caption: "",
				captionAlign: "center",
			});
		}
		return false;
	};
	// 回り込み位置
	return (
		<>
			<div {...blockProps}>
				{(src || content) && (
					<BlockControls>
						<ToolbarGroup>
							<ToolbarButton icon={trash} label="削除" onClick={handleDelete} />
						</ToolbarGroup>
					</BlockControls>
				)}
				<div className={`wp-cwc-block-content-image image-${imagePostion}`}>
					<div className="content-image-image">
						{src ? (
							<>
								{/* 右Sitebar */}
								<InspectorControls>
									<PanelBody
										title={__("設定", "cwc-blocks")}
										initialOpen={true}
									>
										<RadioControl
											className="cwc-content-image-position"
											label={__("画像の位置", "cwc-blocks")}
											selected={imagePostion}
											options={[
												{ label: __("左　", "cwc-blocks"), value: "left" },
												{ label: __("右　", "cwc-blocks"), value: "right" },
											]}
											onChange={(newPosition) =>
												setAttributes({ imagePostion: newPosition })
											}
										/>
										<TextControl
											label={__("Alt", "cwc-blocks")}
											value={alt}
											onChange={(newAlt) => setAttributes({ alt: newAlt })}
											placeholder={__("画像Altタグ...", "cwc-blocks")}
										/>
										<TextControl
											label={__("キャプション", "cwc-blocks")}
											value={caption}
											onChange={(newCaption) =>
												setAttributes({ caption: newCaption })
											}
											placeholder={__("画像キャプション...", "cwc-blocks")}
										/>
										<SelectControl
											label={__("キャプション配置", "cwc-blocks")}
											value={captionAlign}
											options={[
												{ label: __("左寄せ", "cwc-blocks"), value: "left" },
												{ label: __("中心", "cwc-blocks"), value: "center" },
												{ label: __("右寄せ", "cwc-blocks"), value: "right" },
											]}
											onChange={(newAlign) =>
												setAttributes({ captionAlign: newAlign })
											}
										/>
									</PanelBody>
								</InspectorControls>
								<div className="content-image-image-show">
									<img src={src} />
									<div className="content-image-layout">
										<span onClick={deleteImage}>削除</span>
									</div>
								</div>
								{caption && (
									<i className={`image-caption caption-align-${captionAlign}`}>
										{caption}
									</i>
								)}
							</>
						) : (
							<MediaPlaceholder
								icon={<BlockIcon icon={image} />}
								labels={{
									title: __("画像を選択する", "cwc-blocks"),
									instructions: __(
										"選択またはアップロードした画像を挿入します。",
										"cwc-blocks",
									),
								}}
								multiple={false}
								onSelect={onSelectImage}
								accept="image/*"
								// allowedTypes={ALLOWED_IMAGE_TYPES}
							>
								{cannotUpload && (
									<VStack spacing={3} className="components-placeholder__error">
										{__("選択したファイルが利用できません。")}
									</VStack>
								)}
							</MediaPlaceholder>
						)}
					</div>

					<div className="content-image-text">
						<RichText
							identifier="content"
							value={content}
							onChange={(value) => setAttributes({ content: value })}
							placeholder={__("テキストが入ります")}
							allowedFormats={[]}
						/>
					</div>
				</div>
			</div>
		</>
	);
}
