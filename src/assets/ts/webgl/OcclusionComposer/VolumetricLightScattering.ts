import * as THREE from 'three'
import { ShaderPass } from 'three/examples/jsm/postprocessing/ShaderPass'
import volumetricVertexShader from '@ts/webgl/shaders/vertex-volumetricLightScattering.glsl'
import volumetricFragmentShader from '@ts/webgl/shaders/fragment-volumetricLightScattering.glsl'

class VolumeLightScatteringParams {
  private uniforms: Record<string, any> | null = null
  private vertexShader: string
  private fragmentShader: string

  constructor() {
    this.uniforms = {
      tDiffuse: { valie: null },
      lightPosition: {
        value: new THREE.Vector2(0.5, 0.5),
        exposure: { value: 0.2 },
        density: { value: 0.6 },
        weight: { value: 0.2 },
        samples: { value: 80 }
      }
    }
    this.vertexShader = volumetricVertexShader
    this.fragmentShader = volumetricFragmentShader
  }

  public getUniforms() {
    return this.uniforms
  }

  public getVertexShader() {
    return this.vertexShader
  }

  public getFragmentShader() {
    return this.fragmentShader
  }
}

export class VolumeLightScatteringManager {
  private volumeLightScatteringParams: VolumeLightScatteringParams
  private volumeLightScatteringPass: ShaderPass

  constructor() {
    this.volumeLightScatteringParams = new VolumeLightScatteringParams()

    this.volumeLightScatteringPass = new ShaderPass({
      uniforms: this.volumeLightScatteringParams.getUniforms(),
      vertexShader: this.volumeLightScatteringParams.getVertexShader(),
      fragmentShader: this.volumeLightScatteringParams.getFragmentShader()
    })
  }

  public getVolumeLightScatteringPass() {
    return this.volumeLightScatteringPass
  }

  public onResize() {}

  public update() {}
}
