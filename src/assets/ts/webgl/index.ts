import GSAP from 'gsap'
import * as THREE from 'three'

import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls.js'
import DebugPane from '@ts/common/singleton/Pane'
import Pane from 'tweakpane'
import { FinalComposer } from '@ts/webgl/FinalComposer'
import { ModelScene } from '@ts/webgl/ModelScene'

export type TCanvas = {
  template: string
  dom: HTMLElement
  device: string
}

export type TSizes = {
  height: number
  width: number
}

export default class Canvas {
  //config
  private template: string
  private device: string

  //container
  private container: HTMLElement

  //parameters
  private sizes: TSizes
  private x: { start: number; end: number }
  private y: { start: number; end: number }
  private isTouchDown: boolean = false
  private clock = new THREE.Clock()

  //three.js objects
  private renderer: THREE.WebGLRenderer | null
  private scene: THREE.Scene | null
  private camera: THREE.PerspectiveCamera | null
  private cameraForDepth: THREE.PerspectiveCamera | null
  private controls: OrbitControls | null
  private pane: DebugPane = DebugPane.getInstance()
  private paneParams: { [key: string]: any } | null = null

  private modelScene: ModelScene | null = null
  private backLight: THREE.PointLight | null = null
  private fillLight: THREE.PointLight | null = null
  private keyLight: THREE.PointLight | null = null

  //composer
  private finalComposer: FinalComposer | null = null

  constructor({ template, dom, device }: TCanvas) {
    //config
    this.template = template
    this.device = device

    //container
    this.container = dom

    //three.js objects
    this.renderer = null
    this.scene = null
    this.camera = null
    this.cameraForDepth = null
    this.controls = null
    this.finalComposer = null

    //parameter
    this.sizes = {
      height: 0,
      width: 0
    }

    this.x = {
      start: 0,
      end: 0
    }

    this.y = {
      start: 0,
      end: 0
    }

    //create objects
    this.createRenderer()

    this.createScene()

    this.createLights()

    this.createCamera()

    this.createControls()

    this.createModelScene()

    this.createComposer()
  }

  private createRenderer() {
    this.renderer = new THREE.WebGLRenderer({
      alpha: true,
      antialias: true
    })

    this.renderer.setClearColor(0x000000, 1)

    this.renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2))

    this.renderer.setSize(window.innerWidth, window.innerHeight)

    this.container.appendChild(this.renderer.domElement)
  }

  private createScene() {
    this.scene = new THREE.Scene()
  }

  private createLights() {
    this.backLight = new THREE.PointLight(0x0f3363, 100, 20)
    this.backLight.position.set(-5, 5, -5)

    this.fillLight = new THREE.PointLight(0x80529d, 50, 20)
    this.fillLight.position.set(-5, 0, 5)

    this.keyLight = new THREE.PointLight(0x45cf6d, 200, 20)
    this.keyLight.position.set(5, 0, 0)

    this.scene?.add(this.backLight)
    this.scene?.add(this.fillLight)
    this.scene?.add(this.keyLight)
  }

  private createCamera() {
    const fov = 45
    const aspect = window.innerWidth / window.innerHeight
    const near = 3
    const far = 8

    this.camera = new THREE.PerspectiveCamera(fov, aspect, near, far)

    this.camera.position.z = 6

    // this.cameraForDepth = this.camera.clone()
    // this.cameraForDepth.near = 1
    // this.cameraForDepth.far = 10
    // this.cameraForDepth.position.x = 0
    // this.cameraForDepth.position.y = 5
    // this.cameraForDepth.position.z = 0
    // this.cameraForDepth.lookAt(new THREE.Vector3(0, 0, 0))
  }

  private createControls() {
    this.controls = new OrbitControls(
      this.camera as THREE.PerspectiveCamera,
      this.renderer?.domElement as HTMLElement
    )

    this.controls.minAzimuthAngle = -Math.PI / 2
    this.controls.maxAzimuthAngle = Math.PI / 2

    this.controls.minPolarAngle = Math.PI / 4
    this.controls.maxPolarAngle = (Math.PI * 3) / 4

    this.controls.minDistance = 5
    this.controls.maxDistance = 7
    this.controls.enableDamping = true
    this.controls.dampingFactor = 0.05
  }

  /**modelScene */
  private createModelScene() {
    this.modelScene = new ModelScene({
      scene: this.scene as THREE.Scene,
      sizes: this.sizes as TSizes,
      device: this.device as string
    })
  }

  private createComposer() {
    this.finalComposer = new FinalComposer({
      renderer: this.renderer as THREE.WebGLRenderer,
      scene: this.scene as THREE.Scene,
      camera: this.camera as THREE.PerspectiveCamera,
      cameraForDepth: this.cameraForDepth as THREE.PerspectiveCamera
    })
  }

  public destroycreateModelScene() {
    this.modelScene?.destroy()
  }

  /**
   * events
   */

  public onPreloaded() {
    this.onChangeEnd(this.template)
  }

  public onChangeStart(template: string) {
    this.template = template
  }

  public onChangeEnd(template: string) {}

  public onResize({ device }: { device: string }) {
    this.device = device

    this.updateScale()

    const params = {
      sizes: this.sizes,
      device: this.device
    }

    this.modelScene?.onResize(params)

    this.finalComposer?.onResize()
  }

  private updateScale() {
    this.renderer?.setSize(window.innerWidth, window.innerHeight)

    const aspect: number = window.innerWidth / window.innerHeight
    const fov: number = this.camera ? this.camera?.fov * (Math.PI / 180) : 0 // Default camera has fov = 45deg. In this case, esult fov is in radians. (1/4 PI rad)

    const height: number = this.camera
      ? 2 * Math.tan(fov / 2) * this.camera?.position.z
      : 0 //z = 5 is setted at this.createCamera
    const width: number = height * aspect //viewport size in screen.
    this.sizes = {
      //Calclated viewport space sizes.
      height: height,
      width: width
    }

    if (this.camera) {
      this.camera.aspect = aspect

      this.camera.updateProjectionMatrix()
    }

    this.finalComposer?.onResize()
  }

  public onTouchDown(event: TouchEvent | MouseEvent) {
    this.isTouchDown = true

    this.x.start = 'touches' in event ? event.touches[0].clientX : event.clientX
    this.y.start = 'touches' in event ? event.touches[0].clientY : event.clientY

    const positions = {
      x: this.x,
      y: this.y
    }
  }

  public onTouchMove(event: TouchEvent | MouseEvent) {
    if (!this.isTouchDown) return

    const x = 'touches' in event ? event.touches[0].clientX : event.clientX
    const y = 'touches' in event ? event.touches[0].clientY : event.clientY

    this.x.end = x
    this.y.end = y

    const positions = {
      x: this.x,
      y: this.y
    }
  }

  public onClick(event: MouseEvent) {
    this.finalComposer?.onClick(event)
  }

  /**loop */

  public update() {
    this.backLight!.intensity = this.pane.params.backLightIntensity
    this.backLight!.distance = this.pane.params.backLightDistance
    this.fillLight!.intensity = this.pane.params.fillLightIntensity
    this.fillLight!.distance = this.pane.params.fillLightDistance
    this.keyLight!.intensity = this.pane.params.keyLightIntensity
    this.keyLight!.distance = this.pane.params.keyLightDistance

    const deltaTime = this.clock.getDelta()

    this.modelScene?.update({ time: deltaTime })

    this.finalComposer?.update({ time: deltaTime })

    this.finalComposer?.render()
  }
}
