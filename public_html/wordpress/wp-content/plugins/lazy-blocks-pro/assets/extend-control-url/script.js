/**
 * External dependencies
 */
import shorthash from 'shorthash';

/**
 * WordPress dependencies
 */
import { __ } from '@wordpress/i18n';
import { addFilter } from '@wordpress/hooks';
import { ToggleControl, SelectControl, PanelBody } from '@wordpress/components';
import { useState } from '@wordpress/element';
import { useSelect } from '@wordpress/data';
import { __experimentalLinkControl as LinkControl } from '@wordpress/block-editor';

/**
 * Control render in editor.
 *
 * @param {Object} props - component props.
 */
function ControlEditor(props) {
	const { onChange, getValue, data } = props;

	const [key, setKey] = useState(shorthash.unique(`${new Date()}`));

	let query = null;

	if (data.link_suggestions && data.link_suggestions !== 'false') {
		if (data.link_suggestions === 'attachment') {
			query = { type: 'attachment' };
		} else {
			query = {
				type: 'post',
				subtype: data.link_suggestions,
			};
		}
	}

	const { BaseControl, useBlockControlProps } = useSelect((select) => {
		const components = select('lazy-blocks/components').get();
		const hooks = select('lazy-blocks/hooks').get();

		return {
			BaseControl: components.BaseControl,
			useBlockControlProps: hooks.useBlockControlProps,
		};
	});

	return (
		<BaseControl {...useBlockControlProps(props)}>
			<div className="lzb-gutenberg-url">
				<LinkControl
					id="lazyblock-pro-control-url-link"
					key={key}
					className="wp-block-navigation-link__inline-link-input"
					opensInNewTab={false}
					hasRichPreviews={data.rich_preview === 'true'}
					showSuggestions={data.link_suggestions !== 'false'}
					showInitialSuggestions={
						data.link_suggestions !== 'false' &&
						data.show_initial_link_suggestions === 'true'
					}
					suggestionsQuery={query}
					value={{
						url: getValue(),
					}}
					onChange={({ url: newURL = '' }) => {
						onChange(newURL);
					}}
					onRemove={() => {
						onChange('');
						setKey(shorthash.unique(`${new Date()}`));
					}}
				/>
			</div>
		</BaseControl>
	);
}

addFilter('lzb.editor.control.url.render', 'lzb.editor', (render, props) => {
	return <ControlEditor {...props} />;
});

/**
 * Control settings render in block builder.
 *
 * @param {Object} props
 */
function BlockBuilderControlSettings(props) {
	const { updateData, data } = props;
	const {
		link_suggestions: linkSuggestions = '',
		show_initial_link_suggestions: showInitialLinkSuggestions = 'false',
		rich_preview: richPreview = 'false',
	} = data;

	const { BaseControl, postTypes } = useSelect((select) => {
		const components = select('lazy-blocks/components').get();
		const { getPostTypes } = select('core');

		const allPostTypes = getPostTypes({ per_page: -1 }) || [];
		const resultPostTypes = [];

		// Prepare post types.
		allPostTypes.forEach((postTypeData) => {
			if (postTypeData.viewable) {
				let label = postTypeData.name;
				let thereIsDuplicate = 0;

				// Check if there are duplicate labels.
				allPostTypes.forEach((postTypeDataCheck) => {
					if (label === postTypeDataCheck.name) {
						thereIsDuplicate += 1;
					}
				});

				if (thereIsDuplicate > 1) {
					label = `${label} (${postTypeData.slug})`;
				}

				resultPostTypes.push({
					value: postTypeData.slug,
					label,
				});
			}
		});

		return {
			BaseControl: components.BaseControl,
			postTypes: resultPostTypes,
		};
	});

	return (
		<PanelBody>
			<BaseControl
				help={__(
					'Display suggestions when typing the URL',
					'lazy-blocks'
				)}
			>
				<SelectControl
					label={__('Link Suggestions', 'lazy-blocks')}
					value={linkSuggestions}
					onChange={(value) =>
						updateData({ link_suggestions: value })
					}
					options={[
						{
							label: 'Automatic',
							value: '',
						},
						{
							label: 'Disable suggestions',
							value: 'false',
						},
						...postTypes,
					]}
					__next40pxDefaultSize
					__nextHasNoMarginBottom
				/>
			</BaseControl>
			{linkSuggestions !== 'false' ? (
				<BaseControl
					id="lazyblock-pro-control-url-show-suggestions"
					label={__('Show Initial Suggestions', 'lazy-blocks')}
					help={__(
						'Whether to present initial suggestions immediately',
						'lazy-blocks'
					)}
				>
					<ToggleControl
						id="lazyblock-pro-control-url-show-suggestions"
						label={__('Yes', 'lazy-blocks')}
						checked={showInitialLinkSuggestions === 'true'}
						onChange={(value) =>
							updateData({
								show_initial_link_suggestions: value
									? 'true'
									: 'false',
							})
						}
						__nextHasNoMarginBottom
					/>
				</BaseControl>
			) : null}
			<BaseControl
				id="lazyblock-pro-control-url-rich-preview"
				label={__('Rich Preview', 'lazy-blocks')}
				help={__(
					'Display rich link preview with site title and image',
					'lazy-blocks'
				)}
			>
				<ToggleControl
					id="lazyblock-pro-control-url-rich-preview"
					label={__('Yes', 'lazy-blocks')}
					checked={richPreview === 'true'}
					onChange={(value) =>
						updateData({
							rich_preview: value ? 'true' : 'false',
						})
					}
					__nextHasNoMarginBottom
				/>
			</BaseControl>
		</PanelBody>
	);
}

addFilter(
	'lzb.constructor.control.url.settings',
	'lzb.constructor',
	(render, props) => {
		return <BlockBuilderControlSettings {...props} />;
	}
);
