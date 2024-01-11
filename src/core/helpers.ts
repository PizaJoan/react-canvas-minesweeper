import { BOMB_PROXIMITY, INDEX_SEPARATOR } from './constants';
import { Cell } from './types';

export const checkBombProximity = (
	board: Cell[][],
	row: number,
	col: number
) => {
	const validIndexes: string[] = [[row, col].join(INDEX_SEPARATOR)];
	const invalidIndexes: string[] = [];

	for (let tries = 0; tries < validIndexes.length; tries++) {
		const [actualRow, actualCol] = validIndexes[tries]
			.split(INDEX_SEPARATOR)
			.map((_) => +_);

		for (let i = 0; i < BOMB_PROXIMITY.length; i++) {
			const [proximityRow, proximityCol] = BOMB_PROXIMITY[i];

			const indexes = [
				actualRow + proximityRow,
				actualCol + proximityCol,
			];
			const [checkIndexRow, checkIndexCol] = indexes;

			const cell = board?.[checkIndexRow]?.[checkIndexCol];

			if (!cell) continue;

			const strIndex = indexes.join(INDEX_SEPARATOR);
			if (
				validIndexes.indexOf(strIndex) !== -1 ||
				invalidIndexes.indexOf(strIndex) !== -1
			)
				continue;

			if (typeof cell !== 'undefined' && !cell.revealed) {
				if (cell.num === 0) validIndexes.push(strIndex);
				else invalidIndexes.push(strIndex);
			}
		}
	}

	return validIndexes
		.concat(invalidIndexes)
		.map((_) => _.split(INDEX_SEPARATOR).map((__) => +__));
};

export const getRowAndCol = (
	totalRows: number,
	totalCols: number,
	cellSize: number,
	canvasX: number,
	canvasY: number,
	evX: number,
	evY: number
) => {
	const absoluteXInCanvas = evX - canvasX;
	const absoluteYInCanvas = evY - canvasY;

	const col = absoluteXInCanvas - (absoluteXInCanvas % cellSize);
	const row = absoluteYInCanvas - (absoluteYInCanvas % cellSize);

	return [
		Math.min(Math.floor(col / cellSize), totalCols - 1),
		Math.min(Math.floor(row / cellSize), totalRows - 1),
	];
};
