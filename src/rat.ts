import { not, xor } from "./bool.js";
import {
    type Int,
    abs,
    fromSignAndNat,
    add as intAdd,
    fromNat as intFromNat,
    mul as intMul,
    sub as intSub,
    toNumber as intToNumber,
    intoSignAndNat,
    isNegative,
} from "./int.js";
import {
    type Nat,
    gcd,
    div as natDiv,
    mul as natMul,
    toNumber as natToNumber,
    one,
} from "./nat.js";
import { type Pair, first, newPair, second } from "./pair.js";

// num / denom := `[num: Int, denom: Nat]`, but also already reduced
export type Rat = Pair<Int, Nat>;

export const toNumber = (r: Rat): number => intToNumber(numerator(r)) / natToNumber(denominator(r));

export const fromInt = (i: Int): Rat => newPair(i)(one);
export const fromNat = (n: Nat): Rat => fromInt(intFromNat(n));

export const fromNumAndDenom: (i: Int) => (n: Nat) => Rat = newPair;
export const numerator: (r: Rat) => Int = first;
export const denominator: (r: Rat) => Nat = second;

export const fromTwoInts =
    (num: Int) =>
    (denom: Int): Rat => {
        const isPositive = not(xor(isNegative(num))(isNegative(denom)));
        const numAbs = abs(num);
        const denomAbs = abs(denom);
        return fromNumAndDenom(fromSignAndNat(isPositive)(numAbs))(denomAbs);
    };

export const reduce = (r: Rat): Rat => {
    const signAndNat = intoSignAndNat(first(r));
    const num = second(signAndNat);
    const gcdOfTwo = gcd(num)(second(r));
    return fromNumAndDenom(fromSignAndNat(first(signAndNat))(natDiv(num)(gcdOfTwo)))(
        natDiv(second(r))(gcdOfTwo),
    );
};

const mapOver =
    (fn: (rNum: Int) => (rDen: Nat) => (sNum: Int) => (sDen: Nat) => Rat) =>
    (r: Rat) =>
    (s: Rat): Rat =>
        reduce(fn(numerator(r))(denominator(r))(numerator(s))(denominator(s)));

export const add: (r: Rat) => (s: Rat) => Rat = mapOver(
    // [rNum, rDen] + [sNum, sDen]
    // = rNum / rDen + sNum / sDen
    // = (rNum * sDen + sNum * rDen) / (rDen * sDen)
    // = [rNum * sDen + sNum * rDen, rDen * sDen]
    (rNum) => (rDen) => (sNum) => (sDen) =>
        fromNumAndDenom(intAdd(intMul(rNum)(intFromNat(sDen)))(intMul(sNum)(intFromNat(rDen))))(
            natMul(rDen)(sDen),
        ),
);
export const sub: (r: Rat) => (s: Rat) => Rat = mapOver(
    // [rNum, rDen] - [sNum, sDen]
    // = rNum / rDen - sNum / sDen
    // = (rNum * sDen - sNum * rDen) / (rDen * sDen)
    // = [rNum * sDen - sNum * rDen, rDen * sDen]
    (rNum) => (rDen) => (sNum) => (sDen) =>
        fromNumAndDenom(intSub(intMul(rNum)(intFromNat(sDen)))(intMul(sNum)(intFromNat(rDen))))(
            natMul(rDen)(sDen),
        ),
);

export const mul: (r: Rat) => (s: Rat) => Rat = mapOver(
    // [rNum, rDen] * [sNum, sDen]
    // = rNum / rDen * sNum / sDen
    // = (rNum * sNum) / (rDen * sDen)
    // = [rNum * sNum, rDen * sDen]
    (rNum) => (rDen) => (sNum) => (sDen) => fromNumAndDenom(intMul(rNum)(sNum))(natMul(rDen)(sDen)),
);
export const div: (r: Rat) => (s: Rat) => Rat = mapOver(
    // [rNum, rDen] / [sNum, sDen]
    // = rNum / rDen / (sNum / sDen)
    // = (rNum * sDen) / (rDen * sNum)
    // = [rNum * sDen, rDen * sNum]
    (rNum) => (rDen) => (sNum) => (sDen) =>
        fromTwoInts(intMul(rNum)(intFromNat(sDen)))(intMul(intFromNat(rDen))(sNum)),
);
