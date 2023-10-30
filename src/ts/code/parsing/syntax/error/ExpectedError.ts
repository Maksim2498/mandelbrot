import SyntaxError from "./SyntaxError"

import * as t      from "ts/code/parsing/lexic/Token"

export default class ExpectedError extends SyntaxError {
    readonly got:      t.ReadonlyToken
    readonly expected: readonly t.Group[]

    constructor(
           got:      t.ReadonlyToken,
        ...expected: t.Group[]
    ) {
        const expectedString = expected.sort()
                                       .map(t => `"${t}"`)
                                       .join(", ")

        super(
            `Expected: ${expectedString}.\n` +
            `Got: ${got.group}`,
            got.code,
            got.pos,
        )

        this.got      = got
        this.expected = expected
    }
}