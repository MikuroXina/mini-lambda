import { type Bool, and } from "./bool.js";
import { type Nat, isZero, sub, succ } from "./nat.js";

export const lessThan =
    (m: Nat) =>
    (n: Nat): Bool =>
        // m < n  ===  m - n < 0  ===  m - n + 1 <= 0
        isZero(sub(succ(m))(n));

export const greaterThan =
    (m: Nat) =>
    (n: Nat): Bool =>
        lessThan(n)(m);

export const lessThanOrEqualTo =
    (m: Nat) =>
    (n: Nat): Bool =>
        // m <= n  ===  m - n <= 0
        isZero(sub(m)(n));

export const greaterThanOrEqualTo =
    (m: Nat) =>
    (n: Nat): Bool =>
        lessThanOrEqualTo(n)(m);

export const equalTo =
    (m: Nat) =>
    (n: Nat): Bool =>
        and(lessThanOrEqualTo(m)(n))(greaterThanOrEqualTo(m)(n));
