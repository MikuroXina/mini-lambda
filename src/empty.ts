export type Empty = <I>() => I;
export const empty: Empty = () => {
    throw new Error("must not evaluate empty");
};
