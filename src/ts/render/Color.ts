import { clamp } from "ts/util/math"

type Color = [number, number, number]

export default Color

export type ReadonlyColor = readonly [number, number, number]

const COLOR_REGEX = /^#([0-9a-f]{2})([0-9a-f]{2})([0-9a-f]{2})$/i
const HEX_ARRAY   = ["0", "1", "2", "3", "4", "5", "6", "7", "8", "9", "a", "b", "c", "d", "e", "f", ] as const
const HEX_DICT    = {
    "0": 0,
    "1": 1,
    "2": 2,
    "3": 3,
    "4": 4,
    "5": 5,
    "6": 6,
    "7": 7,
    "8": 8,
    "9": 9,
    "a": 10,
    "b": 11,
    "c": 12,
    "d": 13,
    "e": 14,
    "f": 15,
} as const

export function areColorsEqual(lhs: ReadonlyColor, rhs: ReadonlyColor): boolean {
    for (let i = 0; i < 3; ++i)
        if (lhs[i] !== rhs[i])
            return false

    return true
}

export function stringToColor(string: string): Color {
    const matches = string.trim()
                          .toLowerCase()
                          .match(COLOR_REGEX)

    if (matches == null)
        return [0, 0, 0]
    
    matches.shift()

    return matches.map(component => {
        const high = component[0] as keyof typeof HEX_DICT
        const low  = component[1] as keyof typeof HEX_DICT

        return ((HEX_DICT[high] << 4) + HEX_DICT[low]) / 256
    }) as Color
}

export function colorToString(color: ReadonlyColor): string {
    return "#" + color.map(component => {
        component = Math.round(256 * clamp(component, 0, 1))

        const parts = [
            (component & 0xF0) >> 4,
            (component & 0x0F),
        ]

        return parts.map(part => HEX_ARRAY[part]).join("")
    }).join("")
}