export function degreesToRadians(degrees: number): number {
    return Math.PI * degrees / 180
}

export function radiansToDegrees(radians: number): number {
    return 180 * radians / Math.PI
}

export function rotatedVec2(length: number, angle: number): { x: number, y: number } {
    return {
        x: length * Math.cos(angle),
        y: length * Math.sin(angle),
    }
}

export function clamp(value: number, min: number, max: number): number {
    if (value <= min)
        return min

    if (value >= max)
        return max

    return value
}