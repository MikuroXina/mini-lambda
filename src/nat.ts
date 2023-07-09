import { type Bool, FALSE, TRUE, ifThenElse } from "./bool.js";
import { fix } from "./combinator.js";

export type Nat = <T>(internalSucc: (value: T) => T) => (internalZero: T) => T;

export const fromNumber = (n: number): Nat => {
    if (!Number.isInteger(n) || n < 0) {
        throw new Error(`failed to convert from: ${n}`);
    }
    let nat = zero;
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

export const zero = (<T>(_internalSucc: (value: T) => T) =>
    (internalZero: T) =>
        internalZero) satisfies Nat;
export const isZero = (n: Nat): Bool => n<Bool>((_x) => FALSE)(TRUE);

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
        (f) =>
        (x) => {
            const diff = sub(n)(m);
            return ifThenElse(isZero(diff))(zero(f)(x))(f(self(diff)(m)(f)(x)));
        },
);
export const div = (n: Nat) => div1(succ(n));
