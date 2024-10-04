import * as THREE from 'three'
import { EffectComposer } from 'three/examples/jsm/postprocessing/EffectComposer'
import { ScanPassManager } from '@ts/webgl/FinalComposer/ScanPass'
import { ShaderPass } from 'three/examples/jsm/Addons'
import { RipplePassManager } from '@ts/webgl/FinalComposer/RipplePass'
import { RenderPass } from 'three/examples/jsm/Addons'
import { OutputPass } from 'three/examples/jsm/Addons'
import { FXAAShader } from 'three/examples/jsm/Addons'

export type TComposer = {
  renderer: THREE.WebGLRenderer
  scene: THREE.Scene
  camera: THREE.PerspectiveCamera
}

interface IUpdateParams {
  time: number
}

export class FinalComposer {
  private scene: THREE.Scene
  private camera: THREE.PerspectiveCamera
  private renderer: THREE.WebGLRenderer
  private depthRenderTarget: THREE.WebGLRenderTarget
  private depthTexture: THREE.DepthTexture
  private composer: EffectComposer
  private renderPass: RenderPass
  private scanPassManager: ScanPassManager
  private scanPass: ShaderPass
  private ripplePassManager: RipplePassManager
  private ripplePass: ShaderPass
  private fxaaPass: ShaderPass
  private outputPass: OutputPass

  constructor({ renderer, scene, camera }: TComposer) {
    this.scene = scene
    this.camera = camera
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

    this.renderPass = new RenderPass(this.scene, this.camera)
    this.renderPass.renderToScreen = false
    this.composer.addPass(this.renderPass)

    this.scanPassManager = new ScanPassManager()
    this.scanPass = this.scanPassManager.getScanPass() as ShaderPass
    this.scanPass.uniforms.tDepth.value = this.depthTexture
    this.scanPass.uniforms.cameraNear.value = this.camera.near
    this.scanPass.uniforms.cameraFar.value = this.camera.far
    this.scanPass.renderToScreen = false
    this.composer.addPass(this.scanPass)

    this.ripplePassManager = new RipplePassManager()
    this.ripplePass = this.ripplePassManager.getRipplePass() as ShaderPass
    this.ripplePass.renderToScreen = false
    this.composer.addPass(this.ripplePass)

    this.fxaaPass = new ShaderPass(FXAAShader)
    this.fxaaPass.renderToScreen = false
    this.composer.addPass(this.fxaaPass)

    this.outputPass = new OutputPass()
    this.outputPass.renderToScreen = true
    this.composer.addPass(this.outputPass)
  }

  public onResize() {
    this.scanPassManager.onResize()

    this.ripplePassManager.onResize()

    this.composer.setSize(window.innerWidth, window.innerHeight)
  }

  public onClick(event: MouseEvent) {
    this.ripplePassManager.onClick(event)
  }

  public update({ time }: IUpdateParams) {
    this.scanPassManager.update({ time })

    this.ripplePassManager.update({ time })
  }

  public render() {
    this.renderer.setRenderTarget(this.depthRenderTarget)
    this.renderer.render(this.scene, this.camera)
    this.renderer.setRenderTarget(null)

    this.scanPass.uniforms.tDepth.value = this.depthRenderTarget.depthTexture

    this.composer.render()
  }
}
