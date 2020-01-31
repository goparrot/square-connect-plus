export async function sleep(timeout: number): Promise<void> {
    return new Promise((resolve: any): any => setTimeout(resolve, timeout));
}

/**
 * Simple object check.
 * @returns {boolean}
 */
export function isObject<T = any>(item?: T): item is T {
    return !!item && 'object' === typeof item && !Array.isArray(item);
}

/**
 * @link {https://stackoverflow.com/a/34749873/3408246}
 * Deep merge props of two objects
 */
export function mergeDeepProps<T = any, S = T>(target: T, ...sources: S[]): T {
    if (!sources.length) return target;
    const source: S | undefined = sources.shift();

    if (isObject<T>(target) && isObject<S>(source)) {
        for (const key in source) {
            if (isObject(source[key])) {
                // @ts-ignore
                if (!target[key]) {
                    Object.assign(target, { [key]: {} });
                }

                mergeDeepProps<T, S>(
                    // @ts-ignore
                    target[key],
                    // @ts-ignore
                    source[key],
                );
            } else {
                Object.assign(target, { [key]: source[key] });
            }
        }
    }

    return mergeDeepProps(target, ...sources);
}
