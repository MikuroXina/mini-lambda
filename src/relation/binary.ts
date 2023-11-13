import type { Pair } from "../pair.js";

export type HeteroRel<A, B> = <I>(a: A) => (b: B) => I;
export type Rel<A> = HeteroRel<A, A>;

export type Imply<A, B> = (from: HeteroRel<A, B>) => HeteroRel<A, B>;
export type Containment<A, B> = Pair<Imply<A, B>, Imply<B, A>>;

export type MapImply<A, B> = (from: Rel<A>) => (map: (a: A) => B) => Rel<B>;
export type Preserve<A, B> = (map: (a: A) => B) => (from: Rel<A>) => Rel<B>;
export type Preserve2<A, B, C> = (
    map: (a: A) => (b: B) => C,
) => (relA: Rel<A>) => (relB: Rel<B>) => Rel<C>;
