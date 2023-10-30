import ShaderError from "./ShaderError"

export default class ShaderCreationError extends ShaderError {
    constructor() {
        super("Failed to create a shader")
    }
}