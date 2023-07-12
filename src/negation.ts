import { type Empty } from "./empty.js";

export type Negate<P> = (p: P) => Empty;

export type DoubleNegate<P> = Negate<Negate<P>>;

export type Stable<P> = (doubleNegation: DoubleNegate<P>) => P;

export type Contradict<P> = (p: P) => <I>(falseP: Negate<P>) => I;

export type Contraposition<P, Q> = (prop: (p: P) => Q) => (falseQ: Negate<Q>) => Negate<P>;
