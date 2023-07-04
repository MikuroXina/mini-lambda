export type Paradoxical<A extends unknown[], R> = (self: Paradoxical<A, R>) => (...args: A) => R;

export const fix = <A extends unknown[], R>(
    def: (self: (...args: A) => R) => (...args: A) => R,
): ((...args: A) => R) =>
    ((x: Paradoxical<A, R>) => def((...lazyArgs) => x(x)(...lazyArgs)))((x: Paradoxical<A, R>) =>
        def((...lazyArgs) => x(x)(...lazyArgs)),
    );
