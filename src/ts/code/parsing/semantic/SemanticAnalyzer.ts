import SemanticError from "./error/SemanticError"

import * as def      from "ts/code/lom/Definition"
import * as type     from "ts/code/lom/Type"
import * as syntax   from "ts/code/parsing/syntax/Node"
import * as semantic from "./Node"

import * as bi       from "ts/code/lom/builtin"

export interface Options {
    readonly definitions?: readonly def.ReadonlyBuiltin[]
    readonly simplify?:    boolean
}

interface PosInfo {
    code: string
    pos:  number
}

export default class SemanticAnalyzer {
    static readonly DEFAULT_DEFINITIONS: readonly def.ReadonlyBuiltin[] = [
        bi.ACOS,
        bi.ACOS,
        bi.ASIN,
        bi.ATAN,
        bi.COS,
        bi.CON,
        bi.DEG,
        bi.IMM,
        bi.MOD,
        bi.NORM,
        bi.RAD,
        bi.REAL,
        bi.SIN,
        bi.TAN,
        bi.BOOL,
        bi.COMPLEX,
        bi.FLOAT,
        bi.INT,
        bi.COORD,
        bi.MILLIS,
        bi.PI,
        bi.E,
    ]

    static readonly DEFAULT_SIMPLIFY:    boolean = true


    readonly definitions:          ReadonlyMap<string, def.ReadonlyDefinition>
    readonly simplify:             boolean

    private  _currentDefinitions!: Map<string, def.ReadonlyDefinition>

    constructor(options: Options = {}) {
        const definitions   = options.definitions ?? SemanticAnalyzer.DEFAULT_DEFINITIONS
        const simplify      = options.simplify    ?? SemanticAnalyzer.DEFAULT_SIMPLIFY

        this.definitions = new Map(definitions.map(d => [d.id, d]))
        this.simplify    = simplify
    }

    analyzeSemantic(tree: syntax.ReadonlyRoot): semantic.Root {
        this._currentDefinitions = new Map(this.definitions)

        const semanticTree = this._analyzeRoot(tree)

        this._currentDefinitions.clear()

        return this.simplify ? this._simplifyRoot(semanticTree)
                             : semanticTree
    }

    private _analyzeRoot(tree: syntax.ReadonlyRoot): semantic.Root {
        const [init, loop] = tree.args

        return semantic.makeRoot(
            this._analyzeExprList(init),
            this._analyzeLoop(loop),
        )
    }

    private _analyzeLoop(loop: syntax.ReadonlyLoop): semantic.Loop {
        const [body, predicate] = loop.args.map(node => this._analyzeExprList(node))

        if (predicate.args.length === 0)
            this._emptyLoopPredicate(loop.args[1])

        const lastExprIndex = predicate.args.length - 1
        const lastExpr      = predicate.args[lastExprIndex]

        if (!type.isCastableTo(lastExpr.type, type.BOOL)) {
            const predicateSyntax = loop.args[1]
            const lastExprSyntax  = predicateSyntax.args[predicateSyntax.args.length - 1]

            this._cannotBeCasted(lastExpr.type, type.BOOL, lastExprSyntax)
        }

        predicate.args[lastExprIndex] = semantic.makeUnaryOp("cast", type.BOOL, lastExpr)

        return semantic.makeLoop(body, predicate)
    }

    private _analyzeExprList(exprList: syntax.ReadonlyExprList): semantic.ExprList {
        return semantic.makeExprList(exprList.args.map(arg => this._analyzeExpr(arg)))
    }

    private _analyzeExpr(expr: syntax.ReadonlyExpr): semantic.Expr {
        switch (expr.group) {
            case "=":
                return this._analyzeInit(expr)

            case "+=":
            case "-=":
            case "*=":
            case "/=":
            case "^=":
                return this._analyzeMod(expr)

            case "|":
            case "&":
                return this._analyzeLogicBinaryOp(expr)

            case "==":
            case "!=":
                return this._analyzeEqBinaryOp(expr)

            case "<":
            case "<=":
            case ">":
            case ">=":
                return this._analyzeCmpBinaryOp(expr)

            case "+":
            case "-":
            case "*":
            case "/":
            case "^":
                return this._analyzeArithBinaryOp(expr)

            case "!":
                return this._analyzeLogicUnaryOp(expr)

            case "pos":
            case "neg":
                return this._analyzeArithUnaryOp(expr)

            case "call":
                return this._analyzeCall(expr)

            case "id":
                return this._analyzeId(expr)

            case "real":
                return semantic.makeReal(expr.value)

            case "imm":
                return semantic.makeImm(expr.value)

            case "bool":
                return semantic.makeBool(expr.value)

            default:
                const check: never = expr
                throw new Error("never")
        }
    }

    private _analyzeInit(init: syntax.ReadonlyInit): semantic.Init {
        const [idSyntax, valueSyntax] = init.args

        let value = this._analyzeExpr(valueSyntax)

        if (!type.isNumeric(value.type))
            this._badAssignmentType(value.type, valueSyntax)

        let definition = this._currentDefinitions.get(idSyntax.id)
        let first      = false

        if (definition == null) {
            definition = def.makeUser(value.type, idSyntax.id)
            first      = true

            this._currentDefinitions.set(definition.id, definition)
        } else {
            if (def.isBuiltin(definition))
                this._builtinUpdate(init)

            if (!type.isCastableTo(value.type, definition.type))
                this._cannotBeCasted(value.type, definition.type, valueSyntax)

            value = semantic.makeUnaryOp(
                "cast",
                // As it's not built-in definition it's created during semantic analysis
                // and therefore may be safely casted to writable Type
                definition.type as type.Type,
                value,
            )
        }

        // All non-value definitions are filtered out above
        const id = semantic.makeId(definition as def.Value)

        return semantic.makeAssign("=", id, value, first)
    }

    private _analyzeMod(mod: syntax.ReadonlyMod): semantic.Mod {
        const [idSyntax, valueSyntax] = mod.args
        const id                      = this._analyzeId(idSyntax)

        if (def.isBuiltin(id.definition))
            this._builtinUpdate(idSyntax)

        if (!type.isNumeric(id.type))
            this._cannotBeAnArg(mod.group, id.type, idSyntax)

        let value = this._analyzeExpr(valueSyntax)

        if (!type.isNumeric(value.type))
            this._cannotBeAnArg(mod.group, value.type, valueSyntax)

        if (mod.group === "^=" && type.isComplex(id.type)) {
            if (!type.isCastableTo(value.type, type.INT))
                this._badComplexPower(valueSyntax)

            value = semantic.makeUnaryOp("cast", type.INT, value)

            return semantic.makeAssign(mod.group, id, value, false, type.COMPLEX)
        }

        if (!type.isCastableTo(value.type, id.type))
            this._cannotBeCasted(value.type, id.type, valueSyntax)

        value = semantic.makeUnaryOp("cast", id.type, value)

        return semantic.makeAssign(mod.group, id, value)
    }

    private _analyzeLogicBinaryOp(op: syntax.ReadonlyLogicBinaryOp): semantic.LogicBinaryOp {
        const [lhs, rhs] = op.args.map(argSyntax => {
            const arg = this._analyzeExpr(argSyntax)

            if (!type.isCastableTo(arg.type, type.BOOL))
                this._cannotBeCasted(arg.type, type.BOOL, argSyntax)

            return semantic.makeUnaryOp("cast", type.BOOL, arg)
        })

        return semantic.makeBinaryOp(op.group, type.BOOL, lhs, rhs)
    }

    private _analyzeEqBinaryOp(op: syntax.ReadonlyEqBinaryOp): semantic.EqBinaryOp {
        let [lhs, rhs] = op.args.map(argSyntax => {
            let arg = this._analyzeExpr(argSyntax)

            if (!type.isNumeric(arg.type))
                this._cannotBeAnArg(op.group, arg.type, argSyntax)

            return arg
        })

        const commonType = type.common(
            lhs.type as type.Numeric,
            rhs.type as type.Numeric,
        )

        lhs = semantic.makeUnaryOp("cast", commonType, lhs)
        rhs = semantic.makeUnaryOp("cast", commonType, rhs)
    
        return semantic.makeBinaryOp(op.group, type.BOOL, lhs, rhs)
    }

    private _analyzeCmpBinaryOp(op: syntax.ReadonlyCmpBinaryOp): semantic.CmpBinaryOp {
        let [lhs, rhs] = op.args.map(argSyntax => {
            let arg = this._analyzeExpr(argSyntax)

            if (!type.isNumeric(arg.type) || type.isComplex(arg.type))
                this._cannotBeAnArg(op.group, arg.type, argSyntax)

            if (type.isBool(arg.type))
                arg = semantic.makeUnaryOp("cast", type.INT, arg);

            return arg
        })

        const commonType = type.common(
            lhs.type as type.Numeric,
            rhs.type as type.Numeric,
        )

        lhs = semantic.makeUnaryOp("cast", commonType, lhs)
        rhs = semantic.makeUnaryOp("cast", commonType, rhs)
    
        return semantic.makeBinaryOp(op.group, type.BOOL, lhs, rhs)
    }

    private _analyzeArithBinaryOp(op: syntax.ReadonlyArithBinaryOp): semantic.ArithBinaryOp {
        let [lhs, rhs] = op.args.map(argSyntax => {
            let arg = this._analyzeExpr(argSyntax)

            if (!type.isNumeric(arg.type))
                this._cannotBeAnArg(op.group, arg.type, argSyntax)

            if (type.isBool(arg.type))
                arg = semantic.makeUnaryOp("cast", type.INT, arg);

            return arg
        })

        let needCastToCommon = true

        if (op.group === "^" && type.isComplex(lhs.type)) {
            if (!type.isCastableTo(rhs.type, type.INT))
                this._badComplexPower(op.args[1])

            rhs = semantic.makeUnaryOp("cast", type.INT, rhs)

            needCastToCommon = false
        }

        if (needCastToCommon) {
            const commonType = type.common(
                lhs.type as type.Numeric,
                rhs.type as type.Numeric,
            )

            lhs = semantic.makeUnaryOp("cast", commonType, lhs)
            rhs = semantic.makeUnaryOp("cast", commonType, rhs)
        }

        return semantic.makeBinaryOp(op.group, lhs.type as type.Number, lhs, rhs)
    }

    private _analyzeLogicUnaryOp(op: syntax.ReadonlyLogicUnaryOp): semantic.LogicUnaryOp {
        const argSyntax = op.args[0]

        let arg = this._analyzeExpr(argSyntax)

        if (!type.isCastableTo(arg.type, type.BOOL))
            this._cannotBeCasted(arg.type, type.BOOL, argSyntax)

        arg = semantic.makeUnaryOp("cast", type.BOOL, arg)

        return semantic.makeUnaryOp(op.group, type.BOOL, arg)
    }

    private _analyzeArithUnaryOp(op: syntax.ReadonlyArithUnaryOp): semantic.ArithUnaryOp {
        const argSyntax = op.args[0]

        let arg = this._analyzeExpr(argSyntax)

        if (!type.isNumeric(arg.type))
            this._cannotBeAnArg(op.group, arg.type, argSyntax)

        if (type.isBool(arg.type))
            arg = semantic.makeUnaryOp("cast", type.INT, arg);

        return semantic.makeUnaryOp(op.group, arg.type as type.Number, arg);
    }

    private _analyzeCall(call: syntax.ReadonlyCall): semantic.Call {
        const idSyntax   = call.args[0]
        const id         = this._analyzeId(idSyntax)
        const definition = id.definition

        if (!def.isFunction(definition))
            this._notAFunction(definition.id, idSyntax)

        const argSyntaxes      = call.args.slice(1)
        const args             = argSyntaxes.map(arg => this._analyzeExpr(arg))
        const requiredArgTypes = definition.type.argTypes

        if (args.length !== requiredArgTypes.length)
            this._argCountMissmatch(
                definition.id,
                requiredArgTypes.length,
                args.length,
                idSyntax,
            )

        for (let i = 0; i < args.length; ++i) {
            const arg          = args[i]
            const proviedType  = arg.type
            const requiredType = requiredArgTypes[i]

            if (!type.isCastableTo(proviedType, requiredType))
                this._cannotBeCasted(proviedType, requiredType, argSyntaxes[i])

            args[i] = semantic.makeUnaryOp("cast", requiredType, arg)
        }

        return semantic.makeCall(id as semantic.FunctionId, args)
    }

    private _analyzeId(id: syntax.ReadonlyId): semantic.Id {
        let definition = this._currentDefinitions.get(id.id)

        if (definition == null)
            this._undefined(id.id, id)

        if (def.isBuiltin(definition))
            definition = def.clone(definition)

        // May be safely casted to mutable definition
        return semantic.makeId(definition as def.Definition)
    }

    private _emptyLoopPredicate(info: PosInfo): never {
        throw new SemanticError(
            "Loop predicate is empty",
            info.code,
            info.pos,
        )
    }

    private _badAssignmentType(
        valueType: Exclude<type.ReadonlyType, type.ReadonlyNumeric>,
        info:      PosInfo,
    ): never {
        throw new SemanticError(
            `Assignment of value of type ${type.toString(valueType)} is not allowed.\n` +
            `Value must be of numeric type`,
            info.code,
            info.pos,
        )
    }

    private _builtinUpdate(info: PosInfo): never {
        throw new SemanticError(
            "Modification of built-in values/functions isn't allowed",
            info.code,
            info.pos,
        )
    }

    private _cannotBeCasted(from: type.ReadonlyType, to: type.ReadonlyType, info: PosInfo): never {
        throw new SemanticError(
            `Expression of type ${type.toString(from)} cannot be implicitly casted to ${type.toString(to)}`,
            info.code,
            info.pos,
        )
    }

    private _cannotBeAnArg(
        op:      syntax.OpGroup | syntax.AssignGroup,
        argType: type.ReadonlyType,
        info:    PosInfo,
    ): never {
        throw new SemanticError(
            `Value of type ${type.toString(argType)} cannot be an argument of ${op}`,
            info.code,
            info.pos,
        )
    }

    private _badComplexPower(info: PosInfo): never {
        throw new SemanticError(
            `Value of type ${type.toString(type.COMPLEX)} can only be raised to a power implicitly castable to ${type.toString(type.INT)} type`,
            info.code,
            info.pos,
        )
    }

    private _notAFunction(id: string, info: PosInfo): never {
        throw new SemanticError(
            `${id} is not a function`,
            info.code,
            info.pos,
        )
    }

    private _argCountMissmatch(id: string, required: number, provied: number, info: PosInfo): never {
        throw new SemanticError(
            `${id} requires ${required} argument(s) but ${provied} was/were provied`,
            info.code,
            info.pos,
        )
    }

    private _undefined(id: string, info: PosInfo): never {
        throw new SemanticError(
            `${id} is undefined`,
            info.code,
            info.pos,
        )
    }

    private _simplifyRoot(root: semantic.Root): semantic.Root {
        // args[0] - init
        // args[1] - loop

        root.args[0] = this._simplifyExprList(root.args[0])
        root.args[1] = this._simplifyLoop(root.args[1])

        return root
    }

    private _simplifyLoop(loop: semantic.Loop): semantic.Loop {
        loop.args = loop.args.map(arg => this._simplifyExprList(arg)) as any

        return loop
    }

    private _simplifyExprList(exprList: semantic.ExprList): semantic.ExprList {
        exprList.args = exprList.args.map(arg =>this._simplifyExpr(arg)) as any

        return exprList
    }

    private _simplifyExpr(expr: semantic.Expr): semantic.Expr {
        switch (expr.group) {
            case "=":
            case "+=":
            case "-=":
            case "*=":
            case "/=":
            case "^=":
                return this._simplifyAssign(expr)

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
            case "!":
            case "pos":
            case "neg":
                return this._simplifyOp(expr)

            case "cast":
                return this._simplifyCast(expr)

            case "call":
                return this._simplifyCall(expr)

            case "id":
            case "real":
            case "imm":
            case "bool":
                return expr

            default:
                const check: never = expr
                throw new Error("never")
        }
    }

    private _simplifyAssign(assign: semantic.Assign): semantic.Assign {
        // args[0] - id
        // args[1] - value

        assign.args[1] = this._simplifyExpr(assign.args[1])

        return assign
    }

    private _simplifyOp(op: semantic.Op): semantic.Op {
        op.args = op.args.map(arg => this._simplifyExpr(arg)) as any

        return op
    }

    private _simplifyCast(cast: semantic.Cast): semantic.Expr {
        const [arg]         = cast.args
        const simplifiedArg = this._simplifyExpr(arg)

        if (type.areSame(arg.type, cast.type))
            return simplifiedArg

        cast.args = [simplifiedArg]

        return cast
    }

    private _simplifyCall(call: semantic.Call): semantic.Call {
        call.args = [
            call.args[0],
            ...call.args.slice(1)
                        .map(arg => this._simplifyExpr(arg)),
        ]

        return call
    }
}