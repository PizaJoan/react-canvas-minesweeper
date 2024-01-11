import { createContext } from 'react';
import { IGameContext } from './types';
import { Difficulty } from '../core';

export const initialGameContext: IGameContext = {
	diffculty: Difficulty.medium,
	width: 9,
	height: 9,
	mines: 10,
};

export const GameContext = createContext<IGameContext>(initialGameContext);
