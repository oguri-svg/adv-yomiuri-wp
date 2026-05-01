import clsx from "clsx";
import { useSelect } from "@wordpress/data";
import { useEffect } from "@wordpress/element";

import { InnerBlocks, useBlockProps } from "@wordpress/block-editor";

import "./editor.scss";
export default function WrapperEdit({ setAttributes, clientId, className }) {
	const { innerBlocks_length } = useSelect((select) => ({
		innerBlocks_length: select("core/block-editor").getBlockCount(clientId),
	}));
	const blockProps = useBlockProps({
		className: clsx(className, "wrapper-block"),
	});

	useEffect(() => {
		setAttributes({ innerBlocks_length });
	}, [innerBlocks_length]);

	return (
		<div {...blockProps}>
			<InnerBlocks />
		</div>
	);
}
