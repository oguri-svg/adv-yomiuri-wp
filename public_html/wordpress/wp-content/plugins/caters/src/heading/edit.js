import { __ } from "@wordpress/i18n";
import clsx from "clsx";
import "./editor.scss";

import {
	BlockControls,
	useBlockProps,
	RichText,
	InspectorControls,
} from "@wordpress/block-editor";

import {
	DropdownMenu,
	Icon,
	ToolbarGroup,
	PanelBody,
	ToggleControl,
} from "@wordpress/components";

import { useEffect } from "@wordpress/element";

import {
	headingLevel1,
	headingLevel2,
	headingLevel3,
	headingLevel4,
	headingLevel5,
	headingLevel6,
	alignLeft,
	alignCenter,
	alignRight,
} from "@wordpress/icons";

const LEVEL_TO_PATH = {
	1: headingLevel1,
	2: headingLevel2,
	3: headingLevel3,
	4: headingLevel4,
	5: headingLevel5,
	6: headingLevel6,
};

export default function HeadingEdit({ attributes, className, setAttributes }) {
	const { text, align, level, levelOptions, isIndex, customId } = attributes;
	useEffect(() => {
		if (!customId) {
			const uniqueId = Math.random().toString(36).substr(2, 9);
			setAttributes({ customId: `c${uniqueId}` });
		}
	}, []);

	const tagName = "h" + level;

	const currentAlignIcon =
		align === "left" ? alignLeft : align === "right" ? alignRight : alignCenter;

	const blockProps = useBlockProps({
		className: clsx(className, "cwc-block-heading", {
			"align-left": align === "left",
			"align-center": align === "center",
			"align-right": align === "right",
		}),
	});

	return (
		<>
			<div {...blockProps}>
				<BlockControls>
					<ToolbarGroup>
						<DropdownMenu
							icon={<Icon icon={LEVEL_TO_PATH[level]} />}
							controls={levelOptions.map((targetLevel) => {
								const isActive = targetLevel === level;
								return {
									icon: <Icon icon={LEVEL_TO_PATH[targetLevel]} />,
									title: sprintf(__("見出し%d", "cwc-blocks"), targetLevel),
									isActive,
									onClick() {
										setAttributes({ level: targetLevel });
									},
									role: "menuitemradio",
								};
							})}
						/>
					</ToolbarGroup>
					<ToolbarGroup>
						<DropdownMenu
							icon={currentAlignIcon}
							label={__("テキストの配置を設定する", "cwc-blocks")}
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
				</BlockControls>
				<InspectorControls>
					<PanelBody title={__("設定", "cwc-blocks")} initialOpen={true}>
						<ToggleControl
							__nextHasNoMarginBottom
							className="cwc-header__is-index"
							label={__("目次", "cwc-blocks")}
							checked={isIndex}
							onChange={(value) => setAttributes({ isIndex: value })}
						/>
					</PanelBody>
				</InspectorControls>
				<RichText
					identifier="text"
					tagName={tagName}
					value={text}
					onChange={(value) => setAttributes({ text: value })}
					placeholder={__("見出し", "cwc-blocks")}
					allowedFormats={[]}
					id={customId}
				/>
			</div>
		</>
	);
}
