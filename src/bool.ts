import { type Empty, empty } from "./empty.js";
import { type Unit, unit } from "./unit.js";

// TRUE + FALSE
// ((TRUE + FALSE) => I) => I
// ((TRUE => I) × (FALSE => I)) => I
// (TRUE => I) => (FALSE => I) => I
export type Bool = <I>(onTrue: () => I) => (onFalse: () => I) => I;

export const TRUE: Bool =
    <I>(x: () => I) =>
    (): I =>
        x();
export const FALSE: Bool =
    <I>() =>
    (y: () => I): I =>
        y();

export const ifThenElse =
    (condition: Bool) =>
    <T>(ifTrue: T) =>
    (ifFalse: T) =>
        condition<T>(() => ifTrue)(() => ifFalse);

export const and =
    (p: Bool) =>
    (q: Bool): Bool =>
        p(() => q)(() => p);
export const or =
    (p: Bool) =>
    (q: Bool): Bool =>
        p(() => p)(() => q);
export const not = (p: Bool): Bool => p(() => FALSE)(() => TRUE);
export const xor =
    (p: Bool) =>
    (q: Bool): Bool =>
        p(() => not(q))(() => q);

export const asType = (p: Bool): Unit | Empty => ifThenElse(p)(unit)(empty);
