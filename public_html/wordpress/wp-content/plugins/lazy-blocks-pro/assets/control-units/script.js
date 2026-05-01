/**
 * WordPress dependencies
 */
import { __ } from '@wordpress/i18n';
import { addFilter } from '@wordpress/hooks';
import { useSelect } from '@wordpress/data';
import {
	PanelBody,
	BaseControl,
	__experimentalUnitControl as UnitControl,
} from '@wordpress/components';

/**
 * Control render in editor.
 *
 * @param {Object} props
 */
function ControlEditor(props) {
	const { onChange, getValue, data } = props;

	const { Base, useBlockControlProps } = useSelect((select) => {
		const components = select('lazy-blocks/components').get();
		const hooks = select('lazy-blocks/hooks').get();

		return {
			Base: components.BaseControl,
			useBlockControlProps: hooks.useBlockControlProps,
		};
	});

	const units = [];
	const unitsArray = data.units ? data.units.split(',') : [];

	unitsArray.forEach((unit) => {
		units.push({ value: unit, label: unit });
	});

	return (
		<Base
			{...useBlockControlProps(props, {
				label: false,
				help: false,
			})}
		>
			<UnitControl
				label={data.label}
				help={data.help}
				onChange={onChange}
				value={getValue()}
				units={units}
				className="lzb-pro-control_units"
				__next40pxDefaultSize
				__nextHasNoMarginBottom
			/>
		</Base>
	);
}

addFilter('lzb.editor.control.units.render', 'lzb.editor', (render, props) => {
	return <ControlEditor {...props} />;
});

/**
 * Control settings render in block builder.
 *
 * @param {Object} props
 */
function BlockBuilderControlSettings(props) {
	const { updateData, data } = props;
	const { units } = data;

	const { SelectControl } = useSelect((select) => {
		const components = select('lazy-blocks/components').get();

		return {
			SelectControl: components.Select,
		};
	});

	return (
		<PanelBody>
			<BaseControl
				id="lazyblocks-pro-control-units-select-units"
				label={__('Units', 'lazy-blocks')}
				help={__(
					'Collection of available units to display in control.',
					'lazy-blocks'
				)}
				__nextHasNoMarginBottom
			>
				<SelectControl
					id="lazyblocks-pro-control-units-select-units"
					isCreatable
					isTags
					placeholder={__('Type unit and push Enter', 'lazy-blocks')}
					value={(() => {
						if (units) {
							const result = units.split(',').map((val) => ({
								value: val,
								label: val,
							}));
							return result;
						}
						return [];
					})()}
					onChange={(value) => {
						let result = '';

						if (value) {
							value.forEach((optionData) => {
								if (optionData) {
									if (result) {
										result += ',';
									}

									result += optionData.value;
								}
							});
						}

						updateData({ units: result });
					}}
				/>
			</BaseControl>
		</PanelBody>
	);
}

addFilter(
	'lzb.constructor.control.units.settings',
	'lzb.constructor',
	(render, props) => {
		return <BlockBuilderControlSettings {...props} />;
	}
);
