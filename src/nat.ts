import { type Bool, FALSE, TRUE, and, ifThenElse, not } from "./bool.js";
import { fix } from "./combinator.js";

export type Nat = <T>(internalSucc: (value: T) => T) => (internalZero: T) => T;

export const fromNumber = (n: number): Nat => {
    if (!Number.isInteger(n) || n < 0) {
        throw new Error(`failed to convert from: ${n}`);
    }
    let nat: Nat = zero;
    for (; 0 < n; --n) {
        nat = succ(nat);
    }
    return nat;
};

export const evaluate =
    <T>(actualSucc: (value: T) => T) =>
    (actualZero: T) =>
    (nat: Nat): T =>
        nat(actualSucc)(actualZero);
export const toNumber = evaluate((x: number) => x + 1)(0);

export const zero: Nat =
    <T>() =>
    (internalZero: T) =>
        internalZero;
export const isZero = (n: Nat): Bool => n<Bool>(() => FALSE)(TRUE);
export const nonZero = (n: Nat) => not(isZero(n));

export const succ =
    (n: Nat): Nat =>
    <T>(f: (value: T) => T) =>
    (x: T) =>
        f(n(f)(x));

export const one: Nat = succ(zero);

export const pred =
    (n: Nat): Nat =>
    <T>(f: (value: T) => T) =>
    (x: T) => {
        type Value<X> = (fn: (x: X) => X) => X;
        const value =
            <X>(v: X): Value<X> =>
            (h) =>
                h(v);
        const extract = <X>(k: Value<X>): X => k((u: X) => u);
        const include = (g: Value<T>): Value<T> => value(g(f));
        const constant = () => x;
        return extract(n(include)(constant));
    };

export const recurse =
    <A>(op: (a: A) => A) =>
    (init: A) =>
    (times: Nat): A =>
        times(op)(init);
export const add =
    (n: Nat) =>
    (m: Nat): Nat =>
        recurse(succ)(n)(m);
export const mul =
    (n: Nat) =>
    (m: Nat): Nat =>
    <T>(f: (value: T) => T) =>
        n(m(f));
export const pow =
    (n: Nat) =>
    (m: Nat): Nat =>
        n(m);

export const sub =
    (n: Nat) =>
    (m: Nat): Nat =>
        n(pred)(m);

const div1 = fix(
    (self: (n: Nat) => (m: Nat) => Nat) =>
        (n: Nat) =>
        (m: Nat): Nat =>
        <T>(f: (value: T) => T) =>
        (x: T) => {
            const diff = sub(n)(m);
            return ifThenElse(isZero(diff))(zero(f)(x))(f(self(diff)(m)(f)(x)));
        },
);
export const div = (n: Nat) => div1(succ(n));

export const divZeroStop =
    (n: Nat) =>
    (m: Nat): Nat =>
        ifThenElse(isZero(m))(zero)(div(n)(m));

const remExceptZero = fix((self: (n: Nat) => (m: Nat) => Nat) => (n: Nat) => (m: Nat): Nat => {
    const diff = sub(n)(m);
    return ifThenElse(isZero(diff))(n)(self(diff)(m));
});
export const rem =
    (n: Nat) =>
    (m: Nat): Nat =>
        remExceptZero(add(n)(m))(m);

export const gcd = fix(
    (self: (n: Nat) => (m: Nat) => Nat) =>
        (n: Nat) =>
        (m: Nat): Nat =>
            ifThenElse(isZero(m))(n)(self(m)(rem(n)(m))),
);
export const lcm = (n: Nat) => (m: Nat) => div(mul(n)(m))(gcd(n)(m));

export const lessThan =
    (m: Nat) =>
    (n: Nat): Bool =>
        // m < n  ===  m - n < 0  ===  m - n + 1 <= 0
        isZero(sub(succ(m))(n));

export const greaterThan =
    (m: Nat) =>
    (n: Nat): Bool =>
        lessThan(n)(m);

export const lessThanOrEqualTo =
    (m: Nat) =>
    (n: Nat): Bool =>
        // m <= n  ===  m - n <= 0
        isZero(sub(m)(n));

export const greaterThanOrEqualTo =
    (m: Nat) =>
    (n: Nat): Bool =>
        lessThanOrEqualTo(n)(m);

export const equalTo =
    (m: Nat) =>
    (n: Nat): Bool =>
        and(lessThanOrEqualTo(m)(n))(greaterThanOrEqualTo(m)(n));
