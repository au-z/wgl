import {vec3, mat4} from 'gl-matrix'
import Transform from '../Transform'

export default class Camera {
  constructor(gl, fov, near, far) {
    this.projectionMatrix = mat4.create()
    const ratio = gl.canvas.width / gl.canvas.height
    mat4.perspective(this.projectionMatrix, fov || 45, ratio, near || 0.1, far || 100.0)

    this.transform = new Transform()
    this.viewMatrix = mat4.create()

    this.mode = Camera.MODE_ORBIT
  }

  /* eslint-disable */
  setScale(x, y, z) {vec3.set(this.transform.scale, x, y, z); return this}
  setPosition(x, y, z) {vec3.set(this.transform.position, x, y, z); return this}
  setRotation(x, y, z) {vec3.set(this.transform.rotation, x, y, z); return this}
  addScale(x, y, z) {
    vec3.add(this.transform.scale, this.transform.scale, vec3.fromValues(x, y, z))
    return this
  }
  addPosition(x, y, z) {
    vec3.add(this.transform.position, this.transform.position, vec3.fromValues(x, y, z))
    return this
  }
  addRotation(x, y, z) {
    vec3.add(this.transform.rotation, this.transform.rotation, vec3.fromValues(x, y, z))
    return this
  }
  /* eslint-enable */

  panX(v) {
    this.updateViewMatrix()
    vec3.scaleAndAdd(this.transform.position, this.transform.position, this.transform.right, v)
  }

  panY(v) {
    this.updateViewMatrix()
    this.transform.position[1] += this.transform.up[1] * v
    if(this.mode === Camera.MODE_ORBIT) return
    this.transform.position[2] += this.transform.up[2] * v
    this.transform.position[0] += this.transform.up[0] * v
  }

  panZ(v) {
    this.updateViewMatrix()
    if(this.mode === Camera.MODE_ORBIT) {
      this.transform.position[2] += v
    } else {
      vec3.scaleAndAdd(this.transform.position, this.transform.position, this.transform.forward, v)
    }
  }

  panO(v) {
    this.updateViewMatrix()
    vec3.scaleAndAdd(this.transform.position, this.transform.position, this.transform.origin, v)
  }

  rotate(x, y) {
    if(this.mode !== Camera.MODE_ORBIT) {
      vec3.rotateY(this.transform.rotation, this.transform.rotation, 0, x)
    }
    vec3.rotateX(this.transform.rotation, this.transform.rotation, 0, y)
  }

  getUntranslatedViewMatrix() {
    const mat = mat4.clone(this.viewMatrix)
    mat[12] = 0.0
    mat[13] = 0.0
    mat[14] = 0.0
    return mat
  }

  updateViewMatrix() {
    this.transform.matView = mat4.create()
    if(this.mode === Camera.MODE_FREE) {
      mat4.translate(this.transform.matView, this.transform.matView, this.transform.position)
      mat4.rotateX(this.transform.matView, this.transform.matView, Math._degToRad(this.transform.rotation[0]))
      mat4.rotateY(this.transform.matView, this.transform.matView, Math._degToRad(this.transform.rotation[1]))
    } else {
      mat4.rotateX(this.transform.matView, this.transform.matView, Math._degToRad(this.transform.rotation[0]))
      mat4.rotateY(this.transform.matView, this.transform.matView, Math._degToRad(this.transform.rotation[1]))
      mat4.translate(this.transform.matView, this.transform.matView, this.transform.position)
    }

    this.transform.updateDirection()

    mat4.invert(this.viewMatrix, this.transform.matView)
    return this.viewMatrix
  }

  MODE_FREE = 0
  MODE_ORBIT = 1
}
