/**
 * External dependencies
 */
import nl2br from 'nl2br';
import wpautop from 'wpautop';

/**
 * WordPress dependencies
 */
import { __ } from '@wordpress/i18n';
import { RawHTML } from '@wordpress/element';
import { useSelect } from '@wordpress/data';
import { addFilter } from '@wordpress/hooks';
import {
	PanelBody,
	SelectControl,
	TextareaControl,
} from '@wordpress/components';

/**
 * Control render in editor.
 *
 * @param {Object} props
 */
function ControlEditor(props) {
	const { data } = props;

	let message = data.message_text;

	if (data.message_new_lines === 'paragraphs') {
		message = wpautop(message);
	} else if (data.message_new_lines === 'br') {
		message = nl2br(message);
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
			<RawHTML>{message}</RawHTML>
		</BaseControl>
	);
}

addFilter(
	'lzb.editor.control.message.render',
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

	return (
		<PanelBody>
			<TextareaControl
				label={__('Message', 'lazy-blocks')}
				value={data.message_text}
				onChange={(value) => {
					updateData({ message_text: value });
				}}
				__nextHasNoMarginBottom
			/>
			<SelectControl
				label={__('New Lines', 'lazy-blocks')}
				help={__('Controls how new lines are rendered', 'lazy-blocks')}
				value={data.message_new_lines}
				options={[
					{
						label: __(
							'Automatically add paragraphs',
							'lazy-blocks'
						),
						value: 'paragraphs',
					},
					{
						label: __('Automatically add <br>', 'lazy-blocks'),
						value: 'br',
					},
					{
						label: __('No formatting', 'lazy-blocks'),
						value: '',
					},
				]}
				onChange={(value) => {
					updateData({ message_new_lines: value });
				}}
				__next40pxDefaultSize
				__nextHasNoMarginBottom
			/>
		</PanelBody>
	);
}

addFilter(
	'lzb.constructor.control.message.settings',
	'lzb.constructor',
	(render, props) => <BlockBuilderControlSettings {...props} />
);
