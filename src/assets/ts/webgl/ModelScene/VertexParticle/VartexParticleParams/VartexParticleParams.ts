import * as THREE from 'three'

import VertexShader from '@ts/webgl/shaders/vertex-particle.glsl'
import FragmentShader from '@ts/webgl/shaders/fragment-particle.glsl'

export class VertexParticleParams {
  private uniforms: { [key: string]: any }
  private vertexShader: string
  private fragmentShader: string

  constructor() {
    this.uniforms = THREE.UniformsUtils.merge([
      THREE.UniformsLib['lights'],
      {
        pointSize: { value: 2.0 },
        decayModifier: { value: 1.0 }
      }
    ])

    this.vertexShader = VertexShader
    this.fragmentShader = FragmentShader
  }

  getUniforms() {
    return this.uniforms
  }
  getVertexShader() {
    return this.vertexShader
  }
  getFragmentShader() {
    return this.fragmentShader
  }
}
