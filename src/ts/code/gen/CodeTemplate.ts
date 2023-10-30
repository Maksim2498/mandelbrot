import template      from "glsl/fragment-template.glsl"

import { placehold } from "ts/util/string"

export default class CodeTemplate {
    static readonly DEFAULT_TEMPLATE       = template
    static readonly DEFAULT_FUNCTIONS      = []
    static readonly DEFAULT_INIT           = ""
    static readonly DEFAULT_LOOP_BODY      = ""
    static readonly DEFAULT_LOOP_PREDICATE = "false"


    template!:     string
    functions!:    string[]
    init!:         string
    loopBody!:     string
    loopRedicate!: string

    private _maxIters: number = 32

    constructor() {
        this.reset()
    }

    get maxIters(): number {
        return this._maxIters
    }

    set maxIters(value: number) {
        if (!Number.isInteger(value))
            throw new Error("<maxIters> must be an integer")

        this._maxIters = value
    }

    reset() {
        this.template     = CodeTemplate.DEFAULT_TEMPLATE
        this.functions    = CodeTemplate.DEFAULT_FUNCTIONS
        this.init         = CodeTemplate.DEFAULT_INIT
        this.loopBody     = CodeTemplate.DEFAULT_LOOP_BODY
        this.loopRedicate = CodeTemplate.DEFAULT_LOOP_PREDICATE
    }

    render(): string {
        if (!Number.isInteger(this.maxIters))
            throw new Error("<maxIters> must be an integer")

        return placehold(this.template, {
            maxIters:      this.maxIters.toString(),
            functions:     this.functions.join("\n\n"),
            init:          this.init,
            loopBody:      this.loopBody,
            loopPredicate: this.loopRedicate,
        })
    }
}