import { registerFormatType } from "@wordpress/rich-text";

// create more format in paragraph block
import formats from "./default-formats";
formats.forEach(({ name, ...settings }) => registerFormatType(name, settings));
