import { ChangeEvent, FormEvent, useEffect, useRef, useState } from 'react';

import './App.css';
import { GameContext, initialGameContext } from './context/gameContext';
import { Game } from './components/game/game';
import { capitalize } from './utils/string';
import { useToggle } from './hooks/useToggle';
import { Difficulty, HEIGHT, MINES, WIDTH } from './core';

function App() {
	const [configuration, setConfiguration] = useState(initialGameContext);
	const [difficulty, setDifficulty] = useState<Difficulty>(
		initialGameContext.diffculty
	);

	const [isGameEnabled, toggleGameEnabled] = useToggle();
	const [isCustomMode, toggleCustomMode] = useToggle();

	const widthRef = useRef<HTMLInputElement>(null);
	const heightRef = useRef<HTMLInputElement>(null);

	const handleChangeMode = (e: ChangeEvent<HTMLSelectElement>) => {
		const value = e.target.value as Difficulty;

		if (isCustomMode || value === Difficulty.custom) toggleCustomMode();

		setDifficulty(value);
	};

	const handleSubmitConfiguration = (e: FormEvent) => {
		e.preventDefault();

		const selectedConfig = {
			...configuration,
			difficulty: difficulty,
		};

		if (isCustomMode) {
			selectedConfig.width = +widthRef.current!.value;
			selectedConfig.height = +heightRef.current!.value;
			selectedConfig.mines =
				(selectedConfig.width * selectedConfig.height) / 5;
		}

		setConfiguration(selectedConfig);

		if (!isGameEnabled) toggleGameEnabled();
	};

	useEffect(() => {
		setConfiguration((prevConfiguration) => ({
			...prevConfiguration,
			diffculty: difficulty,
			mines: MINES[difficulty],
			width: WIDTH[difficulty],
			height: HEIGHT[difficulty],
		}));
	}, [difficulty]);

	return (
		<main>
			<h1>Hello and welcome to the React + Vanilla Canvas Minesweeper</h1>
			<form onSubmit={handleSubmitConfiguration}>
				<div>
					<label>Select difficulty: </label>
					<select
						onChange={handleChangeMode}
						defaultValue={difficulty}
					>
						{Object.values(Difficulty).map((difficulty) => (
							<option key={difficulty} value={difficulty}>
								{capitalize(difficulty)}
							</option>
						))}
					</select>
				</div>
				{isCustomMode && (
					<>
						<div>
							<label>Number of columns</label>
							<input
								ref={widthRef}
								defaultValue={WIDTH[Difficulty.custom]}
								type='number'
								min={8}
								max={100}
							/>
						</div>
						<div>
							<label>Number of rows</label>
							<input
								ref={heightRef}
								defaultValue={HEIGHT[Difficulty.custom]}
								type='number'
								min={8}
								max={100}
							/>
						</div>
					</>
				)}
				{(!isGameEnabled || isCustomMode) && (
					<button type='submit'>Start!</button>
				)}
			</form>

			{isGameEnabled && (
				<GameContext.Provider value={configuration}>
					<Game />
				</GameContext.Provider>
			)}
		</main>
	);
}

export default App;
