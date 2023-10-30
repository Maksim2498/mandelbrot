import toBool     from "glsl/cast/toBool.glsl"
import toInt      from "glsl/cast/toInt.glsl"
import toFloat    from "glsl/cast/toFloat.glsl"
import toComplex  from "glsl/cast/toComplex.glsl"
import mulComplex from "glsl/op/mulComplex.glsl"
import divComplex from "glsl/op/divComplex.glsl"
import powComplex from "glsl/op/powComplex.glsl"
import getArg     from "glsl/complex/getArg.glsl"
import getCon     from "glsl/complex/getCon.glsl"
import getReal    from "glsl/complex/getReal.glsl"
import getImm     from "glsl/complex/getImm.glsl"

import * as type  from "./Type"
import * as def   from "./Definition"

export const MUL_COMPLEX: def.ReadonlyBuiltinFunction = def.makeBuiltinFunction(
    type.makeFunction([type.COMPLEX], type.COMPLEX),
    "<mul-complex>",
    "mulComplex",
    mulComplex,
)

export const DIV_COMPLEX: def.ReadonlyBuiltinFunction = def.makeBuiltinFunction(
    type.makeFunction([type.COMPLEX], type.COMPLEX),
    "<div-complex>",
    "divComplex",
    divComplex,
)

export const POW_COMPLEX: def.ReadonlyBuiltinFunction = def.makeBuiltinFunction(
    type.makeFunction([type.COMPLEX], type.COMPLEX),
    "<pow-complex>",
    "powComplex",
    powComplex,
)

export const ARG: def.ReadonlyBuiltinFunction = def.makeBuiltinFunction(
    type.makeFunction([type.COMPLEX], type.FLOAT),
    "arg",
    "getArg",
    getArg,
)

export const CON: def.ReadonlyBuiltinFunction = def.makeBuiltinFunction(
    type.makeFunction([type.COMPLEX], type.FLOAT),
    "con",
    "getCon",
    getCon,
)

export const REAL: def.ReadonlyBuiltinFunction = def.makeBuiltinFunction(
    type.makeFunction([type.COMPLEX], type.FLOAT),
    "real",
    "getReal",
    getReal,
)

export const IMM: def.ReadonlyBuiltinFunction = def.makeBuiltinFunction(
    type.makeFunction([type.COMPLEX], type.FLOAT),
    "imm",
    "getImm",
    getImm,
)

export const BOOL: def.ReadonlyBuiltinFunction = def.makeBuiltinFunction(
    type.makeFunction([type.COMPLEX], type.BOOL),
    "bool",
    "toBool",
    toBool,
)

export const INT: def.ReadonlyBuiltinFunction = def.makeBuiltinFunction(
    type.makeFunction([type.COMPLEX], type.INT),
    "int",
    "toInt",
    toInt,
)

export const FLOAT: def.ReadonlyBuiltinFunction = def.makeBuiltinFunction(
    type.makeFunction([type.COMPLEX], type.FLOAT),
    "float",
    "toFloat",
    toFloat,
)

export const COMPLEX: def.ReadonlyBuiltinFunction = def.makeBuiltinFunction(
    type.makeFunction([type.COMPLEX], type.COMPLEX),
    "complex",
    "toComplex",
    toComplex,
)

export const MOD: def.ReadonlyBuiltinFunction = def.makeBuiltinFunction(
    type.makeFunction([type.COMPLEX], type.FLOAT),
    "mod",
    "length",
)

export const NORM: def.ReadonlyBuiltinFunction = def.makeBuiltinFunction(
    type.makeFunction([type.COMPLEX], type.COMPLEX),
    "norm",
    "normalize",
)

export const RAD: def.ReadonlyBuiltinFunction = def.makeBuiltinFunction(
    type.makeFunction([type.FLOAT], type.FLOAT),
    "rad",
    "radians",
)

export const DEG: def.ReadonlyBuiltinFunction = def.makeBuiltinFunction(
    type.makeFunction([type.FLOAT], type.FLOAT),
    "deg",
    "degrees",
)

export const SIN: def.ReadonlyBuiltinFunction = def.makeBuiltinFunction(
    type.makeFunction([type.FLOAT], type.FLOAT),
    "sin",
    "sin",
)

export const COS: def.ReadonlyBuiltinFunction = def.makeBuiltinFunction(
    type.makeFunction([type.FLOAT], type.FLOAT),
    "cos",
    "cos",
)

export const TAN: def.ReadonlyBuiltinFunction = def.makeBuiltinFunction(
    type.makeFunction([type.FLOAT], type.FLOAT),
    "tan",
    "tan",
)

export const ASIN: def.ReadonlyBuiltinFunction = def.makeBuiltinFunction(
    type.makeFunction([type.FLOAT], type.FLOAT),
    "asin",
    "asin",
)

export const ACOS: def.ReadonlyBuiltinFunction = def.makeBuiltinFunction(
    type.makeFunction([type.FLOAT], type.FLOAT),
    "acos",
    "acos",
)

export const ATAN: def.ReadonlyBuiltinFunction = def.makeBuiltinFunction(
    type.makeFunction([type.FLOAT], type.FLOAT),
    "atan",
    "atan",
)

export const COORD: def.ReadonlyBuiltinValue = def.makeBuiltinValue(
    type.COMPLEX,
    "COORD",
    "uv",
)

export const PI: def.ReadonlyBuiltinValue = def.makeBuiltinValue(
    type.FLOAT,
    "PI",
    "3.14159265359",
)

export const E: def.ReadonlyBuiltinValue = def.makeBuiltinValue(
    type.FLOAT,
    "E",
    "2.71828182846",
)