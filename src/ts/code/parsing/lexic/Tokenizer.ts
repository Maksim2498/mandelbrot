import DeepReadonly  from "ts/util/type/DeepReadonly"
import LexicalError  from "./error/LexicalError"

import * as t        from "./Token"

import { TAB_SIZE  } from "ts/const"

/*
    Lexic:

    control:  do|while
    id:       [_A-Za-z][_A-Za-z0-9]*
    boo:      true|false
    number:   (\d+(\.\d+)?|\.\d+)i?(?![_A-Za-z])
    sep:      \n|;|,|$
    op:       +|-|*|/|^|=|+=|-=|*=|/=|^=|<|<=|>|>=|==|!=|!|&|\|
    paren:    \(|\)
*/

export type TokenizationResult         = [...t.Token[], t.EOT]
export type ReadonlyTokenizationResult = DeepReadonly<TokenizationResult>

export default class Tokenizer {
    private static readonly _NUMBER_REGEX     = /^(\d+(\.\d+)?|\.\d+)i?(?![_A-Za-z])/
    private static readonly _ID_REGEX         = /^[_A-Za-z][_A-Za-z0-9]*/
    private static readonly _BLANK_LINE_REGEX = /^[\u0009 ]*\n?/

    tokenize(code: string): TokenizationResult {
        const tokens         = new Array<t.Token>()
        const oldIndentSizes = [0]

        let inLine = false

        for (let pos = 0; pos < code.length;) {
            const match = code.substring(pos)
                              .match(Tokenizer._BLANK_LINE_REGEX)![0]

            const length = match.length
            
            pos += length

            if (match.endsWith("\n")) {
                if (inLine) {
                    tokens.push({
                        group:  "eol",
                        length: 1,
                        pos:    pos - 1,
                        code,
                    })
                
                    inLine = false
                }

                continue
            }

            if (pos >= code.length)
                break

            if (!inLine) {
                let indentSize = 0

                for (const char of match)
                    switch (char) {
                        case " ":
                            ++indentSize
                            break

                        case "\t":
                            indentSize += TAB_SIZE
                            break
                    }

                const oldIndentSize = oldIndentSizes[oldIndentSizes.length - 1]

                let group: t.IndentGroup

                if (indentSize > oldIndentSize) {
                    group = "indent-grow"
                    oldIndentSizes.push(indentSize)
                } else if (indentSize < oldIndentSize) {
                    const preOldIndentSize = oldIndentSizes[oldIndentSizes.length - 2]

                    if (preOldIndentSize !== indentSize)
                        throw new LexicalError("Indent missmatch", code, pos)

                    group = "indent-shrink"

                    oldIndentSizes.pop()
                } else
                    group = "indent-same"

                tokens.push({
                    size: indentSize,
                    group,
                    code,
                    pos,
                    length,
                })

                inLine = true
            }

            const char = code[pos]

            switch (char) {
                case "+":
                case "-":
                case "*":
                case "/":
                case "^":
                case "!":
                case "=":
                case "<":
                case ">":
                    if (code[pos + 1] === "=") {
                        tokens.push({
                            group:  `${char}=`,
                            length: 2,
                            code,
                            pos,
                        })

                        pos += 2

                        break
                    }

                case "=":
                case "(":
                case ")":
                case "&":
                case "|":
                case ";":
                case ",":
                    tokens.push({
                        group:  char,
                        length: 1,
                        code,
                        pos,
                    })

                    ++pos

                    break

                case ".":
                case "0":
                case "1":
                case "2":
                case "3":
                case "4":
                case "5":
                case "6":
                case "7":
                case "8":
                case "9": {
                    const match = code.substring(pos)
                                      .match(Tokenizer._NUMBER_REGEX)
                                     ?.at(0)

                    if (match == null)
                        throw new LexicalError("Expected number", code, pos)

                    const isComplex   = match.endsWith("i")
                    const valueString = isComplex ? match.substring(0, match.length - 1) : match
                    const value       = Number(valueString)
                    const length      = match.length
                    const group       = isComplex ? "imm" : "real"
                    const token       = {
                        code,
                        pos,
                        length,
                        value,
                        group,
                    } as const

                    tokens.push(token)

                    pos += length

                    break
                }
            
                default: {
                    const match = code.substring(pos)
                                      .match(Tokenizer._ID_REGEX)
                                     ?.at(0)

                    if (match == null)
                        throw new LexicalError("Illegal character", code, pos)

                    const length = match.length

                    let token: t.Token

                    switch (match) {
                        case "do":
                        case "while":
                            token = {
                                group: match,
                                code,
                                pos,
                                length,
                            }

                            break

                        case "true":
                        case "false":
                            token = {
                                group: "bool",
                                value: match === "true",
                                code,
                                pos,
                                length,
                            }

                            break

                        default:
                            token = {
                                group: "id",
                                id:    match,
                                code,
                                pos,
                                length,
                            }
                    }

                    tokens.push(token)

                    pos += length

                    break
                }
            }
        }

        if (tokens[tokens.length - 1]?.group === "eol")
            tokens.pop()

        tokens.push({
            group:  "eot",
            pos:    code.length,
            length: 0,
            code,
        })

        return tokens as TokenizationResult
    }
}