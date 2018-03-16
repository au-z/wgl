import Shader from './Shader'

export default class SkyboxShader extends Shader {
  constructor(gl, pMatrix, texture) {
    const vs = `#version 300 es
      in vec4 a_position;
      in vec2 a_uv;

      uniform mat4 uPMatrix;
      uniform mat4 uMVMatrix;
      uniform mat4 uCameraMatrix;

      out highp vec3 texCoord;

      void main(void) {
        texCoord = a_position.xyz;
        gl_Position = uPMatrix * uCameraMatrix * vec4(a_position.xyz, 1.0);
      }
    `
    const fs = `#version 300 es
      precision mediump float;

      in highp vec3 texCoord;

      uniform samplerCube uTex;
      uniform float uTime;

      out vec4 finalColor;

      void main(void) {
        finalColor = mix(texture(uTex, texCoord), vec4(1.0, 1.0, 1.0, 1.0), 0.8);
      }
    `
    super(gl, vs, fs)
    
    this.uniformLoc.time = gl.getUniformLocation(this.program, 'uTime')
    this.uniformLoc.tex = gl.getUniformLocation(this.program, 'uTex')

    this.setPerspective(pMatrix)
    this.tex = texture
    gl.useProgram(null)
  }

  setTime(t) {
    this.gl.uniform1f(this.uniformLoc.time, t)
    return this
  }

  preRender() {
    this.gl.activeTexture(this.gl.TEXTURE0)
    this.gl.bindTexture(this.gl.TEXTURE_CUBE_MAP, this.tex)
    this.gl.uniform1i(this.uniformLoc.tex, 0)

    return this
  }
}
