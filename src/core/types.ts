export enum Difficulty {
	easy = 'EASY',
	medium = 'MEDIUM',
	hard = 'HARD',
	custom = 'CUSTOM',
}

export enum CellColor {
	odd = '#9ca3af',
	even = '#6b7280',
	highLight = '#cbd5e1',
}

export type Cell = {
	num: number;
	color: CellColor;
	isFlag?: boolean;
	revealed?: boolean;
};
