/**
 * Styles
 */
import './styles.scss';

/**
 * WordPress dependencies
 */
import { addFilter } from '@wordpress/hooks';
import { useSelect } from '@wordpress/data';

/**
 * Control render in editor.
 *
 * @param {Object} props
 */
function ControlEditor(props) {
	const { BaseControl, useBlockControlProps } = useSelect((select) => {
		const components = select('lazy-blocks/components').get();
		const hooks = select('lazy-blocks/hooks').get();

		return {
			BaseControl: components.BaseControl,
			useBlockControlProps: hooks.useBlockControlProps,
		};
	});

	return <BaseControl {...useBlockControlProps(props)} />;
}

addFilter(
	'lzb.editor.control.divider.render',
	'lzb.editor',
	(render, props) => <ControlEditor {...props} />
);
