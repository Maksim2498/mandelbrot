import DeepReadonly from "ts/util/type/DeepReadonly"

import * as t       from "ts/code/parsing/lexic/Token"

import { indent   } from "ts/util/string"

// ================================================================

export type RootGroup = "root"

// ----------------------------------------------------------------

export type ExprListGroup = ";"

// ----------------------------------------------------------------

export type LoopGroup = "loop"

// ----------------------------------------------------------------

export type IdGroup     = "id"
export type BoolGroup   = "bool"
export type RealGroup   = "real"
export type ImmGroup    = "imm"

export type NumberGroup = RealGroup
                        | ImmGroup

export type ConstGroup  = BoolGroup
                        | NumberGroup

export type ValueGroup  = IdGroup
                        | ConstGroup

// ----------------------------------------------------------------

export type InitGroup   = "="
export type ModAddGroup = "+="
export type ModSubGroup = "-="
export type ModMulGroup = "*="
export type ModDivGroup = "/="
export type ModPowGroup = "^="

export type ModGroup    = ModAddGroup
                        | ModSubGroup
                        | ModMulGroup
                        | ModDivGroup
                        | ModPowGroup

export type AssignGroup = InitGroup
                        | ModGroup

// ----------------------------------------------------------------

export type NotGroup          = "!"

export type LogicUnaryOpGroup = NotGroup

export type PosGroup          = "pos"
export type NegGroup          = "neg"

export type ArithUnaryOpGroup = PosGroup
                              | NegGroup

export type UnaryOpGroup      = LogicUnaryOpGroup
                              | ArithUnaryOpGroup

// ----------------------------------------------------------------

export type OrGroup            = "|"
export type AndGroup           = "&"

export type LogicBinaryOpGroup = OrGroup
                               | AndGroup

export type LessGroup          = "<"
export type LessOrEqGroup      = "<="
export type GreaterGroup       = ">"
export type GreaterOrEqGroup   = ">="

export type CmpBinaryOpGroup   = LessGroup
                               | LessOrEqGroup
                               | GreaterGroup
                               | GreaterOrEqGroup

export type EqGroup            = "=="
export type NotEqGroup         = "!="

export type EqBinaryOpGroup    = EqGroup
                               | NotEqGroup

export type AddGroup           = "+"
export type SubGroup           = "-"
export type MulGroup           = "*"
export type DivGroup           = "/"
export type PowGroup           = "^"

export type ArithBinaryOpGroup = AddGroup
                               | SubGroup
                               | MulGroup
                               | DivGroup
                               | PowGroup

export type BinaryOpGroup      = LogicBinaryOpGroup
                               | CmpBinaryOpGroup
                               | EqBinaryOpGroup
                               | ArithBinaryOpGroup

// ----------------------------------------------------------------

export type CallGroup = "call"

// ----------------------------------------------------------------

export type OpGroup = UnaryOpGroup
                    | BinaryOpGroup
                    | CallGroup

// ----------------------------------------------------------------

export type ExprGroup = ValueGroup
                      | AssignGroup
                      | OpGroup

// ----------------------------------------------------------------

export type NullaryGroup = ValueGroup

export type UnaryGroup   = UnaryOpGroup

export type BinaryGroup  = RootGroup
                         | LoopGroup
                         | AssignGroup
                         | BinaryOpGroup

export type NaryGroup    = ExprListGroup
                         | CallGroup

// ----------------------------------------------------------------

export type Group = NullaryGroup
                  | UnaryGroup
                  | BinaryGroup
                  | NaryGroup

// ================================================================

export interface Base<G extends Group> {
    group:  G
    code:   string
    pos:    number
    length: number
}


export interface ReadonlyBase<G extends Group> extends Readonly<Base<G>> {}

// ----------------------------------------------------------------

export interface NullaryBase<G extends NullaryGroup> extends Base<G> {}


export interface ReadonlyNullaryBase<G extends NullaryGroup> extends Readonly<NullaryBase<G>> {}

// ----------------------------------------------------------------

export interface UnaryBase<
    G extends UnaryGroup,
    A extends Node,
> extends Base<G> {
    args: [A]
}


export interface RadonlyUnaryBase<
    G extends UnaryGroup,
    A extends Node,
> extends DeepReadonly<UnaryBase<G, A>> {}

// ----------------------------------------------------------------

export interface BinaryBase<
    G  extends BinaryGroup,
    FA extends Node,
    SA extends Node,
> extends Base<G> {
    args: [FA, SA]
}


export interface ReadonlyBinaryBase<
    G  extends BinaryGroup,
    FA extends Node,
    SA extends Node,
> extends DeepReadonly<BinaryBase<G, FA, SA>> {}

// ----------------------------------------------------------------

export interface NaryBase<
    G extends NaryGroup,
    A extends Node,
> extends Base<G> {
    args: A[]
}


export interface ReadonlyNaryBase<
    G extends NaryGroup,
    A extends Node,
> extends DeepReadonly<NaryBase<G, A>> {}

// ----------------------------------------------------------------

export interface Root extends BinaryBase<
    RootGroup,
    ExprList,
    Loop
> {}


export interface ReadonlyRoot extends DeepReadonly<Root> {}

// ----------------------------------------------------------------

export interface ExprList extends NaryBase<
    ExprListGroup,
    Expr
> {}


export interface ReadonlyExprList extends DeepReadonly<ExprList> {}

// ----------------------------------------------------------------

export interface Loop extends BinaryBase<
    LoopGroup,
    ExprList,
    ExprList
> {}


export interface ReadonlyLoop extends DeepReadonly<Loop> {}

// ----------------------------------------------------------------

export interface ValueBase<G extends ValueGroup> extends NullaryBase<G> {}

export interface ConstBase<G extends ConstGroup> extends ValueBase<G> {
    value: G extends BoolGroup
        ? G extends NumberGroup
            ? boolean | number
            : boolean
        : number
}

export interface NumberBase<G extends NumberGroup> extends ConstBase<G> {}

export interface Id extends ValueBase<IdGroup> {
    id: string
}

export interface Bool extends ConstBase<BoolGroup>  {}
export interface Real extends NumberBase<RealGroup> {}
export interface Imm  extends NumberBase<ImmGroup>  {}

export type Number = Real
                   | Imm

export type Const  = Bool
                   | Number

export type Value  = Id
                   | Const


export interface ReadonlyValueBase<G extends ValueGroup>   extends DeepReadonly<ValueBase<G> > {}
export interface ReadonlyConstBase<G extends ConstGroup>   extends DeepReadonly<ConstBase<G> > {}
export interface ReadonlyNumberBase<G extends NumberGroup> extends DeepReadonly<NumberBase<G>> {}

export interface ReadonlyId   extends DeepReadonly<Id  > {}
export interface ReadonlyBool extends DeepReadonly<Bool> {}
export interface ReadonlyReal extends DeepReadonly<Real> {}
export interface ReadonlyImm  extends DeepReadonly<Imm > {}

export type ReadonlyNumber = DeepReadonly<Number>
export type ReadonlyConst  = DeepReadonly<Const >
export type ReadonlyValue  = DeepReadonly<Value >

// ----------------------------------------------------------------

export interface AssignBase<G extends AssignGroup> extends BinaryBase<
    G,
    Id,
    Expr
> {}

export interface ModBase<G extends ModGroup> extends AssignBase<G> {}

export interface Init   extends AssignBase<InitGroup> {}
export interface ModAdd extends ModBase<ModAddGroup>  {}
export interface ModSub extends ModBase<ModSubGroup>  {}
export interface ModMul extends ModBase<ModMulGroup>  {}
export interface ModDiv extends ModBase<ModDivGroup>  {}
export interface ModPow extends ModBase<ModPowGroup>  {}

export type Mod    = ModAdd
                   | ModSub
                   | ModMul
                   | ModDiv
                   | ModPow

export type Assign = Init
                   | Mod


export interface ReadonlyAssignBase<G extends AssignGroup> extends DeepReadonly<AssignBase<G>> {}
export interface ReadonlyModBase<G extends ModGroup>       extends DeepReadonly<ModBase<G>>    {}

export interface ReadonlyInit   extends DeepReadonly<Init  > {}
export interface ReadonlyModAdd extends DeepReadonly<ModAdd> {}
export interface ReadonlyModSub extends DeepReadonly<ModSub> {}
export interface ReadonlyModMul extends DeepReadonly<ModMul> {}
export interface ReadonlyModDiv extends DeepReadonly<ModDiv> {}
export interface ReadonlyModPow extends DeepReadonly<ModPow> {}

export type ReadonlyMod    = DeepReadonly<Mod   >
export type ReadonlyAssign = DeepReadonly<Assign>

// ----------------------------------------------------------------

export interface UnaryOpBase<G extends UnaryOpGroup>           extends UnaryBase<G, Expr> {}
export interface LogicUnaryOpBase<G extends LogicUnaryOpGroup> extends UnaryOpBase<G>     {}
export interface ArithUnaryOpBase<G extends ArithUnaryOpGroup> extends UnaryOpBase<G>     {}

export interface Not extends LogicUnaryOpBase<NotGroup> {}
export interface Pos extends ArithUnaryOpBase<PosGroup> {}
export interface Neg extends ArithUnaryOpBase<NegGroup> {}

export type LogicUnaryOp = Not

export type ArithUnaryOp = Pos
                         | Neg

export type UnaryOp      = LogicUnaryOp
                         | ArithUnaryOp


export interface ReadonlyUnaryOpBase<G extends UnaryOpGroup>           extends DeepReadonly<UnaryOpBase<G>>      {}
export interface ReadonlyLogicUnaryOpBase<G extends LogicUnaryOpGroup> extends DeepReadonly<LogicUnaryOpBase<G>> {}
export interface ReadonlyArithUnaryOpBase<G extends ArithUnaryOpGroup> extends DeepReadonly<ArithUnaryOpBase<G>> {}

export interface ReadonlyNot extends DeepReadonly<Not> {}
export interface ReadonlyPos extends DeepReadonly<Pos> {}
export interface ReadonlyNeg extends DeepReadonly<Neg> {}

export type ReadonlyLogicUnaryOp = DeepReadonly<LogicUnaryOp>
export type ReadonlyArithUnaryOp = DeepReadonly<ArithUnaryOp>
export type ReadonlyUnaryOp      = DeepReadonly<UnaryOp     >

// ----------------------------------------------------------------

export interface BinaryOpBase<G extends BinaryOpGroup> extends BinaryBase<
    G,
    Expr,
    Expr
> {}

export interface LogicBinaryOpBase<G extends LogicBinaryOpGroup> extends BinaryOpBase<G> {}
export interface CmpBinaryOpBase<G extends CmpBinaryOpGroup>     extends BinaryOpBase<G> {}
export interface EqBinaryOpBase<G extends EqBinaryOpGroup>       extends BinaryOpBase<G> {}
export interface ArithBinaryOpBase<G extends ArithBinaryOpGroup> extends BinaryOpBase<G> {}

export interface Or          extends LogicBinaryOpBase<OrGroup >       {}
export interface And         extends LogicBinaryOpBase<AndGroup>       {}

export interface Less        extends CmpBinaryOpBase<LessGroup       > {}
export interface LessOrEq    extends CmpBinaryOpBase<LessOrEqGroup   > {}
export interface Greater     extends CmpBinaryOpBase<GreaterGroup    > {}
export interface GreaterOrEq extends CmpBinaryOpBase<GreaterOrEqGroup> {}

export interface Eq          extends EqBinaryOpBase<EqGroup   >        {}
export interface NotEq       extends EqBinaryOpBase<NotEqGroup>        {}

export interface Add         extends ArithBinaryOpBase<AddGroup>       {}
export interface Sub         extends ArithBinaryOpBase<SubGroup>       {}
export interface Mul         extends ArithBinaryOpBase<MulGroup>       {}
export interface Div         extends ArithBinaryOpBase<DivGroup>       {}
export interface Pow         extends ArithBinaryOpBase<PowGroup>       {}

export type LogicBinaryOp = Or
                          | And

export type CmpBinaryOp   = Less
                          | LessOrEq
                          | Greater
                          | GreaterOrEq

export type EqBinaryOp    = Eq
                          | NotEq

export type ArithBinaryOp = Add
                          | Sub
                          | Mul
                          | Div
                          | Pow

export type BinaryOp      = LogicBinaryOp
                          | CmpBinaryOp
                          | EqBinaryOp
                          | ArithBinaryOp


export interface ReadonlyBinaryOpBase<G extends BinaryOpGroup>           extends DeepReadonly<BinaryOpBase<G>     > {}
export interface ReadonlyLogicBinaryOpBase<G extends LogicBinaryOpGroup> extends DeepReadonly<LogicBinaryOpBase<G>> {}
export interface ReadonlyCmpBinaryOpBase<G extends CmpBinaryOpGroup>     extends DeepReadonly<CmpBinaryOpBase<G>  > {}
export interface ReadonlyEqBinaryOpBase<G extends EqBinaryOpGroup>       extends DeepReadonly<EqBinaryOpBase<G>   > {}
export interface ReadonlyArithBinaryOpBase<G extends ArithBinaryOpGroup> extends DeepReadonly<ArithBinaryOpBase<G>> {}

export interface ReadonlyOr          extends DeepReadonly<Or >         {}
export interface ReadonlyAnd         extends DeepReadonly<And>         {}

export interface ReadonlyLess        extends DeepReadonly<Less       > {}
export interface ReadonlyLessOrEq    extends DeepReadonly<LessOrEq   > {}
export interface ReadonlyGreater     extends DeepReadonly<Greater    > {}
export interface ReadonlyGreaterOrEq extends DeepReadonly<GreaterOrEq> {}

export interface ReadonlyEq          extends DeepReadonly<Eq   >       {}
export interface ReadonlyNotEq       extends DeepReadonly<NotEq>       {}

export interface ReadonlyAdd         extends DeepReadonly<Add>         {}
export interface ReadonlySub         extends DeepReadonly<Sub>         {}
export interface ReadonlyMul         extends DeepReadonly<Mul>         {}
export interface ReadonlyDiv         extends DeepReadonly<Div>         {}
export interface ReadonlyPow         extends DeepReadonly<Pow>         {}

export type ReadonlyLogicBinaryOp = DeepReadonly<LogicBinaryOp>
export type ReadonlyCmpBinaryOp   = DeepReadonly<CmpBinaryOp  >
export type ReadonlyEqBinaryOp    = DeepReadonly<EqBinaryOp   >
export type ReadonlyArithBinaryOp = DeepReadonly<ArithBinaryOp>
export type ReadonlyBinaryOp      = DeepReadonly<BinaryOp     >

// ----------------------------------------------------------------

export interface Call extends NaryBase<CallGroup, Expr> {
    args: [Id, ...Expr[]]
}


export interface ReadonlyCall extends DeepReadonly<Call> {}

// ----------------------------------------------------------------

export type Op = UnaryOp
               | BinaryOp
               | Call


export type ReadonlyOp = DeepReadonly<Op>

// ----------------------------------------------------------------

export type Expr = Value
                 | Assign
                 | Op


export type ReadonlyExpr = DeepReadonly<Expr>

// ----------------------------------------------------------------

export type Nullary = Value

export type Unary   = UnaryOp

export type Binary  = Root
                    | Loop
                    | Assign
                    | BinaryOp

export type Nary    = ExprList
                    | Call


export type ReadonlyNullary = DeepReadonly<Nullary>
export type ReadonlyUnary   = DeepReadonly<Unary  >
export type ReadonlyBinary  = DeepReadonly<Binary >
export type ReadonlyNary    = DeepReadonly<Nary   >

// ----------------------------------------------------------------

export type Node = Nullary
                 | Unary
                 | Binary
                 | Nary


export type ReadonlyNode = DeepReadonly<Node>

// ================================================================

export function makeRoot(init: ExprList,         loop: Loop        ): Root
export function makeRoot(init: ReadonlyExprList, loop: ReadonlyLoop): ReadonlyRoot

export function makeRoot(init: ReadonlyExprList, loop: ReadonlyLoop): ReadonlyRoot {
    return {
        group:  "root",
        code:   loop.code,
        pos:    init?.pos ?? loop.pos,
        length: init != null ? loop.pos - init.pos + loop.length : loop.length,
        args:   [init, loop],
    }
}

// ----------------------------------------------------------------

export function concatExprLists(first: ExprList,         second: ExprList        ): ExprList
export function concatExprLists(first: ReadonlyExprList, second: ReadonlyExprList): ReadonlyExprList

export function concatExprLists(first: ReadonlyExprList, second: ReadonlyExprList): ReadonlyExprList {
    return {
        group:  ";",
        code:   second.code,
        pos:    first.pos,
        length: second.pos - first.pos + second.length,
        args:   [...first.args, ...second.args],
    }
}

// ----------------------------------------------------------------

export function makeEmptyExprList(code: string, pos: number): ExprList {
    return {
        group:  ";",
        length: 0,
        args:   [],
        code,
        pos,
    }
}

// ----------------------------------------------------------------

export function makeExprList(args:          Expr[]        ): ExprList
export function makeExprList(args: readonly ReadonlyExpr[]): ReadonlyExprList

export function makeExprList(args: readonly ReadonlyExpr[]): ReadonlyExprList {
    if (args.length === 0)
        return {
            group:  ";",
            code:   "",
            pos:    0,
            length: 0,
            args:   [],
        }

    const first = args[0              ]
    const last  = args[args.length - 1]

    return {
        group:  ";",
        code:   first.code,
        pos:    first.pos,
        length: last.pos - first.pos + last.length,
        args,
    }
}

// ----------------------------------------------------------------

export function makeLoop(_do: t.ReadonlyDo, body: ExprList, predicate: ExprList): Loop

export function makeLoop(
    _do:       t.ReadonlyDo,
    body:      ReadonlyExprList,
    predicate: ReadonlyExprList,
): ReadonlyLoop

export function makeLoop(
    _do:       t.ReadonlyDo,
    body:      ReadonlyExprList,
    predicate: ReadonlyExprList,
): ReadonlyLoop {
    return {
        group:  "loop",
        code:   _do.code,
        pos:    _do.pos,
        length: predicate.pos - _do.pos + predicate.length,
        args:   [body, predicate],
    }
}

// ----------------------------------------------------------------

export type ValueFor<T extends t.ReadonlyValue>         = Extract<Value, { group: T["group"] }>
export type ReadonlyValueFor<T extends t.ReadonlyValue> = DeepReadonly<ValueFor<T>>

export function makeValue<T extends t.ReadonlyValue>(value: T): ValueFor<T> {
    // Idk why compiler complains without casting to any
    // Everything seems to be correct

    return { ...value } as any
}

// ----------------------------------------------------------------

export function makeAssign<G extends AssignGroup>(group: G, id: Id, value: Expr): AssignBase<G>

export function makeAssign<G extends AssignGroup>(
    group: DeepReadonly<G>,
    id:    ReadonlyId,
    value: ReadonlyExpr,
): ReadonlyAssignBase<G>

export function makeAssign<G extends AssignGroup>(
    group: DeepReadonly<G>,
    id:    ReadonlyId,
    value: ReadonlyExpr,
): ReadonlyAssignBase<G> {
    return {
        code:   id.code,
        pos:    id.pos,
        length: value.pos - id.pos + value.length,
        args:   [id, value],
        group,
    }
}

// ----------------------------------------------------------------

export function makeUnaryOp(token: t.ReadonlyUnaryOp, arg: Expr        ): UnaryOp
export function makeUnaryOp(token: t.ReadonlyUnaryOp, arg: ReadonlyExpr): ReadonlyUnaryOp

export function makeUnaryOp(token: t.ReadonlyUnaryOp, arg: ReadonlyExpr): ReadonlyUnaryOp {
    let group!: UnaryOpGroup

    switch (token.group) {
        case "+":
            group = "pos"
            break

        case "-":
            group = "neg"
            break

        case "!":
            group = "!"
            break

        default:
            const check: never = token
    }

    return {
        code:   token.code,
        pos:    token.pos,
        length: arg.pos - token.pos + arg.length,
        args:   [arg],
        group,
    }
}

// ----------------------------------------------------------------

export function makeBinaryOp<G extends BinaryOpGroup>(group: G, lhs: Expr, rhs:Expr): BinaryOpBase<G>

export function makeBinaryOp<G extends BinaryOpGroup>(
    group: DeepReadonly<G>,
    lhs:   ReadonlyExpr,
    rhs:   ReadonlyExpr,
): ReadonlyBinaryOpBase<G>

export function makeBinaryOp<G extends BinaryOpGroup>(
    group: DeepReadonly<G>,
    lhs:   ReadonlyExpr,
    rhs:   ReadonlyExpr,
): ReadonlyBinaryOpBase<G> {
    return {
        code:   lhs.code,
        pos:    lhs.pos,
        length: rhs.pos - lhs.pos + rhs.length,
        args:   [lhs, rhs],
        group,
    }
}

// ----------------------------------------------------------------

export function makeCall(id: Id, args: Expr[], token: t.ReadonlyClosingParen): Call

export function makeCall(
    id:    ReadonlyId,
    args:  readonly ReadonlyExpr[],
    token: t.ReadonlyClosingParen,
): ReadonlyCall

export function makeCall(
    id:    ReadonlyId,
    args:  readonly ReadonlyExpr[],
    token: t.ReadonlyClosingParen,
): ReadonlyCall {
    return {
        group:  "call",
        code:   id.code,
        pos:    id.pos,
        length: token.pos - id.pos + token.length,
        args:   [id, ...args],
    }
}

// ----------------------------------------------------------------

export function toString(node: ReadonlyNode, indentSize: number = 4): string {
    switch (node.group) {
        case "root":
        case ";":
            return node.args.map(arg => toString(arg, indentSize))
                            .join("\n")

        case "loop": {
            const [body, predicate] = node.args

            return [
                "do",
                indent(
                    toString(body, indentSize),
                    indentSize,
                ),
                "while",
                indent(
                    toString(predicate, indentSize),
                    indentSize,
                ),
            ].join("\n")
        }

        case "=":
        case "+=":
        case "-=":
        case "*=":
        case "/=":
        case "^=":
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
            return `(${
                node.args.map(a => toString(a, indentSize))
                         .join(` ${node.group} `)
            })`

        case "!":
            return unaryOpToString("!", node)

        case "pos":
            return unaryOpToString("+", node)

        case "neg":
            return unaryOpToString("-", node)

        case "call":
            return `${toString(node.args[0], indentSize)}(${
                node.args.map(a => toString(a, indentSize))
                         .join(", ")
            })`

        case "id":
            return node.id

        case "real":
        case "bool":
            return node.value.toString()

        case "imm":
            return `${node.value}i`
        
        default:
            const check: never = node
            return ""
    }

    function unaryOpToString(prefix: string, op: ReadonlyUnaryOp): string {
        return prefix + toString(op.args[0], indentSize)
    }
}