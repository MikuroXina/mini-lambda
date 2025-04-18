import { type Bool, FALSE, TRUE } from "./bool.js";
import { type Nat, isZero, pred } from "./nat.js";
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

export const map =
    <T, U>(mapper: (item: T) => U) =>
    (list: List<T>): List<U> =>
    (onNil) =>
    (onCons) =>
        list(onNil)((head) => (tail) => onCons(mapper(head))(map(mapper)(tail)));

export const singleton = <T>(item: T): List<T> => cons(item)(nil());

export const at =
    (index: Nat) =>
    <T>(list: List<T>): Option<T> =>
        list(none<T>())(
            (head) => (tail) => isZero(index)(() => some(head))(() => at(pred(index))(tail)),
        );

export const withIndex =
    (index: Nat) =>
    <T>(toWrite: T) =>
    (list: List<T>): List<T> =>
        isZero(index)(() => cons(toWrite)(tail(list)))(() =>
            list(list)((h) => (t) => cons(h)(withIndex(pred(index))(toWrite)(t))),
        );
