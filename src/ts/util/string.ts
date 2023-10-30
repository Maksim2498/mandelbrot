export interface LineInfo {
    text:       string
    index:      number
    beginIndex: number
    endIndex:   number
}

export function getLine(string: string, at: number): string {
    return getLineInfo(string, at).text
}

export function getLineInfo(string: string, at: number): LineInfo {
    const beginIndex = getLineBeginIndex(string, at)
    const endIndex   = getLineEndIndex(string, beginIndex)
    const index      = at - beginIndex
    const text       = string.substring(beginIndex, endIndex)

    return {
        text,
        index,
        beginIndex,
        endIndex,
    }
}

export function getLineBeginIndex(string: string, from: number = 0): number {
    if (!isGoodIndex(from))
        return 0

    if (string[from] === "\n" && from + 1 < string.length)
        return from + 1

    do
        --from
    while (string[from] != "\n" && from >= 0)

    return from + 1
}

export function getLineEndIndex(string: string, from: number = 0): number {
    if (!isGoodIndex(from))
        return string.length

    const index = string.indexOf("\n", from)

    return index >= 0 ? index
                      : string.length
}

function isGoodIndex(index: number): boolean {
    return index >= 0
        && Number.isInteger(index)
}

export function capitalize(string: string): string {
    return string.length !== 0 ? string[0].toUpperCase() + string.substring(1)
                               : ""
}

export function indent(string: string, size: number): string {
    const indent = " ".repeat(size)

    return string.split("\n")
                 .map(line => indent + line)
                 .join("\n")
}

export function count(
    string: string,
    target: string,
    from:   number = 0,
    to:     number = string.length,
): number {
    let count = 0

    for (let index = from; index < to;) {
        index = string.indexOf(target, index)

        if (index < 0)
            break

        index += target.length

        ++count
    }

    return count
}

export function placehold(
    string:       string,
    pairs:        { [key: string]: string | undefined },
    open:         string = "{{",
    close:        string = "}}",
    defaultValue: string = "",
): string {
    const result = new Array<string>()

    let i = 0

    while (i < string.length) {
        const openIndex = string.indexOf(open, i)

        if (openIndex < 0)
            break

        const keyIndex   = openIndex + open.length
        const closeIndex = string.indexOf(close, keyIndex)

        if (closeIndex < 0)
            break

        const sep = string.substring(i, openIndex)

        result.push(sep)

        const key   = string.substring(keyIndex, closeIndex).trim()
        const value = pairs[key] ?? defaultValue

        result.push(value)

        i = closeIndex + close.length
    }

    const rem = string.substring(i)

    result.push(rem)

    return result.join("")
}