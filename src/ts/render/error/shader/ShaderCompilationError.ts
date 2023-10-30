import ShaderError from "./ShaderError"

export default class ShaderCompilationError extends ShaderError {
    constructor(public readonly log: string | null) {
        const common = "Failed to compile a shader"

        super(
            log != null ? `${common}:\n${log}`
                        : common
        )
    }
}