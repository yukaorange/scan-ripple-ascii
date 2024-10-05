import * as THREE from 'three'
import vertexShader from '@ts/webgl/shaders/vertex-ASCii.glsl'
import fragmentShader from '@ts/webgl/shaders/fragment-ASCii.glsl'
import { ShaderPass } from 'three/examples/jsm/Addons'
import Assets from '@ts/common/singleton/Assets'
import { cameraNear } from 'three/examples/jsm/nodes/Nodes'

interface IUpdateParams {
  time: number
}

class ASCiiShaderParams {
  private vertexShader: string
  private fragmentShader: string
  private uniforms: Record<string, any> | null = null

  constructor() {
    this.uniforms = {
      tLowRes: { value: null },
      tFont: { value: null },
      tDepth: { value: null },
      fontCharTotalCount: { value: 0 },
      fontCharCount: { value: new THREE.Vector2(1, 1) },
      fontCharSize: { value: new THREE.Vector2(1, 1) },
      renderCharCount: { value: new THREE.Vector2(1, 1) },
      renderCharSize: { value: new THREE.Vector2(1, 1) },
      cameraNear: { value: 3.0 },
      cameraFar: { value: 8.0 }
    }
    this.vertexShader = vertexShader
    this.fragmentShader = fragmentShader
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

export class ASCiiPassManager {
  private ASCiiShaderParams = new ASCiiShaderParams()
  private ASCiiPass: ShaderPass | null = null

  private assets = Assets.getInstance()
  private textures: { [key: string | number]: THREE.Texture } = {}
  private fontTexture: THREE.Texture | null = null
  private lowResRenderTarget: THREE.WebGLRenderTarget | null = null
  private lowResDepthTexture: THREE.DepthTexture | null = null

  private FONT_MAP_SIZE: THREE.Vector2
  private FONT_CHAR_SIZE: THREE.Vector2

  constructor() {
    this.FONT_MAP_SIZE = new THREE.Vector2(64, 64)
    this.FONT_CHAR_SIZE = new THREE.Vector2(8, 8)

    this.createFontTexture()
    this.createlowResRenderTarget()
    this.createASCiiPass()
  }

  createFontTexture() {
    this.textures = this.assets.getTextures()
    this.fontTexture = this.textures[2]
    this.fontTexture.minFilter = THREE.NearestFilter
    this.fontTexture.magFilter = THREE.NearestFilter
  }

  createlowResRenderTarget() {
    const initialSizeData = this.getLowResSize()
    this.lowResRenderTarget = new THREE.WebGLRenderTarget(
      initialSizeData.charCountCeil[0] * 2,
      initialSizeData.charCountCeil[1] * 2
    )

    this.lowResDepthTexture = new THREE.DepthTexture(
      initialSizeData.charCountCeil[0] * 2,
      initialSizeData.charCountCeil[1] * 2
    )

    this.lowResRenderTarget.depthTexture = this.lowResDepthTexture
  }

  createASCiiPass() {
    this.ASCiiPass = new ShaderPass({
      vertexShader: this.ASCiiShaderParams.getVertexShader(),
      fragmentShader: this.ASCiiShaderParams.getFragmentShader(),
      uniforms: this.ASCiiShaderParams.getUniforms()
    })

    this.updateASCiiPassUniforms()
  }

  updateASCiiPassUniforms() {
    const fontCountX = this.FONT_MAP_SIZE.x / this.FONT_CHAR_SIZE.x
    const fontCountY = this.FONT_MAP_SIZE.y / this.FONT_CHAR_SIZE.y

    if (this.ASCiiPass) {
      this.ASCiiPass.uniforms.tFont.value = this.fontTexture
      this.ASCiiPass.uniforms.fontCharTotalCount.value =
        Math.floor(fontCountX) * Math.floor(fontCountY)

      this.ASCiiPass.uniforms.fontCharSize.value.set(
        1 / fontCountX,
        1 / fontCountY
      )

      this.ASCiiPass.uniforms.fontCharCount.value.set(fontCountX, fontCountY)
    }
  }

  private updateRenderSize() {
    const size = this.getLowResSize()

    if (this.ASCiiPass && this.lowResRenderTarget) {
      this.ASCiiPass.uniforms.renderCharSize.value.set(
        1 / size.charCountPrecise[0],
        1 / size.charCountPrecise[1]
      )

      this.ASCiiPass.uniforms.renderCharCount.value.set(
        size.charCountPrecise[0],
        size.charCountPrecise[1]
      )

      this.lowResRenderTarget.setSize(
        size.charCountCeil[0] * 2,
        size.charCountCeil[1] * 2
      )
    }
  }

  private getLowResSize() {
    const charCountPrecise = [
      window.innerWidth / this.FONT_CHAR_SIZE.x,
      window.innerHeight / this.FONT_CHAR_SIZE.y
    ]

    const charCountCeil = charCountPrecise.map(charCount => {
      return Math.ceil(charCount)
    })

    return {
      charCountPrecise,
      charCountCeil
    }
  }

  public getASCiiPass() {
    return this.ASCiiPass as ShaderPass
  }

  public getLowResRenderTarget(): THREE.WebGLRenderTarget {
    return this.lowResRenderTarget as THREE.WebGLRenderTarget
  }

  public onClick(event: MouseEvent) {}

  public onResize() {
    this.updateRenderSize()
  }

  public update({ time }: IUpdateParams) {}
}
