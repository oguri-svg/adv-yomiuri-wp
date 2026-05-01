import { __ } from "@wordpress/i18n";

import { registerBlockType } from "@wordpress/blocks";
import metadata from "./block.json";
import TOCEdit from "./edit";
import TOCSave from "./save";
import { tableOfContents } from "@wordpress/icons";

const { name } = metadata;

registerBlockType(name, {
	title: __("目次", "cwc-blocks"),
	icon: tableOfContents,
	edit: TOCEdit,
	save: TOCSave,
});
