import defaultTemplate     from "glsl/fragment-template.glsl"
import CodeGenerationError from "./error/CodeGenerationError"
import CodeTemplate        from "./CodeTemplate"

import * as bi             from "ts/code/lom/builtin"
import * as def            from "ts/code/lom/Definition"
import * as type           from "ts/code/lom/Type"
import * as semantic       from "ts/code//parsing/semantic/Node"

import { indent          } from "ts/util/string"
import { TAB_SIZE        } from "ts/const"

export interface Options {
    definitions?: def.ReadonlyDefinition[]
    varPrefix?:   string
}

export default class CodeGenerator {
    static readonly DEFAULT_DEFINITIONS: readonly def.ReadonlyDefinition[] = [
        bi.MUL_COMPLEX,
        bi.DIV_COMPLEX,
        bi.POW_COMPLEX,
    ]

    static readonly DEFAULT_VAR_PREFIX = "_"


    readonly definitions:               ReadonlyMap<string, def.ReadonlyDefinition>
    readonly varPrefix:                 string

    private  _usedFunctionDefinitions!: Map<string, def.ReadonlyBuiltinFunction>
    private  _initLines!:               string[]
    private  _loopBodyLines!:           string[]
    private  _loopPredicateExpr!:       string
    private  _nextTmpVarNumber!:        number

    constructor(options: Options = {}) {
        const definitions = options.definitions ?? CodeGenerator.DEFAULT_DEFINITIONS
        const varPrefix   = options.varPrefix   ?? CodeGenerator.DEFAULT_VAR_PREFIX

        this.definitions = new Map(definitions.map(d => [d.id, d]))
        this.varPrefix   = varPrefix
    }

    generateCode(tree: semantic.ReadonlyRoot): CodeTemplate {
        this._init()

        this._generateRootCode(tree)

        const template = this._makeTemplate()

        this._reset()
    
        return template
    }

    private _init() {
        this._reset()
    }

    private _reset() {
        this._usedFunctionDefinitions = new Map()
        this._initLines               = []
        this._loopBodyLines           = []
        this._loopPredicateExpr       = "false"
        this._nextTmpVarNumber        = 0
    }

    private _makeTemplate(): CodeTemplate {
        const template = new CodeTemplate()

        const functions = new Array<string>()

        for (const [_, definition] of this._usedFunctionDefinitions)
            if (definition.code != null)
                functions.push(definition.code)

        template.template     = defaultTemplate
        template.functions    = functions
        template.init         = indent(joinCodeLines(this._initLines    ),     TAB_SIZE)
        template.loopBody     = indent(joinCodeLines(this._loopBodyLines), 2 * TAB_SIZE)
        template.loopRedicate = this._loopPredicateExpr

        return template

        function joinCodeLines(lines: string[]): string {
            return lines.length !== 0 ? lines.join(";\n") + ";"
                                      : ""
        }
    }

    private _generateRootCode(root: semantic.ReadonlyRoot) {
        const [init, loop] = root.args

        this._generateExprListCode(init, this._initLines)
        this._generateLoopCode(loop)
    }

    private _generateLoopCode(loop: semantic.ReadonlyLoop) {
        for (const arg of loop.args)
            this._generateExprListCode(arg, this._loopBodyLines)

        if (this._loopBodyLines.length === 0)
            throw new CodeGenerationError("Loop is empty")

        this._loopPredicateExpr = this._loopBodyLines.pop()!
    }

    private _generateExprListCode(exprList: semantic.ReadonlyExprList, lines: string[]) {
        for (const arg of exprList.args)
            lines.push(this._generateExprCode(arg, lines))
    }

    private _generateExprCode(expr: semantic.ReadonlyExpr, lines: string[]): string {
        switch (expr.group) {
            case "=":
                return this._generateInitCode(expr, lines)

            case "+=":
            case "-=":
            case "*=":
            case "/=":
            case "^=":
                return this._generateModCode(expr, lines)

            case "|":
            case "&":
            case "==":
            case "!=":
            case "<":
            case "<=":
            case ">":
            case ">=":
            case "+":
            case "-":
            case "*":
            case "/":
            case "^":
                return this._generateBinaryOpCode(expr, lines)

            case "!":
                return this._generateLogicUnaryOpCode(expr, lines)

            case "pos":
            case "neg":
                return this._generateArithUnaryOpCode(expr, lines)

            case "cast":
                return this._generateCastCode(expr, lines)

            case "call":
                return this._generateCallCode(expr, lines)

            case "id":
                return this._generateIdCode(expr)

            case "real":
                return this._generateRealCode(expr)

            case "imm":
                return this._generateImmCode(expr)

            case "bool":
                return this._generateBoolCode(expr)

            default:
                const check: never = expr
                throw new Error("never")
        }
    }

    private _generateInitCode(init: semantic.ReadonlyInit, lines: string[]): string {
        const [id, value] = init.args
        const valueCode   = this._generateExprCode(value, lines)
        const varName     = this._makeVarName(id.definition.id)
        const prefix      = init.first
                          ? type.toGLSLString(id.type as type.Value) + " "
                          : ""

        return `${prefix}${varName} = ${valueCode}`
    }

    private _generateModCode(mod: semantic.ReadonlyMod, lines: string[]): string {
        const [id,     value    ] = mod.args
        const [idCode, valueCode] = [id, value].map(arg => this._generateExprCode(arg, lines))
        const varName             = this._makeVarName(id.definition.id)

        switch (mod.group) {
            case "+=":
            case "-=":
                return generateCommon()

            case "*=":
            case "/=":
            case "^=":
                if (!type.isComplex(id.type))
                    return generateCommon()

                let functionId!: string

                switch (mod.group) {
                    case "*=":
                        functionId = bi.MUL_COMPLEX.id
                        break

                    case "/=":
                        functionId = bi.DIV_COMPLEX.id
                        break

                    case "^=":
                        functionId = bi.POW_COMPLEX.id
                        break

                    default:
                        const check: never = mod
                }

                const functionDefinition = this.definitions.get(functionId)

                if (functionDefinition == null)
                    throw new CodeGenerationError(`Missing ${functionId} function definition`)

                if (!def.isFunction(functionDefinition) || !def.isBuiltin(functionDefinition))
                    throw new CodeGenerationError(`${functionId} must be a built-in function`)

                this._usedFunctionDefinitions.set(functionDefinition.id, functionDefinition)

                return `(${varName} = ${functionDefinition.name}(${idCode}, ${valueCode}))`

            default:
                const check: never = mod
                return ""
        }

        function generateCommon(): string {
            return `(${varName} ${mod.group} ${valueCode})`
        }
    }

    private _generateBinaryOpCode(op: semantic.ReadonlyBinaryOp, lines: string[]): string {
        const [lhs,     rhs    ] = op.args
        const [lhsCode, rhsCode] = [lhs, rhs].map(arg => this._generateExprCode(arg, lines))

        switch (op.group) {
            case "|":
            case "&":
            case "<":
            case "<=":
            case ">":
            case ">=":
            case "==":
            case "!=":
            case "+":
            case "-":
                return generateCommon()

            case "*":
            case "/":
            case "^":
                if (!type.isComplex(lhs.type))
                    return generateCommon()

                let functionId!: string

                switch (op.group) {
                    case "*":
                        functionId = bi.MUL_COMPLEX.id
                        break

                    case "/":
                        functionId = bi.DIV_COMPLEX.id
                        break

                    case "^":
                        functionId = bi.POW_COMPLEX.id
                        break

                    default:
                        const check: never = op
                }

                const functionDefinition = this.definitions.get(functionId)

                if (functionDefinition == null)
                    throw new CodeGenerationError(`Missing ${functionId} function definition`)

                if (!def.isFunction(functionDefinition) || !def.isBuiltin(functionDefinition))
                    throw new CodeGenerationError(`${functionId} must be a built-in function`)

                this._usedFunctionDefinitions.set(functionDefinition.id, functionDefinition)

                return `${functionDefinition.name}(${lhsCode}, ${rhsCode})`

            default:
                const check: never = op
                return ""
        }

        function generateCommon(): string {
            return `(${lhsCode} ${op.group} ${rhsCode})`
        }
    }

    private _generateLogicUnaryOpCode(op: semantic.ReadonlyLogicUnaryOp, lines: string[]): string {
        switch (op.group) {
            case "!":
                return `!(${this._generateExprCode(op.args[0], lines)})`
            
            default:
                const check: never = op.group
                return ""
        }
    }

    private _generateArithUnaryOpCode(op: semantic.ReadonlyArithUnaryOp, lines: string[]): string {
        const [arg]   = op.args
        const argCode = this._generateExprCode(arg, lines)

        switch (op.group) {
            case "pos":
                return `abs(${argCode})`

            case "neg":
                return "-" + argCode

            default:
                const check: never = op
                return ""
        }
    }

    private _generateCastCode(cast: semantic.ReadonlyCast, lines: string[]): string {
        const toType = cast.type

        if (type.isFunction(toType))
            throw new CodeGenerationError("Casting to function types isn't supported")

        if (type.isUnit(toType))
            throw new CodeGenerationError(`Casting to ${type.toString(toType)} type isn't supported`)

        const arg      = cast.args[0]
        const fromType = arg.type

        if (type.isFunction(fromType)) {
            if (type.isBool(toType))
                return "true"

            throw new CodeGenerationError(`Casting of function types to types other than ${type.toString(type.BOOL)} type isn't supported`)
        }

        if (type.isUnit(fromType))
            throw new CodeGenerationError(`Casting of ${type.toString(fromType)} type isn't supported`)

        const argCode = this._generateExprCode(arg, lines)

        if (fromType.kind === toType.kind)
            return argCode

        if (!type.isComplex(fromType))
            switch (toType.kind) {
                case "unit":
                    // Filtered out above
                    throw new Error("never")

                case "bool":
                    return `bool(${argCode})`

                case "int":
                    return `int(${argCode})`

                case "float":
                    return `float(${argCode})`

                case "complex":
                    return `vec2(${argCode}, 0)`

                default:
                    const check: never = toType
                    return ""
            }

        const tmpArgVar = this._generateTmpVarCode(argCode, type.COMPLEX, lines)

        switch (toType.kind) {
            case "unit":
            case "complex":
                // Checked above
                throw new Error("never")

            case "bool":
                return `(${tmpArgVar}.x != 0 && ${tmpArgVar}.y != 0)`

            case "int":
                return `int(${tmpArgVar}.x)`

            case "float":
                return `float(${tmpArgVar}.x)`

            default:
                const check: never = toType
                return ""
        }
    }

    private _generateCallCode(call: semantic.ReadonlyCall, lines: string[]): string {
        const id   = this._generateIdCode(call.args[0])
        const args = call.args.slice(1).map(arg => {
            if (type.isFunction(arg.type))
                throw new CodeGenerationError("Function-type arguments aren't supported")

            return this._generateTmpVarCode(
                this._generateExprCode(arg, lines),
                arg.type,
                lines,
            )
        })

        return `${id}(${args.join(", ")})`
    }

    private _generateIdCode(id: semantic.ReadonlyId): string {
        if (def.isFunction(id.definition)) {
            if (def.isUser(id.definition))
                throw new CodeGenerationError("User-defined functions aren't supported")

            this._usedFunctionDefinitions.set(id.definition.id, id.definition)

            return id.definition.name
        }

        return def.isUser(id.definition) ? this._makeVarName(id.definition.id)
                                         : (id.definition as def.Builtin).name
    }

    private _generateRealCode(real: semantic.ReadonlyReal): string {
        return `${type.toGLSLString(real.type)}(${real.value})`
    }

    private _generateImmCode(imm: semantic.ReadonlyImm): string {
        return `vec2(0, ${imm.value})`
    }

    private _generateBoolCode(bool: semantic.ReadonlyBool): string {
        return bool.value ? "true" : "false"
    }

    private _generateTmpVarCode(code: string, varType: type.Value, lines: string[]): string {
        const varName = this._makeNextTmpVarName()
        const varDef  = `${type.toGLSLString(varType)} ${varName} = ${code}`

        lines.push(varDef)

        return varName
    }

    private _makeNextTmpVarName(): string {
        return this._makeVarName((this._nextTmpVarNumber++).toString())
    }

    private _makeVarName(id: string): string {
        return this.varPrefix + id
    }
}