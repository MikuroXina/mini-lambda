import { type Int, fromNat as intFromNat } from "./int.js";
import { type Nat, one, succ, zero } from "./nat.js";
import {
    type Rat,
    add as ratAdd,
    div as ratDiv,
    fromInt as ratFromInt,
    fromNat as ratFromNat,
    mul as ratMul,
    sub as ratSub,
    toNumber as ratToNumber,
} from "./rat.js";

// rational Cauchy sequence as a function, must satisfy `(r: Real)`:
//     lim_[n, m → ∞] | r(n) - r(m) | = 0
export type Real = (index: Nat) => Rat;

export const toNumber = (r: Real): number => {
    let step: Nat = zero;
    while (true) {
        const left = ratToNumber(ratDiv(ratSub(r(step))(ratFromNat(one)))(ratFromNat(step)));
        const right = ratToNumber(ratDiv(ratAdd(r(step))(ratFromNat(one)))(ratFromNat(step)));
        if (right - left < Number.EPSILON) {
            return left;
        }
        step = succ(step);
    }
};

export const fromRat =
    (r: Rat): Real =>
    () =>
        r;
export const fromInt = (i: Int): Real => fromRat(ratFromInt(i));
export const fromNat = (n: Nat): Real => fromInt(intFromNat(n));

export const add =
    (x: Real) =>
    (y: Real): Real =>
    (index) =>
        ratAdd(x(index))(y(index));
export const sub =
    (x: Real) =>
    (y: Real): Real =>
    (index) =>
        ratSub(x(index))(y(index));
export const mul =
    (x: Real) =>
    (y: Real): Real =>
    (index) =>
        ratMul(x(index))(y(index));
export const div =
    (x: Real) =>
    (y: Real): Real =>
    (index) =>
        ratDiv(x(index))(y(index));
