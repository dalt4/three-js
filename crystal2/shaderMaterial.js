import * as THREE from 'three'

export function shaderMaterial(
  uniforms,
  vertexShader,
  fragmentShader,
  onInit
) {
  const material = class extends THREE.ShaderMaterial {

    constructor(parameters = {}) {
      const entries = Object.entries(uniforms)
      // Create unforms and shaders
      super({
        uniforms: entries.reduce((acc, [name, value]) => {
          const uniform = THREE.UniformsUtils.clone({ [name]: { value } })
          return {
            ...acc,
            ...uniform,
          }
        }, {}),
        vertexShader,
        fragmentShader,
      })
      // Create getter/setters
      entries.forEach(([name]) =>
        Object.defineProperty(this, name, {
          get: () => this.uniforms[name].value,
          set: (v) => (this.uniforms[name].value = v),
        })
      )

      // Assign parameters, this might include uniforms
      Object.assign(this, parameters)
      // Call onInit
      if (onInit) onInit(this)
    }
  }
  material.key = THREE.MathUtils.generateUUID()
  return material
}
