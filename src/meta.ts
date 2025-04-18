import { type Bool, FALSE, TRUE, and, ifThenElse, or } from "./bool.js";
import { type List, cons, singleton } from "./list.js";
import { type Nat, equalTo, lessThan, succ, zero } from "./nat.js";

// A `VarName` represents that an index of the variables list `Variables`.
export type VarName = Nat;

// A `Variables` contains distinct variable names.
export type VarSet = List<VarName>;

const max = (set: VarSet): VarName =>
    set<VarName>(zero)((head) => (tail) => {
        const tailMax = max(tail);
        return ifThenElse(lessThan(head)(tailMax))(tailMax)(head);
    });
export const newName = (set: VarSet): VarName => succ(max(set));
export const has =
    (name: VarName) =>
    (set: VarSet): Bool =>
        set(FALSE)((head) => (tail) => equalTo(name)(head)(() => TRUE)(() => has(name)(tail)));
export const add =
    (name: VarName) =>
    (set: VarSet): VarSet =>
        set(singleton(name))(
            (head) => (tail) => equalTo(name)(head)(() => set)(() => cons(head)(add(name)(tail))),
        );
export const remove =
    (name: VarName) =>
    (set: VarSet): VarSet =>
        set(set)(
            (head) => (tail) =>
                equalTo(name)(head)(() => tail)(() => cons(head)(remove(name)(tail))),
        );
export const union =
    (left: VarSet) =>
    (right: VarSet): VarSet =>
        left(right)((head) => (tail) => add(head)(union(tail)(right)));

// A lambda-calculus term.
export type Term = <I>(
    onVariable: (name: VarName) => I,
) => (
    onAbstraction: (param: VarName) => (body: Term) => I,
) => (onApplication: (func: Term) => (argument: Term) => I) => I;

// Makes a variable term `v_n`.
export const v =
    (n: VarName): Term =>
    (onVariable) =>
    () =>
    () =>
        onVariable(n);

// Makes a new lambda abstraction `λ param. body`.
export const abst =
    (param: VarName) =>
    (body: Term): Term =>
    () =>
    (onAbstraction) =>
    () =>
        onAbstraction(param)(body);

// Makes a new invocation `func(argument)`.
export const app =
    (func: Term) =>
    (argument: Term): Term =>
    () =>
    () =>
    (onApplication) =>
        onApplication(func)(argument);

export const freeVars = (term: Term): VarSet =>
    term(singleton)((param) => (body) => remove(param)(freeVars(body)))(
        (func) => (arg) => union(freeVars(func))(freeVars(arg)),
    );

// Substitutes `destination` variable with `source` expression in `target`. It operates `target[destination := source]`.
export const substitute =
    (target: Term) =>
    (source: Term) =>
    (destination: VarName): Term =>
        target((name) => equalTo(destination)(name)(() => source)(() => v(name)))(
            (param) => (body) => {
                const newParam = newName(
                    union(singleton(param))(union(freeVars(body))(freeVars(source))),
                );
                return abst(newParam)(
                    substitute(substitute(body)(v(newParam))(param))(source)(destination),
                );
            },
        )(
            (func) => (arg) =>
                app(substitute(func)(source)(destination))(substitute(arg)(source)(destination)),
        );

export const renameVar =
    (from: VarName) =>
    (into: VarName) =>
    (target: Term): Term =>
        target((name) => ifThenElse(equalTo(name)(from))(v(into))(target))(
            (param) => (body) =>
                has(into)(freeVars(body))(() => abst(param)(renameVar(from)(into)(body)))(() =>
                    abst(into)(substitute(body)(v(into))(param)),
                ),
        )((func) => (arg) => app(renameVar(from)(into)(func))(renameVar(from)(into)(arg)));

/**
 * Checks whether `term` is beta-normal form. It is equivalent to not able to be beta-simplified.
 */
export const isBetaNormal = (term: Term): Bool =>
    term(() => TRUE)(() => (body) => isBetaNormal(body))(
        (func) => (arg) =>
            func(() => FALSE)(() => () => TRUE)(
                () => () => or(isBetaNormal(func))(isBetaNormal(arg)),
            ),
    );

export const outerLeftMostBetaSimp = (term: Term): Term =>
    term(() => term)(() => () => term)(
        (func) => (argument) =>
            func(() => term)((param) => (body) => substitute(body)(argument)(param))(
                () => () =>
                    isBetaNormal(func)(() => app(outerLeftMostBetaSimp(func))(argument))(() =>
                        app(func)(outerLeftMostBetaSimp(argument)),
                    ),
            ),
    );

export const etaNormalize = (term: Term): Term =>
    term(() => term)(
        (param) => (body) =>
            body(() => abst(param)(etaNormalize(body)))(
                () => () => abst(param)(etaNormalize(body)),
            )(
                (func) => (arg) =>
                    arg((argName) =>
                        and(equalTo(param)(argName))(has(param)(freeVars(func)))(() =>
                            abst(param)(etaNormalize(body)),
                        )(() => func),
                    )(() => () => abst(param)(etaNormalize(body)))(
                        () => () => abst(param)(etaNormalize(body)),
                    ),
            ),
    )((func) => (arg) => app(etaNormalize(func))(etaNormalize(arg)));
