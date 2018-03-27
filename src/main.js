/* eslint-disable require-jsdoc */

import GL from './GL'
import RenderLoop from './render/RenderLoop'

import Model from './model/Model'
import Primatives from './model/primatives'

import Camera from './camera/Camera'
import CameraController from './camera/CameraController'

import PhongTextureShader from './shaders/PhongTexture.shader'
import GridAxisShader from './shaders/GridAxis.shader'

import Scene from './loaders/Scene.loader'
import VertexModel from './model/primatives/Vertex.model';

(function registerGlobalMathExtensions() {
  Math._degToRad = (deg) => deg * (Math.PI / 180)
})()

window.addEventListener('load', () => {
  let gl = new GL('canvas', {debug: true})._setSize()._clear()

  const camera = new Camera(gl).setPosition(-0.6, 1, 3).setRotation(0, -10, 0)
  new CameraController(gl, camera)

  let assets = {
    gridShader: new GridAxisShader(gl, camera.projectionMatrix),
    grid: new Model(Primatives.GridAxis.createMesh(gl, {
      size: 2.4, divisions: 24, axes: true,
    }))
      .setScale(1, 1, 1)
      .setRotation(0, 0, 0)
      .setPosition(0, 0, 0),
    cube: new Model(Primatives.Cube.createMesh(gl, 1, 1, 1, {name: 'cube'})),
    skybox: new Model(Primatives.Cube.createMesh(gl, 100, 100, 100, {name: 'skybox'})),
    light: new VertexModel(gl, 20).addColor('#64c4f2').addPoint([0, 0, 0], 0).finalize(),
    light2: new VertexModel(gl, 20).addColor('#64c4f2').addPoint([0, 0, 0], 0).finalize(),
    light3: new VertexModel(gl, 20).addColor('#64c4f2').addPoint([0, 0, 0], 0).finalize(),
    light4: new VertexModel(gl, 20).addColor('#64c4f2').addPoint([0, 0, 0], 0).finalize(),
  }

  let assetsAsync = {
    skyboxShader: {
      type: 'SHADER/CUBEMAP',
      name: 'skybox001',
      url: {
        fn: (a) => `/assets/textures/skymap_${a}.png`,
        fragments: ['right', 'left', 'top', 'bottom', 'back', 'front'],
      },
      camera,
    },
    shader: {
      type: 'SHADER/TEXTURE',
      name: 'shader',
      is: PhongTextureShader,
      texture: {
        name: 'tex001',
        url: '/assets/textures/pirate.png',
      },
      camera,
    },
    pirate: {
      type: 'MODEL/OBJ',
      name: 'obj001',
      url: '/assets/models/pirate.obj',
      options: {
        yflip: true,
      },
    },
  }

  Scene.load(gl, assets, assetsAsync).then((assets) =>
    new RenderLoop(draw).bindDependencies(assets).start())

  let theta = 0
  let R = 1.5
  let inc = 1

  function draw(dt, a) {
    camera.updateViewMatrix()
    gl._clear()

    // a.skyboxShader.activate().preRender()
    //   .setCameraMatrix(camera.getUntranslatedViewMatrix())
    //   .setTime(performance.now())
    //   .renderModel(a.skybox)

    a.gridShader.activate().setCameraMatrix(camera.viewMatrix)
      .renderModel(a.grid.preRender())
    
    theta += inc * dt
    let x = R * Math.cos(theta)
    let z = R * Math.sin(theta)
    a.light.setPosition(x, 1, z).render(camera)
    a.light2.setPosition(x, 2, z).render(camera)
    a.light3.setPosition(x, 3, z).render(camera)
    a.light4.setPosition(x, 4, z).render(camera)

    a.shader.activate().preRender()
      .setCameraMatrix(camera.viewMatrix)
      .setCameraPos(camera)
      .setLightPos(a.light)
      .setTime(performance.now())
      // .renderModel(a.cube.preRender())
      .renderModel(a.pirate.preRender())
  }
})
