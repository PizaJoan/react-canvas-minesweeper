import { MutableRefObject } from 'react';
import { Cell, CellColor } from './types';
import { BOMB_PROXIMITY } from './constants';
import { checkBombProximity, getRowAndCol } from './helpers';

const getCellColor = (num: number): string => {
	switch (num) {
		case 1:
			return '#2563eb';
		case 2:
			return '#16a34a';
		default:
			return '#e11d48';
	}
};

export function initialize(
	ctx: CanvasRenderingContext2D | null,
	mines: number,
	cellSize: number,
	cols: number,
	rows: number
) {
	const board = Array(rows)
		.fill(null)
		.map(() =>
			Array(cols)
				.fill(null)
				.map(() => ({
					num: 0,
					color: CellColor.even,
				}))
		);

	let counter = 0;

	while (counter < mines) {
		const firstNum = Math.floor(Math.random() * rows);
		const secondNum = Math.floor(Math.random() * cols);

		if (!isNaN(board[firstNum][secondNum].num)) {
			board[firstNum][secondNum].num = NaN;

			for (let i = 0; i < BOMB_PROXIMITY.length; i++) {
				const [row, col] = BOMB_PROXIMITY[i];

				const cell = board[firstNum + row]?.[secondNum + col];

				if (cell && !isNaN(cell.num)) {
					cell.num++;
				}
			}

			counter++;
		}
	}

	ctx!.fillStyle = CellColor.even;
	ctx?.fillRect(0, 0, cols * cellSize, rows * cellSize);

	ctx?.beginPath();

	for (let i = 0; i < rows; i++) {
		const posY = i * cellSize;

		for (let j = i % 2 === 0 ? 1 : 0; j < cols; j += 2) {
			const posX = j * cellSize;

			board[i][j].color = CellColor.odd;
			ctx?.rect(posX, posY, cellSize, cellSize);
		}
	}

	ctx!.fillStyle = CellColor.odd;
	ctx?.fill();

	return board;
}

export const handleOnHoverCurrying =
	(
		board: Cell[][],
		ctx: CanvasRenderingContext2D | null,
		cellSize: number,
		prevHoveredRef: MutableRefObject<[number, number]>
	) =>
	(ev: MouseEvent) => {
		const { x: canvasX, y: canvasY } = (
			ev.target! as HTMLCanvasElement
		).getBoundingClientRect();

		const [hoverColIndex, hoverRowIndex] = getRowAndCol(
			board.length,
			board[0].length,
			cellSize,
			canvasX,
			canvasY,
			ev.x,
			ev.y
		);

		const cell = board[hoverRowIndex][hoverColIndex];

		if (!cell.revealed && !cell.isFlag) {
			ctx!.fillStyle = CellColor.highLight;
			ctx?.fillRect(
				hoverColIndex * cellSize,
				hoverRowIndex * cellSize,
				cellSize,
				cellSize
			);
		}

		if (prevHoveredRef.current) {
			const [prevHoverRow, prevHoverCol] = prevHoveredRef.current;
			const cell = board?.[prevHoverRow]?.[prevHoverCol];

			if (
				cell &&
				!cell.revealed &&
				!cell.isFlag &&
				prevHoverRow !== -1 &&
				prevHoverCol !== -1 &&
				(hoverRowIndex !== prevHoverRow ||
					hoverColIndex !== prevHoverCol)
			) {
				ctx!.fillStyle = cell.color;
				ctx?.fillRect(
					prevHoverCol * cellSize,
					prevHoverRow * cellSize,
					cellSize,
					cellSize
				);
			}
		}
		prevHoveredRef.current = [hoverRowIndex, hoverColIndex];
	};

export const handleOnMouseOutCurrying =
	(
		board: Cell[][],
		ctx: CanvasRenderingContext2D | null,
		cellSize: number,
		prevHoveredRef: MutableRefObject<[number, number]>
	) =>
	() => {
		if (prevHoveredRef.current) {
			const [prevHoverRow, prevHoverCol] = prevHoveredRef.current;
			const cell = board[prevHoverRow][prevHoverCol];

			if (cell.revealed || cell.isFlag) return;

			ctx!.fillStyle = cell.color;
			ctx?.fillRect(
				prevHoverCol * cellSize,
				prevHoverRow * cellSize,
				cellSize,
				cellSize
			);
		}
	};

export const handleOnClickCurrying =
	(
		board: Cell[][],
		ctx: CanvasRenderingContext2D | null,
		cellSize: number,
		updateVisited: (...cells: Cell[]) => void
	) =>
	(ev: MouseEvent) => {
		const { x: canvasX, y: canvasY } = (
			ev.target! as HTMLCanvasElement
		).getBoundingClientRect();

		const [clickCol, clickRow] = getRowAndCol(
			board.length,
			board[0].length,
			cellSize,
			canvasX,
			canvasY,
			ev.x,
			ev.y
		);

		const cell = board[clickRow][clickCol];

		if (!cell.revealed && !cell.isFlag) {
			ctx!.fillStyle = getCellColor(cell.num);

			// BOMB
			if (isNaN(cell.num)) {
				ctx?.beginPath();
				ctx?.arc(
					clickCol * cellSize + cellSize / 2,
					clickRow * cellSize + cellSize / 2,
					cellSize / 4,
					0,
					Math.PI * 2
				);

				ctx?.fill();
				updateVisited(cell);

				// 0 BOMBS NEARBY
			} else {
				if (cell.num === 0) {
					// GET PATH TO CLEAR
					const revealPath = checkBombProximity(
						board,
						clickRow,
						clickCol
					);

					revealPath.forEach(([row, col]) => {
						const cell = board[row][col];
						ctx!.fillStyle = CellColor.highLight;
						ctx?.fillRect(
							col * cellSize,
							row * cellSize,
							cellSize,
							cellSize
						);
						if (cell.num !== 0) {
							ctx!.fillStyle = getCellColor(cell.num);
							ctx?.fillText(
								String(cell.num),
								col * cellSize + cellSize / 4,
								row * cellSize + cellSize / 1.2
							);
						}
						cell.revealed = true;
					});
					updateVisited(
						...revealPath.map(([row, col]) => board[row][col])
					);

					// DRAW NUM
				} else {
					ctx?.fillText(
						String(cell.num),
						clickCol * cellSize + cellSize / 4,
						clickRow * cellSize + cellSize / 1.2
					);
					updateVisited(cell);
				}
			}
			cell.revealed = true;
		}
	};

export const handleOnContextMenuCurrying =
	(
		board: Cell[][],
		ctx: CanvasRenderingContext2D | null,
		cellSize: number,
		flags: number,
		multiplier: number,
		useFlag: (used?: boolean) => void
	) =>
	(ev: MouseEvent) => {
		ev.preventDefault();
		const { x: canvasX, y: canvasY } = (
			ev.target! as HTMLCanvasElement
		).getBoundingClientRect();

		const [clickCol, clickRow] = getRowAndCol(
			board.length,
			board[0].length,
			cellSize,
			canvasX,
			canvasY,
			ev.x,
			ev.y
		);

		const cell = board[clickRow][clickCol];

		if (cell.isFlag) {
			cell.isFlag = false;
			return useFlag(true);
		}
		if (cell.revealed || flags < 1) return;

		cell.isFlag = true;
		useFlag();

		const [row, col] = [
			clickRow * cellSize + cellSize / 15,
			clickCol * cellSize + cellSize / 8,
		];

		ctx?.beginPath();
		ctx!.fillStyle = getCellColor(0);

		ctx?.moveTo(col, row + 12 * multiplier);

		ctx?.lineTo(col + 12 * multiplier, row + 0);
		ctx?.lineTo(col + 15 * multiplier, row + 0);
		ctx?.lineTo(col + 15 * multiplier, row + 25 * multiplier);
		ctx?.lineTo(col + 25 * multiplier, row + 25 * multiplier);
		ctx?.lineTo(col + 25 * multiplier, row + 27 * multiplier);
		ctx?.lineTo(col + 0, row + 27 * multiplier);
		ctx?.lineTo(col + 0, row + 25 * multiplier);
		ctx?.lineTo(col + 12 * multiplier, row + 25 * multiplier);
		ctx?.lineTo(col + 12 * multiplier, row + 20 * multiplier);
		ctx?.lineTo(col + 0, row + 12 * multiplier);

		ctx?.fill();
	};
