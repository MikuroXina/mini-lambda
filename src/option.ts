// () + T
// ===  ((() + T) => I) => I
// ===  ((() => I) × (T => I)) => I
// ===  (() => I) => (T => I) => I
import { type Bool, FALSE, TRUE, ifThenElse } from "./bool.js";
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
