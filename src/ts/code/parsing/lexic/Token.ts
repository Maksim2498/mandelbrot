// ================================================================

export type EOTGroup     = "eot"
export type EOLGroup     = "eol"
export type ExprSepGroup = ";"

export type SepGroup     = EOTGroup
                         | EOLGroup
                         | ExprSepGroup

// ----------------------------------------------------------------

export type IndentSameGroup   = "indent-same"
export type IndentGrowGroup   = "indent-grow"
export type IndentShrinkGroup = "indent-shrink"

export type IndentGroup       = IndentSameGroup
                              | IndentGrowGroup
                              | IndentShrinkGroup

// ----------------------------------------------------------------

export type DoGroup      = "do"
export type WhileGroup   = "while"

export type ControlGroup = DoGroup
                         | WhileGroup

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

export type PlusGroup  = "+"
export type MinusGroup = "-"

export type SignGroup  = PlusGroup
                       | MinusGroup

// ----------------------------------------------------------------

export type NotGroup          = "!"

export type LogicUnaryOpGroup = NotGroup

export type PosGroup          = PlusGroup
export type NegGroup          = MinusGroup

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

export type AddGroup           = PlusGroup
export type SubGroup           = MinusGroup
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

export type OpGroup = UnaryOpGroup
                    | BinaryOpGroup

// ----------------------------------------------------------------

export type OpeningParenGroup  = "("
export type ClosingParenGroup  = ")"

export type ParenGroup         = OpeningParenGroup
                               | ClosingParenGroup

// ----------------------------------------------------------------

export type ArgSepGroup = ","

// ----------------------------------------------------------------

export type ExprGroup = ValueGroup
                      | AssignGroup
                      | OpGroup
                      | ParenGroup
                      | ArgSepGroup

// ----------------------------------------------------------------

export type Group = EOTGroup
                  | SepGroup 
                  | IndentGroup
                  | ControlGroup
                  | ExprGroup

// ================================================================

export interface Base<G extends Group> {
    group:  G
    code:   string
    pos:    number
    length: number
}


export interface ReaodnlyBase<G extends Group> extends Readonly<Base<G>> {}

// ----------------------------------------------------------------

export interface SepBase <G extends SepGroup> extends Base<G> {}

export interface EOT     extends SepBase<EOTGroup    > {}
export interface EOL     extends SepBase<EOLGroup    > {}
export interface ExprSep extends SepBase<ExprSepGroup> {}

export type Sep = EOT
                | EOL
                | ExprSep


export interface ReaodnlySepBase<G extends SepGroup> extends Readonly<SepBase<G>> {}

export interface ReadonlyEOT     extends Readonly<EOT    > {}
export interface ReadonlyEOL     extends Readonly<EOL    > {}
export interface ReadonlyExprSep extends Readonly<ExprSep> {}

export type ReadonlySep = Readonly<Sep>

// ----------------------------------------------------------------

export interface IndentBase<G extends IndentGroup> extends Base<G> {
    size: number
}

export interface IndentSame   extends IndentBase<IndentSameGroup  > {}
export interface IndentGrow   extends IndentBase<IndentGrowGroup  > {}
export interface IndentShrink extends IndentBase<IndentShrinkGroup> {}

export type Indent = IndentSame
                   | IndentGrow
                   | IndentShrink


export interface ReadonlyIndentBase<G extends IndentGroup> extends Readonly<IndentBase<G>> {}

export interface ReadonlyIndentSame   extends Readonly<IndentSame  > {}
export interface ReadonlyIndentGrow   extends Readonly<IndentGrow  > {}
export interface ReadonlyIndentShrink extends Readonly<IndentShrink> {}

export type ReadonlyIndent = Readonly<Indent>

// ----------------------------------------------------------------

export interface ControlBase<G extends ControlGroup> extends Base<G> {}

export interface Do    extends ControlBase<DoGroup   > {}
export interface While extends ControlBase<WhileGroup> {}

export type Control = Do
                    | While


export interface ReadonlyControlBase<G extends ControlGroup> extends Readonly<ControlBase<G>> {}

export interface ReadonlyDo    extends Readonly<Do   > {}
export interface ReadonlyWhile extends Readonly<While> {}

export type ReadonlyControl = Readonly<Control>

// ----------------------------------------------------------------

export interface ValueBase<G extends ValueGroup> extends Base<G> {}

export interface Id extends ValueBase<IdGroup> {
    id: string
}

export interface ConstBase<G extends ConstGroup> extends ValueBase<G> {
    value: G extends BoolGroup
        ? G extends NumberGroup
            ? boolean | number
            : boolean
        : number
}

export interface Bool extends ConstBase<BoolGroup> {}

export interface NumberBase<G extends NumberGroup> extends ConstBase<G> {}

export interface Real extends NumberBase<RealGroup> {}
export interface Imm  extends NumberBase<ImmGroup > {}

export type Number = Real
                   | Imm

export type Const  = Bool
                   | Number

export type Value  = Id
                   | Const


export interface ReadonlyValueBase<G extends ValueGroup> extends Readonly<ValueBase<G>> {}

export interface ReadonlyId extends Readonly<Id> {}

export interface ReadonlyConstBase<G extends ConstGroup> extends Readonly<ConstBase<G>> {}

export interface ReadonlyBool extends Readonly<Bool> {}

export interface ReadonlyNumberBase<G extends NumberGroup> extends Readonly<NumberBase<G>> {}

export interface ReadonlyReal extends Readonly<Real> {}
export interface ReadonlyImm  extends Readonly<Imm > {}

export type ReadonlyNumber = Readonly<Number>
export type ReadonlyConst  = Readonly<Const>
export type ReadonlyValue  = Readonly<Value>

// ----------------------------------------------------------------

export interface AssignBase<G extends AssignGroup> extends Base<G> {}

export interface Init extends AssignBase<InitGroup> {}

export interface ModBase<G extends ModGroup> extends AssignBase<G> {}

export interface ModAdd extends ModBase<ModAddGroup> {}
export interface ModSub extends ModBase<ModSubGroup> {}
export interface ModMul extends ModBase<ModMulGroup> {}
export interface ModDiv extends ModBase<ModDivGroup> {}
export interface ModPow extends ModBase<ModPowGroup> {}

export type Mod    = ModAdd
                   | ModSub
                   | ModMul
                   | ModDiv
                   | ModPow

export type Assign = Init
                   | Mod


export interface ReadonlyAssignBase<G extends AssignGroup> extends Readonly<AssignBase<G>> {}

export interface ReadonlyInit extends Readonly<Init> {}

export interface ReadonlyModBase<G extends ModGroup> extends Readonly<ModBase<G>> {}

export interface ReadonlyModAdd extends Readonly<ModAdd> {}
export interface ReadonlyModSub extends Readonly<ModSub> {}
export interface ReadonlyModMul extends Readonly<ModMul> {}
export interface ReadonlyModDiv extends Readonly<ModDiv> {}
export interface ReadonlyModPow extends Readonly<ModPow> {}

export type ReadonlyMod    = Readonly<Mod>
export type ReadonlyAssign = Readonly<Assign>

// ----------------------------------------------------------------

export interface SignBase<G extends SignGroup> extends Base<G> {}

export interface Plus  extends SignBase<PlusGroup > {}
export interface Minus extends SignBase<MinusGroup> {}

export type Sign = Plus
                 | Minus


export interface ReadonlySignBase<G extends SignGroup> extends Readonly<SignBase<G>> {}

export interface ReadonlyPlus  extends Readonly<Plus > {}
export interface ReadonlyMinus extends Readonly<Minus> {}

export type ReadonlySign = Readonly<Sign>

// ----------------------------------------------------------------

export interface UnaryOpBase<G extends UnaryOpGroup> extends OpBase<G> {}

export interface LogicUnaryOpBase<G extends LogicUnaryOpGroup> extends UnaryOpBase<G> {}

export interface Not extends LogicUnaryOpBase<NotGroup> {}

export interface LogicUnaryOp extends Base<LogicUnaryOpGroup> {}

export interface ArithUnaryOpBase<G extends ArithUnaryOpGroup> extends UnaryOpBase<G> {}

export interface Pos extends ArithUnaryOpBase<PosGroup> {}
export interface Neg extends ArithUnaryOpBase<NegGroup> {}

export type ArithUnaryOp = Pos
                         | Neg

export type UnaryOp      = LogicUnaryOp
                         | ArithUnaryOp


export interface ReadonlyUnaryOpBase<G extends UnaryOpGroup> extends Readonly<UnaryOpBase<G>> {}

export interface ReadonlyLogicUnaryOpBase<G extends LogicUnaryOpGroup> extends Readonly<LogicUnaryOpBase<G>> {}

export interface ReadonlyNot extends Readonly<Not> {}

export interface ReadonlyLogicUnaryOp extends Readonly<LogicUnaryOp> {}

export interface ReadonlyArithUnaryOpBase<G extends ArithUnaryOpGroup> extends Readonly<ArithUnaryOpBase<G>> {}

export interface ReadonlyPos extends Readonly<Pos> {}
export interface ReadonlyNeg extends Readonly<Neg> {}

export type ReadonlyArithUnaryOp = Readonly<ArithUnaryOp>
export type ReadonlyUnaryOp      = Readonly<UnaryOp>

// ----------------------------------------------------------------

export interface BinaryOpBase<G extends BinaryOpGroup> extends OpBase<G> {}

export interface LogicBinaryOpBase<G extends LogicBinaryOpGroup> extends BinaryOpBase<G> {}

export interface Or  extends LogicBinaryOpBase<OrGroup > {}
export interface And extends LogicBinaryOpBase<AndGroup> {}

export type LogicBinaryOp = Or
                          | And

export interface CmpBinaryOpBase<G extends CmpBinaryOpGroup> extends BinaryOpBase<G> {}

export interface Less        extends CmpBinaryOpBase<LessGroup       > {}
export interface LessOrEq    extends CmpBinaryOpBase<LessOrEqGroup   > {}
export interface Greater     extends CmpBinaryOpBase<GreaterGroup    > {}
export interface GreaterOrEq extends CmpBinaryOpBase<GreaterOrEqGroup> {}

export type CmpBinaryOp = Less
                        | LessOrEq
                        | Greater
                        | GreaterOrEq

export interface EqBinaryOpBase<G extends EqBinaryOpGroup> extends BinaryOpBase<G> {}

export interface Eq    extends EqBinaryOpBase<EqGroup   > {}
export interface NotEq extends EqBinaryOpBase<NotEqGroup> {}

export type EqBinaryOp = Eq
                       | NotEq

export interface ArithBinaryOpBase<G extends ArithBinaryOpGroup> extends BinaryOpBase<G> {}

export interface Add extends ArithBinaryOpBase<AddGroup> {}
export interface Sub extends ArithBinaryOpBase<SubGroup> {}
export interface Mul extends ArithBinaryOpBase<MulGroup> {}
export interface Div extends ArithBinaryOpBase<DivGroup> {}
export interface Pow extends ArithBinaryOpBase<PowGroup> {}

export type ArithBinaryOp = Add
                          | Sub
                          | Mul
                          | Div
                          | Pow

export type BinaryOp      = LogicBinaryOp
                          | CmpBinaryOp
                          | EqBinaryOp
                          | ArithBinaryOp


export interface ReadonlyBinaryOpBase<G extends BinaryOpGroup> extends Readonly<BinaryOpBase<G>> {}

export interface ReadonlyLogicBinaryOpBase<G extends LogicBinaryOpGroup> extends Readonly<LogicBinaryOpBase<G>> {}

export interface ReadonlyOr  extends Readonly<Or > {}
export interface ReadonlyAnd extends Readonly<And> {}

export type ReadonlyLogicBinaryOp = Readonly<LogicBinaryOp>

export interface ReadonlyCmpBinaryOpBase<G extends CmpBinaryOpGroup> extends Readonly<CmpBinaryOpBase<G>> {}

export interface ReadonlyLess        extends Readonly<Less       > {}
export interface ReadonlyLessOrEq    extends Readonly<LessOrEq   > {}
export interface ReadonlyGreater     extends Readonly<Greater    > {}
export interface ReadonlyGreaterOrEq extends Readonly<GreaterOrEq> {}

export type ReadonlyCmpBinaryOp = Readonly<CmpBinaryOp>

export interface ReadonlyEqBinaryOpBase<G extends EqBinaryOpGroup> extends Readonly<EqBinaryOpBase<G>> {}

export interface ReadonlyEq    extends Readonly<Eq> {}
export interface ReadonlyNotEq extends Readonly<NotEq> {}

export type ReadonlyEqBinaryOp = Readonly<EqBinaryOp>

export interface ReadonlyArithBinaryOpBase<G extends ArithBinaryOpGroup> extends Readonly<ArithBinaryOpBase<G>> {}

export interface ReadonlyAdd extends Readonly<Add> {}
export interface ReadonlySub extends Readonly<Sub> {}
export interface ReadonlyMul extends Readonly<Mul> {}
export interface ReadonlyDiv extends Readonly<Div> {}
export interface ReadonlyPow extends Readonly<Pow> {}

export type ReadonlyArithBinaryOp = Readonly<ArithBinaryOp>
export type ReadonlyBinaryOp      = Readonly<BinaryOp>

// ----------------------------------------------------------------

export interface OpBase<G extends OpGroup> extends Base<G> {}

export type Op = UnaryOp
               | BinaryOp


export interface ReadonlyOpBase<G extends OpGroup> extends Readonly<OpBase<G>> {}

export type ReadonlyOp = Readonly<Op>

// ----------------------------------------------------------------

export interface ParenBase<G extends ParenGroup> extends Base<G> {}

export interface OpeningParen extends ParenBase<OpeningParenGroup> {}
export interface ClosingParen extends ParenBase<ClosingParenGroup> {}

export type Paren = OpeningParen
                  | ClosingParen


export interface ReadonlyParenBase<G extends ParenGroup> extends Readonly<ParenBase<G>> {}

export interface ReadonlyOpeningParen extends Readonly<OpeningParen> {}
export interface ReadonlyClosingParen extends Readonly<ClosingParen> {}

export type ReadonlyParen = Readonly<Paren>

// ----------------------------------------------------------------

export interface ArgSep extends Base<ArgSepGroup> {}


export interface ReadonlyArgSep extends Readonly<ArgSep> {}

// ----------------------------------------------------------------

export type Expr = Value
                 | Assign
                 | Op
                 | Paren
                 | ArgSep


export type ReadonlyExpr = Readonly<Expr>

// ----------------------------------------------------------------

export type Token = EOT
                  | Sep 
                  | Indent
                  | Control
                  | Expr


export type ReadonlyToken = Readonly<Token>


export default Token

// ================================================================

export function areEqual(lhs: ReadonlyToken, rhs: ReadonlyToken): boolean {
    if (lhs.group !== rhs.group)
        return false

    switch (lhs.group) {
        case "indent-same":
        case "indent-grow":
        case "indent-shrink":
            return lhs.size === (rhs as Indent).size

        case "id":
            return lhs.id === (rhs as Id).id

        case "bool":
        case "real":
        case "imm":
            return lhs.value === (rhs as Const).value

        default:
            return true
    }
}

// ----------------------------------------------------------------

export function toString(token: ReadonlyToken): string {
    switch (token.group) {
        case "indent-same":
        case "indent-grow":
        case "indent-shrink":
            return `${token.group}(${token.size})`

        case "id":
            return `${token.group}(${token.id})`

        case "bool":
        case "real":
        case "imm":
            return `${token.group}(${token.value})`

        default:
            return token.group
    }
}