import DeepReadonly from "ts/util/type/DeepReadonly"
import DeepWritable from "ts/util/type/DeepWritable"

// ================================================================

export type FunctionGroup = "function"
export type ValueGroup    = "value"

export type Group         = FunctionGroup
                          | ValueGroup

// ----------------------------------------------------------------

export type UnitKind    = "unit"
export type BoolKind    = "bool"
export type IntKind     = "int"
export type FloatKind   = "float"
export type ComplexKind = "complex"

export type RealKind    = BoolKind
                        | IntKind
                        | FloatKind

export type NumberKind  = IntKind
                        | FloatKind
                        | ComplexKind

export type NumericKind = RealKind
                        | ComplexKind

export type Kind        = UnitKind
                        | NumericKind

// ================================================================

export interface Base<G extends Group> {
    group: G
}

export interface Function extends Base<FunctionGroup> {
    argTypes:   Type[]
    returnType: Type
}

export interface ValueBase<K extends Kind> extends Base<ValueGroup> {
    group: ValueGroup
    kind:  K
}


export interface ReadonlyBase<G extends Group> extends Readonly<Base<G>> {}
export interface ReadonlyFunction extends DeepReadonly<Function> {}
export interface ReadonlyValueBase<K extends Kind> extends Readonly<ValueBase<K>> {}

// ----------------------------------------------------------------

export interface NumericBase<K extends NumericKind> extends ValueBase<K>   {}
export interface RealBase<K extends RealKind>       extends NumericBase<K> {}
export interface NumberBase<K extends NumberKind>   extends NumericBase<K> {}


export interface Unit    extends ValueBase<UnitKind>    {}
export interface Bool    extends RealBase<BoolKind>     {}
export interface Int     extends RealBase<IntKind>      {}
export interface Float   extends RealBase<FloatKind>    {}
export interface Complex extends ValueBase<ComplexKind> {}

export type Real    = Bool
                    | Int
                    | Float

export type Numeric = Real
                    | Complex

export type Number  = Int
                    | Float
                    | Complex

export type Value   = Unit
                    | Numeric


export interface ReadonlyNumericBase<K extends NumericKind> extends Readonly<NumericBase<K>> {}
export interface ReadonlyRealBase<K extends RealKind>       extends Readonly<RealBase<K>> {}
export interface ReadonlyNumberBase<K extends NumberKind>   extends Readonly<NumberBase<K>> {}

export interface ReadonlyUnit    extends Readonly<Unit>    {}
export interface ReadonlyBool    extends Readonly<Bool>    {}
export interface ReadonlyInt     extends Readonly<Int>     {}
export interface ReadonlyFloat   extends Readonly<Float>   {}
export interface ReadonlyComplex extends Readonly<Complex> {}

export type ReadonlyReal    = Readonly<Real>
export type ReadonlyNumeric = Readonly<Numeric>
export type ReadonlyNumber  = Readonly<Number>
export type ReadonlyValue   = Readonly<Value>

// ----------------------------------------------------------------

export type Type = Function
                 | Value


export type ReadonlyType = DeepReadonly<Type>


export default Type

// ================================================================

export const UNIT: ReadonlyUnit = {
    group: "value",
    kind:  "unit",
}

// ----------------------------------------------------------------

export const BOOL: ReadonlyBool = {
    group: "value",
    kind:  "bool",
}

// ----------------------------------------------------------------

export const INT: ReadonlyInt = {
    group: "value",
    kind:  "int",
}

// ----------------------------------------------------------------

export const FLOAT: ReadonlyFloat = {
    group: "value",
    kind:  "float",
}

// ----------------------------------------------------------------

export const COMPLEX: ReadonlyComplex = {
    group: "value",
    kind:  "complex",
}

// ================================================================

export function makeFunction(argTypes: Type[], returnType: Type): Function

export function makeFunction(
    argTypes:   readonly ReadonlyType[],
    returnType: ReadonlyType,
): ReadonlyFunction

export function makeFunction(
    argTypes:   readonly ReadonlyType[],
    returnType: ReadonlyType,
): ReadonlyFunction {
    return {
        group: "function",
        returnType,
        argTypes,
    }
}

// ----------------------------------------------------------------

export function clone(type: Function): Function
export function clone<K extends Kind, T = Extract<Value, { kind: K }>>(type: T): DeepWritable<T>
export function clone(type: ReadonlyType): Type

export function clone(type: ReadonlyType): Type {
    switch (type.group) {
        case "function":
            return {
                group:      "function",
                returnType: clone(type.returnType),
                argTypes:   type.argTypes.map(clone),
            }

        case "value":
            return { ...type }

        default:
            const check: never = type
            throw new Error("never")
    }
}

// ----------------------------------------------------------------

// Read "Are castable to each other"
export function areCompatible(first: ReadonlyType, second: ReadonlyType): boolean {
    if (areSame(first, second))
        return true

    if (isUnit(first) || isUnit(second))
        return false

    if (isBool(first) || isBool(second))
        return true
    
    return !isFunction(first) && !isFunction(second)
}

// ----------------------------------------------------------------

export function isCastableTo(from: ReadonlyType, to: ReadonlyType): boolean {
    if (areSame(from, to))
        return true

    if (isUnit(from) || isUnit(to))
        return false

    if (isBool(to))
        return true

    if (isFunction(from) || isFunction(to))
        return false

    return getPrecedence(from) <= getPrecedence(to)
}

// ----------------------------------------------------------------

export function common(first: ReadonlyValue, second: ReadonlyValue): ReadonlyValue
export function common(first: Value,         second: Value        ): Value

export function common(first: Value, second: Value): Value {
    return getPrecedence(first) >= getPrecedence(second)
         ? first
         : second
}

// ----------------------------------------------------------------

export function getPrecedence(value: ReadonlyValue): number {
    switch (value.kind) {
        case "unit":
            return 0

        case "bool":
            return 1

        case "int":
            return 2

        case "float":
            return 3

        case "complex":
            return 4

        default:
            const check: never = value
            return -1
    }
}

// ----------------------------------------------------------------

export function areSame(lhs: ReadonlyType, rhs: ReadonlyType): boolean {
    if (lhs.group !== rhs.group)
        return false

    switch (lhs.group) {
        case "function":
            const rhsFunction = rhs as Function

            if (lhs.returnType !== rhsFunction.returnType)
                return false

            if (lhs.argTypes.length !== rhsFunction.argTypes.length)
                return false

            for (let i = 0; i < lhs.argTypes.length; ++i)
                if (!areSame(lhs.argTypes[i], rhsFunction.argTypes[i]))
                    return false

            return true

        case "value":
            return lhs.kind === (rhs as Value).kind

        default:
            const check: never = lhs
            return false
    }
}

// ----------------------------------------------------------------

export function isNumeric(type: Type        ): type is Numeric
export function isNumeric(type: ReadonlyType): type is ReadonlyNumeric

export function isNumeric(type: ReadonlyType): type is ReadonlyNumeric {
    switch (type.group) {
        case "function":
            return false

        case "value":
            switch (type.kind) {
                case "unit":
                    return false
                    
                case "bool":
                case "int":
                case "float":
                case "complex":
                    return true

                default:
                    const check: never = type
            }

        default:
            const check: never = type
    }

    return false
}

// ----------------------------------------------------------------

export function isUnit(type: Type):         type is Unit
export function isUnit(type: ReadonlyType): type is ReadonlyUnit

export function isUnit(type: ReadonlyType): type is ReadonlyUnit {
    return isValueOfKind(type, "unit")
}

// ----------------------------------------------------------------

export function isBool(type: Type        ): type is Bool
export function isBool(type: ReadonlyType): type is ReadonlyBool

export function isBool(type: ReadonlyType): type is ReadonlyBool {
    return isValueOfKind(type, "bool")
}

// ----------------------------------------------------------------

export function isInt(type: Type        ): type is Int
export function isInt(type: ReadonlyType): type is ReadonlyInt

export function isInt(type: ReadonlyType): type is ReadonlyInt {
    return isValueOfKind(type, "int")
}

// ----------------------------------------------------------------

export function isFloat(type: Type        ): type is Float
export function isFloat(type: ReadonlyType): type is ReadonlyFloat

export function isFloat(type: ReadonlyType): type is ReadonlyFloat {
    return isValueOfKind(type, "float")
}

// ----------------------------------------------------------------

export function isComplex(type: Type        ): type is ReadonlyComplex
export function isComplex(type: ReadonlyType): type is Complex

export function isComplex(type: ReadonlyType): type is ReadonlyComplex {
    return isValueOfKind(type, "complex")
}

// ----------------------------------------------------------------

export function isValueOfKind(type: ReadonlyType, kind: Kind): boolean {
    return type.group === "value"
        && type.kind  === kind
}

// ----------------------------------------------------------------

export function isFunction(type: Type        ): type is Function
export function isFunction(type: ReadonlyType): type is ReadonlyFunction

export function isFunction(type: ReadonlyType): type is ReadonlyFunction {
    return type.group === "function"
}

// ----------------------------------------------------------------

export function isValue(type: Type        ): type is Value
export function isValue(type: ReadonlyType): type is ReadonlyValue

export function isValue(type: ReadonlyType): type is ReadonlyValue {
    return type.group === "value"
}

// ----------------------------------------------------------------

export function toGLSLString(type: ReadonlyValue): string {
    switch (type.kind) {
        case "unit":
            return "void"

        case "bool":
        case "int":
        case "float":
            return type.kind

        case "complex":
            return "vec2"

        default:
            const check: never = type
            return ""
    }
}

// ----------------------------------------------------------------

export function toString(type: ReadonlyType): string {
    switch (type.group) {
        case "function":
            return `(${type.argTypes.map(toString).join(", ")}) -> ${toString(type.returnType)}`

        case "value":
            return type.kind

        default:
            const check: never = type
            return ""
    }
}