/* eslint-disable import/no-extraneous-dependencies */
/* eslint-disable import/no-unresolved */
/**
 * WordPress dependencies
 */
import { debounce } from 'lodash';
import $ from 'jquery';
import { __ } from '@wordpress/i18n';
import { addFilter } from '@wordpress/hooks';
import {
	PanelBody,
	BaseControl,
	RadioControl,
	CheckboxControl,
} from '@wordpress/components';
import { useState, useEffect } from '@wordpress/element';
import { useSelect } from '@wordpress/data';

const { LZBProControlPosts, ajaxurl } = window;

const cachedPosts = {};

/**
 * Control render in editor.
 *
 * @param {Object} props
 */
function ControlEditor(props) {
	const { onChange, getValue, data } = props;

	const [options, setOptions] = useState([]);
	const [ajaxStatus, setAjaxStatus] = useState(true);
	const [ajaxInProgress, setAjaxInProgress] = useState(false);

	const isLoading = ajaxStatus && ajaxStatus === 'progress';

	const { Base, SelectControl, useBlockControlProps } = useSelect(
		(select) => {
			const components = select('lazy-blocks/components').get();
			const hooks = select('lazy-blocks/hooks').get();

			return {
				Base: components.BaseControl,
				SelectControl: components.Select,
				useBlockControlProps: hooks.useBlockControlProps,
			};
		}
	);

	/**
	 * Request AJAX dynamic data.
	 *
	 * @param {Object}   additionalData  - additional data for AJAX call.
	 * @param {Function} callback        - callback.
	 * @param {boolean}  useStateLoading - use state change when loading.
	 */
	const requestAjax = (
		additionalData = {},
		callback = false,
		useStateLoading = true
	) => {
		if (ajaxInProgress) {
			return;
		}

		setAjaxInProgress(true);

		if (useStateLoading) {
			setAjaxStatus('progress');
		}

		const ajaxData = {
			action: 'lzb_pro_control_posts_get_posts',
			nonce: LZBProControlPosts.nonce,
			post_type: data.posts_post_type,
			post_status: data.posts_post_status,
			taxonomy: data.posts_taxonomy,
			...additionalData,
		};

		$.ajax({
			url: ajaxurl,
			method: 'POST',
			dataType: 'json',
			data: ajaxData,
			complete: (response) => {
				const json = response.responseJSON;

				if (callback && json && json.response) {
					json.response.forEach((itemData) => {
						cachedPosts[itemData.value] = itemData;
					});

					callback(json.response);
				}

				if (useStateLoading) {
					setAjaxStatus(true);
				}

				setAjaxInProgress(false);
			},
		});
	};
	const requestAjaxDebounce = debounce(requestAjax, 300);

	/**
	 * Find option data by value.
	 *
	 * @param {Array} opts - options array.
	 *
	 * @return {Array} - categorized options.
	 */
	const prepareOptionsCategories = (opts) => {
		const categorized = {};
		const result = [];

		if (opts && opts.length) {
			opts.forEach((item) => {
				if (!categorized[item.post_type]) {
					categorized[item.post_type] = [];
				}

				categorized[item.post_type].push(item);
			});

			if (Object.keys(categorized).length) {
				Object.keys(categorized).forEach((catName) => {
					result.push({
						label: catName,
						options: categorized[catName],
					});
				});
			}
		}

		return result;
	};

	/**
	 * Find option data by value.
	 *
	 * @param {string} findVal - value.
	 *
	 * @return {Object | boolean} - value object.
	 */
	const findValueData = (findVal) => {
		const result = {
			value: findVal,
			label: findVal,
		};

		if (cachedPosts[findVal]) {
			result.label = cachedPosts[findVal].label;
		}

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

		requestAjax(
			{
				post_ids: postIds,
			},
			(result) => {
				if (result) {
					setOptions(result);
				}
			}
		);
		// eslint-disable-next-line react-hooks/exhaustive-deps
	}, []);

	return (
		<Base {...useBlockControlProps(props)}>
			<SelectControl
				isAsync
				isSearchable
				isClearable
				isLoading={isLoading}
				isMulti={data.multiple === 'true'}
				placeholder={__('Type to search…', 'lazy-blocks')}
				value={getDefaultValue()}
				defaultOptions={prepareOptionsCategories(options)}
				loadOptions={(inputValue, cb) => {
					requestAjaxDebounce(
						{ search: inputValue },
						(result) => {
							cb(
								result ? prepareOptionsCategories(result) : null
							);
						},
						false
					);
				}}
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
		</Base>
	);
}

addFilter('lzb.editor.control.posts.render', 'lzb.editor', (render, props) => (
	<ControlEditor {...props} />
));

/**
 * Control settings render in block builder.
 *
 * @param {Object} props
 */
function BlockBuilderControlSettings(props) {
	const { updateData, data } = props;

	const {
		SelectControl,
		postTypes,
		statuses,
		taxonomies,
		taxonomiesCategorized,
	} = useSelect((select) => {
		const { getPostTypes, getStatuses, getTaxonomies, getEntityRecords } =
			select('core');

		const { Select } = select('lazy-blocks/components').get();

		const allTaxonomies = getTaxonomies({ per_page: -1 }) || [];
		const allPostTypes = getPostTypes({ per_page: -1 }) || [];
		const allStatuses = getStatuses({ per_page: -1 }) || [];
		const resultPostTypes = [];
		const resultStatuses = [];
		let resultTaxonomies = [];
		const resultTaxonomiesCategorized = [];

		// Prepare post types.
		allPostTypes.forEach((postTypeData) => {
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
		});

		// Prepare statuses.
		allStatuses.forEach((statusData) => {
			resultStatuses.push({
				value: statusData.slug,
				label: statusData.name,
			});
		});

		// Prepare taxonomies.
		allTaxonomies.forEach((taxonomyData) => {
			const terms =
				getEntityRecords('taxonomy', taxonomyData.slug, {
					per_page: -1,
				}) || [];
			const resultTerms = [];

			terms.forEach((termData) => {
				resultTerms.push({
					value: `${taxonomyData.slug}:${termData.slug}`,
					label: termData.name,
				});
			});

			if (resultTerms.length) {
				resultTaxonomiesCategorized.push({
					label: taxonomyData.name,
					options: resultTerms,
				});
			}

			resultTaxonomies = [...resultTaxonomies, ...resultTerms];
		});

		return {
			SelectControl: Select,
			postTypes: resultPostTypes,
			statuses: resultStatuses,
			taxonomies: resultTaxonomies,
			taxonomiesCategorized: resultTaxonomiesCategorized,
		};
	});

	return (
		<>
			<PanelBody>
				<BaseControl
					id="lazyblocks-pro-control-posts-filter-post-type"
					label={__('Filter by Post Type', 'lazy-blocks')}
					__nextHasNoMarginBottom
				>
					<SelectControl
						id="lazyblocks-pro-control-posts-filter-post-type"
						isMulti
						placeholder={__('All post types', 'lazy-blocks')}
						options={postTypes}
						value={(data.posts_post_type || []).map((val) => {
							let label = val;

							postTypes.forEach((postTypeData) => {
								if (postTypeData.value === val) {
									label = postTypeData.label;
								}
							});

							return {
								value: val,
								label,
							};
						})}
						onChange={(value) => {
							const result = [];

							if (value) {
								value.forEach((optionData) => {
									result.push(optionData.value);
								});
							}

							updateData({ posts_post_type: result });
						}}
					/>
				</BaseControl>
			</PanelBody>
			<PanelBody>
				<BaseControl
					id="lazyblocks-pro-control-posts-filter-post-status"
					label={__('Filter by Post Status', 'lazy-blocks')}
					__nextHasNoMarginBottom
				>
					<SelectControl
						id="lazyblocks-pro-control-posts-filter-post-status"
						isMulti
						placeholder={__('All post statuses', 'lazy-blocks')}
						options={statuses}
						value={(data.posts_post_status || []).map((val) => {
							let label = val;

							statuses.forEach((postTypeData) => {
								if (postTypeData.value === val) {
									label = postTypeData.label;
								}
							});

							return {
								value: val,
								label,
							};
						})}
						onChange={(value) => {
							const result = [];

							if (value) {
								value.forEach((optionData) => {
									result.push(optionData.value);
								});
							}

							updateData({ posts_post_status: result });
						}}
					/>
				</BaseControl>
			</PanelBody>
			<PanelBody>
				<BaseControl
					id="lazyblocks-pro-control-posts-filter-taxonomy"
					label={__('Filter by Taxonomy', 'lazy-blocks')}
					__nextHasNoMarginBottom
				>
					<SelectControl
						id="lazyblocks-pro-control-posts-filter-taxonomy"
						isMulti
						placeholder={__('All taxonomies', 'lazy-blocks')}
						options={taxonomiesCategorized}
						value={(data.posts_taxonomy || []).map((val) => {
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
						})}
						onChange={(value) => {
							const result = [];

							if (value) {
								value.forEach((optionData) => {
									result.push(optionData.value);
								});
							}

							updateData({ posts_taxonomy: result });
						}}
					/>
				</BaseControl>
			</PanelBody>
			<PanelBody>
				<BaseControl
					id="lazyblocks-pro-control-posts-output-format"
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
								label: __('Post ID', 'lazy-blocks'),
								value: '',
							},
							{
								label: __('Post Object', 'lazy-blocks'),
								value: 'object',
							},
						]}
						selected={data.posts_output_format || ''}
						onChange={(value) =>
							updateData({ posts_output_format: value })
						}
					/>
				</BaseControl>
			</PanelBody>
			<PanelBody>
				<BaseControl
					id="lazyblocks-pro-control-posts-multiple"
					label={__('Multiple', 'lazy-blocks')}
					help={__(
						'Allows you to select multiple values',
						'lazy-blocks'
					)}
					__nextHasNoMarginBottom
				>
					<CheckboxControl
						id="lazyblocks-pro-control-posts-multiple"
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
	'lzb.constructor.control.posts.settings',
	'lzb.constructor',
	(render, props) => <BlockBuilderControlSettings {...props} />
);
