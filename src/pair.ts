// X × Y
// ===  (X × Y => T) => T
// ===  (X => Y => T) => T
export type Pair<X, Y> = <T>(store: (first: X) => (second: Y) => T) => T;

export const first = <X, Y>(z: Pair<X, Y>): X => z((x) => (_y) => x);
export const second = <X, Y>(z: Pair<X, Y>): Y => z((_x) => (y) => y);
export const newPair =
    <X>(x: X) =>
    <Y>(y: Y): Pair<X, Y> =>
    (z) =>
        z(x)(y);

export const curry =
    <X, Y, R>(f: (arg: Pair<X, Y>) => R) =>
    (x: X) =>
    (y: Y): R =>
        f(newPair(x)(y));

export const uncurry =
    <X, Y, R>(f: (x: X) => (y: Y) => R) =>
    (pair: Pair<X, Y>) =>
        f(first(pair))(second(pair));

export const swap = <X, Y>(pair: Pair<X, Y>): Pair<Y, X> => newPair(second(pair))(first(pair));

export const mapFirst =
    <A, B>(fn: (a: A) => B) =>
    <Y>(pair: Pair<A, Y>): Pair<B, Y> =>
        newPair(fn(first(pair)))(second(pair));
export const mapSecond =
    <A, B>(fn: (a: A) => B) =>
    <X>(pair: Pair<X, A>): Pair<X, B> =>
        newPair(first(pair))(fn(second(pair)));
export const mapBoth =
    <A, B>(f: (a: A) => B) =>
    <X, Y>(g: (x: X) => Y) =>
    (pair: Pair<A, X>): Pair<B, Y> =>
        newPair(f(first(pair)))(g(second(pair)));
export const mapD =
    <A, B>(fn: (a: A) => B) =>
    (pair: Pair<A, A>): Pair<B, B> =>
        newPair(fn(first(pair)))(fn(second(pair)));
