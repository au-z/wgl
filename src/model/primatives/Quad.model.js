export default class Quad {
  static createMesh(gl, options) {
    const verts = [
      -0.5, 0.5, 0,
      -0.5, -0.5, 0,
      0.5, -0.5, 0,
      0.5, 0.5, 0,
    ]
    const uvs = [0, 0, 0, 1, 1, 1, 1, 0]
    const index = [0, 1, 2, 2, 3, 0]
    const mesh = gl._createMeshVAO('Quad', index, verts, null, uvs)
    mesh.noCull = true
    mesh.blend = false
    return mesh
  }
}
