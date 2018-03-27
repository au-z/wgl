/* eslint-disable require-jsdoc */
import ShaderUtil from './ShaderUtil'

export default class Shader {
  constructor(gl, vsSrc, fsSrc) {
    this.program = ShaderUtil.textShaderProgram(gl, vsSrc, fsSrc, true)

    if(this.program) {
      this.gl = gl
      gl.useProgram(this.program)
      this.attribLoc = ShaderUtil.getStandardAttribLocations(gl, this.program)
      this.uniformLoc = ShaderUtil.getStandardUniformLocations(gl, this.program)
    }
  }

  activate() {
    this.gl.useProgram(this.program); return this
  }
  deactivate() {
    this.gl.useProgram(null); return this
  }

  setPerspective(matData) {
    this.gl.uniformMatrix4fv(this.uniformLoc.perspective, false, matData)
    return this
  }

  setModelMatrix(matData) {
    this.gl.uniformMatrix4fv(this.uniformLoc.modelMatrix, false, matData)
    return this
  }

  setCameraMatrix(matData) {
    this.gl.uniformMatrix4fv(this.uniformLoc.cameraMatrix, false, matData)
    return this
  }

  dispose() {
    if(this.gl.getParameter(this.gl.CURRENT_PROGRAM) === this.program) {
      this.gl.useProgram(null)
    }
    this.gl.deleteProgram(this.program)
  }

  preRender() {
    // TODO
  }

  renderModel(model) {
    this.setModelMatrix(model.transform.getViewMatrix())
    this.gl.bindVertexArray(model.mesh.vao)

    this.usingToggledDrawOptions(model.mesh, () => {
      if(model.mesh.indexCount) {
        this.gl.drawElements(model.mesh.drawMode, model.mesh.indexCount, this.gl.UNSIGNED_SHORT, 0)
      } else {
        this.gl.drawArrays(model.mesh.drawMode, 0, model.mesh.vertCount)
      }
    })

    this.gl.bindVertexArray(null)
    return this
  }

  usingToggledDrawOptions(mesh, drawFn) {
    if(mesh.noCull) this.gl.disable(this.gl.CULL_FACE)
    if(mesh.doBlending) this.gl.enable(this.gl.BLEND)

    drawFn()

    if(mesh.noCull) this.gl.enable(this.gl.CULL_FACE)
    if(mesh.doBlending) this.gl.disable(this.gl.BLEND)
  }
}
