import * as THREE from 'three'

import { VertexParticleParams } from '@ts/webgl/ModelScene/VertexParticle/VartexParticleParams/VartexParticleParams'

type TOption = {
  sizes: {
    width: number
    height: number
  }
  device: string
}

interface IUpdate {
  time: number
}

export class VertexParticle {
  //need to sync camera property in webgl index.ts
  private cameraPosition = 5
  private cameraFov = 45
  private cameraAspect = window.innerWidth / window.innerHeight

  private particlesGroup: THREE.Group = new THREE.Group()
  private geometry: THREE.BufferGeometry | null = null
  private material: THREE.ShaderMaterial | null = null
  private particles: THREE.Points | null = null

  private frustumHeight = 0
  private frustumHeightHalf = 0
  private frustumWidth = 0
  private frustumWidthHalf = 0

  private positionX = 0
  private positionY = 0
  private deltaTime = 0

  private PARTICLE_COUNT = 200
  private PARTICLE_DEPTH = 3
  private PARTICLE_SPEED = 5

  private particleDefaultPositions: Float32Array | null = null
  private particleSpeeds: Float32Array | null = null
  private particlePositions: THREE.Float32BufferAttribute | null = null
  private vartexParticleParams: VertexParticleParams | null = null

  constructor({ sizes, device }: TOption) {
    this.updateFrustumValues()

    this.createGeometry()
    this.createMaterial()
    this.createPoints()
  }

  createGeometry() {
    this.geometry = new THREE.BufferGeometry()

    let arrayForParticlePositions = []
    let arrauForParticleSpeeds = []

    for (let i = 0; i < this.PARTICLE_COUNT; i++) {
      let x = Math.random() * this.frustumWidth
      let y = Math.random() * this.frustumHeight
      let z = (Math.random() * 2 - 1) * (this.PARTICLE_DEPTH / 2)

      arrayForParticlePositions.push(x, y, z)
      arrauForParticleSpeeds.push(1 + Math.random() * this.PARTICLE_SPEED)
    }

    this.particleDefaultPositions = new Float32Array(arrayForParticlePositions)
    this.particleSpeeds = new Float32Array(arrauForParticleSpeeds)

    this.particlePositions = new THREE.Float32BufferAttribute(
      arrayForParticlePositions,
      3
    )
    this.geometry.setAttribute('position', this.particlePositions)
  }

  createMaterial() {
    this.vartexParticleParams = new VertexParticleParams()

    this.material = new THREE.ShaderMaterial({
      lights: true,
      uniforms: {
        ...this.vartexParticleParams.getUniforms()
      },
      vertexShader: this.vartexParticleParams.getVertexShader(),
      fragmentShader: this.vartexParticleParams.getFragmentShader()
    })

    this.material.uniforms.pointSize.value = 2.0
  }

  createPoints() {
    this.particles = new THREE.Points(
      this.geometry as THREE.BufferGeometry,
      this.material as THREE.Material
    )

    this.particlesGroup.add(this.particles)
  }

  updateFrustumValues() {
    this.frustumHeight =
      this.cameraPosition *
      Math.tan(this.cameraFov * 0.5 * THREE.MathUtils.DEG2RAD) *
      2.0

    this.frustumWidth = this.frustumHeight * this.cameraAspect

    this.frustumHeightHalf = this.frustumHeight * 0.5
    this.frustumWidthHalf = this.frustumWidth * 0.5

    if (this.particlesGroup) {
      this.particlesGroup.position.x = -this.frustumWidthHalf
      this.particlesGroup.position.y = -this.frustumHeightHalf
    }
  }

  animateParticles({ time }: IUpdate) {
    if (
      !this.particleDefaultPositions ||
      !this.particleSpeeds ||
      !this.particlePositions
    )
      return

    this.deltaTime += time

    this.positionX = Math.sin(this.deltaTime * 0.01)
    this.positionY = Math.cos(this.deltaTime) * 0.01

    let i = 0
    

    for (let p = 0; p < this.PARTICLE_COUNT; p++) {
      this.particlePositions.array[i] =
        (this.particleDefaultPositions[i] * this.frustumWidthHalf +
          this.particleSpeeds[p] * (1.0 + this.positionX * 4.0) * 0.1) %
        this.frustumWidth

      this.particlePositions.array[i + 1] =
        (this.particleDefaultPositions[i + 1] * this.frustumHeightHalf +
          this.particleSpeeds[p] * (1.0 - this.positionY * 4.0) * 0.1) %
        this.frustumHeight

      i += 3
    }

    this.particlePositions.needsUpdate = true
  }

  getGroup() {
    return this.particlesGroup
  }

  onResize() {
    this.cameraAspect = window.innerWidth / window.innerHeight
    this.updateFrustumValues()
  }

  update({ time }: IUpdate) {
    this.animateParticles({ time })
  }
}
