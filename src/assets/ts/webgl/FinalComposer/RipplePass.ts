import * as THREE from 'three'
import vertexShader from '@ts/webgl/shaders/vertex-ripple.glsl'
import fragmentShader from '@ts/webgl/shaders/fragment-ripple.glsl'
import { ShaderPass } from 'three/examples/jsm/Addons'

import Pane from '@ts/common/singleton/Pane'

interface IUpdateParams {
  time: number
}

class RippleCanvas {
  private RIPPLE_SPEED = 0.3
  private RIPPLE_PEAK = 0.2
  private rippleCanvas: HTMLCanvasElement
  private rippleContext: CanvasRenderingContext2D
  private rippleTexture: THREE.CanvasTexture
  private rippleWasRendering: boolean
  private ripples: {
    age: number
    position: THREE.Vector2
    color: THREE.Vector2
  }[]

  constructor() {
    this.rippleCanvas = document.createElement('canvas')
    this.rippleCanvas.width = window.innerWidth
    this.rippleCanvas.height = window.innerHeight
    this.rippleContext = this.rippleCanvas.getContext(
      '2d'
    ) as CanvasRenderingContext2D
    this.rippleTexture = new THREE.CanvasTexture(this.rippleCanvas)
    this.rippleTexture.minFilter = THREE.NearestFilter
    this.rippleTexture.magFilter = THREE.NearestFilter

    this.rippleWasRendering = false

    this.ripples = []
  }

  private liner(t: number) {
    return t
  }

  private easeOutQuad(t: number) {
    t = Math.max(0, Math.min(1, t))

    let reversedT = 1 - t

    let result = reversedT * reversedT * reversedT * reversedT

    return 1 - result
  }

  private addRipple(event: MouseEvent) {
    this.ripples.push({
      age: 0,
      position: new THREE.Vector2(event.clientX, event.clientY),
      color: new THREE.Vector2(
        (event.clientX / window.innerWidth) * 255,
        (event.clientY / window.innerHeight) * 255
      )
    })
  }

  public getRippleTexture() {
    return this.rippleTexture
  }

  public onClick(event: MouseEvent) {
    this.addRipple(event)
  }

  public onResize() {
    this.ripples = []

    const width = window.innerWidth
    const height = window.innerHeight
    this.rippleCanvas.width = width
    this.rippleCanvas.height = height
    this.rippleCanvas.style.width = width + 'px'
    this.rippleCanvas.style.height = height + 'px'

    this.rippleContext = this.rippleCanvas.getContext(
      '2d'
    ) as CanvasRenderingContext2D

    this.rippleTexture = new THREE.CanvasTexture(this.rippleCanvas)
    this.rippleTexture.minFilter = THREE.NearestFilter
    this.rippleTexture.magFilter = THREE.NearestFilter

    this.rippleTexture.needsUpdate = true
  }

  public renderRipples({ time }: IUpdateParams) {
    if (this.ripples.length) {
      this.rippleWasRendering = true

      this.rippleContext.fillStyle = 'rgb(128,128,0)'

      this.rippleContext.fillRect(
        0,
        0,
        this.rippleCanvas.width,
        this.rippleCanvas.height
      )

      this.ripples.forEach((ripple, index) => {
        ripple.age += time * this.RIPPLE_SPEED

        if (ripple.age > 1) {
          this.ripples.splice(index, 1)
          return
        }

        const size = this.rippleCanvas.height * this.easeOutQuad(ripple.age)

        const MAX_ALPHA = 1

        let alpha =
          ripple.age < this.RIPPLE_PEAK
            ? this.easeOutQuad(ripple.age / this.RIPPLE_PEAK)
            : 1 -
              this.liner(
                (ripple.age - this.RIPPLE_PEAK) / (1 - this.RIPPLE_PEAK)
              )

        alpha = alpha * MAX_ALPHA

        const gradient = this.rippleContext.createRadialGradient(
          ripple.position.x,
          ripple.position.y,
          size * 0.25,
          ripple.position.x,
          ripple.position.y,
          size
        )

        gradient.addColorStop(1, 'rgba(128,128,0,0.5)')
        gradient.addColorStop(
          0.8,
          `rgba(${ripple.color.x},${ripple.color.y},${10 * alpha},${alpha})`
        )
        gradient.addColorStop(0.0, 'rgba(0,0,0,0)')

        this.rippleContext.beginPath()
        this.rippleContext.fillStyle = gradient
        this.rippleContext.arc(
          ripple.position.x,
          ripple.position.y,
          size,
          0,
          Math.PI * 2
        )
        this.rippleContext.fill()
      })

      this.rippleTexture.needsUpdate = true
    } else if (this.rippleWasRendering) {
      this.rippleContext.fillStyle = 'rgb(128,128,0)'

      this.rippleContext.fillRect(
        0,
        0,
        this.rippleCanvas.width,
        this.rippleCanvas.height
      )

      this.rippleWasRendering = false
      this.rippleTexture.needsUpdate = true
    }
  }
}

class RippleParams {
  private vertexShader: string
  private fragmentShader: string
  private uniforms: Record<string, any> | null = null
  private pane: Pane = Pane.getInstance()

  constructor() {
    this.vertexShader = vertexShader
    this.fragmentShader = fragmentShader

    this.uniforms = {
      tDiffuse: { value: null },
      tRipple: { value: null },
      distortion: { value: new THREE.Vector2(0.001, 0.001) },
      uTime: {
        value: 0
      }
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

export  class RipplePassManager {
  private rippleCanvas: RippleCanvas
  private rippleParams: RippleParams
  private ripplePass: ShaderPass

  constructor() {
    this.rippleCanvas = new RippleCanvas()
    this.rippleParams = new RippleParams()
    this.ripplePass = new ShaderPass({
      vertexShader: this.rippleParams.getVertexShader(),
      fragmentShader: this.rippleParams.getFragmentShader(),
      uniforms: this.rippleParams.getUniforms()
    })

    this.ripplePass.uniforms.tRipple.value =
      this.rippleCanvas.getRippleTexture()
  }

  public getRipplePass() {
    return this.ripplePass
  }

  public onClick(event: MouseEvent) {
    this.rippleCanvas.onClick(event)
  }

  public onResize() {
    this.rippleCanvas.onResize()

    this.ripplePass.uniforms.tRipple.value =
      this.rippleCanvas.getRippleTexture()
  }

  public update({ time }: IUpdateParams) {
    this.rippleCanvas.renderRipples({ time })
    this.ripplePass.uniforms.uTime.value = time
  }
}
