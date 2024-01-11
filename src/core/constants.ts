import { Difficulty } from './types';

export const CELL_SIZE = 32;
export const CELL_MULTIPLIER: Record<Difficulty, number> = {
	[Difficulty.easy]: 1.7,
	[Difficulty.medium]: 1.2,
	[Difficulty.hard]: 1,
	[Difficulty.custom]: 1,
};

export const INDEX_SEPARATOR = '|';

/*
  This way, starting from 1
  [2, 3, 4]
  [1, *, 5]
  [8, 7, 6]
*/
export const BOMB_PROXIMITY = [
	[0, -1],
	[-1, -1],
	[-1, 0],
	[-1, 1],
	[0, 1],
	[1, 1],
	[1, 0],
	[1, -1],
];

export const MINES: Record<Difficulty, number> = {
	[Difficulty.easy]: 10,
	[Difficulty.medium]: 40,
	[Difficulty.hard]: 99,
	[Difficulty.custom]: 320,
};

export const WIDTH: Record<Difficulty, number> = {
	[Difficulty.easy]: 9,
	[Difficulty.medium]: 16,
	[Difficulty.hard]: 30,
	[Difficulty.custom]: 40,
};

export const HEIGHT: Record<Difficulty, number> = {
	[Difficulty.easy]: 9,
	[Difficulty.medium]: 16,
	[Difficulty.hard]: 16,
	[Difficulty.custom]: 40,
};
