import Shader from './Shader'
import GlUtils from '../GlUtils'

export default class GridAxisShader extends Shader {
  constructor(gl, pMatrix) {
    const vs = `#version 300 es
      in vec3 a_position;

      layout(location=4) in float a_color;

      uniform mat4 uPMatrix;
      uniform mat4 uMVMatrix;
      uniform mat4 uCameraMatrix;

      uniform vec3 uColor[4];
      out lowp vec4 color;

      void main(void){
        color = vec4(uColor[ int(a_color) ], 1.0);
        gl_Position = uPMatrix * uCameraMatrix  * uMVMatrix * vec4(a_position, 1.0);
      }`
    
    const fs = `#version 300 es
      precision mediump float;

      in vec4 color;
      out vec4 finalColor;

      void main(void){ finalColor = color; }`

    super(gl, vs, fs)
    
    this.setPerspective(pMatrix)
    const uColor = gl.getUniformLocation(this.program, 'uColor')
    gl.uniform3fv(uColor, new Float32Array(
      GlUtils.hexToFloat('#4a4a4a', '#f44', '#88f', '#5f5')
    ))

    // clean-up
    gl.useProgram(null)
  }
}
