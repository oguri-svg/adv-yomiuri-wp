import { useBlockProps } from "@wordpress/block-editor";

export default function save({ attributes }) {
	const { items } = attributes;
	return (
		<div {...useBlockProps.save()}>
			<h3>目次</h3>
			<ul>
				{items.map((item) => (
					<li key={item.id} className={`level-${item.level}`}>
						<a href={`#${item.id}`}>- {item.text}</a>
					</li>
				))}
			</ul>
		</div>
	);
}
