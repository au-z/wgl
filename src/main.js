/* eslint-disable require-jsdoc */
import GL from './GL'
import RenderLoop from './render/RenderLoop'

import SceneConfig from './scene.config'

import Camera from './camera/Camera'
import CameraController from './camera/CameraController'

import Scene from './loaders/Scene.loader'
import VertexModel from './model/primatives/Vertex.model';

(function registerGlobalMathExtensions() {
  Math._degToRad = (deg) => deg * (Math.PI / 180)
})()

window.addEventListener('load', () => {
  let gl = new GL('canvas', {debug: true})._setSize()._clear()

  let assets = {
    camera: new Camera(gl),
    light: new VertexModel(gl, 20).addColor('#64c4f2').addPoint([0, 0, 0], 0).finalize(),
    light2: new VertexModel(gl, 20).addColor('#64c4f2').addPoint([0, 0, 0], 0).finalize(),
    light3: new VertexModel(gl, 20).addColor('#64c4f2').addPoint([0, 0, 0], 0).finalize(),
    light4: new VertexModel(gl, 20).addColor('#64c4f2').addPoint([0, 0, 0], 0).finalize(),
  }

  new CameraController(gl, assets.camera)

  Scene.load(gl, assets, new SceneConfig(assets.camera).assets).then(preDraw).then((assets) => {
    new RenderLoop(draw).bindDependencies(assets).start()
  })

  /**
   * A function to be run before any assets are drawn
   * @param {Object} A the scene Assets
   * @return {Object} the scene Assets
   */
  function preDraw(A) {
    A.camera.setPosition(-1.2, 2, 6).setRotation(0, -10, 0)
    return A
  }

  let theta = 0
  let R = 1.5
  let inc = 1

  /**
   * Passed to the RenderLoop to be drawn
   * @param {Number} dt the change in time
   * @param {Object} A Assets (A) shorthand
   */
  function draw(dt, A) {
    A.camera.updateViewMatrix()
    gl._clear()

    // A.skybox.shader.activate().preRender()
    //   .setCameraMatrix(A.camera.getUntranslatedViewMatrix())
    //   .renderModel(A.skybox.model)

    A.grid.shader.activate()
      .setCameraMatrix(A.camera.viewMatrix)
      .renderModel(A.grid.model.preRender())
    
    theta += inc * dt
    let x = R * Math.cos(theta)
    let z = R * Math.sin(theta)
    A.light.setPosition(x, 1, z).render(A.camera)
    A.light2.setPosition(x, 2, z).render(A.camera)
    A.light3.setPosition(x, 3, z).render(A.camera)
    A.light4.setPosition(x, 4, z).render(A.camera)

    A.girl.shader.activate().preRender()
      .setCameraMatrix(A.camera.viewMatrix)
      .setCameraPos(A.camera)
      .setLightPos(A.light)
      .setTime(performance.now())
      .renderModel(A.girl.model.preRender())
  }
})
