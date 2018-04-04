/* eslint-disable no-inline-comments */
import SkyboxShader from '../shaders/Skybox.shader'
import ObjLoader from './Obj.loader'
import Model from '../model/Model'
import Primatives from '../model/primatives'
import GridAxisShader from '../shaders/GridAxis.shader'

const SkyboxLoader = (gl, name = 'skybox', shader, model) => new Promise((res, rej) =>
  gl._loadCubeMapAsync(name, shader.url.fn, shader.url.fragments)
    .then((tex) => res({
      model: new Model(Primatives.Cube.createMesh(gl, model.size, model.size, model.size, {name})),
      shader: new SkyboxShader(gl, shader.camera.projectionMatrix, tex),
    }))
)

const GridLoader = (gl, name = 'grid', model, shader) => ({
  model: new Model(Primatives.GridAxis.createMesh(gl, model)),
  shader: new GridAxisShader(gl, shader.camera.projectionMatrix),
})

export default (() => {
  const load = (gl, assets, asyncAssets) => {
    const names = Object.keys(asyncAssets)

    const assets$ = names.map((a) => new Promise((res, rej) => {
      const asset = asyncAssets[a]
      asset.options = asset.options || {}

      const taxonomy = asset.type.trim().split('/')
      
      /* eslint-disable indent */
      switch(taxonomy[0]) {
        case 'UI': switch(taxonomy[1]) {
          case 'GRID': res(new GridLoader(gl, asset.name, asset.model, asset.shader))
          break
        }
        break

        case 'ENV': switch(taxonomy[1]) {
          case 'SKYBOX': return new SkyboxLoader(gl, asset.name, asset.shader, asset.model).then(res)
        }
        break

        case 'MODEL': switch(taxonomy[1]) {
          case 'OBJ': return new Promise((res, rej) => {
            Promise.all([
              ObjLoader.createMeshAsync(gl, asset.name, asset.model.url, asset.model.options.yflip),
              gl._loadTextureAsync(asset.shader.texture.name, asset.shader.texture.url),
            ]).then((values) => {
              res({
                model: new Model(values[0]),
                // eslint-disable-next-line
                shader: new asset.shader.is(gl, asset.shader.camera.projectionMatrix)
                  .setTexture(gl.$textureCache[asset.shader.texture.name]),
              })
            })
          }).then(res)
        }
        break

        case 'SHADER': switch(taxonomy[1]) {
          case 'CUBEMAP': gl._loadCubeMapAsync(asset.name, asset.url.fn, asset.url.fragments)
            .then((tex) => res(new SkyboxShader(gl, asset.camera.projectionMatrix, tex)))
            break // CUBEMAP
          case 'TEXTURE': gl._loadTextureAsync(asset.texture.name, asset.texture.url)
            // eslint-disable-next-line
            .then((tex) => res(new asset.is(gl, asset.camera.projectionMatrix)
              .setTexture(gl.$textureCache[asset.texture.name])))
            break
        }
        break
      }
    }))

    // resolve all assets
    return new Promise((res, rej) => {
      Promise.all(assets$).then((results) => {
        let finalAssets = {
          ...assets,
          ...results.reduce((acc, a, i) => {
            acc[names[i]] = a
            return acc
          }, {}),
        }
        res(finalAssets)
      }).catch((e) => console.error(e))
    })
  }

  return {
    load,
  }
})()
