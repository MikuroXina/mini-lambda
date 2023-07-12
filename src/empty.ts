export type Empty = () => never;
export const empty: Empty = (): never => {
    throw new Error("must not evaluate empty");
};
