import ProgramError from "./ProgramError"

export default class ProgramCreationError extends ProgramError {
    constructor() {
        super("Failed to create a program")
    }
}