import Shader from './Shader'
import GlUtils from '../GlUtils'

export default class TestShader extends Shader {
  constructor(gl, pMatrix) {
    const vs = `#version 300 es
      in vec4 a_position;
      in vec3 a_norm;
      in vec2 a_uv;

      uniform mat4 uPMatrix;
      uniform mat4 uMVMatrix;
      uniform mat4 uCameraMatrix;

      out highp vec2 texCoord;

      void main(void) {
        texCoord = a_uv;
        gl_Position = uPMatrix * uCameraMatrix * uMVMatrix * vec4(a_position.xyz, 1.0);
      }
    `

    const fs = `#version 300 es
      precision mediump float;

      in highp vec2 texCoord;
      uniform sampler2D uMainTex;

      out vec4 finalColor;
      void main(void) {
        finalColor = texture(uMainTex, texCoord);
      }
    `
    super(gl, vs, fs)

    this.uniformLoc.time = gl.getUniformLocation(this.program, 'uTime')
    const uColor = gl.getUniformLocation(this.program, 'uColor')
    const colors = GlUtils.hexToFloat('#f00', '#0f0', '#00f', '#ff0', '#0ff', '#f0f')
    gl.uniform3fv(uColor, new Float32Array(colors))

    this.setPerspective(pMatrix)

    this.mainTexture = -1
    gl.useProgram(null)
  }

  // eslint-disable-next-line
  setTime(t) { this.gl.uniform1f(this.uniformLoc.time, t); return this }
  // eslint-disable-next-line
  setTexture(texId) { this.mainTexture = texId; return this }

  preRender() {
    this.gl.activeTexture(this.gl.TEXTURE0)
    this.gl.bindTexture(this.gl.TEXTURE_2D, this.mainTexture)
    this.gl.uniform1i(this.uniformLoc.mainTexture, 0)

    return this
  }
}
