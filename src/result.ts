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
