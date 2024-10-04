import GSAP from 'gsap'
import Logger from '@ts/common/utility/Logger'

import * as THREE from 'three'

import { TSizes } from '@ts/webgl'
import { Model } from '@ts/webgl/ModelScene/Model/Model'
import { VertexParticle } from '@ts/webgl/ModelScene/VertexParticle/VertexParticle'

export type TPage = {
  scene: THREE.Scene
  sizes: TSizes
  device: string
}

interface IOption {
  sizes: {
    width: number
    height: number
  }
  device: string
}

export interface IUpdate {
  time: number
}

export class ModelScene {
  private scene: THREE.Scene
  private sizes: TSizes
  private device: string

  private model: Model | null = null
  private vertexParticle: VertexParticle | null = null

  constructor({ scene, sizes, device }: TPage) {
    this.scene = scene

    this.sizes = sizes

    this.device = device

    this.createModel()
    this.createParticles()

    if (this.model) {
      this.scene.add(this.model.getMesh())
    }
    if (this.vertexParticle) {
      this.scene.add(this.vertexParticle.getGroup())
    }

    this.show()

    Logger.log(`from Webgl Home.ts create ${this.model?.getMesh()}`)
  }

  private createModel() {
    this.model = new Model({
      sizes: this.sizes,
      device: this.device
    })
  }

  private createParticles() {
    this.vertexParticle = new VertexParticle({
      sizes: this.sizes,
      device: this.device
    })
  }

  /**
   * animate
   */

  public show() {
    this.model?.show()
  }

  public hide() {
    this.model?.hide()
  }

  /**
   * events
   */
  public onResize(values: any) {
    this.model?.onResize(values)
  }

  /**
   * update
   */
  public update({ time }: IUpdate) {
    this.model?.update({ time })
    this.vertexParticle?.update({ time })
  }

  /**
   * destroy
   */
  public destroy() {
    this.model && this.scene.remove(this.model.getMesh())
  }
}
