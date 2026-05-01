/**
 * Styles
 */
import './styles.scss';

/**
 * WordPress dependencies
 */
import { __ } from '@wordpress/i18n';
import { addFilter } from '@wordpress/hooks';
import { PanelBody, BaseControl } from '@wordpress/components';

/**
 * Internal dependencies
 */
import ConditionsComponent from '../_components/component-conditions';

/**
 * Compare 2 values
 *
 * @param {any}    lval     Left value.
 * @param {string} operator Operator.
 * @param {any}    rval     Right value.
 *
 * @return {boolean} is equal.
 */
function compare(lval, operator, rval) {
	let result = true;

	// Convert array to length.
	if (Array.isArray(lval)) {
		if (['>=', '<=', '>', '<'].includes(operator)) {
			lval = lval.length;
		} else if (['==empty', '!=empty'].includes(operator)) {
			lval = lval.length ? lval : '';
		}
	}

	switch (operator) {
		case '==':
			// eslint-disable-next-line eqeqeq
			result = lval == rval;
			break;
		case '===':
			result = lval === rval;
			break;
		case '!=':
			// eslint-disable-next-line eqeqeq
			result = lval != rval;
			break;
		case '!==':
			result = lval !== rval;
			break;
		case '>=':
			result = lval >= rval;
			break;
		case '<=':
			result = lval <= rval;
			break;
		case '>':
			result = lval > rval;
			break;
		case '<':
			result = lval < rval;
			break;
		case '==empty':
			result = lval === '';
			break;
		case '!=empty':
			result = lval !== '';
			break;
		case '==contains':
			result = lval.includes(rval);
			break;
		case '==class':
			result = lval.split(' ').includes(rval);
			break;
		case '!=class':
			result = !lval.split(' ').includes(rval);
			break;
		case 'AND':
			result = lval && rval;
			break;
		case 'OR':
			result = lval || rval;
			break;
		default:
			result = lval;
			break;
	}

	return result;
}

/**
 * Get control data by name.
 * @param {string} name
 * @param {Object} controls
 *
 * @return {Object} - control data.
 */
function getControlByName(name, controls) {
	const control = Object.values(controls).find((item) => item.name === name);
	return control || {};
}

/**
 * Check condition
 *
 * @param {Object}           conditions - Conditions array.
 * @param {Object}           attributes - Available block attributes.
 * @param {Object}           meta       - Available post meta.
 * @param {string}           relation   - Can be one of 'AND' or 'OR'.
 * @param {number | boolean} childIndex - Child index of Repeater item.
 * @param {Object}           controls   - All available block controls.
 *
 * @return {boolean} passes
 */
function checkCondition(
	conditions,
	attributes,
	meta,
	relation,
	childIndex,
	controls
) {
	const childRelation = relation === 'AND' ? 'OR' : 'AND';

	// by default result will be TRUE for relation AND
	// and FALSE for relation OR.
	let result = relation === 'AND';

	conditions.forEach((data) => {
		if (Array.isArray(data)) {
			result = compare(
				result,
				relation,
				checkCondition(
					data,
					attributes,
					meta,
					childRelation,
					childIndex,
					controls
				)
			);
		} else if (data.control) {
			const controlNames = data.control.split('.');
			const controlName = controlNames[0];
			const innerControlName = controlNames[1];
			const controlData = getControlByName(controlName, controls);

			let val = attributes[controlName];
			let rval = data.value;

			// Support for meta fields.
			if (controlData.save_in_meta === 'true') {
				val = meta[controlData.save_in_meta_name || controlName];
			}

			if (
				controlName === '__BLOCK_STYLE__' ||
				controlName === '__BLOCK_CLASS__'
			) {
				val = attributes.className;
			}
			if (controlName === '__BLOCK_STYLE__' && rval) {
				rval = `is-style-${rval}`;
			}

			// Convert Repeater string to array.
			if (typeof val === 'string' && val.startsWith('%5B')) {
				try {
					// WPML decodes string in a different way, so we have to use decodeURIComponent
					// when string does not contains ':'.
					if (val.includes(':')) {
						val = JSON.parse(decodeURI(val));
					} else {
						val = JSON.parse(decodeURIComponent(val));
					}
				} catch (e) {
					val = [];
				}
			}

			// Find repeater value.
			if (innerControlName) {
				// Check for the first repeater item if no child index specified.
				if (typeof childIndex !== 'number') {
					childIndex = 0;
				}

				if (
					typeof val !== 'undefined' &&
					typeof val[childIndex] !== 'undefined' &&
					typeof val[childIndex][innerControlName] !== 'undefined'
				) {
					val = val[childIndex][innerControlName];
				} else {
					val = '';
				}
			}

			if (typeof val !== 'undefined') {
				result = compare(
					result,
					relation,
					compare(val, data.operator, rval)
				);
			}
		}
	});

	return result;
}

/**
 * Conditionally hide the control in editor.
 */
addFilter(
	'lzb.editor.control.render',
	'lzb.editor',
	(render, { childIndex, data }, { attributes, meta, lazyBlockData }) => {
		if (data && data.conditional_logic && data.conditional_logic.length) {
			if (
				!checkCondition(
					data.conditional_logic,
					attributes,
					meta,
					'OR',
					childIndex,
					lazyBlockData.controls
				)
			) {
				return null;
			}
		}

		return render;
	}
);

/**
 * Control render in block builder.
 *
 * @param {Object} props
 */
function BlockBuilderControlSettings(props) {
	return (
		<PanelBody>
			<BaseControl
				label={__('Conditional Logic', 'lazy-blocks')}
				id="lazyblocks-pro-control-conditional-logic"
				__nextHasNoMarginBottom
			>
				<ConditionsComponent {...props} />
			</BaseControl>
		</PanelBody>
	);
}

addFilter(
	'lzb.constructor.control.settings-rows',
	'lzb.constructor.conditional-logic',
	(items) => {
		items.conditional_logic = BlockBuilderControlSettings;
		return items;
	}
);
