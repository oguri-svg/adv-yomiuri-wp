import { __ } from "@wordpress/i18n";

import { registerBlockType } from "@wordpress/blocks";
import metadata from "./block.json";
import HeadingEdit from "./edit";
import HeadingSave from "./save";
import { heading } from "@wordpress/icons";

const { name } = metadata;

registerBlockType(name, {
	title: __("見出し", "cwc-blocks"),
	icon: heading,
	edit: HeadingEdit,
	save: HeadingSave,
});
