precision mediump float;

uniform float uAlpha;
uniform sampler2D uTexture;

varying vec2 vUv;

void main() {
  vec4 textureColor = texture2D(uTexture, vUv);

  vec3 color = textureColor.rgb;

  gl_FragColor = vec4(color, 1.0);
}
