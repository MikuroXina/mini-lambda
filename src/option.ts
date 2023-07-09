import { type Bool, FALSE, TRUE, and as boolAnd, ifThenElse } from "./bool.js";
import { type List, nil } from "./list.js";
import { type Pair, first, newPair, second } from "./pair.js";

// () + T
// ===  ((() + T) => I) => I
// ===  ((() => I) × (T => I)) => I
// ===  (() => I) => (T => I) => I
export type Option<T> = <I>(onNone: () => I) => (onSome: (value: T) => I) => I;

export const none =
    <T>(): Option<T> =>
    (onNone) =>
    () =>
        onNone();
export const some =
    <T>(value: T): Option<T> =>
    () =>
    (onSome) =>
        onSome(value);

export const fromPredicate =
    <T>(pred: (t: T) => Bool) =>
    (t: T): Option<T> =>
        ifThenElse(pred(t))(some(t))(none());

export const isNone = <T>(opt: Option<T>): Bool => opt(() => TRUE)(() => FALSE);
export const isSome = <T>(opt: Option<T>): Bool => opt(() => FALSE)(() => TRUE);

export const intoList =
    <T>(opt: Option<T>): List<T> =>
    (onNil) =>
    (onCons) =>
        opt(() => onNil)((value) => onCons(value)(nil()));

export const flatten = <T>(optOpt: Option<Option<T>>): Option<T> =>
    optOpt(none<T>)((value) => value);

export const and =
    <B>(optB: Option<B>) =>
    <A>(optA: Option<A>): Option<B> =>
        optA(none<B>)(() => optB);
export const andThen =
    <A, B>(optB: (a: A) => Option<B>) =>
    (optA: Option<A>): Option<B> =>
        optA(none<B>)(optB);

export const or =
    <T>(optB: Option<T>) =>
    (optA: Option<T>): Option<T> =>
        optA(() => optA)(() => optB);
export const orElse =
    <T>(optB: () => Option<T>) =>
    (optA: Option<T>): Option<T> =>
        optA(() => optA)(optB);

export const xor =
    <T>(optB: Option<T>) =>
    (optA: Option<T>): Option<T> =>
        ifThenElse(boolAnd(isSome(optA))(isNone(optB)))(optA)(
            ifThenElse(boolAnd(isNone(optA))(isSome(optB)))(optB)(none()),
        );

export const filter =
    <T>(pred: (t: T) => Bool) =>
    (opt: Option<T>): Option<T> =>
        ifThenElse(opt(() => FALSE)(pred))(opt)(none());

export const zip =
    <A>(optA: Option<A>) =>
    <B>(optB: Option<B>): Option<Pair<A, B>> =>
        optA(none<Pair<A, B>>)((a) => optB(none<Pair<A, B>>)((b) => some(newPair(a)(b))));

export const unzip = <A, B>(optA: Option<Pair<A, B>>): Pair<Option<A>, Option<B>> =>
    optA(() => newPair(none<A>())(none<B>()))((pair) =>
        newPair(some(first(pair)))(some(second(pair))),
    );

export const zipWith =
    <A, B, X>(fn: (a: A) => (b: B) => X) =>
    (optA: Option<A>) =>
    (optB: Option<B>): Option<X> =>
        optA(none<X>)((a) => optB(none<X>)((b) => some(fn(a)(b))));
