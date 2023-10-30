import { getLineInfo, capitalize, indent, count } from "ts/util/string"
import { TAB_SIZE, TAB_SPACES                   } from "ts/const"

export type ParseErrorType = "lexical"
                           | "syntax"
                           | "semantic"

export default class ParseError extends Error {
    constructor(
        public readonly type:   ParseErrorType,
        public readonly reason: string,
        public readonly code:   string,
        public readonly pos:    number,
    ) {
        if (pos < 0)
            throw Error(`<pos> must be positive`)

        if (!Number.isInteger(pos))
            throw Error(`<pos> must be an integer`)

        const prefix      = `${capitalize(type)} error in line: `
        const badLineInfo = getLineInfo(code, pos)
        const firstLine   = `${prefix}"${badLineInfo.text.replaceAll("\t", TAB_SPACES)}"`
        const offsetSize  = prefix.length
                          + badLineInfo.index
                          + (TAB_SIZE - 1) * count(badLineInfo.text, "\t", 0, badLineInfo.index)
                          + 1
        const secondLine  = indent("^", offsetSize)
        const thirdLine   = reason
        const message     = [firstLine, secondLine, thirdLine].join("\n")

        super(message)
    }
}