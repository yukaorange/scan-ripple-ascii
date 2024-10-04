export default class Assets {
  private static instance: Assets
  private textures: {}
  private modelTextures: {}
  private models: {}

  private constructor() {
    this.textures = {}
    this.modelTextures = {}
    this.models = {}
  }

  public static getInstance(): Assets {
    if (!Assets.instance) {
      Assets.instance = new Assets()
    }
    return Assets.instance
  }

  public getTextures() {
    return this.textures
  }

  public getModelTextures() {
    return this.modelTextures
  }

  public getModels() {
    return this.models
  }

  public setTextures(textures: {}) {
    this.textures = textures
  }

  public setModelTextures(modelTextures: {}) {
    this.modelTextures = modelTextures
  }

  public setModels(models: {}) {
    this.models = models
  }
}
