/**
 * Styles
 */
import './styles.scss';

/**
 * WordPress dependencies
 */
import { __ } from '@wordpress/i18n';
import { addFilter } from '@wordpress/hooks';
import {
	BaseControl,
	Button,
	PanelBody,
	TextControl,
	Dropdown,
} from '@wordpress/components';
import { registerBlockCollection } from '@wordpress/blocks';

import { NamespaceSelector } from './namespace-selector';

const { collections } = window.LZBProBlocksCustomSlugNamespace;

/**
 * Register collections
 */
if (collections?.length) {
	collections.forEach((collection) => {
		if (collection.register) {
			registerBlockCollection(collection.namespace, {
				title: collection.label || collection.namespace,
			});
		}
	});
}

/**
 * Custom slug namespace settings render in block builder.
 *
 * @param {Object}   props
 * @param {Object}   props.data
 * @param {Function} props.updateData
 */
function CustomSlugNamespaceSettings({ data, updateData }) {
	const { slug } = data;

	let namespace = 'lazyblock';
	let slugValue = slug;

	if (slugValue.includes('/')) {
		namespace = slugValue.split('/')[0];
		slugValue = slugValue.split('/')[1];
	}

	return (
		<PanelBody className="lazyblocks-pro-panel-custom-slug-namespace">
			<BaseControl
				id="lazyblocks-pro-custom-slug-namespace"
				label={__('Slug', 'lazy-blocks')}
				__nextHasNoMarginBottom
			>
				<div className="lazyblocks-component-block-slug">
					<Dropdown
						className="lazyblocks-component-block-slug-prefix-dropdown"
						contentClassName="lazyblocks-component-block-slug-prefix-dropdown-content"
						popoverProps={{
							placement: 'left-start',
							offset: 36,
							shift: true,
							focusOnMount: false,
						}}
						renderToggle={({ isOpen, onToggle }) => (
							<Button
								className="lazyblocks-component-block-slug-prefix"
								aria-expanded={isOpen}
								onClick={onToggle}
							>
								{namespace}
								<span>/</span>
							</Button>
						)}
						renderContent={({ onClose }) => {
							return (
								<>
									<div className="lazyblocks-component-block-slug-prefix-dropdown-header">
										<h2>
											{__(
												'Collections & namespaces',
												'lazy-blocks'
											)}
										</h2>
										<Button
											onClick={onClose}
											icon={
												<svg
													xmlns="http://www.w3.org/2000/svg"
													viewBox="0 0 24 24"
													width="24"
													height="24"
													aria-hidden="true"
													focusable="false"
												>
													<path d="M12 13.06l3.712 3.713 1.061-1.06L13.061 12l3.712-3.712-1.06-1.06L12 10.938 8.288 7.227l-1.061 1.06L10.939 12l-3.712 3.712 1.06 1.061L12 13.061z"></path>
												</svg>
											}
										/>
									</div>
									<NamespaceSelector
										namespace={namespace}
										onChange={(newNamespace) => {
											if (
												newNamespace &&
												newNamespace !== 'lazyblock'
											) {
												updateData({
													slug: `${newNamespace}/${slugValue}`,
												});
											} else {
												updateData({ slug: slugValue });
											}
										}}
									/>
								</>
							);
						}}
					/>
					<TextControl
						value={slugValue}
						onChange={(value) =>
							updateData({
								slug:
									namespace && namespace !== 'lazyblock'
										? `${namespace}/${value}`
										: value,
							})
						}
						__next40pxDefaultSize
						__nextHasNoMarginBottom
					/>
				</div>
			</BaseControl>
		</PanelBody>
	);
}

addFilter(
	'lzb.constructor.general-settings.slug',
	'lzb-pro.custom-slug-namespace-settings',
	(render, props) => {
		return (
			<>
				<CustomSlugNamespaceSettings {...props} />
				{render}
			</>
		);
	}
);
