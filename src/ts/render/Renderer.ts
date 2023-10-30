import vertexShaderSource     from "glsl/vertex.glsl"
import CodeTemplate           from "ts/code/gen/CodeTemplate"
import Compiler               from "ts/code/Compiler"

import BufferCreationError    from "./error/buffer/BufferCreationError"
import ProgramCreationError   from "./error/program/ProgramCreationError"
import ProgramLinkError       from "./error/program/ProgramLinkError"
import ShaderCompilationError from "./error/shader/ShaderCompilationError"
import ShaderCreationError    from "./error/shader/ShaderCreationError"
import UniformNotFoundError   from "./error/uniform/UniformNotFoundError"
import ReadonlyColor          from "./Color"

import { degreesToRadians   } from "ts/util/math"
import { stringToColor,
         colorToString,
         areColorsEqual     } from "./Color"

export default class Renderer {
    compiler = new Compiler()
    showFPS  = false

    private _x:                                    number                          = 0
    private _y:                                    number                          = 0
    private _scale:                                number                          = 1
    private _angle:                                number                          = 0
    private _resolutionScale:                      number                          = 1
    private _setColor:                             ReadonlyColor                   = [0, 0, 0]
    private _backgroundStartColor:                 ReadonlyColor                   = [1, 0, 1]
    private _backgroundEndColor:                   ReadonlyColor                   = [0, 0, 0]
    private _useRealPixelSize:                     boolean                         = false
    private _needRedraw:                           boolean                         = true
    private _codeTemplate:                         CodeTemplate                    = new CodeTemplate()
    private _code:                                 string                          = ""

    private _gl!:                                  WebGLRenderingContext
    private _vertextShader:                        WebGLShader              | null = null
    private _fragmentShader:                       WebGLShader              | null = null
    private _program:                              WebGLProgram             | null = null
    private _vertextBuffer:                        WebGLBuffer              | null = null
    private _setColorUniformLocation!:             WebGLUniformLocation
    private _backgroundStartColorUniformLocation!: WebGLUniformLocation
    private _backgroundEndColorUniformLocation!:   WebGLUniformLocation
    private _posUniformLocation!:                  WebGLUniformLocation
    private _scaleUniformLocation!:                WebGLUniformLocation
    private _angleUniformLocation!:                WebGLUniformLocation
    private _aspectRatioUniformLocation!:          WebGLUniformLocation

    private _2d:                                   CanvasRenderingContext2D | null = null

    private _autoRedraw:                           boolean                         = false
    private _autoResize:                           boolean                         = false

    private _resizeObserver:                       ResizeObserver                  = new ResizeObserver(entries => {
        for (const entry of entries)
            switch (entry.target) {
                case this.mainCanvas:
                    this._resizeMainCanvas()
                    break

                case this.debugCanvas:
                    this._resizeDebugCanvas()
                    break
            }
    })

    constructor(
        public readonly mainCanvas:  HTMLCanvasElement,
        public readonly debugCanvas: HTMLCanvasElement | null = null,
    ) {
        this._initWebGLContext()
        this._init2DContext()
        this._resize()
    }

    get code(): string {
        return this._code
    }

    set code(value: string) {
        const oldValue = this._code

        if (value === oldValue)
            return

        this._codeTemplate = this.compiler.compile(value)
        this._code         = value

        try {
            this._updateFragmentShader()
        } catch (error) {
            this._code = oldValue
            throw error
        }
    }

    get x(): number {
        return this._x
    }

    set x(value: number) {
        if (this._x === value)
            return

        this._x          = value
        this._needRedraw = true
    }

    get y(): number {
        return this._y
    }

    set y(value: number) {
        if (this._y === value)
            return

        this._y          = value
        this._needRedraw = true
    }

    get scale(): number {
        return this._scale
    }

    set scale(value: number) {
        if (this._scale === value)
            return

        this._scale      = value
        this._needRedraw = true
    }

    get angle(): number {
        return this._angle
    }

    set angle(value: number) {
        if (this._angle === value)
            return

        this._angle      = value
        this._needRedraw = true
    }

    get setColor(): string {
        return colorToString(this._setColor)
    }

    set setColor(value: string) {
        const colorValue = stringToColor(value)

        if (areColorsEqual(colorValue, this._setColor))
            return

        this._setColor   = colorValue
        this._needRedraw = true
    }

    get backgroundStartColor(): string {
        return colorToString(this._backgroundStartColor)
    }

    set backgroundStartColor(value: string) {
        const colorValue = stringToColor(value)

        if (areColorsEqual(colorValue, this._backgroundStartColor))
            return

        this._backgroundStartColor = colorValue
        this._needRedraw           = true
    }

    get backgroundEndColor(): string {
        return colorToString(this._backgroundEndColor)
    }

    set backgroundEndColor(value: string) {
        const colorValue = stringToColor(value)

        if (areColorsEqual(colorValue, this._backgroundEndColor))
            return

        this._backgroundEndColor = colorValue
        this._needRedraw         = true
    }

    get resolutionScale(): number {
        return this._resolutionScale
    }

    set resolutionScale(value: number) {
        if (this._resolutionScale === value)
            return

        this._resolutionScale = value

        this._resizeMainCanvas()
    }

    get useRealPixelSize(): boolean {
        return this._useRealPixelSize
    }

    set useRealPixelSize(value: boolean) {
        if (this._useRealPixelSize === value)
            return

        this._useRealPixelSize = value

        this._resizeMainCanvas()
    }

    get renderWidth(): number {
        return this.effectiveResolutionScale * this._gl.drawingBufferWidth
    }

    get renderHeight(): number {
        return this.effectiveResolutionScale * this._gl.drawingBufferHeight
    }

    get effectiveResolutionScale(): number {
        return this.resolutionScale * (this.useRealPixelSize ? window.devicePixelRatio : 1)
    }

    get aspectRatio(): number {
        return this._gl.drawingBufferWidth / this._gl.drawingBufferHeight
    }

    get maxIters(): number {
        return this._codeTemplate.maxIters
    }

    set maxIters(value: number) {
        const oldValue = this.maxIters

        if (oldValue === value)
            return

        this._codeTemplate.maxIters = value

        try {
            this._updateFragmentShader()
        } catch (error) {
            this._codeTemplate.maxIters = oldValue
            throw error
        }
    }

    get autoRedraw(): boolean {
        return this._autoRedraw
    }

    set autoRedraw(value: boolean) {
        if (value === this._autoRedraw)
            return

        if (value) {
            let prevTs = performance.now()

            const cb = (ts: DOMHighResTimeStamp) => {
                const dt = ts - prevTs

                prevTs = ts

                try {
                    this.render(dt)
                } catch (error) {
                    console.log(error)
                    return
                }

                if (this.autoRedraw)
                    requestAnimationFrame(cb)
            }

            requestAnimationFrame(cb)
        }
    
        this._autoRedraw = value
    }

    get autoResize(): boolean {
        return this._autoResize
    }

    set autoResize(value: boolean) {
        if (this._autoResize === value)
            return

        if (value) {
            this._resizeObserver.observe(this.mainCanvas)

            if (this.debugCanvas != null)
                this._resizeObserver.observe(this.debugCanvas)
        } else {
            this._resizeObserver.unobserve(this.mainCanvas)

            if (this.debugCanvas != null)
                this._resizeObserver.unobserve(this.debugCanvas)
        }

        this._autoResize = value
    }

    render(dt: number = 0) {
        this._renderFractal()
        this._renderDebugInfo(dt)
    }

    close() {
        this.autoRedraw = false
        this.autoResize = false

        this.deleteWebGLObjects()
    }

    private _updateFragmentShader() {
        const oldProgram        = this._program
        const oldFragmentShader = this._fragmentShader

        this._initFragmentShader()

        try {
            this._initProgram()

            this._gl.deleteShader(oldFragmentShader)
            this._gl.deleteProgram(oldProgram)
        } catch (error) {
            this._gl.deleteShader(this._fragmentShader)

            this._fragmentShader = oldFragmentShader

            throw error
        }

        this._needRedraw = true
    }

    private _initWebGLContext() {
        const ctx = this.mainCanvas.getContext("webgl")

        if (ctx == null)
            throw new Error("WebGL canvas context isn't supported")

        this._gl = ctx

        try {
            this._initVertextBuffer()
            this._initShaders()
            this._initProgram()
        } catch (error) {
            this.deleteWebGLObjects()
            throw error
        }
    }

    private _initVertextBuffer() {
        const buffer = this._gl.createBuffer()

        if (buffer == null)
            throw new BufferCreationError()

        this._gl.bindBuffer(this._gl.ARRAY_BUFFER, buffer)

        const positions = this._createRectVertexArray()

        this._gl.bufferData(this._gl.ARRAY_BUFFER, positions, this._gl.STATIC_DRAW)
    }

    private _createRectVertexArray(): Float32Array {
        return new Float32Array([
            -1,  1,
             1,  1,
             1, -1,
            -1, -1,
        ])
    }

    private _initShaders() {
        this._initVertextShader()
        this._initFragmentShader()
    }

    private _initVertextShader() {
        this._vertextShader = this._createShader(this._gl.VERTEX_SHADER,   vertexShaderSource)
    }

    private _initFragmentShader() {
        const code = this._codeTemplate.render()

        this._fragmentShader = this._createShader(this._gl.FRAGMENT_SHADER, code)
    }
    
    private _initProgram() {
        const oldProgram = this._program

        this._program = this._createProgram(this._vertextShader!, this._fragmentShader!)

        this._gl.useProgram(this._program)

        try {
            this._initProgramAttributes()
            this._initProgramUniformLocations()
        } catch (error) {
            this._gl.deleteProgram(this._program)

            this._program = oldProgram

            throw error
        }
    }

    private _initProgramAttributes() {
        const posAttributeLocation = this._gl.getAttribLocation(this._program!, "a_pos")

        this._gl.enableVertexAttribArray(posAttributeLocation)

        const size      = 2
        const type      = this._gl.FLOAT
        const normalize = false
        const stride    = 0
        const offset    = 0

        this._gl.vertexAttribPointer(
            posAttributeLocation,
            size,
            type,
            normalize,
            stride,
            offset,
        )
    }

    private _initProgramUniformLocations() {
        this._setColorUniformLocation             = this._getUniformLocation("u_setColor"            )
        this._backgroundStartColorUniformLocation = this._getUniformLocation("u_backgroundStartColor")
        this._backgroundEndColorUniformLocation   = this._getUniformLocation("u_backgroundEndColor"  )
        this._posUniformLocation                  = this._getUniformLocation("u_pos"                 )
        this._scaleUniformLocation                = this._getUniformLocation("u_scale"               )
        this._angleUniformLocation                = this._getUniformLocation("u_angle"               )
        this._aspectRatioUniformLocation          = this._getUniformLocation("u_aspectRatio"         )
    }

    private _getUniformLocation(name: string): WebGLUniformLocation {
        const location = this._gl.getUniformLocation(this._program!, name)

        if (location == null)
            throw new UniformNotFoundError(name)

        return location
    }

    private _createProgram(vertexShader: WebGLShader, fragmentShader: WebGLShader): WebGLProgram {
        const program = this._gl.createProgram()

        if (program == null)
            throw new ProgramCreationError()

        this._gl.attachShader(program, vertexShader)
        this._gl.attachShader(program, fragmentShader)
        this._gl.linkProgram(program)

        const success = this._gl.getProgramParameter(program, this._gl.LINK_STATUS)

        if (success)
            return program

        const log = this._gl.getProgramInfoLog(program)

        this._gl.deleteProgram(program)

        throw new ProgramLinkError(log)
    }

    private _createShader(type: number, source: string): WebGLShader {
        const shader = this._gl.createShader(type)

        if (shader == null)
            throw new ShaderCreationError()

        this._gl.shaderSource(shader, source)
        this._gl.compileShader(shader)

        const success = this._gl.getShaderParameter(shader, this._gl.COMPILE_STATUS)

        if (success)
            return shader

        const log = this._gl.getShaderInfoLog(shader)

        this._gl.deleteShader(shader)

        throw new ShaderCompilationError(log)
    }

    private _init2DContext() {
        if (this.debugCanvas == null)
            return

        this._2d = this.debugCanvas.getContext("2d")

        if (this._2d == null)
            throw new Error("2D canvas context isn't supported")
    }

    private deleteWebGLObjects() {
        this._gl.deleteProgram(this._program)
        this._gl.deleteShader(this._vertextShader)
        this._gl.deleteShader(this._fragmentShader)
        this._gl.deleteBuffer(this._vertextBuffer)
    }

    private _resize() {
        this._resizeMainCanvas()
        this._resizeDebugCanvas()
    }

    private _resizeMainCanvas() {
        const resolutionScale = this.effectiveResolutionScale
        const width           = this.mainCanvas.clientWidth  * resolutionScale
        const height          = this.mainCanvas.clientHeight * resolutionScale

        this.mainCanvas.width  = width
        this.mainCanvas.height = height

        this._gl.viewport(0, 0, width, height)

        this._needRedraw = true
    }

    private _resizeDebugCanvas() {
        if (this.debugCanvas == null)
            return

        this.debugCanvas.width  = this.debugCanvas.clientWidth
        this.debugCanvas.height = this.debugCanvas.clientHeight

        this._resetDebugCanvasState()
    }

    private _resetDebugCanvasState() {
        this._2d!.fillStyle    = "red"
        this._2d!.font         = "bold 32px sans-serif"
        this._2d!.textBaseline = "top"
    }

    private _renderFractal() {
        if (!this._needRedraw)
            return

        this._setupUniforms()
        this._renderFractalRect()

        this._needRedraw = false
    }

    private _setupUniforms() {
        this._gl.uniform3f(this._setColorUniformLocation,             ...this._setColor            )
        this._gl.uniform3f(this._backgroundStartColorUniformLocation, ...this._backgroundStartColor)
        this._gl.uniform3f(this._backgroundEndColorUniformLocation,   ...this._backgroundEndColor  )
        this._gl.uniform2f(this._posUniformLocation,                  this.x, this.y               )
        this._gl.uniform1f(this._scaleUniformLocation,                this.scale                   )
        this._gl.uniform1f(this._angleUniformLocation,                degreesToRadians(this.angle) )
        this._gl.uniform1f(this._aspectRatioUniformLocation,          this.aspectRatio             )
    }

    private _renderFractalRect() {
        const primitiveType = this._gl.TRIANGLE_FAN
        const offset        = 0
        const count         = 4

        this._gl.drawArrays(
            primitiveType,
            offset,
            count,
        )
    }

    private _renderDebugInfo(dt: number) {
        if (this._2d == null)
            return

        this._clearDebugInfo()

        if (this.showFPS)
            this._renderFPS(dt)
    }

    private _clearDebugInfo() {
        this._2d!.clearRect(0, 0, this._2d!.canvas.width, this._2d!.canvas.height)
    }

    private _renderFPS(dt: number) {
        const fps    = Math.round(1_000 / dt).toFixed()
        const margin = 16

        this._2d!.fillText(fps, margin, margin)
        this._2d!.strokeText(fps, margin, margin)
    }
}