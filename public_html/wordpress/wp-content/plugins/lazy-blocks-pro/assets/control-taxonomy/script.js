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
	PanelBody,
	BaseControl,
	RadioControl,
	CheckboxControl,
} from '@wordpress/components';
import { useEffect } from '@wordpress/element';
import { useSelect } from '@wordpress/data';

/**
 * Control render in editor.
 *
 * @param {Object} props
 */
function ControlEditor(props) {
	const { onChange, getValue, data } = props;

	let appearance = 'select';

	if (data.taxonomy_appearance === 'check') {
		if (data.multiple === 'true') {
			appearance = 'checkbox';
		} else {
			appearance = 'radio';
		}
	}

	const { Base, SelectControl, terms, useBlockControlProps } = useSelect(
		(select) => {
			const { getEntityRecords } = select('core');

			const components = select('lazy-blocks/components').get();
			const hooks = select('lazy-blocks/hooks').get();

			const entityTerms =
				getEntityRecords('taxonomy', data.taxonomy || 'category', {
					per_page: -1,
				}) || [];
			const resultTerms = [];

			entityTerms.forEach((termData) => {
				resultTerms.push({
					value: data?.taxonomy_output_format
						? `${termData.id}`
						: termData.slug,
					label: termData.name,
				});
			});

			// TODO: ADD FORMATS.
			// post_format
			//
			// https://github.com/WordPress/gutenberg/blob/master/packages/editor/src/components/post-format/index.js

			return {
				Base: components.BaseControl,
				SelectControl: components.Select,
				useBlockControlProps: hooks.useBlockControlProps,
				terms: resultTerms,
			};
		}
	);

	/**
	 * Find option data by value.
	 *
	 * @param {string} findVal - value.
	 *
	 * @return {Object|boolean} - value object.
	 */
	const findValueData = (findVal) => {
		const result = {
			value: findVal,
			label: findVal,
		};

		terms.forEach((termData) => {
			if (termData.value === findVal) {
				result.label = termData.label;
			}
		});

		return result;
	};

	/**
	 * Get default value to support React Select attribute.
	 *
	 * @return {Object} - value object for React Select.
	 */
	const getDefaultValue = () => {
		const value = getValue();

		let result = null;

		if (data.multiple === 'true') {
			if ((!value && typeof value !== 'string') || !value.length) {
				return result;
			}

			result = [];

			value.forEach((innerVal) => {
				result.push(findValueData(innerVal));
			});
		} else {
			if (!value && typeof value !== 'string') {
				return result;
			}

			result = findValueData(value);
		}

		return result;
	};

	// Mount.
	useEffect(() => {
		const defaultValue = getDefaultValue();
		const postIds = [];

		if (defaultValue) {
			if (data.multiple === 'true') {
				defaultValue.forEach((itemData) => {
					postIds.push(itemData.value);
				});
			} else if (defaultValue.value) {
				postIds.push(defaultValue.value);
			}
		}
		// eslint-disable-next-line react-hooks/exhaustive-deps
	}, []);

	const defaultValue = getDefaultValue();

	return (
		<Base {...useBlockControlProps(props)}>
			{appearance === 'checkbox' ? (
				<>
					{terms.map((termData) => (
						<CheckboxControl
							key={`lzb-${data.name}-term-${termData.value}`}
							className="lzb-pro-control_taxonomy-checkbox"
							label={termData.label}
							checked={getValue().includes(termData.value)}
							onChange={(value) => {
								const result = [];
								let currentValue = getValue();

								if (!Array.isArray(currentValue)) {
									currentValue = [];
								}

								currentValue.forEach((valItem) => {
									// Skip removed item.
									if (
										valItem &&
										(value || valItem !== termData.value)
									) {
										result.push(valItem);
									}
								});

								// Add new item.
								if (value && !result.includes(termData.value)) {
									result.push(termData.value);
								}

								onChange(result);
							}}
							__nextHasNoMarginBottom
						/>
					))}
				</>
			) : null}
			{appearance === 'radio' ? (
				<RadioControl
					options={terms}
					selected={getValue()}
					onChange={(value) => onChange(value || '')}
				/>
			) : null}
			{appearance === 'select' ? (
				<SelectControl
					isSearchable
					isClearable
					isMulti={data.multiple === 'true'}
					placeholder={__('Type to search…', 'lazy-blocks')}
					value={defaultValue}
					options={terms}
					onChange={(value) => {
						if (data.multiple === 'true') {
							if (Array.isArray(value)) {
								const result = [];

								value.forEach((innerVal) => {
									result.push(innerVal ? innerVal.value : '');
								});

								onChange(result);
							} else {
								onChange([]);
							}
						} else {
							onChange(value ? value.value : '');
						}
					}}
				/>
			) : null}
		</Base>
	);
}

addFilter(
	'lzb.editor.control.taxonomy.render',
	'lzb.editor',
	(render, props) => <ControlEditor {...props} />
);

/**
 * Control settings render in block builder.
 *
 * @param {Object} props
 */
function BlockBuilderControlSettings(props) {
	const { updateData, data } = props;

	const { SelectControl, taxonomies } = useSelect((select) => {
		const { getTaxonomies } = select('core');

		const { Select } = select('lazy-blocks/components').get();

		const allTaxonomies = getTaxonomies({ per_page: -1 }) || [];
		const resultTaxonomies = [];

		// Prepare taxonomies.
		allTaxonomies.forEach((taxonomyData) => {
			const resultData = {
				label: taxonomyData.name,
				value: taxonomyData.slug,
			};
			let isUniqueLabel = true;

			// Check for duplicate label.
			resultTaxonomies.forEach((item) => {
				isUniqueLabel = isUniqueLabel
					? resultData.label !== item.label
					: isUniqueLabel;
			});

			if (!isUniqueLabel) {
				resultData.label += ` (${resultData.value})`;
			}

			resultTaxonomies.push(resultData);
		});

		return {
			SelectControl: Select,
			taxonomies: resultTaxonomies,
		};
	});

	return (
		<>
			<PanelBody>
				<BaseControl
					id="lazyblocks-pro-control-taxonomy-select-taxonomy"
					label={__('Taxonomy', 'lazy-blocks')}
					help={__(
						'Select the taxonomy to be displayed',
						'lazy-blocks'
					)}
					__nextHasNoMarginBottom
				>
					<SelectControl
						id="lazyblocks-pro-control-taxonomy-select-taxonomy"
						placeholder={__('Select Taxonomy', 'lazy-blocks')}
						options={taxonomies}
						value={(() => {
							const val = data.taxonomy;
							let label = val;

							taxonomies.forEach((taxonomyData) => {
								if (taxonomyData.value === val) {
									label = taxonomyData.label;
								}
							});

							return {
								value: val,
								label,
							};
						})()}
						onChange={({ value }) => {
							updateData({ taxonomy: value });
						}}
					/>
				</BaseControl>
			</PanelBody>
			<PanelBody>
				<BaseControl
					id="lazyblocks-pro-control-taxonomy-appearance"
					label={__('Appearance', 'lazy-blocks')}
					help={__(
						'Select the appearance of this field',
						'lazy-blocks'
					)}
					__nextHasNoMarginBottom
				>
					<RadioControl
						options={[
							{
								label: __('Select', 'lazy-blocks'),
								value: '',
							},
							{
								label:
									data.multiple === 'true'
										? __('Checkbox', 'lazy-blocks')
										: __('Radio', 'lazy-blocks'),
								value: 'check',
							},
						]}
						selected={data.taxonomy_appearance || ''}
						onChange={(value) =>
							updateData({ taxonomy_appearance: value })
						}
					/>
				</BaseControl>
			</PanelBody>
			<PanelBody>
				<BaseControl
					id="lazyblocks-pro-control-taxonomy-output-format"
					label={__('Output Format', 'lazy-blocks')}
					help={__(
						'Allows you to change attribute output format',
						'lazy-blocks'
					)}
					__nextHasNoMarginBottom
				>
					<RadioControl
						options={[
							{
								label: __('Term Slug', 'lazy-blocks'),
								value: '',
							},
							{
								label: __('Term ID', 'lazy-blocks'),
								value: 'id',
							},
							{
								label: __('Term Object', 'lazy-blocks'),
								value: 'object',
							},
						]}
						selected={data.taxonomy_output_format || ''}
						onChange={(value) =>
							updateData({ taxonomy_output_format: value })
						}
					/>
				</BaseControl>
			</PanelBody>
			<PanelBody>
				<BaseControl
					id="lazyblocks-pro-control-taxonomy-multiple"
					label={__('Multiple', 'lazy-blocks')}
					help={__(
						'Allows you to select multiple values',
						'lazy-blocks'
					)}
					__nextHasNoMarginBottom
				>
					<CheckboxControl
						id="lazyblocks-pro-control-taxonomy-multiple"
						label={__('Yes', 'lazy-blocks')}
						checked={data.multiple === 'true'}
						onChange={(value) =>
							updateData({
								multiple: value ? 'true' : 'false',
							})
						}
						__nextHasNoMarginBottom
					/>
				</BaseControl>
			</PanelBody>
		</>
	);
}

addFilter(
	'lzb.constructor.control.taxonomy.settings',
	'lzb.constructor',
	(render, props) => <BlockBuilderControlSettings {...props} />
);
