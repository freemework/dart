/**
 * Remove readonly modifier for all properties in T. Opposite util for `Readonly<T>`.
 */
export type FUtilUnReadonly<T> = {
	-readonly [P in keyof T]: T[P];
};
