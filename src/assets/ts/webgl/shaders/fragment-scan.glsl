#include <packing>

varying vec2 vUv;
uniform sampler2D tDiffuse;
uniform sampler2D tDepth;

uniform float cameraNear;
uniform float cameraFar;

uniform float scan;

float readDepth(sampler2D depthSampler, vec2 coord) {

  float gragCoordZ = texture2D(depthSampler, coord).x;

  float viewZ = perspectiveDepthToViewZ(gragCoordZ, cameraNear, cameraFar);

  return viewZToOrthographicDepth(viewZ, cameraNear, cameraFar);
}

float HueToRGB(float f1, float f2, float hue) {
  if(hue < 0.0)
    hue += 1.0;
  else if(hue > 1.0)
    hue -= 1.0;
  float res;
  if((6.0 * hue) < 1.0)
    res = f1 + (f2 - f1) * 6.0 * hue;
  else if((2.0 * hue) < 1.0)
    res = f2;
  else if((3.0 * hue) < 2.0)
    res = f1 + (f2 - f1) * ((2.0 / 3.0) - hue) * 6.0;
  else
    res = f1;
  return res;
}

vec3 HSLToRGB(vec3 hsl) {
  vec3 rgb;

  if(hsl.y == 0.0)
    rgb = vec3(hsl.z); // Luminance
  else {
    float f2;

    if(hsl.z < 0.5)
      f2 = hsl.z * (1.0 + hsl.y);
    else
      f2 = (hsl.z + hsl.y) - (hsl.y * hsl.z);

    float f1 = 2.0 * hsl.z - f2;

    rgb.r = HueToRGB(f1, f2, hsl.x + (1.0 / 3.0));
    rgb.g = HueToRGB(f1, f2, hsl.x);
    rgb.b = HueToRGB(f1, f2, hsl.x - (1.0 / 3.0));
  }
  return rgb;
}

void main() {

  vec4 color = texture2D(tDiffuse, vUv);

  float depth = readDepth(tDepth, vUv);
  depth = pow(depth, 3.0);

  float scanClamp = clamp(scan, 0.0, 1.0);

  float scanFactor = 1000.0;//scanline width

  float scanValue1 = pow(1.0 - abs(depth - scanClamp), scanFactor);
  float scanValue2 = 1.0 - pow(depth, 1.0);

  float scanIntensiry = scanValue1 * scanValue2;

  float hue = mod(depth * 10.0, 1.0);
  vec3 scanlineColor = HSLToRGB(vec3(hue, 1.0, 0.5));//color range

  color.rgb = mix(color.rgb, scanlineColor, scanIntensiry);

  gl_FragColor = color;
}