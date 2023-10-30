/*
    This parser isn't very efficient but it was easy to hand-code.
    Maybe (likely not) i will rewrite it with use of LR(1)
    parsing algorithm. It's table shouldn't be hand-crafted
    but rather generated with use of some WebPack loader
    for syntax description file.

    Maybe one day...
*/

import ExpectedError                  from "./error/ExpectedError"
import SyntaxError                    from "./error/SyntaxError"

import * as t                         from "ts/code/parsing/lexic/Token"
import * as n                         from "./Node"

import { ReadonlyTokenizationResult } from "ts/code/parsing/lexic/Tokenizer"

/*
    Operator Precedence:

    1)  "()" (function call);
    2)  "!", unary "+", unary "-";
    3)  "^";
    4)  "*", "/";
    5)  binary "+", binary "-";
    6)  "<", "<=", ">", ">=";
    7)  "!=", "==";
    8)  "&";
    9)  "|";
    10) "=", "+=", "-=", "*=", "/=", "^=".
*/

/*
    Syntax:

    program: {indent expr-list eol} indent loop eot

    loop: "do" block "while" block

    block: expr (eot | eol indent)
         | eol indent-grow expr-list {eol indent expr-list} (eot | eol indent-shrink)

    expr-list: expr {";" expr} [";"]

    expr: assign

    assign: id ("=" | "+=" | "-=" | "*=" | "/=" | "^=") assign
          | or

    or: [or "|"] and

    and: [and "&"] eq

    eq: [eq ("!=" | "==")] cmp

    cmp: [cmp ("<" | "<=" | ">" | ">=")] sum

    sum: [sum ("+" | "-")] prod

    prod: [prod ("*" | "/")] pow

    pow: unary ["^" pow]

    unary: ("!" | "+" | "-") sign
        | func

    func: id "(" [expr {"," expr}] ")"
        | prim

    prim: "(" expr ")"
        | real
        | imm
        | id
*/

type OrPriority     = 0
type AndPriority    = 1
type EqPriority     = 2
type CmpPriority    = 3
type SumPriority    = 4
type ProdPriority   = 5
type PowPriority    = 6

type OpPriority     = OrPriority
                    | AndPriority
                    | EqPriority
                    | CmpPriority
                    | SumPriority
                    | ProdPriority
                    | PowPriority

const OR_PRIORITY:   OrPriority   = 0
const AND_PRITORITY: AndPriority  = 1
const EQ_PRIORITY:   EqPriority   = 2
const CMP_PRIORITY:  CmpPriority  = 3
const SUM_PRIORITY:  SumPriority  = 4
const PROD_PRIORITY: ProdPriority = 5
const POW_PRIORITY:  PowPriority  = 6

// Assignment is handled separately

interface OpStackEntry {
    priority: OpPriority
    group:    t.BinaryOpGroup
}

export default class TreeBuilder {
    private _tokens!: readonly t.ReadonlyToken[]
    private _pos!:    number

    buildTree(tokens: ReadonlyTokenizationResult): n.Root {
        this._init(tokens)

        const tree = this._parseRoot()

        this._reset()

        return tree
    }

    private _reset() {
        this._init([])
    }

    private _init(tokens: readonly t.ReadonlyToken[]) {
        this._tokens = tokens
        this._pos    = 0
    }

    private _parseRoot(): n.Root {
        let init = n.makeEmptyExprList(this._code, this._pos)
        let loop = undefined as n.Loop | undefined

        while (true) {
            this._check(this._consume(), "indent-same")

            if (this._current().group === "do") {
                loop = this._parseLoop()
                break
            }

            init = n.concatExprLists(init, this._parseOneLineExprList())

            this._check(this._consume(), "eol")
        }

        this._check(this._consume(), "eot")

        return n.makeRoot(init, loop)
    }

    private _parseLoop(): n.Loop {
        const _do = this._consume()

        this._check(_do, "do")

        const body   = this._parseBlock()
        const _while = this._consume()

        this._check(_while, "while")

        const predicate = this._parseBlock()

        return n.makeLoop(_do as t.ReadonlyDo, body, predicate)
    }

    private _parseBlock(): n.ExprList {
        if (this._current().group !== "eol") {
            const expr  = this._parseOneLineExprList()
            const token = this._consume()

            switch (token.group) {
                case "eol":
                    this._check(this._consume(), "indent-same")

                case "eot":
                    return expr

                default:
                    throw new ExpectedError(token, "eol", "eot")
            }
        }

        this._check(this._consume(), "eol")
        this._check(this._consume(), "indent-grow")

        let result = this._parseOneLineExprList()

        loop:
        while (true) {
            let token = this._consume()

            switch (token.group) {
                case "eol": {
                    token = this._consume()

                    switch (token.group) {
                        case "indent-same":
                            result = n.concatExprLists(result, this._parseOneLineExprList())
                            continue

                        case "indent-shrink":
                            break loop

                        default:
                            throw new ExpectedError(token, "indent-same", "indent-shrink")
                    }
                }
                
                case "eot":
                    break loop

                default:
                    throw new ExpectedError(token, "eol", "eot")
            }
        }

        return result
    }

    private _parseOneLineExprList(): n.ExprList {
        const args = [this._parseExpr()]

        while (this._current().group === ";") {
            this._step()

            if (this._current().group === "eol")
                break

            args.push(this._parseExpr())
        }

        return n.makeExprList(args)
    }

    private _parseExpr(): n.Expr {
        const token = this._consume()

        switch (token.group) {
            case "+":
            case "-":
            case "!": {
                const op = this._parseUnaryOp(token)

                return this._tryParseBinaryOp(op) ?? op
            }

            case "(": {
                const expr = this._parseSubExpr(token)

                return this._tryParseBinaryOp(expr) ?? expr
            }

            case "bool":
            case "real":
            case "imm": {
                const value = n.makeValue(token)

                return this._tryParseBinaryOp(value) ?? value
            }

            case "id": {
                const id = n.makeValue(token)

                const assign = this._tryParseAssign(id)

                if (assign != null)
                    return assign

                const callOrId = this._tryParseCall(id) ?? id

                return this._tryParseBinaryOp(callOrId) ?? callOrId
            }

            default:
                throw new ExpectedError(token, "+", "-", "!", "(", "imm", "real", "id")
        }
    }

    private _parseUnaryOp(token: t.ReadonlyUnaryOp): n.UnaryOp {
        return n.makeUnaryOp(token, this._parseOperand())
    }

    private _tryParseAssign(id: n.Id): n.Assign | null {
        const group = this._current().group

        switch (group) {
            case "=":
            case "+=":
            case "-=":
            case "*=":
            case "/=":
            case "^=": {
                this._step()

                return n.makeAssign(group, id, this._parseExpr())
            }
            
            default:
                return null
        }
    }

    private _tryParseCall(id: n.Id): n.Call | null {
        if (this._current().group !== "(")
            return null

        this._step()

        const args = new Array<n.Expr>()

        while (true) {
            try {
                args.push(this._parseExpr())
            } catch (error) {
                const token = this._prev()

                if (token.group !== ")")
                    throw error

                return n.makeCall(id, args, token)
            }

            const token = this._consume()

            switch (token.group) {
                case ",":
                    continue

                case ")":
                    return n.makeCall(id, args, token)

                default:
                    throw new ExpectedError(token, ",", ")")
            }
        }
    }

    private _tryParseBinaryOp(lhs: n.Expr): n.Expr | null {
        const opStack      = new Array<OpStackEntry>()
        const operandStack = new Array<n.Expr>()

        operandStack.push(lhs)

        this._tryParseBinaryOpRec(opStack, operandStack)

        if (opStack.length === 0)
            return null

        this._reduce(opStack, operandStack)

        if (opStack.length !== 0 || operandStack.length !== 1)
            throw new SyntaxError("Bad expression", lhs.code, lhs.pos)

        return operandStack.pop()!
    }

    private _tryParseBinaryOpRec(opStack: OpStackEntry[], operandStack: n.Expr[]) {
        const group    = this._current().group
        const priority = this._getBinaryOpPriority(group)

        if (priority === -1)
            return

        this._step()

        // Comparing with undfined is always false
        if (opStack[opStack.length - 1]?.priority >= priority)
            this._reduce(opStack, operandStack, priority)

        operandStack.push(this._parseOperand())

        opStack.push({
            group: group as t.BinaryOpGroup,
            priority
        })

        this._tryParseBinaryOpRec(opStack, operandStack)
    }

    private _parseOperand(): n.Expr {
        const token = this._consume()

        switch (token.group) {
            case "+":
            case "-":
            case "!":
                return this._parseUnaryOp(token)

            case "(":
                return this._parseSubExpr(token)

            case "bool":
            case "real":
            case "imm":
                return n.makeValue(token)
            
            case "id": {
                const id = n.makeValue(token)
            
                return this._tryParseCall(id) ?? id
            }

            default:
                throw new ExpectedError(token, "+", "-", "!", "(", "imm", "real", "id")
        }
    }

    private _parseSubExpr(opening: t.ReadonlyOpeningParen): n.Expr {
        const expr    = this._parseExpr()
        const closing = this._consume()

        this._check(closing, ")")

        return {
            ...expr,
            pos:    opening.pos,
            length: closing.pos - opening.pos + closing.length,
        }
    }

    private _reduce(
        opStack:       OpStackEntry[],
        operandStack:  n.Expr[],
        untilPriority: OpPriority | -1 = -1,
    ) {
        while (opStack.length > 0 && operandStack.length >= 2) {
            const { group, priority } = opStack[opStack.length - 1]

            if (priority < untilPriority)
                break

            opStack.pop()

            const rhs       = operandStack.pop()!
            const lhs       = operandStack.pop()!
            const result    = n.makeBinaryOp(group, lhs, rhs)

            operandStack.push(result)
        }
    }

    private _getBinaryOpPriority(group: t.Group): OpPriority | -1  {
        switch (group) {
            case "|":
                return OR_PRIORITY

            case "&":
                return AND_PRITORITY

            case "==":
            case "!=":
                return EQ_PRIORITY

            case "<":
            case "<=":
            case ">":
            case ">=":
                return CMP_PRIORITY

            case "+":
            case "-":
                return SUM_PRIORITY

            case "*":
            case "/":
                return PROD_PRIORITY

            case "^":
                return POW_PRIORITY

            default:
                return -1
        }
    }

    private _check(token: t.ReadonlyToken, ...expected: t.Group[]) {
        if (!expected.includes(token.group))
            throw new ExpectedError(token, ...expected)
    }

    private _prev(): t.ReadonlyToken {
        this._retreat()

        return this._consume()
    }

    private _consume(): t.ReadonlyToken {
        const token = this._current()

        this._step()

        return token
    }

    private _current(): t.ReadonlyToken {
        return this._tokens[this._pos]
    }

    private _step() {
        if (this._pos < this._lastPos)
            ++this._pos
    }

    private get _code(): string {
        return this._tokens[this._lastPos].code
    }

    private get _lastPos(): number {
        return this._tokens.length - 1
    }

    private _retreat() {
        if (this._pos > 0)
            --this._pos
    }
}