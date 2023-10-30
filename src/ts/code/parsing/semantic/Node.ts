import DeepReadonly from "ts/util/type/DeepReadonly"

import * as d      from "ts/code/lom/Definition"
import * as t      from "ts/code/lom/Type"

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

export type CastUnaryOpGroup  = "cast"

export type NotGroup          = "!"

export type LogicUnaryOpGroup = NotGroup

export type PosGroup          = "pos"
export type NegGroup          = "neg"

export type ArithUnaryOpGroup = PosGroup
                              | NegGroup

export type UnaryOpGroup      = CastUnaryOpGroup
                              | LogicUnaryOpGroup
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

export interface Base<
    G extends Group,
    T extends t.Type,
> {
    group: G
    type:  T
}


export interface ReadonlyBase<
    G extends Group,
    T extends t.Type,
> extends Readonly<Base<G, T>> {}

// ----------------------------------------------------------------

export interface NullaryBase<
    G extends NullaryGroup,
    T extends t.Type,
> extends Base<G, T> {}


export interface ReadonlyNullaryBase<
    G extends NullaryGroup,
    T extends t.Type,
> extends Readonly<NullaryBase<G, T>> {}

// ----------------------------------------------------------------

export interface UnaryBase<
    G extends UnaryGroup,
    T extends t.Type,
    A extends Node,
> extends Base<G, T> {
    args: [A]
}


export interface RadonlyUnaryBase<
    G extends UnaryGroup,
    T extends t.Type,
    A extends Node,
> extends DeepReadonly<UnaryBase<G, T, A>> {}

// ----------------------------------------------------------------

export interface BinaryBase<
    G  extends BinaryGroup,
    T extends t.Type,
    FA extends Node,
    SA extends Node,
> extends Base<G, T> {
    args: [FA, SA]
}


export interface ReadonlyBinaryBase<
    G  extends BinaryGroup,
    T extends t.Type,
    FA extends Node,
    SA extends Node,
> extends DeepReadonly<BinaryBase<G, T, FA, SA>> {}

// ----------------------------------------------------------------

export interface NaryBase<
    G extends NaryGroup,
    T extends t.Type,
    A extends Node,
> extends Base<G, T> {
    args: A[]
}


export interface ReadonlyNaryBase<
    G extends NaryGroup,
    T extends t.Type,
    A extends Node,
> extends DeepReadonly<NaryBase<G, T, A>> {}

// ----------------------------------------------------------------

export interface Root extends BinaryBase<
    RootGroup,
    t.Unit,
    ExprList,
    Loop
> {}


export interface ReadonlyRoot extends DeepReadonly<Root> {}

// ----------------------------------------------------------------

export interface ExprList extends NaryBase<
    ExprListGroup,
    t.Type,
    Expr
> {}


export interface ReadonlyExprList extends DeepReadonly<ExprList> {}

// ----------------------------------------------------------------

export interface Loop extends BinaryBase<
    LoopGroup,
    t.Unit,
    ExprList,
    ExprList
> {}


export interface ReadonlyLoop extends DeepReadonly<Loop> {}

// ----------------------------------------------------------------

export interface ValueBase<
    G extends ValueGroup,
    T extends t.Type,
> extends NullaryBase<G, T> {}

export interface ConstBase<
    G extends ConstGroup,
    T extends t.Numeric,
> extends ValueBase<G, T> {
    value: G extends BoolGroup
        ? G extends NumberGroup
            ? boolean | number
            : boolean
        : number
}

export interface NumberBase<
    G extends NumberGroup,
    T extends t.Number,
> extends ConstBase<G, T> {}

export interface IdBase<
    D extends d.Definition,
    T extends t.Type,
> extends ValueBase<IdGroup, T> {
    definition: D
}

export interface AnyId      extends IdBase<d.Definition, t.Type    >        {}
export interface ValueId    extends IdBase<d.Value,      t.Value   >        {}
export interface FunctionId extends IdBase<d.Function,   t.Function>        {}

export interface Bool       extends ConstBase<BoolGroup, t.Bool>            {}

export interface Real       extends NumberBase<RealGroup, t.Int | t.Float>  {}
export interface Imm        extends NumberBase<ImmGroup,  t.Complex      >  {}

export type Id     = AnyId
                   | ValueId
                   | FunctionId

export type Number = Real
                   | Imm

export type Const  = Bool
                   | Number

export type Value  = Id
                   | Const


export interface ReadonlyValueBase<
    G extends ValueGroup,
    T extends t.Type,
> extends DeepReadonly<ValueBase<G, T>> {}

export interface ReadonlyConstBase<
    G extends ConstGroup,
    T extends t.Numeric,
> extends DeepReadonly<ConstBase<G, T>> {}

export interface ReadonlyNumberBase<
    G extends NumberGroup,
    T extends t.Number,
> extends DeepReadonly<NumberBase<G, T>> {}

export interface ReadonlyIdBase<
    D extends d.Definition,
    T extends t.Type,
> extends DeepReadonly<IdBase<D, T>> {}

export interface ReadonlyAnyId      extends DeepReadonly<AnyId     > {}
export interface ReadonlyValueId    extends DeepReadonly<ValueId   > {}
export interface ReadonlyFunctionId extends DeepReadonly<FunctionId> {}
export interface ReadonlyBool       extends DeepReadonly<Bool      > {}
export interface ReadonlyReal       extends DeepReadonly<Real      > {}
export interface ReadonlyImm        extends DeepReadonly<Imm       > {}

export type ReadonlyId     = DeepReadonly<Id    >
export type ReadonlyNumber = DeepReadonly<Number>
export type ReadonlyConst  = DeepReadonly<Const >
export type ReadonlyValue  = DeepReadonly<Value >

// ----------------------------------------------------------------

export interface AssignBase<G extends AssignGroup> extends BinaryBase<
    G,
    t.Type,
    Id,
    Expr
> {
    first: boolean
}

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

export interface UnaryOpBase<
    G extends UnaryOpGroup,
    T extends t.Type,
> extends UnaryBase<G, T, Expr> {}

export interface LogicUnaryOpBase<G extends LogicUnaryOpGroup> extends UnaryOpBase<G, t.Bool  > {}
export interface ArithUnaryOpBase<G extends ArithUnaryOpGroup> extends UnaryOpBase<G, t.Number> {}

export interface Cast extends UnaryOpBase<CastUnaryOpGroup, t.Type> {}

export interface Not  extends LogicUnaryOpBase<NotGroup>            {}
export interface Pos  extends ArithUnaryOpBase<PosGroup>            {}
export interface Neg  extends ArithUnaryOpBase<NegGroup>            {}

export type LogicUnaryOp = Not

export type ArithUnaryOp = Pos
                         | Neg

export type UnaryOp      = Cast
                         | LogicUnaryOp
                         | ArithUnaryOp


export interface ReadonlyUnaryOpBase<
    G extends UnaryOpGroup,
    T extends t.Type,
> extends DeepReadonly<UnaryOpBase<G, T>> {}

export interface ReadonlyLogicUnaryOpBase<G extends LogicUnaryOpGroup> extends DeepReadonly<LogicUnaryOpBase<G>> {}
export interface ReadonlyArithUnaryOpBase<G extends ArithUnaryOpGroup> extends DeepReadonly<ArithUnaryOpBase<G>> {}

export interface ReadonlyCast extends DeepReadonly<Cast> {}
export interface ReadonlyNot  extends DeepReadonly<Not>  {}
export interface ReadonlyPos  extends DeepReadonly<Pos>  {}
export interface ReadonlyNeg  extends DeepReadonly<Neg>  {}

export type ReadonlyLogicUnaryOp = DeepReadonly<LogicUnaryOp>
export type ReadonlyArithUnaryOp = DeepReadonly<ArithUnaryOp>
export type ReadonlyUnaryOp      = DeepReadonly<UnaryOp     >

// ----------------------------------------------------------------

export interface BinaryOpBase<
    G extends BinaryOpGroup,
    T extends t.Type,
> extends BinaryBase<
    G,
    T,
    Expr,
    Expr
> {}

export interface LogicBinaryOpBase<G extends LogicBinaryOpGroup> extends BinaryOpBase<G, t.Bool  > {}
export interface CmpBinaryOpBase<G extends CmpBinaryOpGroup>     extends BinaryOpBase<G, t.Bool  > {}
export interface EqBinaryOpBase<G extends EqBinaryOpGroup>       extends BinaryOpBase<G, t.Bool  > {}
export interface ArithBinaryOpBase<G extends ArithBinaryOpGroup> extends BinaryOpBase<G, t.Number> {}

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


export interface ReadonlyBinaryOpBase<
    G extends BinaryOpGroup,
    T extends t.Type,
> extends DeepReadonly<BinaryOpBase<G, T>> {}

export interface ReadonlyLogicBinaryOpBase<G extends LogicBinaryOpGroup> extends DeepReadonly<LogicBinaryOpBase<G>> {}
export interface ReadonlyCmpBinaryOpBase<G extends CmpBinaryOpGroup>     extends DeepReadonly<CmpBinaryOpBase<G>  > {}
export interface ReadonlyEqBinaryOpBase<G extends EqBinaryOpGroup>       extends DeepReadonly<EqBinaryOpBase<G>   > {}
export interface ReadonlyArithBinaryOpBase<G extends ArithBinaryOpGroup> extends DeepReadonly<ArithBinaryOpBase<G>> {}

export interface ReadonlyOr          extends DeepReadonly<Or         > {}
export interface ReadonlyAnd         extends DeepReadonly<And        > {}

export interface ReadonlyLess        extends DeepReadonly<Less       > {}
export interface ReadonlyLessOrEq    extends DeepReadonly<LessOrEq   > {}
export interface ReadonlyGreater     extends DeepReadonly<Greater    > {}
export interface ReadonlyGreaterOrEq extends DeepReadonly<GreaterOrEq> {}

export interface ReadonlyEq          extends DeepReadonly<Eq         > {}
export interface ReadonlyNotEq       extends DeepReadonly<NotEq      > {}

export interface ReadonlyAdd         extends DeepReadonly<Add        > {}
export interface ReadonlySub         extends DeepReadonly<Sub        > {}
export interface ReadonlyMul         extends DeepReadonly<Mul        > {}
export interface ReadonlyDiv         extends DeepReadonly<Div        > {}
export interface ReadonlyPow         extends DeepReadonly<Pow        > {}

export type ReadonlyLogicBinaryOp = DeepReadonly<LogicBinaryOp>
export type ReadonlyCmpBinaryOp   = DeepReadonly<CmpBinaryOp  >
export type ReadonlyEqBinaryOp    = DeepReadonly<EqBinaryOp   >
export type ReadonlyArithBinaryOp = DeepReadonly<ArithBinaryOp>
export type ReadonlyBinaryOp      = DeepReadonly<BinaryOp     >

// ----------------------------------------------------------------

export interface Call extends NaryBase<CallGroup, t.Type, Expr> {
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
        group: "root",
        type:  t.UNIT,
        args:  [init, loop],
    }
}

// ----------------------------------------------------------------

export function makeExprList(args:          Expr[]        ): ExprList
export function makeExprList(args: readonly ReadonlyExpr[]): ReadonlyExprList

export function makeExprList(args: readonly ReadonlyExpr[]): ReadonlyExprList {
    if (args.length === 0)
        return {
            group: ";",
            type:  t.UNIT,
            args:  [],
        }

    const first = args[0              ]
    const last  = args[args.length - 1]

    return {
        group:  ";",
        type:   last.type,
        args,
    }
}

// ----------------------------------------------------------------

export function makeLoop(body: ExprList,         predicate: ExprList        ): Loop
export function makeLoop(body: ReadonlyExprList, predicate: ReadonlyExprList): ReadonlyLoop

export function makeLoop(body: ReadonlyExprList, predicate: ReadonlyExprList): ReadonlyLoop {
    return {
        group: "loop",
        type:  t.UNIT,
        args:  [body, predicate],
    }
}

// ----------------------------------------------------------------

export function makeId<
    D extends d.Definition,
    T extends t.Type = D extends d.Function
        ? D extends d.Value
            ? t.Function | t.Value
            : t.Function
        : t.Value
>(definition: D): IdBase<D, T>

export function makeId<
    D extends d.Definition,
    T extends t.Type = D extends d.Function
        ? D extends d.Value
            ? t.Function | t.Value
            : t.Function
        : t.Value
>(definition: DeepReadonly<D>): ReadonlyIdBase<D, T>

export function makeId<
    D extends d.Definition,
    T extends t.Type = D extends d.Function
        ? D extends d.Value
            ? t.Function | t.Value
            : t.Function
        : t.Value
>(definition: DeepReadonly<D>): ReadonlyIdBase<D, T> {
    return {
        group: "id",
        type:  definition.type,
        definition,
    } as any
}

// ----------------------------------------------------------------

export function makeBool(value: boolean): Bool {
    return {
        group: "bool",
        type:  t.BOOL,
        value,
    }
}

// ----------------------------------------------------------------

export function makeReal(value: number): Real {
    return {
        group: "real",
        type:  window.Number.isInteger(value) ? t.INT : t.FLOAT,
        value,
    }
}

// ----------------------------------------------------------------

export function makeImm(value: number): Imm {
    return {
        group: "imm",
        type:  t.COMPLEX,
        value,
    }
}

// ----------------------------------------------------------------

export function makeAssign<G extends AssignGroup>(
    group:  G,
    id:     Id,
    value:  Expr,
    first?: boolean,
    type?:  t.Type,
): AssignBase<G>

export function makeAssign<G extends AssignGroup>(
    group:  DeepReadonly<G>,
    id:     ReadonlyId,
    value:  ReadonlyExpr,
    first?: boolean,
    type?:  t.ReadonlyType,
): ReadonlyAssignBase<G>

export function makeAssign<G extends AssignGroup>(
    group: DeepReadonly<G>,
    id:    ReadonlyId,
    value: ReadonlyExpr,
    first: boolean        = false,
    type:  t.ReadonlyType = value.type,
): ReadonlyAssignBase<G> {
    return {
        args: [id, value],
        group,
        type,
        first,
    }
}

// ----------------------------------------------------------------

export function makeUnaryOp<
    G extends UnaryOpGroup,
    T extends t.Type,
>(
    group: G,
    type:  T,
    arg:   Expr,
): UnaryOpBase<G, T>

export function makeUnaryOp<
    G extends UnaryOpGroup,
    T extends t.Type,
>(
    group: DeepReadonly<G>,
    type:  DeepReadonly<T>,
    arg:   ReadonlyExpr,
): ReadonlyUnaryOpBase<G, T>

export function makeUnaryOp<
    G extends UnaryOpGroup,
    T extends t.Type,
>(
    group: DeepReadonly<G>,
    type:  DeepReadonly<T>,
    arg:   ReadonlyExpr,
): ReadonlyUnaryOpBase<G, T> {
    return {
        args: [arg],
        group,
        type,
    }
}

// ----------------------------------------------------------------

export function makeBinaryOp<
    G extends BinaryOpGroup,
    T extends t.Type,
>(
    group: G,
    type:  T,
    lhs:   Expr,
    rhs:   Expr,
): BinaryOpBase<G, T>

export function makeBinaryOp<
    G extends BinaryOpGroup,
    T extends t.Type,
>(
    group: DeepReadonly<G>,
    type:  DeepReadonly<T>,
    lhs:   ReadonlyExpr,
    rhs:   ReadonlyExpr,
): ReadonlyBinaryOpBase<G, T>

export function makeBinaryOp<
    G extends BinaryOpGroup,
    T extends t.Type,
>(
    group: DeepReadonly<G>,
    type:  DeepReadonly<T>,
    lhs:   ReadonlyExpr,
    rhs:   ReadonlyExpr,
): ReadonlyBinaryOpBase<G, T> {
    return {
        args: [lhs, rhs],
        group,
        type,
    }
}

// ----------------------------------------------------------------

export function makeCall(id: FunctionId,         args:          Expr[]        ): Call
export function makeCall(id: ReadonlyFunctionId, args: readonly ReadonlyExpr[]): ReadonlyCall

export function makeCall(id: ReadonlyFunctionId, args: readonly ReadonlyExpr[]): ReadonlyCall {
    return {
        group: "call",
        type:  id.definition.type.returnType,
        args:  [id, ...args],
    }
}

// ----------------------------------------------------------------

export function toString(node: ReadonlyNode, indentSize: number = 4): string {
    switch (node.group) {
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

        case "root":
        case ";":
        case "=":
        case "+=":
        case "-=":
        case "*=":
        case "/=":
        case "^=":
        case "&":
        case "|":
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
        case "cast":
        case "!":
        case "pos":
        case "neg":
        case "call":
            return [
                `${node.group}: ${t.toString(node.type)}`,
                 indent(
                    node.args.map(arg => toString(arg, indentSize))
                             .join("\n"),
                    indentSize,
                ),
            ].join("\n")

        case "id":
            return `${node.definition.id}: ${t.toString(node.type)}`

        case "bool":
        case "real":
            return `${node.value}: ${t.toString(node.type)}`

        case "imm":
            return `${node.value}i: ${t.toString(node.type)}`

        default:
            const check: never = node
            return ""
    }
}