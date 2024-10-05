import * as THREE from 'three'
import { EffectComposer } from 'three/examples/jsm/postprocessing/EffectComposer'
import { ScanPassManager } from '@ts/webgl/FinalComposer/ScanPass/ScanPass'
import { ShaderPass } from 'three/examples/jsm/Addons'
import { RipplePassManager } from '@ts/webgl/FinalComposer/RipplePass/RipplePass'
import { RenderPass } from 'three/examples/jsm/Addons'
import { OutputPass } from 'three/examples/jsm/Addons'
import { FXAAShader } from 'three/examples/jsm/Addons'
import { ASCiiPassManager } from './ASCiiPass/ASCiiPass'

export type TComposer = {
  renderer: THREE.WebGLRenderer
  scene: THREE.Scene
  camera: THREE.PerspectiveCamera
  cameraForDepth: THREE.PerspectiveCamera
}

interface IUpdateParams {
  time: number
}

export class FinalComposer {
  private scene: THREE.Scene
  private camera: THREE.PerspectiveCamera
  private cameraForDepth: THREE.PerspectiveCamera
  private renderer: THREE.WebGLRenderer
  private lowResRenderTarget: THREE.WebGLRenderTarget
  private depthRenderTarget: THREE.WebGLRenderTarget
  private depthTexture: THREE.DepthTexture
  private composer: EffectComposer
  private renderPass: RenderPass
  private scanPassManager: ScanPassManager
  private scanPass: ShaderPass
  private ripplePassManager: RipplePassManager
  private ripplePass: ShaderPass
  private ASCiiPassManager: ASCiiPassManager
  private ASCiiPass: ShaderPass
  private fxaaPass: ShaderPass
  private outputPass: OutputPass

  constructor({ renderer, scene, camera, cameraForDepth }: TComposer) {
    this.scene = scene
    this.camera = camera
    this.cameraForDepth = cameraForDepth
    this.renderer = renderer

    this.depthTexture = new THREE.DepthTexture(
      window.innerWidth,
      window.innerHeight
    )
    this.depthRenderTarget = new THREE.WebGLRenderTarget(
      window.innerWidth,
      window.innerHeight,
      {
        depthTexture: this.depthTexture
      }
    )

    this.composer = new EffectComposer(this.renderer)

    /**
     * RenderPass
     */
    this.renderPass = new RenderPass(this.scene, this.camera)
    this.renderPass.renderToScreen = false
    this.composer.addPass(this.renderPass)

    /**
     * ASCii
     */
    this.ASCiiPassManager = new ASCiiPassManager()
    this.lowResRenderTarget = this.ASCiiPassManager.getLowResRenderTarget()
    this.ASCiiPass = this.ASCiiPassManager.getASCiiPass() as ShaderPass
    this.ASCiiPass.renderToScreen = false
    this.ASCiiPass.uniforms.tLowRes.value = this.lowResRenderTarget.texture
    this.ASCiiPass.uniforms.tDepth.value = this.lowResRenderTarget.depthTexture
    this.ASCiiPass.uniforms.cameraNear.value = this.camera.near
    this.ASCiiPass.uniforms.cameraFar.value = this.camera.far
    this.composer.addPass(this.ASCiiPass)
    
    /**
     * scanline
     */
    this.scanPassManager = new ScanPassManager()
    this.scanPass = this.scanPassManager.getScanPass() as ShaderPass
    this.scanPass.uniforms.tDepth.value = this.depthTexture
    this.scanPass.uniforms.cameraNear.value = this.camera.near
    this.scanPass.uniforms.cameraFar.value = this.camera.far
    this.scanPass.renderToScreen = false
    this.composer.addPass(this.scanPass)

    /**
     * ripple
     */
    this.ripplePassManager = new RipplePassManager()
    this.ripplePass = this.ripplePassManager.getRipplePass() as ShaderPass
    this.ripplePass.renderToScreen = false
    this.composer.addPass(this.ripplePass)

    /**
     * FXAA
     */
    this.fxaaPass = new ShaderPass(FXAAShader)
    this.fxaaPass.renderToScreen = false
    this.composer.addPass(this.fxaaPass)

    /**
     * Output
     */
    this.outputPass = new OutputPass()
    this.outputPass.renderToScreen = true
    this.composer.addPass(this.outputPass)
  }

  public onResize() {
    this.scanPassManager.onResize()

    this.ripplePassManager.onResize()

    this.ASCiiPassManager.onResize()
    this.lowResRenderTarget = this.ASCiiPassManager.getLowResRenderTarget()

    this.composer.setSize(window.innerWidth, window.innerHeight)
  }

  public onClick(event: MouseEvent) {
    this.ripplePassManager.onClick(event)
  }

  public update({ time }: IUpdateParams) {
    this.scanPassManager.update({ time })

    this.ASCiiPassManager.update({ time })

    this.ripplePassManager.update({ time })
  }

  public render() {
    this.renderer.setRenderTarget(this.ASCiiPassManager.getLowResRenderTarget())
    this.renderer.render(this.scene, this.camera)

    this.renderer.setRenderTarget(this.depthRenderTarget)
    this.renderer.render(this.scene, this.camera)
    this.renderer.setRenderTarget(null)

    this.scanPass.uniforms.tDepth.value = this.depthRenderTarget.depthTexture
    this.ASCiiPass.uniforms.tLowRes.value =
      this.ASCiiPassManager.getLowResRenderTarget().texture
    this.ASCiiPass.uniforms.tDepth.value =
      this.ASCiiPassManager.getLowResRenderTarget().depthTexture

    this.composer.render()
  }
}
