import BufferError from "./BufferError"

export default class BufferCreationError extends BufferError {
    constructor() {
        super("Failed to create a buffer")
    }
}