import {vec3, vec4, mat3, mat4} from 'gl-matrix'

export default class Transform {
  constructor() {
    this.position = vec3.fromValues(0, 0, 0)
    this.scale = vec3.fromValues(1, 1, 1)
    this.rotation = vec3.fromValues(0, 0, 0)
    this.matView = mat4.create()
    this.matNormal = mat3.create()

    this.forward = vec4.create()
    this.up = vec4.create()
    this.right = vec4.create()
    this.origin = vec4.create()
  }

  updateMatrix() {
    this.matView = mat4.create()
    mat4.translate(this.matView, this.matView, this.position)
    mat4.rotateX(this.matView, this.matView, Math._degToRad(this.rotation[0]))
    mat4.rotateY(this.matView, this.matView, Math._degToRad(this.rotation[1]))
    mat4.rotateZ(this.matView, this.matView, Math._degToRad(this.rotation[2]))
    mat4.scale(this.matView, this.matView, this.scale)

    mat3.normalFromMat4(this.matNormal, this.matView)

    this.updateDirection()
    return this.matView
  }

  updateDirection() {
    vec4.transformMat4(this.forward, [0, 0, 1, 0], this.matView)
    vec4.transformMat4(this.up, [0, 1, 0, 0], this.matView)
    vec4.transformMat4(this.right, [1, 0, 0, 0], this.matView)
    vec4.transformMat4(this.origin, vec4.normalize(this.origin, this.lookAt(this.matView)), this.matView)
    return this
  }

  lookAt() {
    return vec4.fromValues(this.matView[2], this.matView[6], this.matView[10], this.matView[14])
  }
  
  getViewMatrix() {
    return this.matView
  }

  getNormalMatrix() {
    return this.matNormal
  }

  reset() {
    vec3.set(this.position, 0, 0, 0)
    vec3.set(this.scale, 1, 1, 1)
    vec4.set(this.rotation, 0, 0, 0)
  }
}
