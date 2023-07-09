import { type Bool, FALSE, TRUE } from "./bool.js";

// () + T
// ===  ((() + T) => I) => I
// ===  ((() => I) × (T => I)) => I
// ===  (() => I) => (T => I) => I
export type Result<E, T> = <I>(onErr: (error: E) => I) => (onOk: (value: T) => I) => I;

export const ok =
    <E, T>(value: T): Result<E, T> =>
    () =>
    (onOk) =>
        onOk(value);
export const err =
    <E, T>(error: E): Result<E, T> =>
    (onErr) =>
    () =>
        onErr(error);

export const isOk = <E, T>(res: Result<E, T>): Bool => res(() => FALSE)(() => TRUE);
export const isErr = <E, T>(res: Result<E, T>): Bool => res(() => TRUE)(() => FALSE);

export const either =
    <I, E>(onErr: (error: E) => I) =>
    <T>(onOk: (value: T) => I) =>
    (res: Result<E, T>): I =>
        res(onErr)(onOk);

export const flatten = <E, T>(resRes: Result<E, Result<E, T>>): Result<E, T> =>
    resRes(err<E, T>)((value) => value);

export const mergeOkErr = <T>(res: Result<T, T>): T => res((x) => x)((x) => x);

export const and =
    <E, B>(resB: Result<E, B>) =>
    <A>(resA: Result<E, A>): Result<E, B> =>
        resA(err<E, B>)(() => resB);
export const andThen =
    <E, A, B>(resB: (a: A) => Result<E, B>) =>
    (resA: Result<E, A>): Result<E, B> =>
        resA(err<E, B>)(resB);

export const or =
    <E, T>(resB: Result<E, T>) =>
    (resA: Result<E, T>): Result<E, T> =>
        resA(() => resB)(() => resA);
export const orElse =
    <E, F, T>(resB: (error: E) => Result<F, T>) =>
    (resA: Result<E, T>): Result<F, T> =>
        resA(resB)((value) => ok(value));
