import SkyboxShader from '../shaders/Skybox.shader'
import ObjLoader from './Obj.loader'
import Model from '../model/Model'

export default (() => {
  const load = (gl, assets, asyncAssets) => {
    const names = Object.keys(asyncAssets)
    const assets$ = names.map((a) => new Promise((res, rej) => {
      const asset = asyncAssets[a]
      const taxonomy = asset.type.trim().split('/')
      switch(taxonomy[0]) {
      case 'MODEL':
        switch(taxonomy[1]) {
        case 'OBJ': ObjLoader.createMeshAsync(gl, asset.name, asset.url, asset.options.yflip)
          .then((mesh) => res(new Model(mesh)))
        }
        break
      case 'SHADER':
        switch(taxonomy[1]) {
        case 'CUBEMAP': gl._loadCubeMapAsync(asset.name, asset.url.fn, asset.url.fragments)
          .then((tex) => res(new SkyboxShader(gl, asset.camera.projectionMatrix, tex)))
          break
        case 'TEXTURE': gl._loadTextureAsync(asset.texture.name, asset.texture.url)
          // eslint-disable-next-line
          .then((tex) => res(new asset.is(gl, asset.camera.projectionMatrix)
            .setTexture(gl.$textureCache[asset.texture.name])))
          break
        }
        break
      }
    }))
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
      })
        .catch((e) => console.error(e))
    })
  }

  return {
    load,
  }
})()
