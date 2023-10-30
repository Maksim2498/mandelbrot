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

    errorElement.className = "error"
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