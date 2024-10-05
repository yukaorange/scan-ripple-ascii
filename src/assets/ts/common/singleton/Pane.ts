import { Pane } from 'tweakpane'

export default class DebugPane {
  private static instance: DebugPane
  private pane: Pane
  public params: { [key: string]: any }

  private constructor() {
    this.pane = new Pane({
      expanded: false
    })

    this.params = {
      alpha: 1,
      backLightIntensity: 900,
      backLightDistance: 8,
      fillLightIntensity: 800,
      fillLightDistance: 8,
      keyLightIntensity: 600,
      keyLightDistance: 8,

      
    }

    this.addBindings()
  }

  public static getInstance(): DebugPane {
    if (!DebugPane.instance) {
      DebugPane.instance = new DebugPane()
    }

    return DebugPane.instance
  }

  private addBindings() {
    this.pane.addBinding(this.params, 'alpha', {
      min: 0,
      max: 1,
      step: 0.01
    })

    this.pane.addBinding(this.params, 'backLightIntensity', {
      min: 0,
      max: 1000,
      step: 1
    })

    this.pane.addBinding(this.params, 'backLightDistance', {
      min: 0,
      max: 10,
      step: 1
    })

    this.pane.addBinding(this.params, 'fillLightIntensity', {
      min: 0,
      max: 1000,
      step: 1
    })

    this.pane.addBinding(this.params, 'fillLightDistance', {
      min: 0,
      max: 10,
      step: 1
    })

    this.pane.addBinding(this.params, 'keyLightIntensity', {
      min: 0,
      max: 1000,
      step: 1
    })

    this.pane.addBinding(this.params, 'keyLightDistance', {
      min: 0,
      max: 10,
      step: 1
    })
  }

  public getParams() {
    return this.params
  }
}
