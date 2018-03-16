/* eslint-disable require-jsdoc */

import GL from './GL'
import GlUtils from './GlUtils'
// eslint-disable-next-line
import RenderLoop from './render/RenderLoop'

import ObjLoader from './loaders/Obj.loader'

import Model from './model/Model'
import Primatives from './model/primatives'

import Camera from './camera/Camera'
import CameraController from './camera/CameraController'

import Shader from './shaders/Shader'
import GridAxisShader from './shaders/GridAxis.shader'

import SkyboxShader from './shaders/Skybox.shader'

(function registerGlobalMathExtensions() {
  Math._degToRad = (deg) => deg * (Math.PI / 180)
})()

class TestShader extends Shader {
  constructor(gl, pMatrix) {
    const vs = `#version 300 es
      in vec4 a_position;
      in vec3 a_norm;
      in vec2 a_uv;

      uniform mat4 uPMatrix;
      uniform mat4 uMVMatrix;
      uniform mat4 uCameraMatrix;

      uniform vec3 uColor[6];
      uniform float uTime;

      out lowp vec4 color;
      out highp vec2 texCoord;

      vec3 warp(vec3 p) {
        return p + 0.2 * abs(cos(uTime * 0.002)) * a_norm;
      }

      void main(void) {
        texCoord = a_uv;
        color = vec4(uColor[ int(a_position.w) ], 1.0);
        gl_Position = uPMatrix * uCameraMatrix * uMVMatrix * vec4(a_position.xyz, 1.0);
      }
    `

    const fs = `#version 300 es
      precision mediump float;

      in vec4 color;
      in highp vec2 texCoord;
      uniform sampler2D uMainTex;

      out vec4 finalColor;
      void main(void) {
        finalColor = mix(color, texture(uMainTex, texCoord), 0.8);
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

window.addEventListener('load', () => {
  let gl = new GL('canvas', {debug: true})._setSize()._clear()

  const camera = new Camera(gl).setPosition(-0.6, 1, 3).setRotation(0, -10, 0)
  new CameraController(gl, camera)

  const tex = gl._loadTexture('tex001', document.getElementById('img-tex'))

  gl._loadCubeMapAsync('skybox000', [
    '/assets/textures/skymap_right.png',
    '/assets/textures/skymap_front.png',
    '/assets/textures/skymap_top.png',
    '/assets/textures/skymap_left.png',
    '/assets/textures/skymap_back.png',
    '/assets/textures/skymap_bottom.png',
  ], 1024, 1024)
  const skyboxTex = gl._loadCubeMap('skybox001', [
    document.getElementById('skybox001_right'),
    document.getElementById('skybox001_left'),
    document.getElementById('skybox001_top'),
    document.getElementById('skybox001_bottom'),
    document.getElementById('skybox001_back'),
    document.getElementById('skybox001_front'),
  ])

  const gridShader = new GridAxisShader(gl, camera.projectionMatrix)
  const grid = new Model(Primatives.GridAxis.createMesh(gl, {
    size: 2.4, divisions: 24, axes: true,
  }))
    .setScale(1, 1, 1)
    .setRotation(0, 0, 0)
    .setPosition(0, 0, 0)
  
  const shader = new TestShader(gl, camera.projectionMatrix)
    .setTexture(tex)
  const cube = new Model(Primatives.Cube.createMesh(gl, 1, 1, 1, {
    name: 'Cube',
  })).setPosition(1, 1, 0)

  const skybox = new Model(Primatives.Cube.createMesh(gl, 20, 20, 20, {name: 'skybox'}))
  const skyboxShader = new SkyboxShader(gl, camera.projectionMatrix, skyboxTex)
  // const quad = new Model(Primatives.Quad.createMesh(gl)).setPosition(0, 0, 0)

  // const objCube = new Model(ObjLoader.domToMesh('objCube', 'obj_001', true))

  // draw(0)
  new RenderLoop(draw).start()

  function draw(dt) {
    camera.updateViewMatrix()
    gl._clear()

    skyboxShader.activate().preRender()
      .setCameraMatrix(camera.getUntranslatedViewMatrix())
      .setTime(performance.now())
      .renderModel(skybox)

    gridShader.activate().setCameraMatrix(camera.viewMatrix)
      .renderModel(grid.preRender())

    shader.activate()
      .preRender()
      .setCameraMatrix(camera.viewMatrix)
      .setTime(performance.now())
      .renderModel(cube.preRender())
      // .renderModel(objCube.preRender())
  }
})
