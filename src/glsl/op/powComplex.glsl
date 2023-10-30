vec2 powComplex(vec2 lhs, int rhs) {
    const vec2 ZERO = vec2(0, 0);

    if (lhs == ZERO)
        return ZERO;

    float lhsLength    = length(lhs);
    float newLhsLength = pow(lhsLength, float(rhs));

    lhs /= lhsLength;

    float lhsAngle    = atan(lhs.y, lhs.x);
    float newLhsAngle = float(rhs) * lhsAngle;

    return newLhsLength * vec2(
        cos(newLhsAngle),
        sin(newLhsAngle)
    );
}