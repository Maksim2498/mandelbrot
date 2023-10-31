vec2 divComplex(vec2 lhs, vec2 rhs) {
    float den = rhs.x*rhs.x + rhs.y*rhs.y;

    return vec2(
        (lhs.x*rhs.x + lhs.y*rhs.y) / den,
        (lhs.y*rhs.x - lhs.x*rhs.y) / den
    );
}