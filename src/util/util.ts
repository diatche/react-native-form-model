/**
 * Returns a list of typed keys of the object.
 *
 * Explicitly set the type `Keys` to ensure type safety works.
 * If you have an interface, use `safeKeyList<keyof YourInterface>({ ...keys })`.
 *
 * Using a typed object ensures type safety.
 * Any changes to keys are caught by static type analysis.
 *
 * @param input An object with all the keys of `Keys`. The values do not matter.
 */
export function safeKeyList<Keys extends string | number | symbol>(input: {
    [K in Keys]: any;
}): readonly Keys[] {
    return Object.keys(input) as Keys[];
}
