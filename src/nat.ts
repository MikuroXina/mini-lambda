import { type Bool, FALSE, TRUE, ifThenElse, not, or } from "./bool.js";
import { fix } from "./combinator.js";
import { empty } from "./empty.js";

// Nat := zero | succ (n)
// = (zero: () => I) + (succ: (n: Nat) => I)
// = ( (zero: () => I) + (succ: (n: Nat) => I) ) => I
// = (zero: () => I) × ( (succ: (n: Nat) => I) => I)
// = (zero: () => I) => (succ: (n: Nat) => I) => I
export type Nat = <I>(onSucc: (predN: Nat) => I) => (zero: () => I) => I;

export const fromNumber = (n: number): Nat => {
    if (!Number.isInteger(n) || n < 0) {
        throw new Error(`failed to convert from: ${n}`);
    }
    let nat: Nat = zero;
    for (; 0 < n; n /= 2) {
        nat = mul(nat)(two);
        if (n % 2 == 1) {
            nat = succ(nat);
        }
    }
    return nat;
};

export const evaluate =
    <I>(actualSucc: (value: I) => I) =>
    (actualZero: () => I) =>
    (nat: Nat): I =>
        nat<I>((n) => evaluate(actualSucc)(actualZero)(n))(actualZero);
export const toNumber = evaluate((x: number) => x + 1)(() => 0);

export const zero = (<I>() =>
    (internalZero: () => I) =>
        internalZero()) satisfies Nat;
export type Zero = typeof zero;
export const isZero = (n: Nat): Bool => n(() => FALSE)(() => TRUE);
export const nonZero = (n: Nat) => not(isZero(n));

export type Succ<N extends Nat> = <T>(f: (s: N) => T) => () => T;
export const succ =
    <N extends Nat>(n: N): Succ<N> =>
    <T>(f: (s: N) => T) =>
    () =>
        f(n);

export const one = succ(zero) satisfies Nat;
export const two = succ(one) satisfies Nat;

export type Pred<N extends Nat> = N extends Succ<infer M extends Nat> ? M : Zero;
export const pred = <N extends Nat>(n: N): Pred<N> =>
    n<Pred<N>>((predN) => predN as Pred<N>)(() => zero as Pred<N>);

export const add =
    (n: Nat) =>
    (m: Nat): Nat =>
        // (succ n) + m = succ (n + m)
        // 0 + m = m
        n<Nat>((predN) => succ(add(predN)(m)))(() => m);
export const mul =
    (n: Nat) =>
    (m: Nat): Nat =>
        // (succ n) * m = m + n * m
        // 0 * m = 0
        n((predN) => add(m)(mul(predN)(m)))(() => zero);
export const pow =
    (n: Nat) =>
    (m: Nat): Nat =>
        // n ^ (succ m) = n ^ m * n
        // n ^ 0 = 1
        m((predM) => mul(pow(n)(predM))(n))(() => one);

export const sub =
    (n: Nat) =>
    (m: Nat): Nat =>
        // n - 0 = n
        // 0 - succ m = 0
        // succ n - succ m = n - m
        m((predM) => n((predN) => sub(predN)(predM))(() => zero))(() => n);

const div1 =
    (quotient: Nat) =>
    (n: Nat) =>
    (m: Nat) =>
    (count: Nat): Nat =>
        n((predN) =>
            count((predCount) => div1(quotient)(predN)(m)(predCount))(() =>
                div1(succ(quotient))(predN)(m)(m),
            ),
        )(() => quotient);
export const div =
    (n: Nat) =>
    (m: Nat): Nat =>
        m((predM) => div1(zero)(n)(predM)(predM))(empty);

const rem1 =
    (remainder: Nat) =>
    (n: Nat) =>
    (m: Nat) =>
    (count: Nat): Nat =>
        n((predN) =>
            count((predCount) => rem1(succ(remainder))(predN)(m)(predCount))(() =>
                rem1(zero)(predN)(m)(m),
            ),
        )(() => remainder);
export const rem =
    (n: Nat) =>
    (m: Nat): Nat =>
        m((predM) => rem1(zero)(n)(predM)(predM))(empty);

export const gcd = fix(
    (self: (n: Nat) => (m: Nat) => Nat) =>
        (n: Nat) =>
        (m: Nat): Nat =>
            ifThenElse(isZero(m))(n)(self(m)(rem(n)(m))),
);
export const lcm = (n: Nat) => (m: Nat) => div(mul(n)(m))(gcd(n)(m));

export const lessThan =
    (n: Nat) =>
    (m: Nat): Bool =>
        // n < 0 = FALSE
        // 0 < succ m = TRUE
        // succ n < succ m = n < m
        m((predM) => n((predN) => lessThan(predN)(predM))(() => TRUE))(() => FALSE);

export const greaterThan =
    (n: Nat) =>
    (m: Nat): Bool =>
        lessThan(m)(n);

export const equalTo =
    (n: Nat) =>
    (m: Nat): Bool =>
        // 0 == 0  =  TRUE
        // succ n == succ m  =  n == m
        // otherwise  =  FALSE
        n((predM) => m((predN) => equalTo(predM)(predN))(() => FALSE))(() =>
            m(() => FALSE)(() => TRUE),
        );

export const lessThanOrEqualTo =
    (n: Nat) =>
    (m: Nat): Bool =>
        or(lessThan(n)(m))(equalTo(n)(m));

export const greaterThanOrEqualTo =
    (n: Nat) =>
    (m: Nat): Bool =>
        or(greaterThan(n)(m))(equalTo(n)(m));
