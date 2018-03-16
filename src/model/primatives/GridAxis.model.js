import __ from '../../constants'

export default class {
  static createMesh(gl, options = {size: 0.9, divisions: 10, axes: true}) {
    // 3 floats for position and 1 for color
    const verts = this.createGridVerts(options)
    const attrColorLoc = 4
    const mesh = {drawMode: gl.LINES, vao: gl.createVertexArray()}

    mesh.vertComponentLen = 4
    mesh.vertCount = verts.length / mesh.vertComponentLen
    const stride = Float32Array.BYTES_PER_ELEMENT * mesh.vertComponentLen
  
    // TODO: simplify buffer creation?
    // mesh.buffVerts = gl._createArrayBuffer(verts, true)
    mesh.buffVerts = gl.createBuffer()
    gl.bindVertexArray(mesh.vao)
    gl.bindBuffer(gl.ARRAY_BUFFER, mesh.buffVerts)
    gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(verts), gl.STATIC_DRAW)

    gl.enableVertexAttribArray(__.ATTR_POSITION_LOC)
    gl.enableVertexAttribArray(attrColorLoc)

    gl.vertexAttribPointer(__.ATTR_POSITION_LOC, 3, gl.FLOAT, false, stride, 0)
    gl.vertexAttribPointer(attrColorLoc, 1, gl.FLOAT, false, stride, Float32Array.BYTES_PER_ELEMENT * 3)
  
    gl.bindVertexArray(null)
    gl.bindBuffer(gl.ARRAY_BUFFER, null)
    gl.$meshCache['grid'] = mesh
    mesh.noCull = true
    return mesh
  }

  static createGridVerts(options) {
    const o = options
    const verts = []
    for(let i = -o.size; i <= o.size + 0.0002; i += (2 * o.size) / o.divisions) {
      // vertical lines
      verts.push(...[i, 0, o.size, 0], ...[i, 0, -o.size, 0])
      // horizontal lines
      verts.push(...[-o.size, 0, i, 0], ...[o.size, 0, i, 0])
    }

    if(o.axes) {
      // offset along axis to disable x-fighting
      verts.push(...[-o.size, 0.0001, 0, 1], ...[o.size, 0.0001, 0, 1])
      verts.push(...[0, -0.25, 0, 2], ...[0, 0.25, 0, 2])
      verts.push(...[0, 0.0001, -o.size, 3], ...[0, 0.0001, o.size, 3])
    }
    return verts
  }
}
