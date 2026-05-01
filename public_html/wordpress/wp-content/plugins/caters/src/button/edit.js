import { __ } from "@wordpress/i18n";
import clsx from "clsx";
import "./editor.scss";

import {
	BlockControls,
	useBlockProps,
	RichText,
} from "@wordpress/block-editor";

import {
	DropdownMenu,
	ToolbarGroup,
	ToolbarButton,
	Popover,
	Button,
	__experimentalInputControl as InputControl,
	ToggleControl,
} from "@wordpress/components";

import { alignLeft, alignCenter, alignRight, link } from "@wordpress/icons";

import { useState, useEffect } from "@wordpress/element";

const NEW_TAB_TARGET = "_blank";
const CUR_TAB_TARGET = "_self";
const BLANK_ICON = (
	<svg
		xmlns="http://www.w3.org/2000/svg"
		height="10"
		width="10"
		viewBox="0 0 512 512"
	>
		<path
			fill="#2271b1"
			d="M320 0c-17.7 0-32 14.3-32 32s14.3 32 32 32l82.7 0L201.4 265.4c-12.5 12.5-12.5 32.8 0 45.3s32.8 12.5 45.3 0L448 109.3l0 82.7c0 17.7 14.3 32 32 32s32-14.3 32-32l0-160c0-17.7-14.3-32-32-32L320 0zM80 32C35.8 32 0 67.8 0 112L0 432c0 44.2 35.8 80 80 80l320 0c44.2 0 80-35.8 80-80l0-112c0-17.7-14.3-32-32-32s-32 14.3-32 32l0 112c0 8.8-7.2 16-16 16L80 448c-8.8 0-16-7.2-16-16l0-320c0-8.8 7.2-16 16-16l112 0c17.7 0 32-14.3 32-32s-14.3-32-32-32L80 32z"
		/>
	</svg>
);

export default function Edit({
	attributes,
	className,
	setAttributes,
	isSelected,
}) {
	const { text, align, url, target } = attributes;

	const [isEditingURL, setIsEditingURL] = useState(false);
	const [src, setSRC] = useState(url);

	const currentAlignIcon =
		align === "left" ? alignLeft : align === "right" ? alignRight : alignCenter;

	const blockProps = useBlockProps({
		className: clsx(className, "cwc-block-button", {
			"align-left": align === "left",
			"align-center": align === "center",
			"align-right": align === "right",
		}),
	});

	useEffect(() => {
		if (!isSelected) {
			setIsEditingURL(false);
		}
	}, [isSelected]);

	return (
		<>
			<div {...blockProps}>
				<BlockControls>
					<ToolbarGroup>
						<DropdownMenu
							icon={currentAlignIcon}
							label={__("ボタンの配置を設定する", "cwc-blocks")}
							controls={[
								{
									icon: alignLeft,
									title: __("左寄せ", "cwc-blocks"),
									onClick: () => setAttributes({ align: "left" }),
									isActive: align === "left",
								},
								{
									icon: alignCenter,
									title: __("中心", "cwc-blocks"),
									onClick: () => setAttributes({ align: "center" }),
									isActive: align === "center",
								},
								{
									icon: alignRight,
									title: __("右寄せ", "cwc-blocks"),
									onClick: () => setAttributes({ align: "right" }),
									isActive: align === "right",
								},
							]}
						/>
					</ToolbarGroup>
					<ToolbarGroup>
						<ToolbarButton
							icon={link}
							title={__("リンク")}
							onClick={() => setIsEditingURL(!isEditingURL)}
							isActive={!!url}
						/>
					</ToolbarGroup>
				</BlockControls>

				{isEditingURL && (
					<Popover
						className="wp-block-button-popver"
						position="botom center"
						onClose={() => setIsEditingURL(false)}
					>
						<div className="wp-block-button-link-control">
							<form
								onSubmit={(event) => {
									if (event) event.preventDefault();
									setAttributes({ url: src });
								}}
							>
								<InputControl
									type="url"
									value={src || ""}
									className="wp-block-button-link__field"
									placeholder={__(
										"リンクを貼り付けてください...",
										"cwc-blocks",
									)}
									onChange={(value) => setSRC(value)}
								/>
								<Button
									variant="primary"
									className="wp-block-youtube-media__button"
									type="submit"
								>
									{__("埋め込み", "button label")}
								</Button>
							</form>
							{url && (
								<>
									<a href={url} target={target}>
										{url}
										{target === NEW_TAB_TARGET && (
											<span style={{ marginLeft: "5px" }}>{BLANK_ICON}</span>
										)}
									</a>
									<ToggleControl
										className="wp-block-button-target-toggle"
										label={__("別のタブで開く", "cwc-block")}
										checked={target === NEW_TAB_TARGET}
										onChange={(newValue) =>
											setAttributes({
												target: newValue ? NEW_TAB_TARGET : CUR_TAB_TARGET,
											})
										}
									/>
								</>
							)}
						</div>
					</Popover>
				)}

				<RichText
					identifier="text"
					value={text}
					onChange={(value) => setAttributes({ text: value })}
					placeholder={__("ダミーテキスト")}
					allowedFormats={[]}
				/>
			</div>
		</>
	);
}
