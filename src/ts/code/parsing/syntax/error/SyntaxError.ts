import ParseError from "ts/code/parsing/error/ParseError"

export default class SyntaxError extends ParseError {
    constructor(
        reason: string,
        code:   string,
        pos:    number,
    ) {
        super("syntax", reason, code, pos)
    }
}