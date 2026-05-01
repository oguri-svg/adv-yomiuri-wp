/**
 * Styles
 */
import './styles.scss';

/**
 * WordPress dependencies
 */
import { __ } from '@wordpress/i18n';
import { RawHTML } from '@wordpress/element';
import { addFilter } from '@wordpress/hooks';
import { useSelect } from '@wordpress/data';
import { PanelBody, BaseControl, ToggleControl } from '@wordpress/components';

/**
 * Internal dependencies
 */
import escape from '../_utils/escape';
import unescape from '../_utils/unescape';

/**
 * Control render in editor.
 */
// eslint-disable-next-line react/jsx-no-useless-fragment
addFilter('lzb.editor.control.panel.render', 'lzb.editor', () => <></>);

/**
 * Change controls render to support panels.
 */
addFilter(
	'lzb.editor.controls.render',
	'lzb.editor.maybe-place-controls-to-panel',
	(defaultResult, data) => {
		const {
			placement,
			childOf,
			childIndex,
			getControls,
			renderControl,
			group,
		} = data;

		const controls = getControls(childOf);
		const resultPanels = [];
		const result = [];

		// prepare attributes.
		Object.keys(controls).forEach((k) => {
			const control = controls[k];

			// eslint-disable-next-line no-use-before-define
			const renderedControl = renderControl(
				control,
				placement,
				k,
				childIndex,
				group
			);

			if (renderedControl) {
				if (control.type === 'panel' || !resultPanels.length) {
					resultPanels.push({
						icon:
							control.type === 'panel' && control.icon
								? unescape(control.icon)
								: '',
						label:
							control.type === 'panel' &&
							control.endpoint === 'false'
								? control.label
								: '',
						initial_open:
							control.type === 'panel' &&
							control.endpoint === 'false'
								? control.initial_open
								: 'true',
						controls: [],
					});
				}

				if (control.type !== 'panel') {
					resultPanels[resultPanels.length - 1].controls.push(
						renderedControl
					);
				}
			}
		});

		resultPanels.forEach((panelData, index) => {
			result.push(
				<PanelBody
					// eslint-disable-next-line react/no-array-index-key
					key={`panel-${group}-${index}`}
					className="lzb-pro-control_panel"
					title={panelData.label}
					icon={<RawHTML>{panelData.icon}</RawHTML>}
					initialOpen={
						panelData.initial_open &&
						panelData.initial_open === 'true'
					}
				>
					<div>{panelData.controls}</div>
				</PanelBody>
			);
		});

		return result;
	}
);

/**
 * Control render in block builder.
 *
 * @param {Object} props
 */
function BlockBuilderControlSettings(props) {
	const { updateData, data } = props;

	const { IconPickerControl } = useSelect((select) => {
		const { IconPicker } = select('lazy-blocks/components').get();

		return {
			IconPickerControl: IconPicker,
		};
	});

	return (
		<PanelBody>
			<BaseControl
				id="lazyblocks-pro-control-panel-endpoint"
				label={__('Endpoint', 'lazy-blocks')}
				help={__(
					'Define an endpoint for the previous panel to stop. This panel will not be visible.',
					'lazy-blocks'
				)}
				__nextHasNoMarginBottom
			>
				<ToggleControl
					id="lazyblocks-pro-control-panel-endpoint"
					label={__('Yes', 'lazy-blocks')}
					checked={data.endpoint === 'true'}
					onChange={(value) =>
						updateData({ endpoint: value ? 'true' : 'false' })
					}
					__nextHasNoMarginBottom
				/>
			</BaseControl>
			{data.endpoint === 'false' ? (
				<>
					<BaseControl
						id="lazyblocks-pro-control-panel-initial-open"
						label={__('Initial Open', 'lazy-blocks')}
						__nextHasNoMarginBottom
					>
						<ToggleControl
							id="lazyblocks-pro-control-panel-initial-open"
							label={__('Yes', 'lazy-blocks')}
							checked={data.initial_open === 'true'}
							onChange={(value) =>
								updateData({
									initial_open: value ? 'true' : 'false',
								})
							}
							__nextHasNoMarginBottom
						/>
					</BaseControl>
					<IconPickerControl
						label={__('Icon', 'lazy-blocks')}
						value={unescape(data.icon)}
						onChange={(value) => {
							updateData({ icon: escape(value) });
						}}
					/>
				</>
			) : null}
		</PanelBody>
	);
}

addFilter(
	'lzb.constructor.control.panel.settings',
	'lzb.constructor',
	(render, props) => {
		const { updateData, data, IconPickerControl } = props;

		return (
			<BlockBuilderControlSettings
				updateData={updateData}
				data={data}
				IconPickerControl={IconPickerControl}
			/>
		);
	}
);
