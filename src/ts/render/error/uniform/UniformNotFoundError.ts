import UniformError from "./UniformError";

export default class UniformNotFoundError extends UniformError {
    constructor(public readonly name: string) {
        super(`Uniform "${name}" not found`)
    }
}