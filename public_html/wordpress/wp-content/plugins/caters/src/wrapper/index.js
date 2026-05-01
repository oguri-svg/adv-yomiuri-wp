import { __ } from "@wordpress/i18n";
import { group } from "@wordpress/icons";
import { registerBlockType } from "@wordpress/blocks";
import metadata from "./block.json";
import WrapperEdit from "./edit";
import WrapperSave from "./save";

const { name } = metadata;

registerBlockType(name, {
	title: __("枠", "cwc-blocks"),
	icon: group,
	description: __("Group all block", "cwc-blocks"),
	edit: WrapperEdit,
	save: WrapperSave,
});
