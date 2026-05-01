import { __ } from "@wordpress/i18n";
import clsx from "clsx";
import "./editor.scss";

import {
	BlockControls,
	MediaPlaceholder,
	BlockIcon,
	useBlockProps,
	InspectorControls,
} from "@wordpress/block-editor";

import {
	ToolbarGroup,
	ToolbarButton,
	ResizableBox,
	DropdownMenu,
	PanelBody,
	TextControl,
	TextareaControl,
	SelectControl,
	__experimentalNumberControl as NumberControl,
	__experimentalVStack as VStack,
} from "@wordpress/components";

import {
	image,
	alignLeft,
	alignCenter,
	alignRight,
	trash,
} from "@wordpress/icons";

import { useState, useEffect } from "@wordpress/element";
import { v4 as uuidv4 } from "uuid";

const ALLOWED_IMAGE_TYPES = [
	"image/jpeg",
	"image/jpg",
	"image/png",
	"image/gif",
	"image/webp",
	"image/tiff",
	"image/x-tiff",
];

const MIN_WIDTH = "10%";
const MAX_WIDTH = "100%";

export default function ImageEdit({
	attributes,
	className,
	setAttributes,
	isSelected,
}) {
	const {
		src,
		align = "center",
		widthSize,
		alt,
		caption,
		captionAlign,
		nameDefinition,
	} = attributes;

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

	// メニューから画像の配置を設定する
	const setAlignment = (newAlign) => setAttributes({ align: newAlign });

	// ブロックの属性を設定する
	const blockProps = useBlockProps({
		className: clsx(className, "cwc-block-image", {
			"align-left": align === "left",
			"align-center": align === "center",
			"align-right": align === "right",
		}),
	});

	// 画像の配置に応じたアイコンを取得する
	const currentAlignIcon =
		align === "left" ? alignLeft : align === "right" ? alignRight : alignCenter;

	// 画像のリサイズが終了したときの処理
	const onResizeStop = (event, direction, elt, delta) => {
		const parentWidth = elt.offsetParent.clientWidth;
		const widthPercentage = (elt.offsetWidth / parentWidth) * 100;

		setAttributes({ widthSize: `${widthPercentage}%` });
	};

	// 削除
	const handleDelete = () => {
		if (confirm("データを削除します。よろしいですか？")) {
			setAttributes({ src: "", widthSize: "auto", alt: "", caption: "" });
		}
		return false;
	};

	useEffect(() => {
		if (!nameDefinition) {
			setAttributes({ nameDefinition: `c${uuidv4()}` });
		}
	}, []);

	return (
		<>
			<div {...blockProps}>
				{src ? (
					<>
						{/* プロックの上にメニュー */}
						<BlockControls>
							<ToolbarGroup>
								<DropdownMenu
									icon={currentAlignIcon}
									label={__("画像の配置を設定する", "cwc-blocks")}
									controls={[
										{
											icon: alignLeft,
											title: __("左寄せ", "cwc-blocks"),
											onClick: () => setAlignment("left"),
											isActive: align === "left",
										},
										{
											icon: alignCenter,
											title: __("中心", "cwc-blocks"),
											onClick: () => setAlignment("center"),
											isActive: align === "center",
										},
										{
											icon: alignRight,
											title: __("右寄せ", "cwc-blocks"),
											onClick: () => setAlignment("right"),
											isActive: align === "right",
										},
									]}
								/>
							</ToolbarGroup>
							<ToolbarGroup>
								<ToolbarButton
									icon={trash}
									label="削除"
									onClick={handleDelete}
								/>
							</ToolbarGroup>
						</BlockControls>

						{/* 右Sitebar */}
						<InspectorControls>
							<PanelBody title={__("設定", "cwc-blocks")} initialOpen={true}>
								<NumberControl
									className="m0"
									label={__("幅（％）", "cwc-blocks")}
									value={
										parseInt(widthSize) > 100
											? 100
											: parseInt(widthSize) < 10
											? 10
											: parseInt(widthSize)
									}
									onChange={(newSize) => {
										let size = parseInt(newSize);
										if (isNaN(size)) size = parseInt(widthSize);
										setAttributes({
											widthSize: `${size > 100 ? 100 : size}%`,
										});
									}}
									placeholder={__("〇〇%", "cwc-blocks")}
									min="10"
									max="100"
								/>
								<small className="memo mb-1">最低：10％；最大：100％</small>
								<TextControl
									label={__("Alt", "cwc-blocks")}
									value={alt}
									onChange={(newAlt) => setAttributes({ alt: newAlt })}
									placeholder={__("画像Altタグ...", "cwc-blocks")}
									maxLength={100}
								/>
								<TextareaControl
									label={__("キャプション", "cwc-blocks")}
									value={caption}
									onChange={(newCaption) =>
										setAttributes({ caption: newCaption })
									}
									placeholder={__("画像キャプション...", "cwc-blocks")}
									maxLength={100}
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
								<TextControl
									label={__("名称", "cwc-blocks")}
									value={nameDefinition}
									disabled
								/>
							</PanelBody>
						</InspectorControls>

						<div className="image-container">
							<ResizableBox
								className="resizable-image-container"
								size={{ width: widthSize, height: "auto" }}
								minWidth={MIN_WIDTH}
								maxWidth={MAX_WIDTH}
								showHandle={isSelected}
								enable={{
									left: true,
									right: true,
								}}
								onResizeStop={onResizeStop}
							>
								<img
									src={src}
									style={{ width: "100%", height: "autocaption" }}
									id={nameDefinition}
								/>
							</ResizableBox>
						</div>

						{caption && (
							<i
								className={`image-caption caption-align-${captionAlign}`}
								style={{ whiteSpace: "pre-line" }}
							>
								{caption}
							</i>
						)}
					</>
				) : (
					<>
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
							onError={() => setCannotUpload(true)}
							accept="image/*"
							// allowedTypes={ALLOWED_IMAGE_TYPES}
						>
							{cannotUpload && (
								<VStack spacing={3} className="components-placeholder__error">
									{__("選択したファイルが利用できません。")}
								</VStack>
							)}
						</MediaPlaceholder>
					</>
				)}
			</div>
		</>
	);
}
