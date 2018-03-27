import Shader from './Shader'
import GlUtils from '../GlUtils'

export default class TestShader extends Shader {
  constructor(gl, pMatrix) {
    const vs = `#version 300 es
      in vec4 a_position;
      in vec3 a_normal;
      in vec2 a_uv;

      uniform mat4 uPMatrix;
      uniform mat4 uMVMatrix;
      uniform mat4 uCameraMatrix;
      uniform mat3 uNormMatrix;
      uniform vec3 uCamPos;

      out vec3 vPos;
      out vec3 vNormal;
      out vec3 vCamPos;
      out highp vec2 vUV;

      void main(void) {
        vec4 pos = uMVMatrix * vec4(a_position.xyz, 1.0);
        vPos = pos.xyz;
        vNormal = uNormMatrix * a_normal;
        vUV = a_uv;
        vCamPos = (inverse(uCameraMatrix) * vec4(uCamPos, 1.0)).xyz;

        gl_Position = uPMatrix * uCameraMatrix * pos;
      }
    `

    const fs = `#version 300 es
      precision mediump float;

      in vec3 vPos;
      in vec3 vNormal;
      in vec3 vCamPos;
      in highp vec2 vUV;

      uniform sampler2D uMainTex;
      uniform vec3 uLightPos;

      out vec4 outColor;

      void main(void) {
        vec4 cBase = vec4(1.0, 0.7, 0.5, 1.0);
        vec3 cLight = vec3(1.0, 1.0, 1.0);

        float ambientStrength = 0.10;
        vec3 cAmbient = ambientStrength * cLight;

        vec3 lightDir = normalize(uLightPos - vPos);
        float diffAngle = max(dot(vNormal, lightDir), 0.0);

        float diffuseStrength = 0.7;
        vec3 cDiffuse = diffAngle * cLight * diffuseStrength;

        float specularStrength = 0.15;
        float specularShininess = 1.0;
        vec3 camDir = normalize(vCamPos - vPos);
        vec3 reflectDir = reflect(-lightDir, vNormal);
        float spec = pow(max(dot(reflectDir, camDir), 0.0), specularShininess);
        vec3 cSpecular = specularStrength * spec * cLight;

        vec3 finalColor = (cAmbient + cDiffuse + cSpecular) * cBase.rgb;
        outColor = mix(vec4(finalColor, 1.0), texture(uMainTex, vUV), 0.5);
      }
    `
    super(gl, vs, fs)

    this.uniformLoc.uLightPos = gl.getUniformLocation(this.program, 'uLightPos')
    this.uniformLoc.uCamPos = gl.getUniformLocation(this.program, 'uCamPos')
    this.uniformLoc.uNormMatrix = gl.getUniformLocation(this.program, 'uNormMatrix')

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
  setLightPos(obj) {
    this.gl.uniform3fv(this.uniformLoc.uLightPos, new Float32Array(obj.transform.position))
    return this
  }
  setCameraPos(obj) {
    this.gl.uniform3fv(this.uniformLoc.uCamPos, new Float32Array(obj.transform.position))
    return this
  }

  preRender() {
    this.gl.activeTexture(this.gl.TEXTURE0)
    this.gl.bindTexture(this.gl.TEXTURE_2D, this.mainTexture)
    this.gl.uniform1i(this.uniformLoc.mainTexture, 0)

    return this
  }

  renderModel(model) {
    this.gl.uniformMatrix3fv(this.uniformLoc.uNormMatrix, false, model.transform.getNormalMatrix())
    super.renderModel(model)
    return this
  }
}
