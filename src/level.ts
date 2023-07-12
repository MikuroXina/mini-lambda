export type Level = [];

export declare const levelZero: Level;
export declare const levelSucc: (l: Level) => Level;
export declare const levelMin: (l1: Level) => (l2: Level) => Level;
