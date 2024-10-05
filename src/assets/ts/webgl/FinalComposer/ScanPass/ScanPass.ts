import * as THREE from 'three'
import { ShaderPass } from 'three/examples/jsm/Addons'
import vertexShader from '@ts/webgl/shaders/vertex-scan.glsl'
import fragmentShader from '@ts/webgl/shaders/fragment-scan.glsl'

interface IUpdateParams {
  time: number
}

class ScanParams {
  private vertexShader: string
  private fragmentShader: string
  private uniforms: Record<string, any> | null = null

  constructor() {
    this.vertexShader = vertexShader
    this.fragmentShader = fragmentShader

    this.uniforms = {
      tDiffuse: { value: null },
      tDepth: { value: null },
      cameraNear: { value: 1 },
      cameraFar: { value: 1000 },
      scan: { value: 0 }
    }
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

export  class ScanPassManager {
  private scanParams: ScanParams
  private scanPass: ShaderPass | null = null

  constructor() {
    this.scanParams = new ScanParams()

    this.createScanPass()
  }

  private createScanPass() {
    this.scanPass = new ShaderPass({
      uniforms: this.scanParams.getUniforms(),
      vertexShader: this.scanParams.getVertexShader(),
      fragmentShader: this.scanParams.getFragmentShader()
    })
  }

  public onResize() {}

  public getScanPass() {
    return this.scanPass
  }

  public update({ time }: IUpdateParams) {
    this.scanPass!.uniforms.scan.value =
      (this.scanPass!.uniforms.scan.value + time * 0.1) % 0.5
  }
}
