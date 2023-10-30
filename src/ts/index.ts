import flowerCode                from "mandelbrot/flower.mandelbrot"
import mandelbrotExCode          from "mandelbrot/mandelbrot-ex.mandelbrot"
import mandelbrotCode            from "mandelbrot/mandelbrot.mandelbrot"
import targetCode                from "mandelbrot/target.mandelbrot"
import voidCode                  from "mandelbrot/void.mandelbrot"
import islandsCode               from "mandelbrot/islands.mandelbrot"
import Renderer                  from "./render/Renderer"

import { forceGetElementById,
         addError, clearErrors } from "./util/dom"

import "css/index.css"

interface Predef {
    name: string
    code: string
}

const PREDEFS: Predef[] = [
    {
        name: "Mandelbrot",
        code: mandelbrotCode,
    },
    {
        name: "Mandelbrot-Ex",
        code: mandelbrotExCode,
    },
    {
        name: "Target",
        code: targetCode,
    },
    {
        name: "Flower",
        code: flowerCode,
    },
    {
        name: "Void",
        code: voidCode,
    },
    {
        name: "Islands",
        code: islandsCode,
    }
]

try {
    const canvasContainerDiv        = forceGetElementById("canvas-container")             as HTMLDivElement
    const mainCanvas                = forceGetElementById("main-canvas")                  as HTMLCanvasElement
    const debugCanvas               = forceGetElementById("debug-canvas")                 as HTMLCanvasElement
    const predefSelect              = forceGetElementById("predef-select")                as HTMLSelectElement
    const codeTextArea              = forceGetElementById("code-text-area")               as HTMLTextAreaElement
    const iterCountInput            = forceGetElementById("max-iters-input")              as HTMLInputElement
    const xInput                    = forceGetElementById("x-input")                      as HTMLInputElement
    const yInput                    = forceGetElementById("y-input")                      as HTMLInputElement
    const scaleInput                = forceGetElementById("scale-input")                  as HTMLInputElement
    const angleInput                = forceGetElementById("angle-input")                  as HTMLInputElement
    const setColorInput             = forceGetElementById("set-color-input")              as HTMLInputElement
    const backgroundStartColorInput = forceGetElementById("background-start-color-input") as HTMLInputElement
    const backgroundEndColorInput   = forceGetElementById("background-end-color-input")   as HTMLInputElement
    const resolutionScaleInput      = forceGetElementById("resolution-scale-input")       as HTMLInputElement
    const useRealPixelSizeInput     = forceGetElementById("use-real-pixel-size-input")    as HTMLInputElement
    const showFPSInput              = forceGetElementById("show-fps-input")               as HTMLInputElement
    const logTokensInput            = forceGetElementById("log-tokens-input")             as HTMLInputElement
    const logSyntaxTreeInput        = forceGetElementById("log-syntax-tree-input")        as HTMLInputElement
    const logSemanticTreeInput      = forceGetElementById("log-semantic-tree-input")      as HTMLInputElement
    const logGLSLCodeInput          = forceGetElementById("log-glsl-code-input")          as HTMLInputElement
    const autocompileInput          = forceGetElementById("autocompile-input")            as HTMLInputElement
    const compileButton             = forceGetElementById("compile-button")               as HTMLButtonElement
    const fullscreenButton          = forceGetElementById("fullscreen-button")            as HTMLButtonElement


    const renderer = new Renderer(mainCanvas, debugCanvas)

    renderer.autoRedraw = true
    renderer.autoResize = true


    initInPredefSelect()

    predefSelect.onchange = onPredefChange
    onPredefChange()


    codeTextArea.oninput              = onCodeChange

    iterCountInput.oninput            = () => onNumberChange("maxIters",        iterCountInput      )
    xInput.oninput                    = () => onNumberChange("x",               xInput              )
    yInput.oninput                    = () => onNumberChange("y",               yInput              )
    scaleInput.oninput                = () => onNumberChange("scale",           scaleInput          )
    angleInput.oninput                = () => onNumberChange("angle",           angleInput          )
    resolutionScaleInput.oninput      = () => onNumberChange("resolutionScale", resolutionScaleInput)

    setColorInput.oninput             = () => onColorChange("setColor",             setColorInput            )
    backgroundStartColorInput.oninput = () => onColorChange("backgroundStartColor", backgroundStartColorInput)
    backgroundEndColorInput.oninput   = () => onColorChange("backgroundEndColor",   backgroundEndColorInput  )

    useRealPixelSizeInput.oninput     = () => onBoolChange("useRealPixelSize", useRealPixelSizeInput)
    showFPSInput.oninput              = () => onBoolChange("showFPS",          showFPSInput         )

    logTokensInput.oninput            = () => onParserBoolChange("logTokens",       logTokensInput      )
    logSyntaxTreeInput.oninput        = () => onParserBoolChange("logSyntaxTree",   logSyntaxTreeInput  )
    logSemanticTreeInput.oninput      = () => onParserBoolChange("logSemanticTree", logSemanticTreeInput)

    logGLSLCodeInput.oninput          = () => onCompilerBoolChange("logCode", logGLSLCodeInput)

    autocompileInput.oninput          = onAutocompileChange

    compileButton.onclick             = onCompile
    fullscreenButton.onclick          = onFullscreen


    const inputs = [
        codeTextArea,

        iterCountInput,
        xInput,
        yInput,
        scaleInput,
        angleInput,
        resolutionScaleInput,

        setColorInput,
        backgroundStartColorInput,
        backgroundEndColorInput,

        useRealPixelSizeInput,
        showFPSInput,
        logTokensInput,
        logSyntaxTreeInput,
        logSemanticTreeInput,
        logGLSLCodeInput,
        autocompileInput,
    ]

    for (const input of inputs)
        input.dispatchEvent(new Event("input"))


    codeTextArea.onkeydown = function(e) {
        if (e.key !== "Tab")
            return

        e.preventDefault()

        const start = codeTextArea.selectionStart
        const end   = codeTextArea.selectionEnd
        const value = codeTextArea.value

        codeTextArea.value = value.substring(0, start) +
                             "\t"                      +
                             value.substring(end)

        codeTextArea.selectionStart = codeTextArea.selectionEnd
                                    = start + 1

        codeTextArea.dispatchEvent(new Event("input"))
    }

    debugCanvas.onmousemove = e => {
        if (e.buttons !== 1) // Left mouse button
            return

        const dx = -2 * e.movementX / renderer.mainCanvas.clientWidth  / renderer.scale * renderer.aspectRatio
        const dy =  2 * e.movementY / renderer.mainCanvas.clientHeight / renderer.scale

        const newX = renderer.x + dx
        const newY = renderer.y + dy

        renderer.x = newX
        renderer.y = newY

        xInput.value = newX.toString()
        yInput.value = newY.toString()
    }

    debugCanvas.onwheel = e => {
        renderer.scale   *= Math.pow(.99, e.deltaY)
        scaleInput.value  = renderer.scale.toString()
    }

    function initInPredefSelect() {
        for (const option of PREDEFS.map(predefToOptionElement))
            predefSelect.appendChild(option)

        if (PREDEFS.length > 0)
            predefSelect.selectedIndex = 0

        return

        function predefToOptionElement(predef: Predef, index: number): HTMLOptionElement {
            const option = document.createElement("option")

            option.innerHTML = `${index + 1}. ${predef.name}`
            option.value     = index.toString()

            return option
        }
    }

    function onPredefChange() {
        const id     = Number(predefSelect.value)
        const predef = PREDEFS[id]

        codeTextArea.value = predef.code

        onCodeChange()
    }

    function onCodeChange() {
        if (autocompileInput.checked)
            onCompile()
    }

    function onNumberChange(
        keyName: "maxIters" | "x" | "y" | "scale" | "angle" | "resolutionScale",
        element: HTMLInputElement,
    ) {
        clearErrors(element)

        try {
            const value = Number(element.value)

            if (Number.isNaN(value))
                throw new Error("Not a number")

            if (element.min && value < Number(element.min))
                throw new Error(`Too small.\nMinimum allowed value is ${element.min}`)

            if (element.max && value < Number(element.max))
                throw new Error(`Too small.\nMinimum allowed value is ${element.max}`)

            renderer[keyName] = value
        } catch (error) {
            addError(error, element)
        }
    }

    function onColorChange(
        keyName: "setColor" | "backgroundStartColor" | "backgroundEndColor",
        element: HTMLInputElement,
    ) {
        renderer[keyName] = element.value
    }

    function onBoolChange(
        keyName: "useRealPixelSize" | "showFPS",
        element: HTMLInputElement,
    ) {
        renderer[keyName] = element.checked
    }

    function onParserBoolChange(
        keyName: "logTokens" | "logSyntaxTree" | "logSemanticTree",
        element: HTMLInputElement,
    ) {
        renderer.compiler.parser[keyName] = element.checked
    }

    function onCompilerBoolChange(
        keyName: "logCode",
        element: HTMLInputElement,
    ) {
        renderer.compiler[keyName] = element.checked
    }

    function onAutocompileChange() {
        compileButton.style.display = autocompileInput.checked ? "none"
                                                               : "inline-block"
    }

    function onCompile() {
        clearErrors(codeTextArea)

        try {
            renderer.code = codeTextArea.value
        } catch (error) {
            addError(error, codeTextArea)
        }
    }

    function onFullscreen() {
        if (document.fullscreenElement == null)
            canvasContainerDiv.requestFullscreen()
        else
            document.exitFullscreen()
    }
} catch (error) {
    console.error(error)
}