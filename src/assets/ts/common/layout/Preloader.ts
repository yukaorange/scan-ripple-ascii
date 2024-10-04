import Component from '@ts/abstract/Component'
import GSAP from 'gsap'
import * as THREE from 'three'

import Assets from '@ts/common/singleton/Assets'

import Logger from '@ts/common/utility/Logger'

import { DRACOLoader } from 'three/examples/jsm/loaders/DRACOLoader'
import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader'

const modelPath = '/model/character.glb'

const texturePath = '/textures/baked.jpg'

/**
 * Loader
 */
type TLoader = {
  loadAssets: (assets: HTMLImageElement[]) => Promise<void>
  setIndicator: (indicator: HTMLElement) => void
}

export class Loader implements TLoader {
  private textureLoader: THREE.TextureLoader
  private globalAssets: Assets
  private totalLength: number
  private loadedCount: number
  private indicator: HTMLElement | null
  private textures: { [key: number]: THREE.Texture }
  private gltfLoader: GLTFLoader
  private dracoLoader: DRACOLoader

  private model: THREE.Group | null
  private modelTexture: THREE.Texture | null

  constructor() {
    this.globalAssets = Assets.getInstance()

    this.totalLength = 0
    this.loadedCount = 0
    this.textures = {}
    this.modelTexture = null
    this.model = null
    this.indicator = null

    this.textureLoader = new THREE.TextureLoader()
    this.dracoLoader = new DRACOLoader()
    this.dracoLoader.setDecoderPath('/draco/')
    this.gltfLoader = new GLTFLoader()
    this.gltfLoader.setDRACOLoader(this.dracoLoader)
  }

  public async loadAssets(assets: HTMLImageElement[]): Promise<void> {
    return new Promise((resolve, reject) => {
      this.totalLength = assets.length + 2

      const modelPromise = this.loadModel()
      const modelTexturePromise = this.loadModelTexture()
      const texturePromises = assets.map(asset => this.loadTexture(asset))

      Promise.all([modelPromise, modelTexturePromise, ...texturePromises]).then(
        () => {
          this.onLoaded(resolve)
        }
      )
    })
  }

  private loadModel(): Promise<void> {
    return new Promise((resolve, reject) => {
      this.gltfLoader.load(
        modelPath,
        model => {
          this.model = model.scene
          this.onAssetLoaded()
          resolve()
        },
        undefined,
        error => {
          console.error(error)
          reject(error)
        }
      )
    })
  }

  private loadModelTexture(): Promise<void> {
    return new Promise((resolve, reject) => {
      this.textureLoader.load(
        texturePath,
        texture => {
          this.modelTexture = texture
          this.onAssetLoaded()
          resolve()
        },
        undefined,
        error => {
          console.error(error)
          reject(error)
        }
      )
    })
  }

  private loadTexture(imageDom: HTMLImageElement): Promise<void> {
    return new Promise((resolve, reject) => {
      const image = new Image()
      const id = imageDom.getAttribute('data-id')

      image.crossOrigin = 'anonymous'

      image.src = imageDom.getAttribute('data-src') as string

      image.onload = () => {
        const texture = this.textureLoader.load(image.src)

        texture.needsUpdate = true

        this.textures[id as unknown as number] = texture

        this.onAssetLoaded()

        resolve()
      }

      image.onerror = e => {
        Logger.error(`from Preloader.ts / failed to load ${image.src}`)

        reject(e)
      }
    })
  }

  private onAssetLoaded() {
    this.loadedCount++

    const percent = (this.loadedCount / this.totalLength) * 100

    this.updateLoadingIndicator(percent)
  }

  private updateLoadingIndicator(percent: number) {
    const hundred = (this.indicator as HTMLElement).querySelector(
      '[data-ui="preloader-count-digit-hundred"]'
    ) as HTMLElement

    const ten = (this.indicator as HTMLElement).querySelector(
      '[data-ui="preloader-count-digit-ten"]'
    ) as HTMLElement

    const one = (this.indicator as HTMLElement).querySelector(
      '[data-ui="preloader-count-digit-one"]'
    ) as HTMLElement

    let hundreds: number = Math.floor((percent / 100) % 100)

    let tens: number = Math.floor((percent / 10) % 10)

    let ones: number = Math.floor(percent % 10)

    hundred.style.setProperty('--progress', hundreds.toString())

    ten.style.setProperty('--progress', tens.toString())

    one.style.setProperty('--progress', ones.toString())
  }

  private onLoaded(resolve: () => void) {
    this.globalAssets.setTextures(this.textures)
    this.globalAssets.setModels({ character: this.model })
    this.globalAssets.setModelTextures({ skin: this.modelTexture })

    Logger.log(`from Preloader.ts / assets ${this.totalLength} assets loaded`)

    resolve()
  }

  public setIndicator(indicator: HTMLElement) {
    this.indicator = indicator
  }
}

/**
 * animatior
 */

type TAnimator = {
  hideAnimation: (elements: any, resolve: () => void) => Promise<void>
}

export class Animator implements TAnimator {
  public async hideAnimation(
    elements: any,
    resolve: () => void
  ): Promise<void> {
    GSAP.to(elements, {
      autoAlpha: 0,
      duration: 1,
      ease: 'power2.out',
      onUpdate: function () {
        const progress = this.progress()

        if (progress > 0.8) {
          // this logic makes me can modify animation finally.

          resolve()
        }
      }
      // onComplete: () => {
      //   resolve()
      // },
    })
  }
}

export default class Preloader extends Component {
  private loader: TLoader
  private animator: TAnimator

  constructor(loader: TLoader, animator: TAnimator) {
    super({
      element: '[data-ui="preloader"]',
      elements: {
        count: '[data-ui="preloader-count"]',
        assets: '[data-ui="preloader-assets"]'
      }
    })

    Logger.log(
      `from Preloader.ts / this.element: ${this.element} | this.elements: ${this.elements}`
    )

    this.loader = loader

    this.animator = animator
  }

  public async startLoading() {
    const assets = [...this.elements.assets.querySelectorAll('img')]

    const indicator = this.elements.count as HTMLElement

    this.loader.setIndicator(indicator)

    await this.loader.loadAssets(assets)

    this.emit('loaded')
  }

  public async hideAnimation() {
    return new Promise<void>(resolve => {
      const element = this.element

      this.animator.hideAnimation(element, resolve)
    })
  }

  destroy() {
    this.element.parentNode.removeChild(this.element)

    Logger.log('from Preloader.ts / preloader destroyed')
  }
}
