import { __ } from "@wordpress/i18n";

import { registerBlockType } from "@wordpress/blocks";
import metadata from "./block.json";
import Edit from "./edit";
import Save from "./save";
import { button } from "@wordpress/icons";

const { name } = metadata;

registerBlockType(name, {
	title: __("リンクボタン", "cwc-blocks"),
	icon: button,
	edit: Edit,
	save: Save,
});
