export type Bool = <X>(x: X) => <Y>(y: Y) => X | Y;

export const TRUE: Bool =
    <X>(x: X) =>
    <Y>(_y: Y): X =>
        x;
export const FALSE: Bool =
    <X>(_x: X) =>
    <Y>(y: Y): Y =>
        y;

export const ifThenElse =
    (condition: Bool) =>
    <T>(ifTrue: T) =>
    <F>(ifFalse: F) =>
        condition(ifTrue)(ifFalse);

export const and =
    (p: Bool) =>
    (q: Bool): Bool =>
        p(q)(p);
export const or =
    (p: Bool) =>
    (q: Bool): Bool =>
        p(p)(q);
export const not = (p: Bool): Bool => p(FALSE)(TRUE);
export const xor =
    (p: Bool) =>
    (q: Bool): Bool =>
        p(not(q))(q);
