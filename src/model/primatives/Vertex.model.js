// import GlUtils from '../../GlUtils'
import {vec3} from 'gl-matrix'
import Transform from '../../Transform'
import ShaderUtil from '../../shaders/ShaderUtil'
import GlUtils from '../../GlUtils'

export default class {
  constructor(gl, ptSize) {
    this.transform = new Transform()
    this.gl = gl
    this.mColor = []
    this.mVerts = []
    this.mVertBuffer = 0
    this.mVertCount = 0
    this.mVertComponentLen = 4
    this.ptSize = ptSize
  }

  addColor(...colors) {
    if(!colors || colors.length === 0) return this
    this.mColor.push(...new Float32Array(GlUtils.hexToFloat(...colors)))
    return this
  }

  addPoint(vec3Pos, index = 0) {
    this.mVerts.push(...vec3Pos, index)
    this.mVertCount = this.mVerts.length / this.mVertComponentLen
    return this
  }

  addMeshPoints(mesh, index = 0) {
    while (mesh.length > 0) this.addPoint(...mesh.splice(0, 3), index)
    return this
  }

  // eslint-disable-next-line
  setPosition(x, y, z) {vec3.set(this.transform.position, x, y, z); return this}

  createShader() {
    const vs = `#version 300 es
      layout(location=0) in vec4 a_position;
      
      uniform mat4 uPMatrix;
      uniform mat4 uCameraMatrix;
      uniform mat4 uMVMatrix;

      uniform vec3 uColorArr[6];
      uniform vec3 uCameraPos;
      uniform float uPtSize;

      out lowp vec4 color;

      void main(void) {
        vec4 pos = uMVMatrix * vec4(a_position.xyz, 1.0);
        color = vec4(uColorArr[int(a_position.w)], 1.0);
        gl_PointSize = (1.0 - distance(uCameraPos, pos.xyz) / 10.0) * uPtSize;

        gl_Position = uPMatrix * uCameraMatrix * pos;
      }
    `

    const fs = `#version 300 es
      precision mediump float;
      in vec4 color;
      out vec4 finalColor;
      void main(void) {
        finalColor = color;
      }
    `

    this.mShader = ShaderUtil.textShaderProgram(this.gl, vs, fs, true)
    this.mUniformColor = this.gl.getUniformLocation(this.mShader, 'uColorArr')
    this.mUniformProj = this.gl.getUniformLocation(this.mShader, 'uPMatrix')
    this.mUniformCamera = this.gl.getUniformLocation(this.mShader, 'uCameraMatrix')
    this.mUniformModelView = this.gl.getUniformLocation(this.mShader, 'uMVMatrix')
    this.mUniformPtSize = this.gl.getUniformLocation(this.mShader, 'uPtSize')
    this.mUniformCameraPos = this.gl.getUniformLocation(this.mShader, 'uCameraPos')

    this.gl.useProgram(this.mShader)
    this.gl.uniform3fv(this.mUniformColor, new Float32Array(this.mColor))
    this.gl.uniform1f(this.mUniformPtSize, this.ptSize)
    this.gl.useProgram(null)
  }

  finalize() {
    this.mVertBuffer = this.gl._createArrayBuffer(new Float32Array(this.mVerts), true)
    this.createShader()
    return this
  }

  render(camera) {
    this.transform.updateMatrix()
    this.gl.useProgram(this.mShader)
    this.gl.uniformMatrix4fv(this.mUniformProj, false, camera.projectionMatrix)
    this.gl.uniformMatrix4fv(this.mUniformCamera, false, camera.viewMatrix)
    this.gl.uniformMatrix4fv(this.mUniformModelView, false, this.transform.getViewMatrix())
    this.gl.uniform3fv(this.mUniformCameraPos, new Float32Array(camera.transform.position))

    this.gl.bindBuffer(this.gl.ARRAY_BUFFER, this.mVertBuffer)
    this.gl.enableVertexAttribArray(0)
    this.gl.vertexAttribPointer(0, this.mVertComponentLen, this.gl.FLOAT, false, 0, 0)

    this.gl.drawArrays(this.gl.POINTS, 0, this.mVertCount)

    this.gl.disableVertexAttribArray(0)
    this.gl.useProgram(null)
    this.gl.bindBuffer(this.gl.ARRAY_BUFFER, null)
  }
}
