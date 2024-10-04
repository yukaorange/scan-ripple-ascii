import * as THREE from 'three'
import { EffectComposer } from 'three/examples/jsm/postprocessing/EffectComposer'
import { ShaderPass } from 'three/examples/jsm/Addons'
import { RenderPass } from 'three/examples/jsm/Addons'
import { OutputPass } from 'three/examples/jsm/Addons'
import { VolumeLightScatteringManager } from '@ts/webgl/OcclusionComposer/VolumetricLightScattering'

export type TComposer = {
  renderer: THREE.WebGLRenderer
  mainScene: THREE.Scene
  occlusionCamera: THREE.PerspectiveCamera
}

interface IUpdateParams {
  time: number
}

export class OcclusionComposer {
  private mainScene: THREE.Scene
  private occlusionCamera: THREE.PerspectiveCamera
  private renderer: THREE.WebGLRenderer

  private occlusionRenderTarget: THREE.WebGLRenderTarget
  private occlusionComposer: EffectComposer
  private renderPass: RenderPass
  private volumeLightScatteringManager: VolumeLightScatteringManager
  private volumeLightScatteringPass: ShaderPass
  private outputPass: OutputPass

  constructor({ renderer, mainScene, occlusionCamera }: TComposer) {
    this.mainScene = mainScene
    this.occlusionCamera = occlusionCamera
    this.renderer = renderer

    this.occlusionRenderTarget = new THREE.WebGLRenderTarget(
      window.innerWidth * 0.5,
      window.innerHeight * 0.5
    )

    this.occlusionComposer = new EffectComposer(
      this.renderer,
      this.occlusionRenderTarget
    )

    this.renderPass = new RenderPass(this.mainScene, this.occlusionCamera)
    this.renderPass.renderToScreen = false
    this.occlusionComposer.addPass(this.renderPass)

    this.volumeLightScatteringManager = new VolumeLightScatteringManager()
    this.volumeLightScatteringPass =
      this.volumeLightScatteringManager.getVolumeLightScatteringPass()
    this.occlusionComposer.addPass(this.volumeLightScatteringPass)

    this.outputPass = new OutputPass()
    this.occlusionComposer.addPass(this.outputPass)
  }

  public onResize() {
    this.occlusionComposer.setSize(window.innerWidth, window.innerHeight)
  }

  public onClick(event: MouseEvent) {}

  public update({ time }: IUpdateParams) {}

  public render() {
    this.occlusionComposer.render()
  }
}
