import type { Get, Paths } from 'type-fest';

type Fn = (...a: any[]) => any;

// All dot-paths that end at methods
export type MethodPath<T> = {
    [P in Extract<Paths<T>, string>]: Get<T, P> extends Fn ? P : never;
}[Extract<Paths<T>, string>];
