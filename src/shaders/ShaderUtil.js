/* eslint-disable require-jsdoc */
import __ from '../constants'

class ShaderUtil {
  static domShaderSrc(elId) {
    const el = document.getElementById(elId)
    if(!el || el.text === '') {
      console.log(`${elId} shader not found or empty!`)
      return null
    }
    return el.text
  }

  static createShader(gl, src, type) {
    const shader = gl.createShader(type)
    gl.shaderSource(shader, src)
    gl.compileShader(shader)

    if(!gl.getShaderParameter(shader, gl.COMPILE_STATUS)) {
      console.error(`Error compiling shader: ${src}. ${gl.getShaderInfoLog(shader)}`)
      gl.deleteShader(shader)
      return null
    }
    return shader
  }

  static createProgram(gl, vs, fs, validate) {
    const program = gl.createProgram()
    gl.attachShader(program, vs)
    gl.attachShader(program, fs)

    gl.bindAttribLocation(program, __.ATTR_POSITION_LOC, __.ATTR_POSITION_NAME)
    gl.bindAttribLocation(program, __.ATTR_NORMAL_LOC, __.ATTR_NORMAL_NAME)
    gl.bindAttribLocation(program, __.ATTR_UV_LOC, __.ATTR_UV_NAME)
    
    gl.linkProgram(program)

    if(!gl.getProgramParameter(program, gl.LINK_STATUS)) return deleteProgram(program)

    if(validate) {
      gl.validateProgram(program)
      if(!gl.getProgramParameter(program, gl.VALIDATE_STATUS)) return deleteProgram(program)
    }

    detachAndDelete(program, vs, fs)
    return program

    function deleteProgram(program) {
      console.error(`Error validating program: ${gl.getProgramInfoLog(program)}`)
      gl.deleteProgram(program)
      return null
    }

    function detachAndDelete(program, vs, fs) {
      gl.detachShader(program, vs)
      gl.detachShader(program, fs)
      gl.deleteShader(fs)
      gl.deleteShader(vs)
    }
  }

  /**
   * Creates a shader program from in-DOM vertex and fragment shaders
   * @param {Object} gl GL context
   * @param {String} vsId id of vertex shader ('vs')
   * @param {String} fsId id of fragment shader ('fs')
   * @param {Boolean} validate if shader program should be validated
   * @return {Object} Shader program
   */
  static domShaderProgram(gl, vsId = 'vs', fsId = 'fs', validate = false) {
    const vsText = ShaderUtil.domShaderSrc(vsId)
    if(!vsText) return null
    const fsText = ShaderUtil.domShaderSrc(fsId)
    if(!fsText) return null
    return ShaderUtil.textShaderProgram(gl, vsText, fsText, validate)
  }

  /**
   * Creates a shader program from text vertex and fragment shaders
   * @param {Object} gl GL context
   * @param {String} vsText id of vertex shader
   * @param {String} fsText id of fragment shader
   * @param {Boolean} validate if shader program should be validated
   * @return {Object} Shader program
   */
  static textShaderProgram(gl, vsText, fsText, validate = false) {
    const vs = ShaderUtil.createShader(gl, vsText, gl.VERTEX_SHADER)
    if(!vs) return null
    const fs = ShaderUtil.createShader(gl, fsText, gl.FRAGMENT_SHADER)

    if(!fs) {
      console.error('[ShaderUtil] fragment shader failed to compile.')
      gl.deleteShader(vs)
      return null
    }

    return ShaderUtil.createProgram(gl, vs, fs, validate)
  }

  static getStandardAttribLocations(gl, program) {
    return {
      position: gl.getAttribLocation(program, __.ATTR_POSITION_NAME),
      normal: gl.getAttribLocation(program, __.ATTR_NORMAL_NAME),
      uv: gl.getAttribLocation(program, __.ATTR_UV_NAME),
    }
  }

  static getStandardUniformLocations(gl, program) {
    return {
      perspective: gl.getUniformLocation(program, 'uPMatrix'),
      modelMatrix: gl.getUniformLocation(program, 'uMVMatrix'),
      cameraMatrix: gl.getUniformLocation(program, 'uCameraMatrix'),
      mainTexture: gl.getUniformLocation(program, 'uMainTex'),
    }
  }
}

export default ShaderUtil
