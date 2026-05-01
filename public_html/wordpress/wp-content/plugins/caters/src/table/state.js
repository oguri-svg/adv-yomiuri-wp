const INHERITED_COLUMN_ATTRIBUTES = ["align"];

/**
 * Creates a table state.
 *
 * @param {Object} options
 * @param {number} options.rowCount    Row count for the table to create.
 * @param {number} options.columnCount Column count for the table to create.
 *
 * @return {Object} New table state.
 */
export function createTable({ rowCount, columnCount }) {
	return {
		body: Array.from({ length: rowCount }).map(() => ({
			cells: Array.from({ length: columnCount }).map(() => ({
				content: "",
				tag: "td",
			})),
		})),
	};
}

/**
 * Returns the first row in the table.
 *
 * @param {Object} state Current table state.
 *
 * @return {Object | undefined} The first table row.
 */
export function getFirstRow(state) {
	if (!isEmptyTableSection(state.body)) {
		return state.body[0];
	}
	return null;
}

/**
 * Gets an attribute for a cell.
 *
 * @param {Object} state         Current table state.
 * @param {Object} cellLocation  The location of the cell
 * @param {string} attributeName The name of the attribute to get the value of.
 *
 * @return {*} The attribute value.
 */
export function getCellAttribute(state, cellLocation, attributeName) {
	const { sectionName, rowIndex, columnIndex } = cellLocation;
	return state[sectionName]?.[rowIndex]?.cells?.[columnIndex]?.[attributeName];
}

/**
 * Returns updated cell attributes after applying the `updateCell` function to the selection.
 *
 * @param {Object}   state      The block attributes.
 * @param {Object}   selection  The selection of cells to update.
 * @param {Function} updateCell A function to update the selected cell attributes.
 *
 * @return {Object} New table state including the updated cells.
 */
export function updateSelectedCell(state, selection, updateCell) {
	if (!selection) {
		return state;
	}

	const tableSections = Object.fromEntries(
		Object.entries(state).filter(([key]) => ["body"].includes(key)),
	);
	const { sectionName: selectionSectionName, rowIndex: selectionRowIndex } =
		selection;

	return Object.fromEntries(
		Object.entries(tableSections).map(([sectionName, section]) => {
			if (selectionSectionName && selectionSectionName !== sectionName) {
				return [sectionName, section];
			}

			return [
				sectionName,
				section.map((row, rowIndex) => {
					if (selectionRowIndex && selectionRowIndex !== rowIndex) {
						return row;
					}

					return {
						cells: row.cells.map((cellAttributes, columnIndex) => {
							const cellLocation = {
								sectionName,
								columnIndex,
								rowIndex,
							};
							if (!isCellSelected(cellLocation, selection)) {
								return cellAttributes;
							}
							cellAttributes.tag = selection.tag;
							return updateCell(cellAttributes);
						}),
					};
				}),
			];
		}),
	);
}

/**
 * Returns whether the cell at `cellLocation` is included in the selection `selection`.
 *
 * @param {Object} cellLocation An object containing cell location properties.
 * @param {Object} selection    An object containing selection properties.
 *
 * @return {boolean} True if the cell is selected, false otherwise.
 */
export function isCellSelected(cellLocation, selection) {
	if (!cellLocation || !selection) {
		return false;
	}

	switch (selection.type) {
		case "column":
			return (
				selection.type === "column" &&
				cellLocation.columnIndex === selection.columnIndex
			);
		case "cell":
			return (
				selection.type === "cell" &&
				cellLocation.sectionName === selection.sectionName &&
				cellLocation.columnIndex === selection.columnIndex &&
				cellLocation.rowIndex === selection.rowIndex
			);
	}
}

/**
 * Inserts a row in the table state.
 *
 * @param {Object} state               Current table state.
 * @param {Object} options
 * @param {string} options.sectionName Section in which to insert the row.
 * @param {number} options.rowIndex    Row index at which to insert the row.
 * @param {number} options.columnCount Column count for the table to create.
 *
 * @return {Object} New table state.
 */
export function insertRow(state, { sectionName, rowIndex, columnCount }) {
	const firstRow = getFirstRow(state);

	const cellCount =
		columnCount === undefined ? firstRow?.cells?.length : columnCount;

	// Bail early if the function cannot determine how many cells to add.
	if (!cellCount) {
		return state;
	}

	return {
		[sectionName]: [
			...state[sectionName].slice(0, rowIndex),
			{
				cells: Array.from({ length: cellCount }).map((_, index) => {
					const firstCellInColumn = firstRow?.cells?.[index] ?? {};

					const inheritedAttributes = Object.fromEntries(
						Object.entries(firstCellInColumn).filter(([key]) =>
							INHERITED_COLUMN_ATTRIBUTES.includes(key),
						),
					);

					return {
						...inheritedAttributes,
						content: "",
						tag: "td",
						align: "left",
					};
				}),
			},
			...state[sectionName].slice(rowIndex),
		],
	};
}

/**
 * Deletes a row from the table state.
 *
 * @param {Object} state               Current table state.
 * @param {Object} options
 * @param {string} options.sectionName Section in which to delete the row.
 * @param {number} options.rowIndex    Row index to delete.
 *
 * @return {Object} New table state.
 */
export function deleteRow(state, { sectionName, rowIndex }) {
	return {
		[sectionName]: state[sectionName].filter(
			(row, index) => index !== rowIndex,
		),
	};
}

/**
 * Inserts a column in the table state.
 *
 * @param {Object} state               Current table state.
 * @param {Object} options
 * @param {number} options.columnIndex Column index at which to insert the column.
 *
 * @return {Object} New table state.
 */
export function insertColumn(state, { columnIndex }) {
	const tableSections = Object.fromEntries(
		Object.entries(state).filter(([key]) => ["body"].includes(key)),
	);

	return Object.fromEntries(
		Object.entries(tableSections).map(([sectionName, section]) => {
			// Bail early if the table section is empty.
			if (isEmptyTableSection(section)) {
				return [sectionName, section];
			}

			return [
				sectionName,
				section.map((row) => {
					// Bail early if the row is empty or it's an attempt to insert past
					// the last possible index of the array.
					if (isEmptyRow(row) || row.cells.length < columnIndex) {
						return row;
					}

					return {
						cells: [
							...row.cells.slice(0, columnIndex),
							{
								content: "",
								tag: "td",
								alert: "left",
							},
							...row.cells.slice(columnIndex),
						],
					};
				}),
			];
		}),
	);
}

/**
 * Deletes a column from the table state.
 *
 * @param {Object} state               Current table state.
 * @param {Object} options
 * @param {number} options.columnIndex Column index to delete.
 *
 * @return {Object} New table state.
 */
export function deleteColumn(state, { columnIndex }) {
	const tableSections = Object.fromEntries(
		Object.entries(state).filter(([key]) => ["body"].includes(key)),
	);

	return Object.fromEntries(
		Object.entries(tableSections).map(([sectionName, section]) => {
			// Bail early if the table section is empty.

			if (isEmptyTableSection(section)) {
				return [sectionName, section];
			}

			return [
				sectionName,
				section
					.map((row) => ({
						cells:
							row.cells.length >= columnIndex
								? row.cells.filter((cell, index) => index !== columnIndex)
								: row.cells,
					}))
					.filter((row) => row.cells.length),
			];
		}),
	);
}

/**
 * Toggles the existence of a section.
 *
 * @param {Object} state       Current table state.
 * @param {string} sectionName Name of the section to toggle.
 *
 * @return {Object} New table state.
 */
export function toggleSection(state, sectionName) {
	// Section exists, replace it with an empty row to remove it.
	if (!isEmptyTableSection(state[sectionName])) {
		return { [sectionName]: [] };
	}

	// Get the length of the first row of the body to use when creating the header.
	const columnCount = state.body?.[0]?.cells?.length ?? 1;

	// Section doesn't exist, insert an empty row to create the section.
	return insertRow(state, { sectionName, rowIndex: 0, columnCount });
}

/**
 * Determines whether a table section is empty.
 *
 * @param {Object} section Table section state.
 *
 * @return {boolean} True if the table section is empty, false otherwise.
 */
export function isEmptyTableSection(section) {
	return !section || !section.length || section.every(isEmptyRow);
}

/**
 * Determines whether a table row is empty.
 *
 * @param {Object} row Table row state.
 *
 * @return {boolean} True if the table section is empty, false otherwise.
 */
export function isEmptyRow(row) {
	return !(row.cells && row.cells.length);
}

/**
 * Get the minimum / maximum row / column virtual indexes on virtual table from selected cells.
 *
 * @param selectedCells Current selected cells.
 * @return Minimum / maximum virtual indexes.
 */
export function getVirtualRangeIndexes(selectedCells) {
	// Lấy danh sách vị trí hàng và cột
	const rowIndexes = selectedCells?.map((cell) => cell.rowIndex);
	const colIndexes = selectedCells?.map((cell) => cell.columnIndex);

	return {
		minRowIndex: Math.min(...rowIndexes),
		maxRowIndex: Math.max(...rowIndexes),
		minColIndex: Math.min(...colIndexes),
		maxColIndex: Math.max(...colIndexes),
	};
}

/**
 * Determines whether a rectangle will be formed from the selected cells in the virtual table.
 * This function is used to determines whether to allow cell merging from the selected cells.
 *
 * @param selectedCells Current selected cells.
 * @return True if a rectangle will be formed from the selected cells, false otherwise.
 */
export function isRectangleSelected(selectedCells) {
	if (!selectedCells) return false;

	// No need to merge If only one or no cell is selected.
	if (selectedCells.length <= 1) return false;

	// Get the minimum / maximum virtual indexes of the matrix from the selected cells.
	const vRangeIndexes = getVirtualRangeIndexes(selectedCells);

	// Generate indexed matrix from the indexes.
	const vRange = [];

	for (let i = vRangeIndexes.minRowIndex; i <= vRangeIndexes.maxRowIndex; i++) {
		vRange[i] = [];
		for (
			let j = vRangeIndexes.minColIndex;
			j <= vRangeIndexes.maxColIndex;
			j++
		) {
			vRange[i][j] = false;
		}
	}

	// Map the selected cells to the matrix (mark the cell as "true").
	selectedCells.forEach((cell) => {
		if (cell.rowIndex in vRange && cell.columnIndex in vRange[cell.rowIndex]) {
			vRange[cell.rowIndex][cell.columnIndex] = true;

			if (cell.colSpan > 1) {
				for (let i = 1; i < cell.colSpan; i++) {
					vRange[cell.rowIndex][cell.columnIndex + i] = true;
				}
			}

			if (cell.rowSpan > 1) {
				for (let i = 1; i < cell.rowSpan; i++) {
					vRange[cell.rowIndex + i][cell.columnIndex] = true;

					if (cell.colSpan > 1) {
						for (let j = 1; j < cell.colSpan; j++) {
							vRange[cell.rowIndex + i][cell.columnIndex + j] = true;
						}
					}
				}
			}
		}
	});
	// Whether all cells in the matrix are filled (whether cell merging is possible).
	return vRange
		.reduce((cells, row) => cells.concat(row), [])
		.every((cell) => cell);
}

export function mergeCells(vTable, selectedCells, isMergeContent) {
	if (!selectedCells || !selectedCells.length) return vTable;

	const sectionName = selectedCells[0].sectionName;

	// Create the minimum / maximum virtual indexes of the matrix from the selected cells.
	const vRangeIndexes = getVirtualRangeIndexes(selectedCells);

	const { minRowIndex, maxRowIndex, minColIndex, maxColIndex } = vRangeIndexes;

	// Find the rowspan & colspan cells in selected cells.
	const rowColSpanCellsCount = selectedCells.filter(
		({ rowSpan, colSpan }) => rowSpan > 1 || colSpan > 1,
	).length;

	// Split the found rowspan & colspan cells before merge cell.
	if (rowColSpanCellsCount) {
		for (let i = 0; i < rowColSpanCellsCount; i++) {
			const vMergedCells = vTable[sectionName]
				.reduce((cells, row) => cells.concat(row.cells), [])
				.filter(
					(cell) =>
						(cell.rowspan > 1 || cell.colspan > 1) &&
						minRowIndex <= cell.rowIndex &&
						maxRowIndex >= cell.rowIndex &&
						minColIndex <= cell.columnIndex &&
						maxColIndex >= cell.columnIndex,
				);

			if (vMergedCells.length) {
				vTable = splitMergedCell(vTable, vMergedCells[0]);
			}
		}
	}

	// Merge the contents of the cells to be merged.
	const mergedCellsContent = selectedCells
		.sort((a, b) => a.rowIndex - b.rowIndex || a.columnIndex - b.columnIndex)
		.reduce((result, cell) => {
			if (cell.content) result.push(cell.content);
			return result;
		}, [])
		.join("<br/>");

	return {
		...vTable,
		[sectionName]: vTable[sectionName].map((row, rowIndex) => {
			if (rowIndex < minRowIndex || rowIndex > maxRowIndex) {
				// Row not to be merged.
				return row;
			}

			return {
				cells: row.cells.map((cell, vColIndex) => {
					if (vColIndex === minColIndex && rowIndex === minRowIndex) {
						// Cell to merge.
						return {
							...cell,
							rowspan: Math.abs(maxRowIndex - minRowIndex) + 1,
							colspan: Math.abs(maxColIndex - minColIndex) + 1,
							content: isMergeContent ? mergedCellsContent : cell.content,
						};
					}

					// Cells to be merged (Mark as deletion).
					if (
						rowIndex >= minRowIndex &&
						rowIndex <= maxRowIndex &&
						vColIndex >= minColIndex &&
						vColIndex <= maxColIndex
					) {
						return {
							...cell,
							isHidden: true,
						};
					}

					// Cells not to be merged.
					return cell;
				}),
			};
		}),
	};
}

export function toTableAttributes(vTable) {
	vTable = { body: vTable.body };

	return Object.entries(vTable).reduce(
		(newTableAttributes, [sectionName, section]) => {
			if (!section.length) {
				return newTableAttributes;
			}

			newTableAttributes[sectionName] = section.map(({ cells }) => ({
				cells: cells
					// Delete cells marked as deletion.
					.filter((cell) => !cell.isHidden)
					// Keep only the properties needed.
					.map((cell) => ({
						...cell,
						rowspan: cell.rowspan > 1 ? String(cell.rowspan) : undefined,
						colspan: cell.colspan > 1 ? String(cell.colspan) : undefined,
					})),
			}));
			return newTableAttributes;
		},
		{
			body: [],
		},
	);
}

export function hasMergedCells(selectedCells) {
	if (!selectedCells || selectedCells.length === 0) return false;
	return selectedCells.some(
		({ rowspan = 1, colspan = 1 }) => rowspan > 1 || colspan > 1,
	);
}

export function splitMergedCells(vTable, selectedCells) {
	if (!selectedCells) return vTable;
	// Find the rowspan & colspan cells.
	const rowColSpanCells = selectedCells.filter(
		({ rowspan, colspan }) => rowspan > 1 || colspan > 1,
	);

	// Split the found rowspan & colspan cells.
	if (rowColSpanCells.length) {
		rowColSpanCells.forEach((cell) => {
			vTable = splitMergedCell(vTable, cell);
		});
	}

	return vTable;
}

/**
 * Split single cell in the virtual table state.
 *
 * @param vTable       Current virtual table state.
 * @param selectedCell Current selected cells.
 * @return New virtual table state.
 */
export function splitMergedCell(vTable, selectedCell) {
	const { sectionName, rowIndex, columnIndex, rowspan, colspan } = selectedCell;

	const vSection = vTable[sectionName];

	// Split the selected cells and map them on the virtual section.
	vSection[rowIndex].cells[columnIndex] = {
		...vSection[rowIndex].cells[columnIndex],
		rowspan: 1,
		colspan: 1,
	};

	if (colspan > 1) {
		for (let i = 1; i < colspan; i++) {
			vSection[rowIndex].cells.splice(columnIndex + i, 0, {
				content: "",
				tag: "td",
				align: "left",
			});
		}
	}

	if (rowspan > 1) {
		for (let i = 1; i < rowspan; i++) {
			if (!vSection[rowIndex + i]) continue; // Đảm bảo hàng tồn tại trước khi chỉnh sửa

			vSection[rowIndex + i].cells.splice(columnIndex, 0, {
				content: "",
				tag: "td",
				align: "left",
			});

			if (colspan > 1) {
				for (let j = 1; j < colspan; j++) {
					vSection[rowIndex + i].cells.splice(columnIndex + j, 0, {
						content: "",
						tag: "td",
						align: "left",
					});
				}
			}
		}
	}

	return {
		...vTable,
		[sectionName]: vSection,
	};
}

export function toInteger(value, defaultValue = 0) {
	if (!value) {
		return defaultValue;
	}

	const converted = parseInt(String(value), 10);

	if (isNaN(converted)) {
		return defaultValue;
	}

	return converted || defaultValue;
}
