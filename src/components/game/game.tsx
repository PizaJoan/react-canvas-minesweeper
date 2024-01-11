import { useMineSweeper } from '../../hooks/useMinesweeper';

export const Game = () => {
	const { canvasRef, width, height, remainingFlags, lost, won, reset } =
		useMineSweeper();

	return (
		<>
			<p>Flags: {remainingFlags}</p>
			{(won || lost) && (
				<p>
					{won ? 'Congrats youn won!' : 'Game over...'}
					<button onClick={reset}>Play Again!</button>
				</p>
			)}
			<div id='game'>
				<canvas ref={canvasRef} width={width} height={height} />
			</div>
		</>
	);
};
