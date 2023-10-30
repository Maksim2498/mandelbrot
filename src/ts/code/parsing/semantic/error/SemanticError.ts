import ParseError from "ts/code/parsing/error/ParseError"

export default class SemanticError extends ParseError {
    constructor(
        reason: string,
        code:   string,
        pos:    number,
    ) {
        super("semantic", reason, code, pos)
    }
}