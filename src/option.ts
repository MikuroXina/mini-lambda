// () + T
// ===  ((() + T) => I) => I
// ===  ((() => I) × (T => I)) => I
// ===  (() => I) => (T => I) => I
import { type Bool, FALSE, TRUE, and as boolAnd, ifThenElse } from "./bool.js";
import { type List, nil } from "./list.js";

// ===  I => (T => I) => I
export type Option<T> = <I>(onNone: I) => (onSome: (value: T) => I) => I;

export const none =
    <T>(): Option<T> =>
    (onNone) =>
    () =>
        onNone;
export const some =
    <T>(value: T): Option<T> =>
    () =>
    (onSome) =>
        onSome(value);

export const fromPredicate =
    <T>(pred: (t: T) => Bool) =>
    (t: T): Option<T> =>
        ifThenElse(pred(t))(some(t))(none());

export const isNone = <T>(opt: Option<T>): Bool => opt(TRUE)(() => FALSE);
export const isSome = <T>(opt: Option<T>): Bool => opt(FALSE)(() => TRUE);

export const intoList =
    <T>(opt: Option<T>): List<T> =>
    (onNil) =>
    (onCons) =>
        opt(onNil)((value) => onCons(value)(nil()));

export const flatten = <T>(optOpt: Option<Option<T>>): Option<T> =>
    optOpt(none<T>())((value) => value);

export const and =
    <B>(optB: Option<B>) =>
    <A>(optA: Option<A>): Option<B> =>
        optA(none<B>())(() => optB);
export const andThen =
    <A, B>(optB: (a: A) => Option<B>) =>
    (optA: Option<A>): Option<B> =>
        optA(none<B>())(optB);

export const or =
    <T>(optB: Option<T>) =>
    (optA: Option<T>): Option<T> =>
        optA(optA)(() => optB);
export const orElse =
    <T>(optB: () => Option<T>) =>
    (optA: Option<T>): Option<T> =>
        optA(optA)(optB);

export const xor =
    <T>(optB: Option<T>) =>
    (optA: Option<T>): Option<T> =>
        ifThenElse(boolAnd(isSome(optA))(isNone(optB)))(optA)(
            ifThenElse(boolAnd(isNone(optA))(isSome(optB)))(optB)(none()),
        );
