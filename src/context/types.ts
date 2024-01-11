import type { Difficulty } from '../core/types';

export interface IGameContext {
	diffculty: Difficulty;
	width: number;
	height: number;
	mines: number;
}
