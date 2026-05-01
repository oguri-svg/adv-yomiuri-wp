import { __ } from "@wordpress/i18n";
import clsx from "clsx";
import "./editor.scss";

import {
	BlockControls,
	InspectorControls,
	useBlockProps,
	RichText,
	BlockIcon,
	AlignmentControl,
} from "@wordpress/block-editor";

import {
	createTable,
	updateSelectedCell,
	insertRow,
	deleteRow,
	insertColumn,
	deleteColumn,
	isEmptyTableSection,
	isRectangleSelected,
	mergeCells,
	toTableAttributes,
	hasMergedCells,
	splitMergedCells,
} from "./state";

import {
	blockTable as icon,
	alignLeft,
	alignRight,
	alignCenter,
	tableRowBefore,
	tableRowAfter,
	tableRowDelete,
	tableColumnBefore,
	tableColumnAfter,
	tableColumnDelete,
	table,
} from "@wordpress/icons";

import {
	Button,
	Placeholder,
	TextControl,
	ToggleControl,
	PanelBody,
	ToolbarDropdownMenu,
} from "@wordpress/components";
import { useEffect, useRef, useState } from "@wordpress/element";

const cellAriaLabel = {
	body: __("Body"),
};

const ALIGNMENT_CONTROLS = [
	{
		icon: alignLeft,
		title: __("左寄せ"),
		align: "left",
	},
	{
		icon: alignCenter,
		title: __("中心"),
		align: "center",
	},
	{
		icon: alignRight,
		title: __("右寄せ"),
		align: "right",
	},
];

function TSection({ name, ...props }) {
	const TagName = `t${name}`;
	return <TagName {...props} />;
}

const iconMergeCells = (
	<svg
		viewBox="0 0 24 24"
		width="24"
		height="24"
		aria-hidden="true"
		focusable="false"
	>
		<path d="M2,19.9V2h20.5v17.9H2z M8.4,3.5H3.3v3h5.1V3.5z M14.8,3.5H9.7v3h5.1C14.8,6.5,14.8,3.5,14.8,3.5z M21.2,3.5h-5.1v3h5.1V3.5 z M20.2,9.5h-16v3h16C20.2,12.5,20.2,9.5,20.2,9.5z M8.4,15.5H3.3v3h5.1V15.5z M14.8,15.5H9.7v3h5.1C14.8,18.5,14.8,15.5,14.8,15.5z M21.2,15.5h-5.1v3h5.1V15.5z"></path>
	</svg>
);
const splitCell = (
	<svg viewBox="0 0 24 24">
		<path d="M2,19.9V2h20.5v17.9H2z M21.2,3.5H3.3v3h17.9V3.5z M21.2,15.5H3.3v3h17.9V15.5z M8.8,9.5H4.2v3h4.6V9.5z M14.5,9.5H9.9v3 h4.6C14.5,12.5,14.5,9.5,14.5,9.5z M20.2,9.5h-4.6v3h4.6V9.5z" />
	</svg>
);

export default function Edit({
	attributes,
	className,
	setAttributes,
	isSelected: isSingleSelected,
}) {
	const { caption, border } = attributes;
	const tableRef = useRef();
	const [selectedCell, setSelectedCell] = useState();
	const [hasTableCreated, setHasTableCreated] = useState(false);
	const [initialRowCount, setInitialRowCount] = useState(2);
	const [initialColumnCount, setInitialColumnCount] = useState(2);

	// tạo bảng từ 2 input row, col đầu vào.
	// 投入した行と列の数を使用して、テーブルを作成します。
	const onCreateTable = (event) => {
		event.preventDefault();

		setAttributes(
			createTable({
				rowCount: parseInt(initialRowCount, 10) || 2,
				columnCount: parseInt(initialColumnCount, 10) || 2,
			}),
		);
		setHasTableCreated(true);
	};

	// cập nhật cell hiện tại đang active
	// 現在アクティブなセルを更新します。
	const onMouseDown = (
		name,
		row,
		col,
		tag,
		align,
		content,
		rowspan,
		colspan,
		event,
	) => {
		const newCell = {
			sectionName: name,
			rowIndex: row,
			columnIndex: col,
			type: "cell",
			tag,
			content,
			rowspan,
			colspan,
			align: align ?? "left",
		};

		setSelectedCell((prev) => {
			const selectedCells = Array.isArray(prev) ? prev : [];

			if (event?.ctrlKey || event?.metaKey) {
				if (!prev) return [newCell];

				// check current cell exits in array cells
				const existsSelected = selectedCells.some(
					(cell) =>
						cell.sectionName == newCell.sectionName &&
						cell.rowIndex == newCell.rowIndex &&
						cell.columnIndex == newCell.columnIndex,
				);

				// add current cell into array cells
				if (!existsSelected) return [...selectedCells, newCell];

				// toggle class active cell
				return selectedCells.filter(
					(cell) =>
						!(
							cell.sectionName == newCell.sectionName &&
							cell.rowIndex == newCell.rowIndex &&
							cell.columnIndex == newCell.columnIndex
						),
				);
			}

			return [newCell];
		});
	};

	// nhập text
	// テキストを入力します。
	const onChange = (content) => {
		if (!selectedCell) return;
		selectedCell.map(
			(cell) => {
				setAttributes(
					updateSelectedCell(attributes, cell, (cellAttributes) => ({
						...cellAttributes,
						content,
					})),
				);
			},
			[attributes],
		);
	};

	// check cell selected
	const isCellSelected = (cellLocation, selection) => {
		if (!cellLocation || !selection) {
			return false;
		}

		if (Array.isArray(selection)) {
			// Trường hợp chọn nhiều ô
			// 複数のセルを選択する場合
			return selection.some(
				(sel) =>
					sel.sectionName === cellLocation.sectionName &&
					sel.columnIndex === cellLocation.columnIndex &&
					sel.rowIndex === cellLocation.rowIndex,
			);
		}

		// Trường hợp chọn một ô
		// セルを1つ選択する場合
		return (
			selection.type === "cell" &&
			cellLocation.sectionName === selection.sectionName &&
			cellLocation.columnIndex === selection.columnIndex &&
			cellLocation.rowIndex === selection.rowIndex
		);
	};

	// switch th <-> td
	const onToggleTHSection = (value) => {
		if (!selectedCell) return;

		// Tạo bản sao của các cell đã chọn và thay đổi tag
		// 選択したセルのコピーを作成し、タグを変更します。
		const newCells = selectedCell.map((cell) => ({
			...cell,
			tag: value ? "th" : "td",
		}));

		setSelectedCell(newCells);

		newCells.forEach((cell) => {
			setAttributes(
				updateSelectedCell(
					attributes,
					cell,
					(cellAttributes) => cellAttributes,
				),
			);
		});
	};

	// switch border 1 <-> 0
	const onToggleBorderWidth = (value) => {
		const newBorder = value ? 0 : 1;
		setAttributes({ border: newBorder });
	};

	// get align text
	const getSelectedAlign = () => {
		if (!selectedCell || selectedCell.length === 0) return false;
		if (selectedCell.length === 1) return selectedCell[0].align;

		const firstAlign = selectedCell[0]?.align;
		return selectedCell.every((cell) => cell.align === firstAlign)
			? firstAlign
			: false;
	};

	// set align text
	const onChangeColumnAlignment = (align) => {
		if (!selectedCell) {
			return;
		}

		const newCells = selectedCell.map((cell) => ({
			...cell,
			align,
		}));

		setSelectedCell(newCells);

		newCells.forEach((cell) => {
			setAttributes(
				updateSelectedCell(attributes, cell, (cellAttributes) => ({
					...cellAttributes,
					align,
				})),
			);
		});
	};

	function onInsertRow(delta) {
		if (!selectedCell || selectedCell.length > 1) {
			return;
		}

		const { sectionName, rowIndex } = selectedCell[0];
		const newRowIndex = rowIndex + delta;

		setAttributes(
			insertRow(attributes, {
				sectionName,
				rowIndex: newRowIndex,
			}),
		);
		setSelectedCell();
	}

	// insert row before
	const onInsertRowBefore = () => {
		onInsertRow(0);
	};

	// insert row after
	const onInsertRowAfter = () => {
		onInsertRow(1);
	};

	// delete row
	const onDeleteRow = () => {
		if (!selectedCell || selectedCell.length === 0) return;

		const uniqueRows = Array.from(
			new Set(
				selectedCell.map((cell) => `${cell.sectionName}-${cell.rowIndex}`),
			),
		)
			.map((key) => {
				const [sectionName, rowIndex] = key.split("-");
				return { sectionName, rowIndex: Number(rowIndex) };
			})
			// rowIndex giảm dần
			// 行インデックスを降順にソートします。
			.sort((a, b) => b.rowIndex - a.rowIndex);

		let newAttributes = { ...attributes };

		uniqueRows.forEach(({ sectionName, rowIndex }) => {
			newAttributes = deleteRow(newAttributes, {
				sectionName,
				rowIndex,
			});
		});

		setAttributes(newAttributes);
		setSelectedCell();
	};

	function onInsertColumn(delta) {
		if (!selectedCell || selectedCell.length > 1) {
			return;
		}

		const { columnIndex } = selectedCell[0];
		const newColumnIndex = columnIndex + delta;

		setAttributes(insertColumn(attributes, { columnIndex: newColumnIndex }));
		setSelectedCell();
	}

	// insert col before
	const onInsertColumnBefore = () => {
		onInsertColumn(0);
	};

	// insert col after
	const onInsertColumnAfter = () => {
		onInsertColumn(1);
	};

	// delete col
	const onDeleteColumn = () => {
		if (!selectedCell) {
			return;
		}

		const uniqueCols = Array.from(
			new Set(
				selectedCell.map((cell) => `${cell.sectionName}-${cell.columnIndex}`),
			),
		)
			.map((key) => {
				const [sectionName, columnIndex] = key.split("-");
				return { sectionName, columnIndex: Number(columnIndex) };
			})
			// colIndex giảm dần
			// 列インデックスを降順にソートします。
			.sort((a, b) => b.columnIndex - a.columnIndex);

		let newAttributes = { ...attributes };

		uniqueCols.forEach(({ columnIndex }) => {
			newAttributes = deleteColumn(newAttributes, { columnIndex });
		});

		setAttributes(newAttributes);
		setSelectedCell();
	};

	// Merge Cells
	const onMergeCells = () => {
		let newAttributes = { ...attributes };
		const newVTable = mergeCells(newAttributes, selectedCell, true);
		setAttributes(toTableAttributes(newVTable));
		setSelectedCell();
	};

	// un Merge Cells
	const onSplitMergedCells = () => {
		let newAttributes = { ...attributes };
		const newVTable = splitMergedCells(newAttributes, selectedCell);
		setAttributes(toTableAttributes(newVTable));
		setSelectedCell();
	};

	// xoá bỏ data của cell active hiện tại về undefined
	// 現在アクティブなセルのデータを未定義にリセットします。
	useEffect(() => {
		if (!isSingleSelected) {
			setSelectedCell();
		}
	}, [isSingleSelected]);

	// check trạng thái table đã được tạo hay chưa
	// テーブルが作成されたかどうかを確認します。
	useEffect(() => {
		if (hasTableCreated) {
			tableRef?.current
				?.querySelector('td div[contentEditable="true"]')
				?.focus();
			setHasTableCreated(false);
		}
	}, [hasTableCreated]);

	const sections = ["body"].filter(
		(name) => !isEmptyTableSection(attributes[name]),
	);

	const isEmpty = !sections.length;

	const tableControls = [
		{
			icon: tableRowBefore,
			title: __("Insert row before"),
			isDisabled: !selectedCell || selectedCell.length > 1,
			onClick: onInsertRowBefore,
		},
		{
			icon: tableRowAfter,
			title: __("Insert row after"),
			isDisabled: !selectedCell || selectedCell.length > 1,
			onClick: onInsertRowAfter,
		},
		{
			icon: tableRowDelete,
			title: __("Delete row"),
			isDisabled: !selectedCell,
			onClick: onDeleteRow,
		},
		{
			icon: tableColumnBefore,
			title: __("Insert column before"),
			isDisabled: !selectedCell || selectedCell.length > 1,
			onClick: onInsertColumnBefore,
		},
		{
			icon: tableColumnAfter,
			title: __("Insert column after"),
			isDisabled: !selectedCell || selectedCell.length > 1,
			onClick: onInsertColumnAfter,
		},
		{
			icon: tableColumnDelete,
			title: __("Delete column"),
			isDisabled: !selectedCell,
			onClick: onDeleteColumn,
		},
		{
			icon: iconMergeCells,
			title: __("セルの結合"),
			isDisabled: !selectedCell || !isRectangleSelected(selectedCell),
			onClick: onMergeCells,
		},
		{
			icon: splitCell,
			title: __("セルの分割"),
			isDisabled: !selectedCell || !hasMergedCells(selectedCell),
			onClick: () => onSplitMergedCells(),
		},
	];

	const renderedSections = sections.map((name) => (
		<TSection name={name} key={name}>
			{attributes[name].map(({ cells }, rowIndex) => (
				<tr key={rowIndex}>
					{cells.map(
						(
							{ content, tag: CellTag, scope, align, colspan, rowspan },
							columnIndex,
						) => (
							<CellTag
								key={columnIndex}
								scope={CellTag === "th" ? scope : undefined}
								colSpan={colspan}
								rowSpan={rowspan}
								className={clsx(
									{
										[`has-text-align-${align}`]: align,
										"selected-cell": isCellSelected(
											{ sectionName: name, rowIndex, columnIndex },
											selectedCell,
										),
									},
									"wp-block-table__cell-content",
								)}
								onMouseDown={(event) => {
									onMouseDown(
										name,
										rowIndex,
										columnIndex,
										CellTag,
										align,
										content,
										rowspan,
										colspan,
										event,
									);
								}}
							>
								<RichText
									value={content}
									onChange={onChange}
									aria-label={cellAriaLabel[name]}
								/>
							</CellTag>
						),
					)}
				</tr>
			))}
		</TSection>
	));

	return (
		<figure
			{...useBlockProps({
				className: clsx(className, "cwc-block-table"),
				ref: tableRef,
			})}
		>
			{selectedCell && (
				<>
					<BlockControls group="block">
						<AlignmentControl
							alignmentControls={ALIGNMENT_CONTROLS}
							value={getSelectedAlign()}
							onChange={(nextAlign) => onChangeColumnAlignment(nextAlign)}
						/>
					</BlockControls>

					<BlockControls group="other">
						<ToolbarDropdownMenu
							icon={table}
							label={__("Edit table")}
							controls={tableControls}
						/>
					</BlockControls>

					<InspectorControls>
						<PanelBody title={__("設定", "cwc-blocks")} initialOpen={true}>
							<>
								<ToggleControl
									__nextHasNoMarginBottom
									className="cwc-table-tag"
									label={__("セルは「TH」タグになる", "cwc-block")}
									checked={selectedCell?.every((cell) => cell.tag === "th")}
									onChange={onToggleTHSection}
								/>
								<ToggleControl
									__nextHasNoMarginBottom
									className="cwc-table-border"
									label={__("Border無しにする", "cwc-block")}
									checked={border === 0}
									onChange={onToggleBorderWidth}
								/>
							</>
						</PanelBody>
					</InspectorControls>
				</>
			)}

			{!isEmpty && (
				<table className={border === 0 ? "cwc-table no-border" : "cwc-table"}>
					{renderedSections}
				</table>
			)}

			{isEmpty && (
				<Placeholder
					label={__("Table")}
					icon={<BlockIcon icon={icon} showColors />}
				>
					<form
						className="blocks-table__placeholder-form"
						onSubmit={onCreateTable}
					>
						<TextControl
							__nextHasNoMarginBottom
							__next40pxDefaultSize
							type="number"
							label={__("Column count")}
							value={initialColumnCount}
							onChange={($col) => setInitialColumnCount($col)}
							min="1"
							className="blocks-table__placeholder-input"
						/>
						<TextControl
							__nextHasNoMarginBottom
							__next40pxDefaultSize
							type="number"
							label={__("Row count")}
							value={initialRowCount}
							onChange={($row) => setInitialRowCount($row)}
							min="1"
							className="blocks-table__placeholder-input"
						/>
						<Button __next40pxDefaultSize variant="primary" type="submit">
							{__("表を作成")}
						</Button>
					</form>
				</Placeholder>
			)}

			{!isEmpty && (
				<RichText
					className="cwc-block-table-caption"
					placeholder={__("キャプション")}
					tagName="figcaption"
					value={caption}
					onChange={(value) => setAttributes({ caption: value })}
					allowedFormats={[]}
				/>
			)}
		</figure>
	);
}
