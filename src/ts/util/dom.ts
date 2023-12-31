export function forceGetElementById(id: string): HTMLElement {
    const element = document.getElementById(id)

    if (element == null)
        throw new Error(`Element with id \"${id}\" not found`)

    return element
}

export function addError(error: unknown, element: HTMLElement) {
    const parent = element.parentElement

    if (parent == null)
        return

    const errorElement = document.createElement("div")
    const message      = error instanceof Error ? error.message
                                                : String(error)

    errorElement.className = "error with-border"
    errorElement.innerHTML = message

    parent.insertBefore(errorElement, element.nextElementSibling)
}

export function clearErrors(element: HTMLElement) {
    const parent = element.parentElement

    if (parent == null)
        return

    while (element.nextElementSibling?.classList.contains("error"))
        element.nextElementSibling.remove()
}

export function onNumberChange(element: HTMLInputElement, callback: (number: number) => void) {
    clearErrors(element)

    try {
        const number = Number(element.value)

        if (Number.isNaN(number))
            throw new Error("Not a number")

        if (element.min && number < Number(element.min))
            throw new Error(`Too small.\nMinimum allowed value is ${element.min}`)

        if (element.max && number < Number(element.max))
            throw new Error(`Too small.\nMinimum allowed value is ${element.max}`)

        callback(number)
    } catch (error) {
        addError(error, element)
    }
}

export function tabKeyDownEventHandler(this: HTMLTextAreaElement, event: KeyboardEvent) {
    if (event.key !== "Tab")
        return

    event.preventDefault()

    const start = this.selectionStart
    const end   = this.selectionEnd
    const value = this.value

    this.value = value.substring(0, start) +
                 "\t"                      +
                 value.substring(end)

    this.selectionStart = this.selectionEnd
                        = start + 1

    this.dispatchEvent(new Event("input"))
}