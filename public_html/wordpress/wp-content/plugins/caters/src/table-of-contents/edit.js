import { __ } from "@wordpress/i18n";
import clsx from "clsx";
import "./editor.scss";

import { useSelect } from "@wordpress/data";
import { useBlockProps } from "@wordpress/block-editor";
import { useEffect } from "@wordpress/element";

export default function TOCEdit({ className, attributes, setAttributes }) {
	const { items } = attributes;
	const headings = useSelect((select) => {
		const blocks = select("core/block-editor").getBlocks();
		let results = [];

		const findHeadings = (blocks) => {
			blocks.forEach((element) => {
				if (element.name === "cwc/heading" && element.attributes.isIndex) {
					results.push({
						id: element.attributes.customId,
						text: element.attributes.text,
						level: element.attributes.level,
					});
				}
			});
		};

		findHeadings(blocks);

		return results;
	});

	useEffect(() => {
		if (JSON.stringify(headings) !== JSON.stringify(items)) {
			setAttributes({ items: headings });
		}
	}, [items, headings]);

	const blockProps = useBlockProps({
		className: clsx(className, "cwc-table-of-contents"),
	});

	return (
		<>
			<div {...blockProps}>
				<h3>目次</h3>
				<ul>
					{items.map((heading, index) => (
						<li key={index} className={`level-${heading.level}`}>
							<a href={`#${heading.id}`}>- {heading.text}</a>
						</li>
					))}
				</ul>
			</div>
		</>
	);
}
