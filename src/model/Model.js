/* eslint-disable require-jsdoc */
import {vec3} from 'gl-matrix'
import Transform from '../Transform'

/* eslint-disable brace-style */
export default class Model {
  constructor(meshData) {
    this.transform = new Transform()
    this.mesh = meshData
    return this
  }

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

  preRender() {
    this.transform.updateMatrix()
    return this
    // TODO: update transform matrix
  }
}
