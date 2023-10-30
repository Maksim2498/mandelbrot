#ifdef GL_FRAGMENT_PRECISION_HIGH
  precision highp float;
#else
  precision mediump float;
#endif

const int MAX_ITERS = {{maxIters}};

uniform vec3  u_setColor;
uniform vec3  u_backgroundStartColor;
uniform vec3  u_backgroundEndColor;
uniform vec2  u_pos;
uniform float u_scale;
uniform float u_angle;
uniform float u_aspectRatio;

varying vec2  v_pos;

{{functions}}

void main() {
    vec2 z  = vec2(0, 0);
    vec2 uv = v_pos;

    uv.x *= u_aspectRatio;

    uv /= u_scale;
    uv += u_pos;
    uv  = vec2(
        uv.x*cos(u_angle) - uv.y*sin(u_angle),
        uv.x*sin(u_angle) + uv.y*cos(u_angle)
    );

{{init}}

    for (int i = 0; i < MAX_ITERS; ++i) {
{{loopBody}}

        if ({{loopPredicate}})
            continue;

        gl_FragColor = vec4(
            mix(
                u_backgroundStartColor,
                u_backgroundEndColor,
                1. - float(i) / float(MAX_ITERS)
            ),
            1.
        );

        return;
    }

    gl_FragColor = vec4(u_setColor, 1);
}