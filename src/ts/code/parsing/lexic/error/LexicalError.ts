import ParseError from "ts/code/parsing/error/ParseError"

export default class LexicalError extends ParseError {
    constructor(
        reason: string,
        code:   string,
        pos:    number,
    ) {
        super("lexical", reason, code, pos)
    }
}