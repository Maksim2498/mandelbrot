type DeepWritable<T> = T extends ReadonlyArray<any>            ? DeepWritableTuple<T>
                     : T extends Function                      ? T
                     : T extends ReadonlyMap<infer K, infer V> ? DeepWritableMap<K, V>
                     : T extends ReadonlySet<infer E>          ? DeepWritableSet<E>
                     : T extends object                        ? DeepWritableObject<T>
                     : T

// Works for tuples of size < 8

type DeepWritableTuple<T extends ReadonlyArray<any>> =
      T extends [infer _0, infer _1, infer _2, infer _3, infer _4, infer _5]
    ? readonly [DeepWritable<_0>, DeepWritable<_1>, DeepWritable<_3>, DeepWritable<_4>, DeepWritable<_5>]
    : T extends [infer _0, infer _1, infer _2, infer _3, infer _4]
    ? readonly [DeepWritable<_0>, DeepWritable<_1>, DeepWritable<_3>, DeepWritable<_4>]
    : T extends [infer _0, infer _1, infer _2, infer _3]
    ? readonly [DeepWritable<_0>, DeepWritable<_1>, DeepWritable<_3>]
    : T extends [infer _0, infer _1, infer _2]
    ? readonly [DeepWritable<_0>, DeepWritable<_1>, DeepWritable<_2>]
    : T extends [infer _0, infer _1]
    ? readonly [DeepWritable<_0>, DeepWritable<_1>]
    : T extends [infer _0]
    ? readonly [DeepWritable<_0>]
    : T extends []
    ? readonly []

    : T extends [infer _0, infer _1, infer _2, infer _3, infer _4, infer _5, infer _6, ...(infer R)[]]
    ? readonly [DeepWritable<_0>, DeepWritable<_1>, DeepWritable<_3>, DeepWritable<_4>, DeepWritable<_5>, DeepWritable<_6>, ...DeepWritable<R>[]]
    : T extends [infer _0, infer _1, infer _2, infer _3, infer _4, infer _5, ...(infer R)[]]
    ? readonly [DeepWritable<_0>, DeepWritable<_1>, DeepWritable<_3>, DeepWritable<_4>, DeepWritable<_5>, ...DeepWritable<R>[]]
    : T extends [infer _0, infer _1, infer _2, infer _3, infer _4, ...(infer R)[]]
    ? readonly [DeepWritable<_0>, DeepWritable<_1>, DeepWritable<_3>, DeepWritable<_4>, ...DeepWritable<R>[]]
    : T extends [infer _0, infer _1, infer _2, infer _3, ...(infer R)[]]
    ? readonly [DeepWritable<_0>, DeepWritable<_1>, DeepWritable<_3>, ...DeepWritable<R>[]]
    : T extends [infer _0, infer _1, infer _2, ...(infer R)[]]
    ? readonly [DeepWritable<_0>, DeepWritable<_1>, DeepWritable<_2>, ...DeepWritable<R>[]]
    : T extends [infer _0, infer _1, ...(infer R)[]]
    ? readonly [DeepWritable<_0>, DeepWritable<_1>, ...DeepWritable<R>[]]
    : T extends [infer _0, ...(infer R)[]]
    ? readonly [DeepWritable<_0>, ...DeepWritable<R>[]]

    : T extends (infer E)[]
    ? DeepWritableArray<E>
    : never

interface DeepWritableArray<T> extends Array<DeepWritable<T>> {}

interface DeepWritableMap<K, V> extends Map<DeepWritable<K>, DeepWritable<V>> {}

interface DeepWritableSet<T> extends Set<DeepWritable<T>> {}

type DeepWritableObject<T> = {
    -readonly [P in keyof T]: DeepWritable<T[P]>
}

export default DeepWritable