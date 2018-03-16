import GlUtils from '../../GlUtils'

export default class {
  static createMesh(gl, w, h, d, options = {}) {
    let pos = options.pos || options.position || [0, 0, 0]
    w = w / 2
    h = h / 2
    d = d / 2

    const x0 = pos[0] - w
    const x1 = pos[0] + w
    const y0 = pos[1] - h
    const y1 = pos[1] + h
    const z0 = pos[2] - d
    const z1 = pos[2] + d
    
    /* eslint-disable */
    const verts = [
                     // top
                     x0, y1, z0, 0, //0
                     x0, y1, z1, 0, //1
                     x1, y1, z1, 0, //2
                     x1, y1, z0, 0, //3
// left              front                right
x1, y1, z1, 1,/* 4*/ x0, y1, z1, 2,/* 5*/ x0, y1, z0, 3,// 6
x1, y0, z1, 1,/* 7*/ x0, y0, z1, 2,/* 8*/ x0, y0, z0, 3,// 9
x1, y0, z0, 1,/*10*/ x1, y0, z1, 2,/*11*/ x0, y0, z1, 3,//12
x1, y1, z0, 1,/*13*/ x1, y1, z1, 2,/*14*/ x0, y1, z1, 3,//15
                     // bottom 
                     x0, y0, z1, 4,//16
                     x0, y0, z0, 4,//17
                     x1, y0, z0, 4,//18
                     x1, y0, z1, 4,//19
                     // back
                     x1, y1, z0, 5,//20
                     x1, y0, z0, 5,//21
                     x0, y0, z0, 5,//22
                     x0, y1, z0, 5,//23
    ]

    const index = [
      0, 1, 2, 2, 3, 0, // top
      4, 7, 10, 10, 13, 4, // right
      5, 8, 11, 11, 14, 5, // front
      6, 9, 12, 12, 15, 6, // left
      16, 17, 18, 18, 19, 16, // bottom
      20, 21, 22, 22, 23, 20, // back
    ]

    const uv = GlUtils.replicate([0, 0, 0, 1, 1, 1, 1, 0], 6)
    for(let i = 0; i < 6; i++) uv.push(0, 0, 0, 1, 1, 1, 1, 0)
    
    const normals = [
      ...GlUtils.replicate([0, 1, 0], 4), // top
      ...GlUtils.interleave(3,
        GlUtils.replicate([1, 0, 0], 4), // left
        GlUtils.replicate([0, 0, 1], 4), // front
        GlUtils.replicate([-1, 0, 0], 4), // right
      ),
      ...GlUtils.replicate([0, -1, 0], 4), // bottom
      ...GlUtils.replicate([0, 0, -1], 4), // back
    ]
    /* eslint-enable */

    const mesh = gl._createMeshVAO(options.name || 'Cube', index, verts, normals, uv, 4)
    mesh.noCull = true
    return mesh
  }
}
