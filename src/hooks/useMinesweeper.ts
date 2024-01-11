import {
	useCallback,
	useContext,
	useEffect,
	useMemo,
	useRef,
	useState,
} from 'react';

import { GameContext } from '../context/gameContext';

import {
	Cell,
	CELL_MULTIPLIER,
	CELL_SIZE,
	initialize,
	handleOnClickCurrying,
	handleOnContextMenuCurrying,
	handleOnHoverCurrying,
	handleOnMouseOutCurrying,
} from '../core';

export const useMineSweeper = () => {
	const { width, height, mines, diffculty } = useContext(GameContext);

	const board = useRef<Cell[][]>([[]]);
	const prevHoveredRef = useRef<[number, number]>([-1, -1]);
	const canvasRef = useRef<HTMLCanvasElement>(null);
	const ctx = useRef<CanvasRenderingContext2D | null>();

	const [visited, setVisited] = useState<Cell[]>([]);
	const [won, setWon] = useState(false);
	const [lost, setLost] = useState(false);
	const [flags, setFlags] = useState(mines);
	const flagsRef = useRef(flags);

	const visitedCellsToWin = useMemo(
		() => width * height - mines,
		[width, height, mines]
	);

	const multiplier = useMemo(() => CELL_MULTIPLIER[diffculty], [diffculty]);
	const drawCellSize = useMemo(() => CELL_SIZE * multiplier, [multiplier]);

	const canvasWidth = useMemo(
		() => Math.round(CELL_SIZE * width * multiplier),
		[width, multiplier]
	);
	const canvasHeight = useMemo(
		() => Math.round(CELL_SIZE * height * multiplier),
		[height, multiplier]
	);

	const handleUpdateVisited = useCallback((...visitedCels: Cell[]) => {
		setVisited((prevVisited) => {
			const updatedVisited = [...prevVisited];
			updatedVisited?.push(...visitedCels);

			return updatedVisited;
		});
	}, []);

	const useFlag = useCallback((used: boolean = false) => {
		setFlags((prev) => (prev > 0 ? (used ? prev + 1 : prev - 1) : prev));
	}, []);

	const win = useCallback(() => setWon(true), []);
	const lose = useCallback(() => setLost(true), []);

	const handleReset = useCallback(() => {
		setWon(false);
		setLost(false);
	}, []);

	useEffect(() => {
		if (canvasRef.current && !(won || lost)) {
			// Reset original state
			setFlags(mines);
			setVisited([]);

			const canvas = canvasRef.current;

			ctx.current = canvas.getContext('2d');
			ctx.current!.font = `${drawCellSize}px bold serif`;
			board.current = initialize(
				ctx.current,
				mines,
				drawCellSize,
				width,
				height
			);

			const handleOnHover = handleOnHoverCurrying(
				board.current,
				ctx.current,
				drawCellSize,
				prevHoveredRef
			);
			const handleOnMouseOut = handleOnMouseOutCurrying(
				board.current,
				ctx.current,
				drawCellSize,
				prevHoveredRef
			);
			const handleClick = handleOnClickCurrying(
				board.current,
				ctx.current,
				drawCellSize,
				handleUpdateVisited
			);
			const handleOnContextMenu = handleOnContextMenuCurrying(
				board.current,
				ctx.current,
				drawCellSize,
				flagsRef.current,
				multiplier,
				useFlag
			);

			canvas.addEventListener('mousemove', handleOnHover);
			canvas.addEventListener('mouseout', handleOnMouseOut);
			canvas.addEventListener('click', handleClick);
			canvas.addEventListener('contextmenu', handleOnContextMenu);

			return () => {
				canvas.removeEventListener('mousemove', handleOnHover);
				canvas.removeEventListener('mouseout', handleOnMouseOut);
				canvas.removeEventListener('click', handleClick);
				canvas.removeEventListener('contextmenu', handleOnContextMenu);
			};
		}
	}, [
		multiplier,
		won,
		lost,
		mines,
		drawCellSize,
		width,
		height,
		useFlag,
		handleUpdateVisited,
	]);

	useEffect(() => {
		flagsRef.current = flags;
	}, [flags]);

	useEffect(() => {
		if (visitedCellsToWin === visited.length) return win();

		const foundBomb = visited.find((cell) => isNaN(cell.num));
		if (foundBomb) lose();
	}, [visited, visitedCellsToWin, win, lose]);

	// Force reset game when updates the context/changes difficulty
	useEffect(() => {
		handleReset();
	}, [width, height, handleReset]);

	return {
		canvasRef,
		width: canvasWidth,
		height: canvasHeight,
		remainingFlags: flags,
		won,
		lost,
		reset: handleReset,
	};
};
