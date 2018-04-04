import PhongTextureShader from './shaders/PhongTexture.shader'

export default function(camera) {
  return {
    assets: {
      grid: {
        type: 'UI/GRID',
        model: {
          size: 2.4, divisions: 24, axes: true,
        },
        shader: {camera},
      },
      skybox: {
        type: 'ENV/SKYBOX',
        name: 'skybox',
        model: {
          size: 100,
        },
        shader: {
          camera,
          url: {
            fn: (a) => `/assets/textures/skymap_${a}.png`,
            fragments: ['right', 'left', 'top', 'bottom', 'back', 'front'],
          },
        },
      },
      girl: {
        type: 'MODEL/OBJ',
        name: 'girl',
        model: {
          url: '/assets/models/pirate.obj',
          options: {yflip: true},
        },
        shader: {
          is: PhongTextureShader,
          camera,
          texture: {
            name: 'girl',
            url: '/assets/textures/pirate.png',
          },
        },
      },
    },
  }
}
