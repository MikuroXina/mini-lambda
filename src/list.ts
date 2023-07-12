import { type Bool, FALSE, TRUE } from "./bool.js";
import { type Option, none, some } from "./option.js";

export type List<T> = <I>(onNil: I) => (onCons: (head: T) => (tail: List<T>) => I) => I;

export const nil =
    <T>(): List<T> =>
    (onNil) =>
    () =>
        onNil;
export const cons =
    <T>(head: T) =>
    (list: List<T>): List<T> =>
    () =>
    (onCons) =>
        onCons(head)(list);

export const foldR =
    <A>(init: A) =>
    <T>(folder: (head: T) => (next: A) => A) =>
    (list: List<T>): A =>
        list(init)((head) => (tail) => foldR(folder(head)(init))(folder)(tail));

export const isEmpty: <T>(list: List<T>) => Bool = foldR(TRUE)(() => () => FALSE);

export const head = <T>(list: List<T>): Option<T> =>
    list(none<T>())((headItem) => () => some(headItem));

export const tail =
    <T>(list: List<T>): List<T> =>
    (onNil) =>
    (onCons) =>
        list(onNil)(() => (tailItem) => tailItem(onNil)(onCons));
