import { __ } from "@wordpress/i18n";
import { registerBlockType } from "@wordpress/blocks";
import metadata from "./block.json";
import WrapperEdit from "./edit";
import WrapperSave from "./save";

const { name } = metadata;

registerBlockType(name, {
	title: __("枠_背景(白)", "cwc-blocks"),
	icon: "welcome-widgets-menus",
	description: __("Group all block", "cwc-blocks"),
	edit: WrapperEdit,
	save: WrapperSave,
});
