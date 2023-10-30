import DeepReadonly from "ts/util/type/DeepReadonly"

import * as t       from "./Type"

// ================================================================

export type UserGroup    = "user"
export type BuiltinGroup = "builtin"

export type Group        = UserGroup
                         | BuiltinGroup

// ----------------------------------------------------------------

export type ValueKind    = "value"
export type FunctionKind = "function"

export type Kind         = ValueKind
                         | FunctionKind

// ================================================================

export interface Base<
    G extends Group,
    K extends Kind,
    T extends (
        K extends ValueKind
            ? K extends FunctionKind
                ? t.Value | t.Function
                : t.Value
            : K extends FunctionKind
                ? t.Function
                : never
    ),
> {
    group: G
    kind:  K
    type:  T
    id:    string
}


export interface ReadonlyBase<
    G extends Group,
    K extends Kind,
    T extends (
        K extends ValueKind
            ? K extends FunctionKind
                ? t.Value | t.Function
                : t.Value
            : K extends FunctionKind
                ? t.Function
                : never
    ),
> extends DeepReadonly<Base<G, K, T>> {}

// ----------------------------------------------------------------

export interface ValueBase<G extends Group>    extends Base<G, ValueKind,    t.Value   > {}
export interface FunctionBase<G extends Group> extends Base<G, FunctionKind, t.Function> {}


export interface ReadonlyValueBase<G extends Group>    extends DeepReadonly<ValueBase<G>   > {}
export interface ReadonlyFunctionBase<G extends Group> extends DeepReadonly<FunctionBase<G>> {}

// ----------------------------------------------------------------

export interface UserValue    extends ValueBase<UserGroup>    {}
export interface UserFunction extends FunctionBase<UserGroup> {}

export type User = UserValue
                 | UserFunction


export interface ReadonlyUserValue    extends DeepReadonly<UserValue   > {}
export interface ReadonlyUserFunction extends DeepReadonly<UserFunction> {}

export type ReadonlyUser = DeepReadonly<User>

// ----------------------------------------------------------------

export interface BuiltinValue extends ValueBase<BuiltinGroup> {
    name: string
}

export interface BuiltinFunction extends FunctionBase<BuiltinGroup> {
    name:  string
    code?: string
}

export type Builtin = BuiltinValue
                    | BuiltinFunction


export interface ReadonlyBuiltinValue    extends DeepReadonly<BuiltinValue   > {}
export interface ReadonlyBuiltinFunction extends DeepReadonly<BuiltinFunction> {}

export type ReadonlyBuiltin = DeepReadonly<Builtin>

// ----------------------------------------------------------------

export type Value    = UserValue
                     | BuiltinValue

export type Function = UserFunction
                     | BuiltinFunction


export type ReadonlyValue    = DeepReadonly<Value   >
export type ReadonlyFunction = DeepReadonly<Function>

// ----------------------------------------------------------------

export type Definition = User
                       | Builtin

export type ReadonlyDefinition = DeepReadonly<Definition>

export default Definition

// ================================================================

export function clone(definition: ReadonlyDefinition): Definition {
    // Idk why compiler complains without casting to any
    // Everything seems to be correct

    return {
        ...definition,
        type: t.clone(definition.type),
    } as any
}

// ----------------------------------------------------------------

export function isFunction(definition: Definition        ): definition is Function
export function isFunction(definition: ReadonlyDefinition): definition is ReadonlyFunction

export function isFunction(definition: ReadonlyDefinition): definition is ReadonlyFunction {
    return definition.kind === "function"
}

// ----------------------------------------------------------------

export function isValue(definition: Definition):         definition is Value
export function isValue(definition: ReadonlyDefinition): definition is ReadonlyValue

export function isValue(definition: ReadonlyDefinition): definition is ReadonlyValue {
    return definition.kind === "value"
}

// ----------------------------------------------------------------

export function isUser(definition: Definition        ): definition is User
export function isUser(definition: ReadonlyDefinition): definition is ReadonlyUser

export function isUser(definition: ReadonlyDefinition): definition is ReadonlyUser {
    return definition.group === "user"
}

// ----------------------------------------------------------------

export function isBuiltin(definition: Definition        ): definition is Builtin
export function isBuiltin(definition: ReadonlyDefinition): definition is ReadonlyBuiltin

export function isBuiltin(definition: ReadonlyDefinition): definition is ReadonlyBuiltin {
    return definition.group === "builtin"
}

// ----------------------------------------------------------------

export function makeUser(type: t.Type,         id: string): User
export function makeUser(type: t.ReadonlyType, id: string): ReadonlyUser

export function makeUser(type: t.ReadonlyType, id: string): ReadonlyUser {
    return type.group === "value" ? makeUserValue(type, id)
                                  : makeUserFunction(type, id)
}

// ----------------------------------------------------------------

export function makeUserValue(type: t.Value,         id: string): UserValue
export function makeUserValue(type: t.ReadonlyValue, id: string): ReadonlyUserValue

export function makeUserValue(type: t.ReadonlyValue, id: string): ReadonlyUserValue {
    return {
        group: "user",
        kind:  "value",
        type,
        id,
    }
}

// ----------------------------------------------------------------

export function makeUserFunction(type: t.Function,         id: string): UserFunction
export function makeUserFunction(type: t.ReadonlyFunction, id: string): ReadonlyUserFunction

export function makeUserFunction(type: t.ReadonlyFunction, id: string): ReadonlyUserFunction {
    return {
        group: "user",
        kind:  "function",
        type,
        id,
    }
}

// ----------------------------------------------------------------

export function makeBuiltinValue(type: t.Value,         id: string, name: string): BuiltinValue
export function makeBuiltinValue(type: t.ReadonlyValue, id: string, name: string): ReadonlyBuiltinValue

export function makeBuiltinValue(type: t.ReadonlyValue, id: string, name: string): ReadonlyBuiltinValue {
    return {
        group: "builtin",
        kind:  "value",
        name,
        type,
        id,
    }
}

// ----------------------------------------------------------------

export function makeBuiltinFunction(
    type:  t.Function,
    id:    string,
    name:  string,
    code?: string,
): BuiltinFunction

export function makeBuiltinFunction(
    type:  t.ReadonlyFunction,
    id:    string,
    name:  string,
    code?: string,
): ReadonlyBuiltinFunction

export function makeBuiltinFunction(
    type:  t.ReadonlyFunction,
    id:    string,
    name:  string,
    code?: string,
): ReadonlyBuiltinFunction {
    return {
        group: "builtin",
        kind:  "function",
        code,
        name,
        type,
        id,
    }
}