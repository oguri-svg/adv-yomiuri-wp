import { __ } from "@wordpress/i18n";
import { video } from "@wordpress/icons";
import { registerBlockType } from "@wordpress/blocks";
import metadata from "./block.json";
import VideoEdit from "./edit";
import VideoSave from "./save";

const { name } = metadata;

registerBlockType(name, {
	title: __("Video", "cwc-blocks"),
	icon: video,
	description: __("Embed a video from your media library or upload a new one.", "cwc-blocks"),
	edit: VideoEdit,
	save: VideoSave,
});
