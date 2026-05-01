import { __ } from "@wordpress/i18n";
import { registerBlockType } from "@wordpress/blocks";
import { postFeaturedImage } from "@wordpress/icons";
import metadata from "./block.json";
import Edit from "./edit";
import Save from "./save";

const { name } = metadata;
const postFeaturedImages = (
	<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 32 24">
		<g transform="translate(-7,0) scale(0.9)">{postFeaturedImage}</g>
		<g transform="translate(10,0) scale(0.9)">{postFeaturedImage}</g>
	</svg>
);

registerBlockType(name, {
	title: __("画像＆テキスト（２列）", "cwc-blocks"),
	icon: postFeaturedImages,
	edit: Edit,
	save: Save,
});
