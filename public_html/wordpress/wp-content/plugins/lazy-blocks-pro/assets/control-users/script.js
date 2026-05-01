/* eslint-disable import/no-unresolved */
/* eslint-disable import/no-extraneous-dependencies */
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

const { LZBProControlUsers, ajaxurl } = window;

const cachedRoles = [];
const cachedUsers = {};

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
			action: 'lzb_pro_control_users_get_users',
			nonce: LZBProControlUsers.nonce,
			role: data.users_role,
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
						cachedUsers[itemData.ID] = itemData;
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
	 * @return {Array} - options for Select control.
	 */
	const prepareOptionsSelect = (opts) => {
		const result = [];

		if (opts && opts.length) {
			opts.forEach((item) => {
				result.push({
					value: item.ID,
					label: item.display_name,
				});
			});
		}

		return result;
	};

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

		if (cachedUsers[findVal]) {
			result.label = cachedUsers[findVal].display_name;
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
		const include = [];

		if (defaultValue) {
			if (data.multiple === 'true') {
				defaultValue.forEach((itemData) => {
					include.push(itemData.value);
				});
			} else if (defaultValue.value) {
				include.push(defaultValue.value);
			}
		}

		requestAjax(
			{
				include,
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
				defaultOptions={prepareOptionsSelect(options)}
				loadOptions={(inputValue, cb) => {
					requestAjaxDebounce(
						{ search: inputValue },
						(result) => {
							cb(result ? prepareOptionsSelect(result) : null);
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

addFilter('lzb.editor.control.users.render', 'lzb.editor', (render, props) => (
	<ControlEditor {...props} />
));

/**
 * Control settings render in block builder.
 *
 * @param {Object} props
 */
function BlockBuilderControlSettings(props) {
	const { updateData, data } = props;

	const [roles, setRoles] = useState([...cachedRoles]);

	const { SelectControl } = useSelect((select) => {
		const components = select('lazy-blocks/components').get();

		return {
			SelectControl: components.Select,
		};
	});

	// Mount.
	useEffect(() => {
		if (roles.length) {
			return;
		}

		// Let's request all roles using AJAX.
		$.ajax({
			url: ajaxurl,
			method: 'POST',
			dataType: 'json',
			data: {
				action: 'lzb_pro_control_users_get_roles',
				nonce: LZBProControlUsers.nonce,
			},
			complete: (response) => {
				const json = response.responseJSON;

				if (json && json.response) {
					json.response.forEach((itemData) => {
						cachedRoles.push(itemData);
					});

					setRoles([...cachedRoles]);
				}
			},
		});
		// eslint-disable-next-line react-hooks/exhaustive-deps
	}, []);

	return (
		<>
			<PanelBody>
				<BaseControl
					id="lazyblocks-pro-control-users-filter-by-role"
					label={__('Filter by Role', 'lazy-blocks')}
					__nextHasNoMarginBottom
				>
					<SelectControl
						id="lazyblocks-pro-control-users-filter-by-role"
						isMulti
						placeholder={__('All user roles', 'lazy-blocks')}
						options={roles}
						value={(data.users_role || []).map((val) => {
							let label = val;

							roles.forEach((roleData) => {
								if (roleData.value === val) {
									label = roleData.label;
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

							updateData({ users_role: result });
						}}
					/>
				</BaseControl>
			</PanelBody>
			<PanelBody>
				<BaseControl
					id="lazyblocks-pro-control-users-output-format"
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
								label: __('User ID', 'lazy-blocks'),
								value: '',
							},
							{
								label: __('User Object', 'lazy-blocks'),
								value: 'object',
							},
						]}
						selected={data.users_output_format || ''}
						onChange={(value) =>
							updateData({ users_output_format: value })
						}
					/>
				</BaseControl>
			</PanelBody>
			<PanelBody>
				<BaseControl
					id="lazyblocks-pro-control-users-multiple"
					label={__('Multiple', 'lazy-blocks')}
					help={__(
						'Allows you to select multiple values',
						'lazy-blocks'
					)}
					__nextHasNoMarginBottom
				>
					<CheckboxControl
						id="lazyblocks-pro-control-users-multiple"
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
	'lzb.constructor.control.users.settings',
	'lzb.constructor',
	(render, props) => <BlockBuilderControlSettings {...props} />
);
