export type Equality<A> = <I>(refl: (x: A) => I) => I;

export const equal =
    <A>(x: A): Equality<A> =>
    (refl) =>
        refl(x);
