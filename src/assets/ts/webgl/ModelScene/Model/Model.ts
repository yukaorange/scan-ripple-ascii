import GSAP from 'gsap'

import Logger from '@ts/common/utility/Logger'

import * as THREE from 'three'

import Assets from '@ts/common/singleton/Assets'
import DebugPane from '@ts/common/singleton/Pane'

import vertexShader from '@ts/webgl/shaders/vertex.glsl'
import fragmentShader from '@ts/webgl/shaders/fragment.glsl'

type TOption = {
  sizes: {
    width: number
    height: number
  }
  device: string
}

interface IOption {
  sizes: {
    width: number
    height: number
  }
  device: string
}

export class Model {
  private sizes: {
    width: number
    height: number
  }

  private device: string
  private models: THREE.Group | null = null
  private material: THREE.Material | null = null
  private mesh: THREE.Mesh | THREE.Group | null = null
  private texture: THREE.Texture | null = null
  private assets = Assets.getInstance()
  private pane: DebugPane | null = null

  constructor({ sizes, device }: TOption) {
    this.sizes = sizes

    this.device = device

    this.createTexture()

    this.createGeometry()

    this.createMaterial()

    this.createMesh()

    this.createPane()

    this.calculateBounds({
      sizes: this.sizes,
      device: this.device
    })
  }

  private createGeometry() {
    this.models = (
      this.assets.getModels() as { character: THREE.Group }
    ).character
  }

  private createTexture() {
    this.texture = (
      this.assets.getModelTextures() as { skin: THREE.Texture }
    ).skin

    this.texture.flipY = false
  }

  private createMaterial() {
    // this.material = new THREE.ShaderMaterial({
    //   vertexShader: vertexShader,
    //   fragmentShader: fragmentShader,
    //   uniforms: {
    //     uTexture: { value: this.texture },
    //     uAlpha: { value: 1.0 }
    //   },
    //   transparent: true
    // })

    this.material = new THREE.MeshStandardMaterial({
      map: this.texture
    })
  }

  private createMesh() {
    this.mesh = this.models

    this.centeringModel(this.mesh as THREE.Group)

    this.applyTexture(this.mesh as THREE.Group, this.material as THREE.Material)
  }

  private centeringModel(model: THREE.Group) {
    const box = new THREE.Box3().setFromObject(model)

    const size = box.getSize(new THREE.Vector3())

    model.position.y = -size.y / 2
  }

  private applyTexture(model: THREE.Group, material: THREE.Material) {
    model.traverse(child => {
      if (child instanceof THREE.Mesh) {
        child.material = material
      }
    })
  }

  private createPane() {
    this.pane = DebugPane.getInstance()
  }

  public getMesh() {
    return this.mesh as THREE.Mesh
  }

  private calculateBounds(values: TOption) {
    const { sizes, device } = values

    this.sizes = sizes

    this.device = device

    this.updateScale()

    this.updateX()

    this.updateY()
  }

  /**
   * Animations
   */
  public show() {}

  public hide() {}
  /**
   * events
   */
  onResize(values: IOption) {
    this.calculateBounds(values)
  }

  /**
   * update
   */

  updateScale() {}

  updateX(x = 0) {}

  updateY(y = 0) {}

  update({ time }: { time: number }) {
    // this.mesh!.rotation.x = Math.PI / 10
    // this.mesh!.rotation.y -= time * 0.8
  }
}
