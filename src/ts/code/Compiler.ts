import CodeGenerator from "./gen/CodeGenerator"
import CodeTemplate  from "./gen/CodeTemplate"
import Parser        from "./parsing/Parser"

import * as semantic from "./parsing/semantic/Node"


export interface Options {
    parser?:        Parser
    codeGenerator?: CodeGenerator
    logCode?:       boolean
    doBuffer?:      boolean
}

export interface ReadonlyOptions extends Readonly<Options> {}


export default class Compiler {
    static readonly DEFAULT_PARSER         = new Parser()
    static readonly DEFAULT_CODE_GENERATOR = new CodeGenerator()
    static readonly DEFAULT_LOG_CODE       = false
    static readonly DEFAULT_DO_BUFFER      = true


    parser:        Parser
    codeGenerator: CodeGenerator
    logCode:       boolean
    doBuffer:      boolean

    private _oldTree:     semantic.Root | null = null
    private _oldTempalte: CodeTemplate  | null = null

    constructor(options: ReadonlyOptions = {}) {
        this.parser        = options.parser        ?? Compiler.DEFAULT_PARSER
        this.codeGenerator = options.codeGenerator ?? Compiler.DEFAULT_CODE_GENERATOR
        this.logCode       = options.logCode       ?? Compiler.DEFAULT_LOG_CODE
        this.doBuffer      = options.doBuffer      ?? Compiler.DEFAULT_DO_BUFFER
    }

    compile(code: string): CodeTemplate {
        const tree = this.parser.parse(code)

        if (tree === this._oldTree)
            return this._oldTempalte!

        const template = this.codeGenerator.generateCode(tree)

        if (this.logCode) {
            console.log("Code:")
            console.log(template.render())
        }

        this._oldTree     = tree
        this._oldTempalte = template
    
        return template
    }
}