vec2 mulComplex(vec2 lhs, vec2 rhs) {
    return vec2(
        lhs.x*rhs.x - lhs.y*rhs.y,
        lhs.y*rhs.x + lhs.x*rhs.y
    );
}