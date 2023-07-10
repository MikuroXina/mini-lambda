import { type Bool, FALSE, TRUE, and, ifThenElse, not, or } from "./bool.js";
import { fix } from "./combinator.js";
import {
    type Nat,
    divZeroStop,
    add as natAdd,
    isZero as natIsZero,
    mul as natMul,
    toNumber as natToNumber,
    pred,
    zero,
} from "./nat.js";
import { type Pair, first, newPair, second, swap } from "./pair.js";

// x := [x, 0], -x := [0, x]
export type Int = Pair<Nat, typeof zero> | Pair<typeof zero, Nat>;

export const toNumber = (i: Int): number =>
    isNegative(i)(-natToNumber(abs(i)))(natToNumber(abs(i)));

export const fromSignAndNat =
    (isPositive: Bool) =>
    (n: Nat): Int =>
        ifThenElse(isPositive)(newPair(n)(zero))(newPair(zero)(n));
export const intoSignAndNat = (i: Int): Pair<Bool, Nat> =>
    ifThenElse(natIsZero(second(i)))(newPair(TRUE)(first(i)))(newPair(FALSE)(second(i)));

export const fromNat = (x: Nat) => newPair(x)(zero);

export const isPositive = (i: Int): Bool => and(natIsZero(second(i)))(not(natIsZero(first(i))));
export const isNegative = (i: Int): Bool => and(natIsZero(first(i)))(not(natIsZero(second(i))));
export const isZero = (i: Int): Bool => and(natIsZero(first(i)))(natIsZero(second(i)));
export const abs = (i: Int): Nat => ifThenElse(natIsZero(first(i)))(first(i))(second(i));

export type Neg<I extends Int> = I extends Pair<infer N, typeof zero>
    ? Pair<typeof zero, N>
    : Pair<Nat, typeof zero>;
export const neg: <I extends Int>(i: I) => Neg<I> = swap as unknown as <I extends Int>(
    i: I,
) => Neg<I>;

export const normalize = fix(
    (self: (x: Int | Pair<Nat, Nat>) => Int) =>
        (x: Int | Pair<Nat, Nat>): Int =>
            ifThenElse(or(natIsZero(first(x)))(natIsZero(second(x))))(x as unknown as Int)(
                self(newPair(pred(first(x)))(pred(second(x)))),
            ),
);

const mapOver =
    (fn: (x1: Nat) => (x2: Nat) => (y1: Nat) => (y2: Nat) => Pair<Nat, Nat>) =>
    (x: Int) =>
    (y: Int): Int =>
        normalize(fn(first(x))(second(x))(first(y))(second(y)));

export const add: (x: Int) => (y: Int) => Int = mapOver(
    // [x1, x2] + [y1, y2]
    // = x1 - x2 + y1 - y2
    // = x1 + x2 - (y1 + y2)
    // = [x1 + x2, y1 + y2]
    (x1) => (x2) => (y1) => (y2) => newPair(natAdd(x1)(y1))(natAdd(x2)(y2)),
);
export const sub: (x: Int) => (y: Int) => Int = mapOver(
    // [x1, x2] - [y1, y2]
    // = x1 - x2 - (y1 - y2)
    // = x1 + y2 - (x2 + y1)
    // = [x1 + y2, x2 + y1]
    (x1) => (x2) => (y1) => (y2) => newPair(natAdd(x1)(y2))(natAdd(x2)(y1)),
);

export const mul: (x: Int) => (y: Int) => Int = mapOver(
    // [x1, x2] * [y1, y2]
    // = (x1 - x2)(y1 - y2)
    // = x1 y1 - x1 y2 - x2 y1 + x2 y2
    // = x1 y1 + x2 y2 - (x1 y2 + x2 y1)
    // = [x1 y1 + x2 y2, x1 y2 + x2 y1]
    (x1) => (x2) => (y1) => (y2) =>
        newPair(natAdd(natMul(x1)(y1))(natMul(x2)(y2)))(natAdd(natMul(x1)(y2))(natMul(x2)(y1))),
);

export const div: (x: Int) => (y: Int) => Int = mapOver(
    // [x1, x2] / [y1, y2]
    // = (x1 - x2) / (y1 - y2)
    // = x1 / y1 - x1 / y2 - x2 / y1 + x2 / y2
    // = x1 / y1 + x2 / y2 - (x1 / y2 + x2 / y1)
    // = [x1 / y1 + x2 / y2, x1 / y2 + x2 / y1]
    (x1) => (x2) => (y1) => (y2) =>
        newPair(natAdd(divZeroStop(x1)(y1))(divZeroStop(x2)(y2)))(
            natAdd(divZeroStop(x1)(y2))(divZeroStop(x2)(y1)),
        ),
);
