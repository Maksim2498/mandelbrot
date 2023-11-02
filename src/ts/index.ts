import flowerCode                 from "mandelbrot/flower.mandelbrot"
import animatedFlowerCode         from "mandelbrot/animated-flower.mandelbrot"
import generalizedMandelbrotCode  from "mandelbrot/generalized-mandelbrot.mandelbrot"
import mandelbrotCode             from "mandelbrot/mandelbrot.mandelbrot"
import targetCode                 from "mandelbrot/target.mandelbrot"
import animatedTargetCode         from "mandelbrot/animated-target.mandelbrot"
import newtonsPoolsCode           from "mandelbrot/newtons-pools.mandelbrot"
import islandsCode                from "mandelbrot/islands.mandelbrot"
import Renderer                   from "./render/Renderer"

import { onNumberChange,
         forceGetElementById,
         addError, clearErrors,
         tabKeyDownEventHandler } from "./util/dom"

import "css/index.css"


interface Predef {
    name: string
    code: string
}

interface ReadonlyPredef extends Readonly<Predef> {}


const PREDEFS: readonly ReadonlyPredef[] = [
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
        name: "Newton's Pools",
        code: newtonsPoolsCode,
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
    const controlPanelDiv           = forceGetElementById("control-panel"               ) as HTMLDivElement
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

    scaleSensitivityInput.addEventListener("input", onScaleSensitivityChange)
    onScaleSensitivityChange()


    initPredefSelect()
    predefSelect.addEventListener("change", onPredefChange)
    onPredefChange()


    codeTextArea.addEventListener("input", onCodeChange)

    iterCountInput.addEventListener("input", () => onRendererNumberChange("maxIters", iterCountInput))
    xInput.addEventListener("input", () => onRendererNumberChange("x", xInput))
    yInput.addEventListener("input", () => onRendererNumberChange("y", yInput))
    scaleInput.addEventListener("input", () => onRendererNumberChange("scale", scaleInput))
    angleInput.addEventListener("input", () => onRendererNumberChange("angle", angleInput))
    resolutionScaleInput.addEventListener("input", () => onRendererNumberChange("resolutionScale", resolutionScaleInput))

    setColorInput.addEventListener("input", () => onRendererColorChange("setColor", setColorInput))
    backgroundStartColorInput.addEventListener("input", () => onRendererColorChange("backgroundStartColor", backgroundStartColorInput))
    backgroundEndColorInput.addEventListener("input", () => onRendererColorChange("backgroundEndColor", backgroundEndColorInput))

    useRealPixelSizeInput.addEventListener("input", () => onRendererBoolChange("useRealPixelSize", useRealPixelSizeInput))
    showResolutionInput.addEventListener("input", () => onRendererBoolChange("showResolution", showResolutionInput))
    lazyRenderingInput.addEventListener("input", () => onRendererBoolChange("lazy", lazyRenderingInput))
    showFPSInput.addEventListener("input", () => onRendererBoolChange("showFPS", showFPSInput))

    logTokensInput.addEventListener("input", () => onParserBoolChange("logTokens", logTokensInput))
    logSyntaxTreeInput.addEventListener("input", () => onParserBoolChange("logSyntaxTree", logSyntaxTreeInput))
    logSemanticTreeInput.addEventListener("input", () => onParserBoolChange("logSemanticTree", logSemanticTreeInput))

    logGLSLCodeInput.addEventListener("input", () => onCompilerBoolChange("logCode", logGLSLCodeInput))

    autocompileInput.addEventListener("input", onAutocompileChange)

    compileButton.addEventListener("click", onCompile)
    fullscreenButton.addEventListener("click", onFullscreen)


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


    codeTextArea.addEventListener("keydown", tabKeyDownEventHandler)
    

    canvasContainerDiv.addEventListener("keydown", zeroKeyDownEventHandler)
    canvasContainerDiv.addEventListener("keydown", fullscreenKeyDownEventHandler)

    canvasContainerDiv.addEventListener("wheel", event => {
        const scaleFactor = Math.pow(.99, scaleSensitivity * event.deltaY)
        const oldScale    = renderer.scale
        const newScale    = oldScale * scaleFactor
        const deltaScale  =  (1 - scaleFactor) / newScale

        const deltaX      = -(2 * event.clientX / debugCanvas.width  - 1) * deltaScale * renderer.aspectRatio
        const deltaY      =  (2 * event.clientY / debugCanvas.height - 1) * deltaScale

        const newX        = renderer.x + deltaX
        const newY        = renderer.y + deltaY

        setScale(newScale)
        setPos(newX, newY)
    })

    type MouseActionState = "none" | "positioning" | "resizing-control-panel"

    let mouseActionState          = "none" as MouseActionState
    let readyToResizeControlPanel = false

    canvasContainerDiv.addEventListener("mousedown", event => {
        if (readyToResizeControlPanel)
            return

        if (mouseActionState !== "none")
            return

        // Primary (usually left) mouse button isn't pressed
        if ((event.buttons & 1) === 0)
            return

        mouseActionState           = "positioning"
        document.body.style.cursor = "grabbing"
    })

    canvasContainerDiv.addEventListener("mousemove", event => {
        if (mouseActionState !== "positioning")
            return

        const dx = -2 * event.movementX / renderer.mainCanvas.clientWidth  / renderer.scale * renderer.aspectRatio
        const dy =  2 * event.movementY / renderer.mainCanvas.clientHeight / renderer.scale

        const newX = renderer.x + dx
        const newY = renderer.y + dy

        setPos(newX, newY)
    })

    addEventListener("mousemove", event => {
        if (mouseActionState === "resizing-control-panel") {
            raiseControlPanelWidth(controlPanelDiv.offsetLeft - event.clientX)
            return
        }

        const activeDistance = 5

        readyToResizeControlPanel = Math.abs(event.clientX - controlPanelDiv.offsetLeft) < activeDistance

        if (mouseActionState !== "none")
            return

        document.body.style.cursor = readyToResizeControlPanel ? "col-resize"
                                                               : "default"
    })

    addEventListener("mousedown", event => {
        if (!readyToResizeControlPanel)
            return

        if (mouseActionState !== "none")
            return

        // Primary (usually left) mouse button isn't pressed
        if ((event.buttons & 1) === 0)
            return

        mouseActionState           = "resizing-control-panel"
        document.body.style.cursor = "col-resize"
    })

    addEventListener("mouseup", event => {
        // Some mouse button is pressed
        if (event.button !== 0) 
            return

        mouseActionState = "none"

        document.body.style.cursor = readyToResizeControlPanel ? "col-resize"
                                                               : "default"
    })


    function initPredefSelect() {
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

    function zeroKeyDownEventHandler(event: KeyboardEvent) {
        if (event.key === "0")
            setPos(0, 0)
    }

    function fullscreenKeyDownEventHandler(event: KeyboardEvent) {
        if (event.key === "F" || event.key === "f")
            onFullscreen()
    }

    function onFullscreen() {
        if (document.fullscreenElement == null)
            canvasContainerDiv.requestFullscreen()
        else
            document.exitFullscreen()
    }

    function raiseControlPanelWidth(widthDelta: number) {
        const newWidth = controlPanelDiv.clientWidth + widthDelta

        setControlPanelWidth(newWidth)
    }

    function setControlPanelWidth(width: number) {
        controlPanelDiv.style.width    = `${width}px`
        canvasContainerDiv.style.width = `${(innerWidth - width)}px`
    }

    function setPos(x: number, y: number) {
        setX(x)
        setY(y)
    }

    function setX(x: number) {
        xInput.value = (renderer.x = x).toString()
    }

    function setY(y: number) {
        yInput.value = (renderer.y = y).toString()
    }

    function setScale(scale: number) {
        scaleInput.value = (renderer.scale = scale).toString()
    }
} catch (error) {
    console.error(error)
} //