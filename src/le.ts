import type { Nat, Succ, zero } from "./nat.js";

export type Le<X extends Nat, Y extends Nat> = <I>(
    onZero: () => I,
) => (onSuccXLeSuccY: (xLeY: Le<X, Y>) => I) => I;

export const zeroLeY =
    <Y extends Nat>(): Le<typeof zero, Y> =>
    (onZero) =>
    () =>
        onZero();
export const succXLeSuccY =
    <X extends Nat, Y extends Nat>(xLeY: Le<X, Y>): Le<Succ<X>, Succ<Y>> =>
    () =>
    (onSuccXLeSuccY) =>
        onSuccXLeSuccY(xLeY);
