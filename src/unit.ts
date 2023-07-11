export type Unit = <I>(tt: () => I) => I;
export const unit: Unit = (x) => x();
