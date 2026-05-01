import { __ } from "@wordpress/i18n";
import { image } from "@wordpress/icons";
import { registerBlockType } from "@wordpress/blocks";
import metadata from "./block.json";
import ImageEdit from "./edit";
import ImageSave from "./save";

const { name } = metadata;

registerBlockType(name, {
	title: __("画像", "cwc-blocks"),
	icon: image,
	description: __("画像を挿入し、視覚に訴えます。", "cwc-blocks"),
	edit: ImageEdit,
	save: ImageSave,
});
