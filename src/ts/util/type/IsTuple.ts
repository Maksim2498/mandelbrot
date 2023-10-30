// Works for tuples of size < 8

type IsTuple<F> =
    F extends []
            | [any]
            | [any, any]
            | [any, any, any]
            | [any, any, any, any]
            | [any, any, any, any, any]
            | [any, any, any, any, any, any]
            | [any, any, any, any, any, any, any]
    ? true
    : false

export default IsTuple