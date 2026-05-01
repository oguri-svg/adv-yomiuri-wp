import { RichText, useBlockProps } from "@wordpress/block-editor";
import { toInteger } from "./state";
import clsx from "clsx";

export default function save({ attributes }) {
	const { caption, body, border, className } = attributes;

	const isEmpty = !body.length;

	if (isEmpty) return null;

	const hasCaption = !RichText.isEmpty(caption);
	const _className = clsx({
		className,
		"cwc-table-no-border": border === 0,
		device__wrap: true,
	});

	const Section = ({ type, rows }) => {
		if (!rows.length) return null;

		const Tag = `t${type}`;

		return (
			<Tag>
				{rows.map(({ cells }, rowIndex) => (
					<tr key={rowIndex}>
						{cells.map(
							({ content, tag, rowspan, colspan, align }, cellIndex) => (
								<RichText.Content
									key={cellIndex}
									tagName={tag}
									className={clsx({
										[`text-align-${align}`]: align,
									})}
									value={content}
									rowspan={
										toInteger(rowspan) > 1 ? toInteger(rowspan) : undefined
									}
									colspan={
										toInteger(colspan) > 1 ? toInteger(colspan) : undefined
									}
								/>
							)
						)}
					</tr>
				))}
			</Tag>
		);
	};
	return (
		<div {...useBlockProps.save({ className: _className })}>
			<table>
				<Section type="body" rows={body} />
			</table>
			{hasCaption && <RichText.Content tagName="figcaption" value={caption} />}
		</div>
	);
}
