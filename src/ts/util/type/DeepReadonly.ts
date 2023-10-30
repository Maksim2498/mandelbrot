type DeepReadonly<T> = T extends Array<any>            ? DeepReadonlyTuple<T>
                     : T extends Function              ? T
                     : T extends Map<infer K, infer V> ? DeepReadonlyMap<K, V>
                     : T extends Set<infer E>          ? DeepReadonlySet<E>
                     : T extends object                ? DeepReadonlyObject<T>
                     : T

// Works for tuples of size < 8

type DeepReadonlyTuple<T extends Array<any>> =
      T extends [infer _0, infer _1, infer _2, infer _3, infer _4, infer _5]
    ? readonly [DeepReadonly<_0>, DeepReadonly<_1>, DeepReadonly<_3>, DeepReadonly<_4>, DeepReadonly<_5>]
    : T extends [infer _0, infer _1, infer _2, infer _3, infer _4]
    ? readonly [DeepReadonly<_0>, DeepReadonly<_1>, DeepReadonly<_3>, DeepReadonly<_4>]
    : T extends [infer _0, infer _1, infer _2, infer _3]
    ? readonly [DeepReadonly<_0>, DeepReadonly<_1>, DeepReadonly<_3>]
    : T extends [infer _0, infer _1, infer _2]
    ? readonly [DeepReadonly<_0>, DeepReadonly<_1>, DeepReadonly<_2>]
    : T extends [infer _0, infer _1]
    ? readonly [DeepReadonly<_0>, DeepReadonly<_1>]
    : T extends [infer _0]
    ? readonly [DeepReadonly<_0>]
    : T extends []
    ? readonly []

    : T extends [infer _0, infer _1, infer _2, infer _3, infer _4, infer _5, infer _6, ...(infer R)[]]
    ? readonly [DeepReadonly<_0>, DeepReadonly<_1>, DeepReadonly<_3>, DeepReadonly<_4>, DeepReadonly<_5>, DeepReadonly<_6>, ...DeepReadonly<R>[]]
    : T extends [infer _0, infer _1, infer _2, infer _3, infer _4, infer _5, ...(infer R)[]]
    ? readonly [DeepReadonly<_0>, DeepReadonly<_1>, DeepReadonly<_3>, DeepReadonly<_4>, DeepReadonly<_5>, ...DeepReadonly<R>[]]
    : T extends [infer _0, infer _1, infer _2, infer _3, infer _4, ...(infer R)[]]
    ? readonly [DeepReadonly<_0>, DeepReadonly<_1>, DeepReadonly<_3>, DeepReadonly<_4>, ...DeepReadonly<R>[]]
    : T extends [infer _0, infer _1, infer _2, infer _3, ...(infer R)[]]
    ? readonly [DeepReadonly<_0>, DeepReadonly<_1>, DeepReadonly<_3>, ...DeepReadonly<R>[]]
    : T extends [infer _0, infer _1, infer _2, ...(infer R)[]]
    ? readonly [DeepReadonly<_0>, DeepReadonly<_1>, DeepReadonly<_2>, ...DeepReadonly<R>[]]
    : T extends [infer _0, infer _1, ...(infer R)[]]
    ? readonly [DeepReadonly<_0>, DeepReadonly<_1>, ...DeepReadonly<R>[]]
    : T extends [infer _0, ...(infer R)[]]
    ? readonly [DeepReadonly<_0>, ...DeepReadonly<R>[]]

    : T extends (infer E)[]
    ? DeepReadonlyArray<E>
    : never

interface DeepReadonlyArray<T> extends ReadonlyArray<DeepReadonly<T>> {}

interface DeepReadonlyMap<K, V> extends ReadonlyMap<DeepReadonly<K>, DeepReadonly<V>> {}

interface DeepReadonlySet<T> extends ReadonlySet<DeepReadonly<T>> {}

type DeepReadonlyObject<T> = {
    readonly [P in keyof T]: DeepReadonly<T[P]>
}

export default DeepReadonly