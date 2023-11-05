import Tokenizer              from "./lexic/Tokenizer"
import SematicAnalyzer        from "./semantic/SemanticAnalyzer"
import TreeBuilder            from "./syntax/TreeBuilder"

import * as lexic             from "./lexic/Token"
import * as syntax            from "./syntax/Node"
import * as semantic          from "./semantic/Node"

import { TokenizationResult } from "ts/code/parsing/lexic/Tokenizer"


export interface Options {
    tokenizer?:        Tokenizer
    treeBuilder?:      TreeBuilder
    semanticAnalyzer?: SematicAnalyzer
    logTokens?:        boolean
    logSyntaxTree?:    boolean
    logSemanticTree?:  boolean
    doBuffer?:         boolean
}

export interface ReadonlyOptions extends Readonly<Options> {}


export default class Parser {
    static readonly DEFAULT_TOKENIZER         = new Tokenizer()
    static readonly DEFAULT_TREE_BUILDER      = new TreeBuilder()
    static readonly DEFAULT_SEMATIC_ANALYZER  = new SematicAnalyzer()
    static readonly DEFAULT_LOG_TOKENS        = false
    static readonly DEFAULT_LOG_SYNTAX_TREE   = false
    static readonly DEFAULT_LOG_SEMANTIC_TREE = false
    static readonly DEFAULT_DO_BUFFER         = true


    tokenizer:        Tokenizer
    treeBuilder:      TreeBuilder
    semanticAnalyzer: SematicAnalyzer
    logTokens:        boolean
    logSyntaxTree:    boolean
    logSemanticTree:  boolean
    doBuffer:         boolean

    private _oldTokens:       TokenizationResult | null = null
    private _oldSemanticTree: semantic.Root      | null = null

    constructor(options: ReadonlyOptions = {}) {
        this.tokenizer        = options.tokenizer        ?? Parser.DEFAULT_TOKENIZER
        this.treeBuilder      = options.treeBuilder      ?? Parser.DEFAULT_TREE_BUILDER
        this.semanticAnalyzer = options.semanticAnalyzer ?? Parser.DEFAULT_SEMATIC_ANALYZER
        this.logTokens        = options.logTokens        ?? Parser.DEFAULT_LOG_TOKENS
        this.logSyntaxTree    = options.logSyntaxTree    ?? Parser.DEFAULT_LOG_SYNTAX_TREE
        this.logSemanticTree  = options.logSemanticTree  ?? Parser.DEFAULT_LOG_SYNTAX_TREE
        this.doBuffer         = options.doBuffer         ?? Parser.DEFAULT_DO_BUFFER
    }

    parse(code: string): semantic.Root {
        const tokens = this.tokenizer.tokenize(code)

        if (this.logTokens) {
            console.log("Tokens:")
            console.log(JSON.stringify(tokens.map(lexic.toString), null, 4))
        }

        if (this.doBuffer && this._isTokenizationResultEqual(tokens))
            return this._oldSemanticTree!

        const syntaxTree = this.treeBuilder.buildTree(tokens)

        if (this.logSyntaxTree) {
            console.log("Syntax Tree:")
            console.log(syntax.toString(syntaxTree))
        }

        const semanticTree = this.semanticAnalyzer.analyzeSemantic(syntaxTree)

        if (this.logSemanticTree) {
            console.log("Semantic Tree:")
            console.log(semantic.toString(semanticTree))
        }

        this._oldTokens       = tokens
        this._oldSemanticTree = semanticTree

        return semanticTree
    }

    private _isTokenizationResultEqual(result: TokenizationResult,): boolean {
        if (this._oldTokens == null)
            return false

        if (result.length !== this._oldTokens.length)
            return false

        for (let i = 0; i < result.length; ++i) {
            const lhs = result[i]
            const rhs = this._oldTokens[i]

            if (!lexic.areEqual(lhs, rhs))
                return false
        }

        return true
    }
}