import ProgramError from "./ProgramError"

export default class ProgramLinkError extends ProgramError {
    constructor(public readonly log: string | null) {
        const common = "Failed to link a program"

        super(
            log != null ? `${common}:\n${log}`
                        : common
        )
    }
}