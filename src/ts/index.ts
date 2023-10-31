import flowerCode                from "mandelbrot/flower.mandelbrot"
import animatedFlowerCode        from "mandelbrot/animated-flower.mandelbrot"
import generalizedMandelbrotCode from "mandelbrot/generalized-mandelbrot.mandelbrot"
import mandelbrotCode            from "mandelbrot/mandelbrot.mandelbrot"
import targetCode                from "mandelbrot/target.mandelbrot"
import animatedTargetCode        from "mandelbrot/animated-target.mandelbrot"
import voidCode                  from "mandelbrot/void.mandelbrot"
import islandsCode               from "mandelbrot/islands.mandelbrot"
import Renderer                  from "./render/Renderer"

import { onTabKeyDown,
         onNumberChange,
         forceGetElementById,
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
        name: "Mandelbrot (Generalized)",
        code: generalizedMandelbrotCode,
    },
    {
        name: "Target",
        code: targetCode,
    },
    {
        name: "Target (Animated)",
        code: animatedTargetCode,
    },
    {
        name: "Flower",
        code: flowerCode,
    },
    {
        name: "Flower (Animated)",
        code: animatedFlowerCode,
    },
    {
        name: "Void (WIP)",
        code: voidCode,
    },
    {
        name: "Islands (WIP)",
        code: islandsCode,
    }
]

try {
    const canvasContainerDiv        = forceGetElementById("canvas-container"            ) as HTMLDivElement
    const mainCanvas                = forceGetElementById("main-canvas"                 ) as HTMLCanvasElement
    const debugCanvas               = forceGetElementById("debug-canvas"                ) as HTMLCanvasElement
    const predefSelect              = forceGetElementById("predef-select"               ) as HTMLSelectElement
    const codeTextArea              = forceGetElementById("code-text-area"              ) as HTMLTextAreaElement
    const iterCountInput            = forceGetElementById("max-iters-input"             ) as HTMLInputElement
    const xInput                    = forceGetElementById("x-input"                     ) as HTMLInputElement
    const yInput                    = forceGetElementById("y-input"                     ) as HTMLInputElement
    const scaleInput                = forceGetElementById("scale-input"                 ) as HTMLInputElement
    const angleInput                = forceGetElementById("angle-input"                 ) as HTMLInputElement
    const setColorInput             = forceGetElementById("set-color-input"             ) as HTMLInputElement
    const backgroundStartColorInput = forceGetElementById("background-start-color-input") as HTMLInputElement
    const backgroundEndColorInput   = forceGetElementById("background-end-color-input"  ) as HTMLInputElement
    const scaleSensitivityInput     = forceGetElementById("scale-sensitivity-input"     ) as HTMLInputElement
    const resolutionScaleInput      = forceGetElementById("resolution-scale-input"      ) as HTMLInputElement
    const useRealPixelSizeInput     = forceGetElementById("use-real-pixel-size-input"   ) as HTMLInputElement
    const showResolutionInput       = forceGetElementById("show-resolution-input"       ) as HTMLInputElement
    const showFPSInput              = forceGetElementById("show-fps-input"              ) as HTMLInputElement
    const logTokensInput            = forceGetElementById("log-tokens-input"            ) as HTMLInputElement
    const logSyntaxTreeInput        = forceGetElementById("log-syntax-tree-input"       ) as HTMLInputElement
    const logSemanticTreeInput      = forceGetElementById("log-semantic-tree-input"     ) as HTMLInputElement
    const logGLSLCodeInput          = forceGetElementById("log-glsl-code-input"         ) as HTMLInputElement
    const autocompileInput          = forceGetElementById("autocompile-input"           ) as HTMLInputElement
    const lazyRenderingInput        = forceGetElementById("lazy-rendering-input"        ) as HTMLInputElement
    const compileButton             = forceGetElementById("compile-button"              ) as HTMLButtonElement
    const fullscreenButton          = forceGetElementById("fullscreen-button"           ) as HTMLButtonElement


    const renderer = new Renderer(mainCanvas, debugCanvas)

    renderer.autoRedraw = true
    renderer.autoResize = true


    let scaleSensitivity = 1

    scaleSensitivityInput.oninput = onScaleSensitivityChange
    onScaleSensitivityChange()


    initInPredefSelect()

    predefSelect.onchange = onPredefChange
    onPredefChange()


    codeTextArea.oninput              = onCodeChange

    iterCountInput.oninput            = () => onRendererNumberChange("maxIters",        iterCountInput      )
    xInput.oninput                    = () => onRendererNumberChange("x",               xInput              )
    yInput.oninput                    = () => onRendererNumberChange("y",               yInput              )
    scaleInput.oninput                = () => onRendererNumberChange("scale",           scaleInput          )
    angleInput.oninput                = () => onRendererNumberChange("angle",           angleInput          )
    resolutionScaleInput.oninput      = () => onRendererNumberChange("resolutionScale", resolutionScaleInput)

    setColorInput.oninput             = () => onRendererColorChange("setColor",             setColorInput            )
    backgroundStartColorInput.oninput = () => onRendererColorChange("backgroundStartColor", backgroundStartColorInput)
    backgroundEndColorInput.oninput   = () => onRendererColorChange("backgroundEndColor",   backgroundEndColorInput  )

    useRealPixelSizeInput.oninput     = () => onRendererBoolChange("useRealPixelSize", useRealPixelSizeInput)
    showResolutionInput.oninput       = () => onRendererBoolChange("showResolution",   showResolutionInput  )
    lazyRenderingInput.oninput        = () => onRendererBoolChange("lazy",             lazyRenderingInput   )
    showFPSInput.oninput              = () => onRendererBoolChange("showFPS",          showFPSInput         )

    logTokensInput.oninput            = () => onParserBoolChange("logTokens",       logTokensInput      )
    logSyntaxTreeInput.oninput        = () => onParserBoolChange("logSyntaxTree",   logSyntaxTreeInput  )
    logSemanticTreeInput.oninput      = () => onParserBoolChange("logSemanticTree", logSemanticTreeInput)

    logGLSLCodeInput.oninput          = () => onCompilerBoolChange("logCode", logGLSLCodeInput)

    autocompileInput.oninput          = onAutocompileChange

    compileButton.onclick             = onCompile
    fullscreenButton.onclick          = onFullscreen
    canvasContainerDiv.onkeydown      = onFullscreenKeyDown


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

        scaleSensitivityInput,
        useRealPixelSizeInput,
        showResolutionInput,
        showFPSInput,
        logTokensInput,
        logSyntaxTreeInput,
        logSemanticTreeInput,
        logGLSLCodeInput,
        autocompileInput,
        lazyRenderingInput,
    ]

    for (const input of inputs)
        input.dispatchEvent(new Event("input"))


    codeTextArea.onkeydown = event => onTabKeyDown(event, codeTextArea)

    debugCanvas.onmousemove = event => {
        if ((event.buttons & 1) === 0) // Primary (usually left) mouse button
            return

        const dx = -2 * event.movementX / renderer.mainCanvas.clientWidth  / renderer.scale * renderer.aspectRatio
        const dy =  2 * event.movementY / renderer.mainCanvas.clientHeight / renderer.scale

        const newX = renderer.x + dx
        const newY = renderer.y + dy

        renderer.x = newX
        renderer.y = newY

        xInput.value = newX.toString()
        yInput.value = newY.toString()

        document.body.style.cursor = "grabbing"
    }

    onmouseup = event => {
        if (event.button === 0) // No buttons pressed
            document.body.style.cursor = "default"
    }

    debugCanvas.onwheel = event => {
        const scaleFactor = Math.pow(.99, scaleSensitivity * event.deltaY)
        const deltaScale  =  (1 - scaleFactor) / (renderer.scale * scaleFactor)

        const deltaX      = -(2 * event.clientX / debugCanvas.width  - 1) * deltaScale * renderer.aspectRatio
        const deltaY      =  (2 * event.clientY / debugCanvas.height - 1) * deltaScale

        renderer.scale   *= scaleFactor
        renderer.x       += deltaX
        renderer.y       += deltaY

        scaleInput.value  = renderer.scale.toString()
        xInput.value      = renderer.x.toString()
        yInput.value      = renderer.y.toString()
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

    function onScaleSensitivityChange() {
        onNumberChange(scaleSensitivityInput, number => scaleSensitivity = number)
    }

    function onCodeChange() {
        if (autocompileInput.checked)
            onCompile()
    }

    function onRendererNumberChange(
        keyName: "maxIters" | "x" | "y" | "scale" | "angle" | "resolutionScale",
        element: HTMLInputElement,
    ) {
        onNumberChange(element, number => renderer[keyName] = number)
    }

    function onRendererColorChange(
        keyName: "setColor" | "backgroundStartColor" | "backgroundEndColor",
        element: HTMLInputElement,
    ) {
        renderer[keyName] = element.value
    }

    function onRendererBoolChange(
        keyName: "useRealPixelSize" | "lazy" | "showResolution" | "showFPS",
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

    function onFullscreenKeyDown(event: KeyboardEvent) {
        if (event.key === "F" || event.key === "f")
            onFullscreen()
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