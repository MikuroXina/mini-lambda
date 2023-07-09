import { ifThenElse, or } from "./bool.js";
import { fix } from "./combinator.js";
import { type Nat, add as addNat, divZeroStop, isZero, mul as mulNat, pred, zero } from "./nat.js";
import { type Pair, first, newPair, second, swap } from "./pair.js";

// x := [x, 0], -x := [0, x]
export type Int = Pair<Nat, typeof zero> | Pair<typeof zero, Nat>;

export const fromNat = (x: Nat) => newPair(x)(zero);

export const abs = (i: Int): Nat => ifThenElse(isZero(first(i)))(first(i))(second(i));

export const neg: (x: Int) => Int = swap;

export const normalize = fix(
    (self: (x: Int) => Int) =>
        (x: Int): Int =>
            ifThenElse(or(isZero(first(x)))(isZero(second(x))))(x)(
                self(newPair(pred(first(x)))(pred(second(x)))),
            ),
);

const mapOver =
    (fn: (x1: Nat) => (x2: Nat) => (y1: Nat) => (y2: Nat) => Int) =>
    (x: Int) =>
    (y: Int): Int =>
        normalize(fn(first(x))(second(x))(first(y))(second(y)));

export const add: (x: Int) => (y: Int) => Int = mapOver(
    // [x1, x2] + [y1, y2]
    // = x1 - x2 + y1 - y2
    // = x1 + x2 - (y1 + y2)
    // = [x1 + x2, y1 + y2]
    (x1) => (x2) => (y1) => (y2) => newPair(addNat(x1)(y1))(addNat(x2)(y2)),
);
export const sub: (x: Int) => (y: Int) => Int = mapOver(
    // [x1, x2] - [y1, y2]
    // = x1 - x2 - (y1 - y2)
    // = x1 + y2 - (x2 + y1)
    // = [x1 + y2, x2 + y1]
    (x1) => (x2) => (y1) => (y2) => newPair(addNat(x1)(y2))(addNat(x2)(y1)),
);

export const mul: (x: Int) => (y: Int) => Int = mapOver(
    // [x1, x2] * [y1, y2]
    // = (x1 - x2)(y1 - y2)
    // = x1 y1 - x1 y2 - x2 y1 + x2 y2
    // = x1 y1 + x2 y2 - (x1 y2 + x2 y1)
    // = [x1 y1 + x2 y2, x1 y2 + x2 y1]
    (x1) => (x2) => (y1) => (y2) =>
        newPair(addNat(mulNat(x1)(y1))(mulNat(x2)(y2)))(addNat(mulNat(x1)(y2))(mulNat(x2)(y1))),
);

export const div: (x: Int) => (y: Int) => Int = mapOver(
    // [x1, x2] / [y1, y2]
    // = (x1 - x2) / (y1 - y2)
    // = x1 / y1 - x1 / y2 - x2 / y1 + x2 / y2
    // = x1 / y1 + x2 / y2 - (x1 / y2 + x2 / y1)
    // = [x1 / y1 + x2 / y2, x1 / y2 + x2 / y1]
    (x1) => (x2) => (y1) => (y2) =>
        newPair(addNat(divZeroStop(x1)(y1))(divZeroStop(x2)(y2)))(
            addNat(divZeroStop(x1)(y2))(divZeroStop(x2)(y1)),
        ),
);
