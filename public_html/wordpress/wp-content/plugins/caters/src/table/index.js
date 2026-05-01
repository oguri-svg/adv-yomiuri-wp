import { __ } from "@wordpress/i18n";

import { registerBlockType } from "@wordpress/blocks";
import metadata from "./block.json";
import Edit from "./edit";
import Save from "./save";
import { blockTable } from "@wordpress/icons";

const { name } = metadata;

registerBlockType(name, {
	title: __("テーブル", "cwc-blocks"),
	icon: blockTable,
	edit: Edit,
	save: Save,
});
