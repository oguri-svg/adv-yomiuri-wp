/* eslint-disable camelcase */
/**
 * External dependencies
 */
import classnames from 'classnames/dedupe';
import {
	DndContext,
	closestCenter,
	useSensor,
	useSensors,
} from '@dnd-kit/core';
import {
	SortableContext,
	verticalListSortingStrategy,
	useSortable,
} from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import { arrayMoveImmutable } from 'array-move';

/**
 * WordPress dependencies
 */
import { __ } from '@wordpress/i18n';
import { Fragment } from '@wordpress/element';
import {
	BaseControl,
	SelectControl,
	TextControl,
	Button,
} from '@wordpress/components';
import { useSelect } from '@wordpress/data';

import CustomPointerSensor from '../_utils/dnd-kit-custom-pointer-sensor';

function getAllowedOperators(config) {
	return [
		...(config.allowExistenceOperators
			? [
					{
						label: __('Has any value', 'lazy-blocks'),
						value: '!=empty',
					},
					{
						label: __('Has no value', 'lazy-blocks'),
						value: '==empty',
					},
				]
			: []),
		...(config.allowEqualOperators
			? [
					{
						label: __('Is equal to', 'lazy-blocks'),
						value: '==',
					},
					{
						label: __('Is not equal to', 'lazy-blocks'),
						value: '!=',
					},
				]
			: []),
		...(config.allowClassEqualOperators
			? [
					{
						label:
							config.allowClassEqualOperators?.labelHas ??
							__('Has class', 'lazy-blocks'),
						value: '==class',
					},
					{
						label:
							config.allowClassEqualOperators?.labelHasNo ??
							__('Has no class', 'lazy-blocks'),
						value: '!=class',
					},
				]
			: []),
		...(config.allowContainsOperator
			? [
					{
						label: __('Contains', 'lazy-blocks'),
						value: '==contains',
					},
				]
			: []),
		...(config.allowRangeOperators
			? [
					{
						label: __('Is greater than', 'lazy-blocks'),
						value: '>',
					},
					{
						label: __('Is less than', 'lazy-blocks'),
						value: '<',
					},
				]
			: []),
	];
}

const SortableItem = function (props) {
	const {
		id,
		selectedControlName,
		stylesList,
		control,
		value,
		operator,
		equalOptions,
		updateCondition,
		removeCondition,
	} = props;

	const {
		attributes,
		listeners,
		setNodeRef,
		transform,
		transition,
		isDragging,
		isSorting,
	} = useSortable({
		id,
	});

	const style = {
		transform: CSS.Translate.toString(transform),
		transition: isSorting ? transition : '',
	};

	const controlsList = [...props.controlsList];

	// Disabled current control name.
	if (selectedControlName) {
		controlsList.forEach((controlName, k) => {
			if (selectedControlName === controlName.value) {
				controlsList[k].disabled = 'disabled';
			}
		});
	}

	const allowedOperators = getAllowedOperators(props);

	return (
		<div
			className={classnames(
				'lzb-block-builder-controls-item-settings-conditional-logic-item',
				isDragging
					? 'lzb-block-builder-controls-item-settings-conditional-logic-item-dragging'
					: ''
			)}
			ref={setNodeRef}
			style={style}
		>
			<SelectControl
				value={control}
				onChange={(val) => updateCondition({ control: val })}
				__next40pxDefaultSize
				__nextHasNoMarginBottom
			>
				<option value="">{__('-- Select --', 'lazy-blocks')}</option>
				<optgroup label={__('Controls', 'lazy-blocks')}>
					{controlsList.length ? (
						controlsList.map((data) => (
							<option
								key={data.value + data.label}
								value={data.value}
							>
								{data.label}
							</option>
						))
					) : (
						<option disabled>
							{__('No controls found', 'lazy-blocks')}
						</option>
					)}
				</optgroup>
				<optgroup label={__('Other', 'lazy-blocks')}>
					<option value="className">
						{__('CSS Class Name', 'lazy-blocks')}
					</option>
					<option
						value="__BLOCK_STYLE__"
						disabled={!stylesList.length}
					>
						{__('Block Styles', 'lazy-blocks')}
					</option>
				</optgroup>
			</SelectControl>
			<SelectControl
				value={operator}
				options={allowedOperators}
				onChange={(val) => updateCondition({ operator: val })}
				__next40pxDefaultSize
				__nextHasNoMarginBottom
			/>
			{equalOptions &&
			(operator === '==' ||
				operator === '!=' ||
				operator === '==class' ||
				operator === '!=class') ? (
				<SelectControl
					value={value}
					options={equalOptions}
					onChange={(val) => updateCondition({ value: val })}
					__next40pxDefaultSize
					__nextHasNoMarginBottom
				/>
			) : null}
			{!equalOptions &&
			(operator === '==' ||
				operator === '!=' ||
				operator === '==class' ||
				operator === '!=class' ||
				operator === '==contains' ||
				operator === '>' ||
				operator === '<') ? (
				<TextControl
					placeholder={__('Value', 'lazy-blocks')}
					value={value || ''}
					onChange={(val) => updateCondition({ value: val })}
					__next40pxDefaultSize
					__nextHasNoMarginBottom
				/>
			) : null}
			<div
				className="lzb-block-builder-controls-item-settings-conditional-logic-item-handler"
				{...attributes}
				{...listeners}
			>
				<svg
					width="24"
					height="24"
					viewBox="0 0 24 24"
					fill="none"
					xmlns="http://www.w3.org/2000/svg"
				>
					<path
						d="M10 4.99976H8V6.99976H10V4.99976Z"
						fill="currentColor"
					/>
					<path
						d="M10 10.9998H8V12.9998H10V10.9998Z"
						fill="currentColor"
					/>
					<path
						d="M10 16.9998H8V18.9998H10V16.9998Z"
						fill="currentColor"
					/>
					<path
						d="M16 4.99976H14V6.99976H16V4.99976Z"
						fill="currentColor"
					/>
					<path
						d="M16 10.9998H14V12.9998H16V10.9998Z"
						fill="currentColor"
					/>
					<path
						d="M16 16.9998H14V18.9998H16V16.9998Z"
						fill="currentColor"
					/>
				</svg>
			</div>
			{/* eslint-disable-next-line react/button-has-type */}
			<button
				className="lzb-block-builder-controls-item-settings-conditional-logic-item-remove"
				onClick={() => removeCondition()}
			>
				<svg
					width="24"
					height="24"
					viewBox="0 0 24 24"
					fill="none"
					xmlns="http://www.w3.org/2000/svg"
				>
					<path
						d="M6.33734 7.1706C6.23299 6.4793 6.76826 5.85717 7.4674 5.85717H16.5326C17.2317 5.85717 17.767 6.4793 17.6627 7.17061L15.9807 18.3134C15.8963 18.8724 15.416 19.2857 14.8507 19.2857H9.14934C8.58403 19.2857 8.10365 18.8724 8.01928 18.3134L6.33734 7.1706Z"
						stroke="currentColor"
						strokeWidth="1.71429"
					/>
					<rect
						x="4"
						y="5"
						width="16"
						height="2"
						fill="currentColor"
					/>
					<path
						d="M14.2857 5C14.2857 5 13.2624 5 12 5C10.7376 5 9.71428 5 9.71428 5C9.71428 3.73763 10.7376 2.71429 12 2.71429C13.2624 2.71429 14.2857 3.73763 14.2857 5Z"
						fill="currentColor"
					/>
				</svg>
			</button>
		</div>
	);
};

const SortableList = function (props) {
	const { items, controlsList, stylesList, selectedControlName, onSortEnd } =
		props;

	const sensors = useSensors(useSensor(CustomPointerSensor));

	return (
		<div className="lzb-block-builder-controls-item-settings-conditional-logic-items">
			<DndContext
				sensors={sensors}
				collisionDetection={closestCenter}
				onDragEnd={(event) => {
					const { active, over } = event;

					if (active.id !== over.id) {
						onSortEnd(active.id - 1, over.id - 1);
					}
				}}
			>
				<SortableContext
					items={items}
					strategy={verticalListSortingStrategy}
				>
					{items.map((value) => (
						<SortableItem
							key={`lzb-block-builder-controls-item-settings-conditional-logic-item-${value.id}`}
							controlsList={controlsList}
							stylesList={stylesList}
							selectedControlName={selectedControlName}
							{...value}
						/>
					))}
				</SortableContext>
			</DndContext>
		</div>
	);
};

function ConditionsRow(props) {
	const { data, updateData } = props;

	const { conditional_logic = [] } = data;

	const { blockData } = useSelect((select) => {
		const { getBlockData } = select('lazy-blocks/block-data');

		return {
			blockData: getBlockData(),
		};
	});

	const { controls, styles } = blockData;

	const resortCondition = (groupId, oldIndex, newIndex) => {
		if (
			conditional_logic[groupId] &&
			conditional_logic[groupId].constructor === Array
		) {
			conditional_logic[groupId] = arrayMoveImmutable(
				conditional_logic[groupId],
				oldIndex,
				newIndex
			);

			updateData({ conditional_logic });
		}
	};

	const updateCondition = (groupId, i, newData) => {
		if (
			conditional_logic[groupId] &&
			conditional_logic[groupId].constructor === Array &&
			conditional_logic[groupId][i]
		) {
			conditional_logic[groupId][i] = {
				...conditional_logic[groupId][i],
				...newData,
			};

			const allowedConditions = getControlAllowedConditions(
				conditional_logic[groupId][i].control,
				conditional_logic[groupId][i].operator,
				false
			);
			const allowedOperators = getAllowedOperators(allowedConditions);

			// Check if value is available in options. If not - change the value to the first in the options list.
			if (
				allowedConditions.equalOptions &&
				allowedConditions.equalOptions.length
			) {
				let isOptionAvailable = false;

				allowedConditions.equalOptions.forEach((equalOption) => {
					isOptionAvailable =
						isOptionAvailable ||
						equalOption.value ===
							conditional_logic[groupId][i].value;
				});

				if (!isOptionAvailable) {
					conditional_logic[groupId][i].value =
						allowedConditions.equalOptions[0].value;
				}
			}

			// Check if used unsupported operator.
			let isOperatorAvailable = false;

			allowedOperators.forEach((operator) => {
				isOperatorAvailable =
					isOperatorAvailable ||
					operator.value === conditional_logic[groupId][i].operator;
			});

			if (!isOperatorAvailable && allowedOperators[0]) {
				conditional_logic[groupId][i].operator =
					allowedOperators[0].value;
			}

			// Reset value if used Empty operator.
			if (
				conditional_logic[groupId][i].operator === '==empty' ||
				conditional_logic[groupId][i].operator === '!=empty'
			) {
				conditional_logic[groupId][i].value = '';
			}

			updateData({ conditional_logic });
		}
	};

	const removeCondition = (groupId, i) => {
		if (
			conditional_logic[groupId] &&
			conditional_logic[groupId].constructor === Array
		) {
			conditional_logic[groupId].splice(i, 1);

			if (!conditional_logic[groupId].length) {
				conditional_logic.splice(groupId, 1);
			}
		}

		updateData({ conditional_logic });
	};

	const addCondition = (groupId = false) => {
		let newCondLogic = conditional_logic;

		if (newCondLogic.constructor !== Array) {
			newCondLogic = [];
		}

		if (groupId === false) {
			newCondLogic.push([
				{
					control: '',
					operator: '!=empty',
				},
			]);
		} else if (
			newCondLogic[groupId] &&
			newCondLogic[groupId].constructor === Array
		) {
			newCondLogic[groupId].push({
				control: '',
				operator: '!=empty',
			});
		}

		updateData({ conditional_logic: newCondLogic });
	};

	const getControlByKey = (controlKey) => {
		let result = false;

		Object.keys(controls).forEach((k) => {
			if (!result && k === controlKey) {
				result = controls[k];
			}
		});

		return result;
	};

	const getControlByName = (controlFullName) => {
		const controlNames = controlFullName.split('.');
		const controlName = controlNames[0];
		const innerControlName = controlNames[1];

		let controlKey = false;
		let controlData = false;

		Object.keys(controls).forEach((k) => {
			if (!controlData && controls[k].name === controlName) {
				controlKey = k;
				controlData = controls[k];
			}
		});

		if (innerControlName && controlKey) {
			let innerControlData = false;

			Object.keys(controls).forEach((k) => {
				if (
					!innerControlData &&
					controls[k].child_of === controlKey &&
					controls[k].name === innerControlName
				) {
					innerControlData = controls[k];
					controlData = innerControlData;
				}
			});
		}

		return controlData;
	};

	const getControlAllowedConditions = (
		controlName,
		currentOperator,
		addFallback = true
	) => {
		const result = {
			allowExistenceOperators: false,
			allowEqualOperators: false,
			allowClassEqualOperators: false,
			allowRangeOperators: false,
			allowContainsOperator: false,
			equalOptions: null,
		};

		if (addFallback) {
			if (
				currentOperator === '==empty' ||
				currentOperator === '!=empty'
			) {
				result.allowExistenceOperators = true;
			}
			if (currentOperator === '>' || currentOperator === '<') {
				result.allowRangeOperators = true;
			}
			if (currentOperator === '==' || currentOperator === '!=') {
				result.allowEqualOperators = true;
			}
			if (
				currentOperator === '==class' ||
				currentOperator === '!=class'
			) {
				result.allowClassEqualOperators = true;
			}
			if (currentOperator === '==contains') {
				result.allowContainsOperator = true;
			}
		}

		let controlData = getControlByName(controlName);

		// Core ClassName attribute.
		if (!controlData && 'className' === controlName) {
			controlData = { type: '__BLOCK_CLASS__' };
		}

		// Block Styles selector.
		if (!controlData && '__BLOCK_STYLE__' === controlName) {
			controlData = {
				type: '__BLOCK_STYLE__',
				choices: styles.map((styleData) => {
					return {
						value: styleData.name,
						label: styleData.label,
					};
				}),
			};
		}

		if (controlData) {
			// Existence Operators
			if (
				controlData.type !== 'inner_blocks' &&
				controlData.type !== 'checkbox' &&
				controlData.type !== 'toggle' &&
				controlData.type !== 'message'
			) {
				result.allowExistenceOperators = true;
			}

			// Equal and Contains Operators
			if (
				controlData.type === 'text' ||
				controlData.type === 'textarea' ||
				controlData.type === 'number' ||
				controlData.type === 'range' ||
				controlData.type === 'url' ||
				controlData.type === 'email' ||
				controlData.type === 'password' ||
				controlData.type === 'rich_text' ||
				controlData.type === 'classic_editor' ||
				controlData.type === 'code_editor' ||
				controlData.type === 'select' ||
				controlData.type === 'radio' ||
				controlData.type === 'color' ||
				controlData.type === 'date_time' ||
				controlData.type === 'units'
			) {
				result.allowEqualOperators = true;
				result.allowContainsOperator = true;
			}

			// Contains Operator
			if (
				controlData.type === 'number' ||
				controlData.type === 'range' ||
				controlData.type === '__BLOCK_CLASS__'
			) {
				result.allowContainsOperator = true;
			}

			// Range Operators
			if (
				controlData.type === 'number' ||
				controlData.type === 'range' ||
				controlData.type === 'gallery' ||
				controlData.type === 'posts' ||
				controlData.type === 'taxonomy' ||
				controlData.type === 'users' ||
				controlData.type === 'repeater'
			) {
				result.allowRangeOperators = true;
			}

			// equalOptions
			if (controlData.type === 'select' || controlData.type === 'radio') {
				result.equalOptions = controlData.choices;

				if (!result.equalOptions || !result.equalOptions.length) {
					result.equalOptions = [
						{
							label: __('-- Nothing to select --', 'lazy-blocks'),
							value: '',
						},
					];
				}
			}

			// equalOptions for checkboxes
			if (
				controlData.type === 'checkbox' ||
				controlData.type === 'toggle'
			) {
				result.allowEqualOperators = true;
				result.equalOptions = [
					{
						label: 'Checked',
						value: '1',
					},
				];
			}

			// Class name check.
			if (
				controlData.type === '__BLOCK_STYLE__' ||
				controlData.type === '__BLOCK_CLASS__'
			) {
				result.allowClassEqualOperators = true;
				result.equalOptions = controlData.choices;
			}
			if (controlData.type === '__BLOCK_STYLE__') {
				// Change label of equal option.
				result.allowClassEqualOperators = {
					labelHas: __('Has style', 'lazy-blocks'),
					labelHasNo: __('Has no style', 'lazy-blocks'),
				};

				// Don't allow to use custom value for Block Style selector.
				if (!result.equalOptions || !result.equalOptions.length) {
					result.equalOptions = [
						{
							label: __('-- Nothing to select --', 'lazy-blocks'),
							value: '',
						},
					];
				}
			}
		}

		return result;
	};

	const getControlsListSelector = (childOf = false, labelPrefix = '') => {
		let result = [];

		if (controls) {
			Object.keys(controls).forEach((k) => {
				const control = controls[k];
				const parentControl = childOf
					? getControlByKey(childOf)
					: false;

				if (
					control.name &&
					((!childOf && !control.child_of) ||
						(childOf && control.child_of === childOf))
				) {
					let controlName = control.name;

					if (parentControl) {
						controlName = `${parentControl.name}.${control.name}`;
					}

					result.push({
						label: `${labelPrefix}${control.label || control.name}`,
						value: controlName,
					});

					if (!childOf && !control.child_of) {
						result = [
							...result,
							...getControlsListSelector(k, '– '),
						];
					}
				}
			});
		}

		return result;
	};

	const getStyleListSelector = () => {
		const result = [];

		if (styles && styles.length) {
			styles.forEach((style) => {
				result.push({
					label: style.label,
					value: style.name,
				});
			});
		}

		return result;
	};

	const items = [];
	const controlsList = getControlsListSelector();
	const stylesList = getStyleListSelector();

	if (conditional_logic && conditional_logic.constructor === Array) {
		conditional_logic.forEach((group, i) => {
			if (group && group.constructor === Array) {
				const groupItems = [];

				group.forEach((cond, x) => {
					groupItems.push({
						id: x + 1,
						control: cond.control,
						operator: cond.operator,
						value: cond.value || null,
						...getControlAllowedConditions(
							cond.control,
							cond.operator
						),
						removeCondition() {
							removeCondition(i, x);
						},
						updateCondition(newData) {
							updateCondition(i, x, newData);
						},
					});
				});

				if (groupItems.length) {
					items.push(groupItems);
				}
			}
		});
	}

	return (
		<BaseControl __nextHasNoMarginBottom>
			<div className="lzb-block-builder-controls-item-settings-conditional-logic">
				{items.length
					? items.map((group, i) => (
							<Fragment
								// eslint-disable-next-line react/no-array-index-key
								key={`conditional-logic-group-${i}`}
							>
								<SortableList
									items={group}
									controlsList={controlsList}
									stylesList={stylesList}
									selectedControlName={data.name}
									onSortEnd={(oldIndex, newIndex) => {
										resortCondition(i, oldIndex, newIndex);
									}}
								/>
								<Button
									variant="secondary"
									size="small"
									onClick={() => {
										addCondition(i);
									}}
								>
									{__('and', 'lazy-blocks')}
								</Button>
								<p>
									<strong>{__('or', 'lazy-blocks')}</strong>
								</p>
							</Fragment>
						))
					: ''}
				<div>
					<Button
						variant="secondary"
						size="small"
						onClick={() => {
							addCondition();
						}}
					>
						{__('Add Rule Group', 'lazy-blocks')}
					</Button>
				</div>
			</div>
		</BaseControl>
	);
}

export default ConditionsRow;
