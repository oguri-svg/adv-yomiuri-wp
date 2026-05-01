import { __ } from "@wordpress/i18n";
import { file } from "@wordpress/icons";
import { registerBlockType } from "@wordpress/blocks";
import metadata from "./block.json";
import Edit from "./edit";
import Save from "./save";

const { name } = metadata;

registerBlockType(name, {
	title: __("ファイル", "cwc-blocks"),
	icon: file,
	description: __(
		"ファイルをダウンロードするリンクを追加します。",
		"cwc-blocks",
	),
	edit: Edit,
	save: Save,
});
