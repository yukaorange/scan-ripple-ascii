varying vec2 vUv;
uniform sampler2D tDiffuse;
uniform sampler2D tRipple;

uniform vec2 distortion;
uniform float uTime;

void main() {

  vec3 ripple = texture2D(tRipple, vUv).rgb;

  vec2 baseOffset = normalize(vUv.xy - ripple.xy) * ripple.b + distortion;

  vec2 redOffset = baseOffset * 1.0;
  vec2 greenOffset = baseOffset * 0.7;
  vec2 blueOffset = baseOffset * -.60;

  float alpha = ripple.b * 0.0025;

  float r = texture2D(tDiffuse, vUv + redOffset).r;
  float g = texture2D(tDiffuse, vUv + greenOffset).g;
  float b = texture2D(tDiffuse, vUv + blueOffset).b;

  r += alpha;
  g += alpha;
  b += alpha;

  gl_FragColor = vec4(r, g, b, 1.0);
}

// void main() {

//   vec3 ripple = texture2D(tRipple, vUv).rgb;

//   vec2 distortionOffset = normalize(vUv.xy - ripple.xy) * ripple.b + distortion;

//   float alpha = ripple.b * 0.1;

//   float r = alpha + texture2D(tDiffuse, vUv + distortionOffset).r;
//   float g = alpha + texture2D(tDiffuse, vUv).g;
//   float b = alpha + texture2D(tDiffuse, vUv - distortionOffset).b;

//   gl_FragColor = vec4(r, g, b, 1.0);
// }