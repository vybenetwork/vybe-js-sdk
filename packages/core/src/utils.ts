export const isBrowser = typeof window !== 'undefined' && typeof window.document !== 'undefined'

export type ResolverTuple<T> = [Error | undefined, T?]

export const resolver = <T>(promise: Promise<T>): Promise<ResolverTuple<T>> =>
  promise.then((data: T): ResolverTuple<T> => [undefined, data]).catch((e: Error): ResolverTuple<T> => [e])
