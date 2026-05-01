/**
 * WordPress dependencies.
 */
import { __ } from '@wordpress/i18n';
import { addFilter } from '@wordpress/hooks';
/**
 * WordPress dependencies.
 */
import { useEffect, useState } from '@wordpress/element';
import { BaseControl, TextControl } from '@wordpress/components';
import { useSelect } from '@wordpress/data';

function BlockRelationshipsSettings(props) {
	const { data, updateData } = props;

	const [registeredBlocks, setRegisteredBlocks] = useState([]);
	const [processedSlug, setProcessedSlug] = useState('');

	// Extract Select component from lazy-blocks/components
	const { SelectControl } = useSelect((select) => {
		const { Select } = select('lazy-blocks/components').get();

		return {
			SelectControl: Select,
		};
	});

	useEffect(() => {
		const lazyBlocks = window.lazyblocksGutenberg?.blocks || [];

		const currentBlockSlug = data.slug || '';
		let currentProcessedSlug = '';

		if (currentBlockSlug) {
			// Check if slug contains '/' character
			if (currentBlockSlug.includes('/')) {
				// If it contains '/', use the entire string
				currentProcessedSlug = currentBlockSlug;
			} else {
				// If it doesn't contain '/', prepend 'lazyblock/'
				currentProcessedSlug = `lazyblock/${currentBlockSlug}`;
			}
		}

		// Set the processed slug in state
		setProcessedSlug(currentProcessedSlug);

		// Extract slugs from lazy blocks and filter out current block
		const result = lazyBlocks
			.map((block) => block.slug)
			.filter((slug) => slug !== currentProcessedSlug);

		setRegisteredBlocks(result);
	}, [data]); // Add data as dependency to re-run when data changes

	const {
		provide_context_to_blocks: provideContextToBlocks,
		custom_context_slug: customContextSlug,
		allowed_blocks: allowedBlocks,
		ancestor,
	} = data;

	return (
		<>
			<BaseControl
				id="lazyblocks-relationships-provide-context"
				label={__('Provide Context to Blocks', 'lazy-blocks')}
				__nextHasNoMarginBottom
			>
				<SelectControl
					id="lazyblocks-relationships-context"
					isMulti={true}
					isCreatable={true}
					placeholder={__(
						'Select or enter block slug',
						'lazy-blocks'
					)}
					options={registeredBlocks.map((blockName) => ({
						value: blockName,
						label: blockName, // Using block name as both value and label
					}))}
					value={(() => {
						if (
							provideContextToBlocks &&
							provideContextToBlocks.length
						) {
							const result = provideContextToBlocks.map(
								(val) => ({
									value: val,
									label: val, // Using the slug as label since we only have slugs
								})
							);
							return result;
						}
						return [];
					})()}
					onChange={(value) => {
						if (value) {
							const result = [];

							value.forEach((optionData) => {
								result.push(optionData.value);
							});

							updateData({ provide_context_to_blocks: result });
						} else {
							updateData({ provide_context_to_blocks: '' });
						}
					}}
				/>
			</BaseControl>
			{provideContextToBlocks ? (
				<TextControl
					label={__('Context custom slug (optional)', 'lazy-blocks')}
					value={customContextSlug}
					onChange={(value) => {
						if (value) {
							updateData({ custom_context_slug: value });
						} else {
							updateData({ custom_context_slug: '' });
						}
					}}
					placeholder={processedSlug}
					__next40pxDefaultSize
					__nextHasNoMarginBottom
				/>
			) : (
				''
			)}
			<BaseControl
				id="lazyblocks-relationships-ancestor"
				label={__('Ancestor', 'lazy-blocks')}
				__nextHasNoMarginBottom
			>
				<SelectControl
					id="lazyblocks-relationships-ancestor"
					isMulti={true}
					isCreatable={true}
					placeholder={__(
						'Select or enter block slug',
						'lazy-blocks'
					)}
					options={registeredBlocks.map((blockName) => ({
						value: blockName,
						label: blockName, // Using block name as both value and label
					}))}
					value={(() => {
						if (ancestor && ancestor.length) {
							const result = ancestor.map((val) => ({
								value: val,
								label: val, // Using the slug as label since we only have slugs
							}));
							return result;
						}
						return [];
					})()}
					onChange={(value) => {
						if (value) {
							const result = [];

							value.forEach((optionData) => {
								result.push(optionData.value);
							});

							updateData({ ancestor: result });
						} else {
							updateData({ ancestor: '' });
						}
					}}
				/>
			</BaseControl>
			<BaseControl
				id="lazyblocks-relationships-allowed-blocks"
				label={__('Allowed Blocks', 'lazy-blocks')}
				__nextHasNoMarginBottom
			>
				<SelectControl
					id="lazyblocks-relationships-allowed-blocks"
					isMulti={true}
					isCreatable={true}
					placeholder={__(
						'Select or enter block slug',
						'lazy-blocks'
					)}
					options={registeredBlocks.map((blockName) => ({
						value: blockName,
						label: blockName, // Using block name as both value and label
					}))}
					value={(() => {
						if (allowedBlocks && allowedBlocks.length) {
							const result = allowedBlocks.map((val) => ({
								value: val,
								label: val, // Using the slug as label since we only have slugs
							}));
							return result;
						}
						return [];
					})()}
					onChange={(value) => {
						if (value) {
							const result = [];

							value.forEach((optionData) => {
								result.push(optionData.value);
							});

							updateData({ allowed_blocks: result });
						} else {
							updateData({ allowed_blocks: '' });
						}
					}}
				/>
			</BaseControl>
		</>
	);
}

/**
 * Add Relationships panel to block builder.
 */
addFilter(
	'lzb.constructor.panels',
	'lzb.constructor.panels.add-relationships-panel',
	(panels) => {
		// Insert the Relationships panel after the Condition panel
		const conditionIndex = panels.findIndex(
			(panel) => panel.name === 'condition'
		);
		const insertIndex =
			conditionIndex !== -1 ? conditionIndex + 1 : panels.length;

		const relationshipsPanel = {
			name: 'relationships',
			title: __('Relationships', 'lazy-blocks'),
			component: BlockRelationshipsSettings,
			initialOpen: false,
		};

		panels.splice(insertIndex, 0, relationshipsPanel);

		return panels;
	}
);

// Add filter to modify lazy blocks registration arguments
addFilter(
	'lzb.registerBlockType.args',
	'lzb.registerBlockType.args.add-block-relationships',
	(blockArgs, blockSlug, blockData) => {
		if (blockArgs.lazyblock) {
			blockArgs.usesContext = [...(blockData.uses_context || [])];
			blockArgs.providesContext = [...(blockData.provides_context || [])];

			if (blockData.ancestor && blockData.ancestor.length > 0) {
				blockArgs.ancestor = [...blockData.ancestor];
			}

			if (
				blockData.allowed_blocks &&
				blockData.allowed_blocks.length > 0
			) {
				blockArgs.allowedBlocks = [...blockData.allowed_blocks];
			}
		}

		return blockArgs;
	}
);

/**
 * Add uses context to 3rd party blocks during registration.
 */
addFilter(
	'blocks.registerBlockType',
	'lzb.blocks.registerBlockType.add-relationships-to-third-party-blocks',
	(settings, name) => {
		// Check if we have uses context data for this block
		if (window.lzbThirdPartyUsesContext?.[name]) {
			const usesContext = window.lzbThirdPartyUsesContext[name];

			// Merge with existing uses context and remove duplicates in one step
			settings.usesContext = [
				...new Set([...(settings.usesContext || []), ...usesContext]),
			];
		}

		return settings;
	}
);
