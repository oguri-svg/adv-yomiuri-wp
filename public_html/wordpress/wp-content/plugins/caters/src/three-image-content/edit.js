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
	TextareaControl,
	SelectControl,
	__experimentalVStack as VStack,
} from "@wordpress/components";
import { image, trash } from "@wordpress/icons";
import { useState, useEffect } from "@wordpress/element";
import blockData from "./block.json";

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
	const { data } = attributes;
	const [cannotUploadLeft, setCannotUploadLeft] = useState(false);
	const [cannotUploadCenter, setCannotUploadCenter] = useState(false);
	const [cannotUploadRight, setCannotUploadRight] = useState(false);
	const [hasData, setHasData] = useState(false);

	// ブロックの属性を設定する
	const blockProps = useBlockProps({
		className: clsx(className, "cwc-block-three-image-content"),
	});

	// メディアから又はアップロードした画像を選択する
	const onSelectImage = (media, index) => {
		if (media.mime || media.mime_type) {
			if (
				ALLOWED_IMAGE_TYPES.includes(media.mime) ||
				ALLOWED_IMAGE_TYPES.includes(media.mime_type)
			) {
				const newData = [...data];

				newData[index] = {
					...newData[index],
					src: media.url,
					alt: media.alt || "",
					caption: media.caption || "",
				};

				setAttributes({ data: newData });
			} else {
				if (index == 0) setCannotUploadLeft(true);
				else if (index == 1) setCannotUploadCenter(true);
				else setCannotUploadRight(true);
			}
		}
	};

	// 削除
	const handleDelete = () => {
		if (confirm("データを削除します。よろしいですか？")) {
			setAttributes({ data: blockData.attributes.data.default });
		}
	};

	// 削除イメージ
	const deleteImage = (i) => {
		if (confirm("削除します。よろしいですか？")) {
			const newData = [...data];

			newData[i] = {
				...newData[i],
				src: "",
				alt: "",
				caption: "",
				captionAlign: "center",
			};

			setAttributes({ data: newData });
		}
		return false;
	};

	// changeAlt
	const changeAlt = (newAlt, i) => {
		const newData = [...data];

		newData[i] = {
			...newData[i],
			alt: newAlt,
		};

		setAttributes({ data: newData });
	};

	// changeCaption
	const changeCaption = (newCaption, i) => {
		const newData = [...data];

		newData[i] = {
			...newData[i],
			caption: newCaption,
		};

		setAttributes({ data: newData });
	};

	// changeCaptionAlign
	const changeCaptionAlign = (captionAlign, i) => {
		const newData = [...data];

		newData[i] = {
			...newData[i],
			captionAlign: captionAlign,
		};

		setAttributes({ data: newData });
	};

	// setContent
	const setContent = (value, i) => {
		const newData = [...data];

		newData[i] = {
			...newData[i],
			content: value,
		};

		setAttributes({ data: newData });
	};

	useEffect(() => {
		const hasContent = data?.some(({ src, content }) => src || content);
		if (hasContent && !hasData) setHasData(true);
	}, [data, hasData]);

	// レンダリング
	return (
		<div {...blockProps}>
			{hasData && (
				<BlockControls>
					<ToolbarGroup>
						<ToolbarButton icon={trash} label="削除" onClick={handleDelete} />
					</ToolbarGroup>
				</BlockControls>
			)}
			{data?.map(({ src, alt, caption, captionAlign, content }, index) => (
				<div className="image-content-col">
					{/* 右Sitebar */}
					<InspectorControls>
						{src && (
							<PanelBody
								title={__(
									`${index == 0 ? "左の" : index == 1 ? "中央の" : "右の"}設定`,
									"cwc-blocks",
								)}
								initialOpen={true}
							>
								<TextControl
									label={__("Alt", "cwc-blocks")}
									value={alt}
									onChange={(newAlt) => changeAlt(newAlt, index)}
									placeholder={__("画像Altタグ...", "cwc-blocks")}
									maxLength={100}
								/>
								<TextareaControl
									label={__("キャプション", "cwc-blocks")}
									value={caption}
									onChange={(newCaption) => changeCaption(newCaption, index)}
									help={__("画像キャプション...", "cwc-blocks")}
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
									onChange={(newAlign) => changeCaptionAlign(newAlign, index)}
								/>
							</PanelBody>
						)}
					</InspectorControls>

					{/* グループ */}
					{src ? (
						<>
							<div className="image-content-image-show">
								<img src={src} alt={alt} />
								<div className="content-image-layout">
									<span onClick={() => deleteImage(index)}>削除</span>
								</div>
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
							onSelect={(media) => onSelectImage(media, index)}
							accept="image/*"
							// allowedTypes={ALLOWED_IMAGE_TYPES}
						>
							{((cannotUploadLeft && index == 0) ||
								(cannotUploadCenter && index == 1) ||
								(cannotUploadRight && index == 2)) && (
								<VStack spacing={3} className="components-placeholder__error">
									{__("選択したファイルが利用できません。")}
								</VStack>
							)}
						</MediaPlaceholder>
					)}
					<RichText
						key={`richtext-${index}`}
						identifier={`content-${index}`}
						value={content}
						onChange={(value) => setContent(value, index)}
						placeholder={__("テキストが入ります")}
						allowedFormats={[]}
					/>
				</div>
			))}
		</div>
	);
}
