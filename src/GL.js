/* eslint-disable require-jsdoc */
import __ from './constants'
import GLDebug from '../lib/webgl-debug'
import http from './loaders/http'

export default function GL(id, options) {
  options = options || {}
  const DEBUG_CALLS = false  
  const canvas = document.getElementById(id)
  const gl = canvas.getContext('webgl2')
  if(!gl) {
    console.error('WebGL not available :(')
    return null
  }
  // properties
  gl.$meshCache = {}
  gl.$textureCache = {}
  
  gl.cullFace(gl.BACK)
  gl.frontFace(gl.CCW)
  gl.enable(gl.DEPTH_TEST)
  gl.enable(gl.CULL_FACE)
  gl.depthFunc(gl.LEQUAL)
  gl.blendFunc(gl.SRC_ALPHA, gl.ONE_MINUS_SRC_ALPHA)
  gl.clearColor(0.23, 0.23, 0.23, 1.0)
  
  // methods
  gl._clear = function() {
    this.clear(this.COLOR_BUFFER_BIT | this.DEPTH_BUFFER_BIT)
    return this
  }

  gl._setSize = function(w, h) {
    if(!w && !h) window.addEventListener('resize', () => {
      const w = document.body.clientWidth
      const h = document.body.clientHeight
      this.canvas.width = w
      this.canvas.height = h
      this.viewport(0, 0, w, h)
    })
    w = w || document.body.clientWidth
    h = h || document.body.clientHeight
    this.canvas.width = w
    this.canvas.height = h
    this.viewport(0, 0, w, h)
    return this
  }

  gl._createArrayBuffer = function(array, isStatic = true) {
    const buffer = this.createBuffer()
    this.bindBuffer(this.ARRAY_BUFFER, buffer)
    this.bufferData(this.ARRAY_BUFFER, array, (isStatic) ? this.STATIC_DRAW : this.DYNAMIC_DRAW)
    this.bindBuffer(this.ARRAY_BUFFER, null)
    return buffer
  }

  gl._createMeshVAO = function(name, arrIdx, arrVert, arrNormal, arrUV, vertLen = 3) {
    const rtn = {
      drawMode: this.TRIANGLES,
      vao: this.createVertexArray(),
    }

    this.bindVertexArray(rtn.vao)

    if(arrVert) {
      rtn.buffVert = this.createBuffer()
      rtn.vertComponentLen = vertLen
      rtn.vertCount = arrVert.length / rtn.vertComponentLen
      
      this.bindBuffer(this.ARRAY_BUFFER, rtn.buffVert)
      this.bufferData(this.ARRAY_BUFFER, new Float32Array(arrVert), this.STATIC_DRAW)
      this.enableVertexAttribArray(__.ATTR_POSITION_LOC)
      this.vertexAttribPointer(__.ATTR_POSITION_LOC, rtn.vertComponentLen, this.FLOAT, false, 0, 0)
    }

    if(arrNormal) {
      rtn.buffNormals = this.createBuffer()
      this.bindBuffer(this.ARRAY_BUFFER, rtn.buffNormals)
      this.bufferData(this.ARRAY_BUFFER, new Float32Array(arrNormal), this.STATIC_DRAW)
      this.enableVertexAttribArray(__.ATTR_NORMAL_LOC)
      this.vertexAttribPointer(__.ATTR_NORMAL_LOC, 3, this.FLOAT, false, 0, 0)
    }

    if(arrUV) {
      rtn.buffUV = this.createBuffer()
      this.bindBuffer(this.ARRAY_BUFFER, rtn.buffUV)
      this.bufferData(this.ARRAY_BUFFER, new Float32Array(arrUV), this.STATIC_DRAW)
      this.enableVertexAttribArray(__.ATTR_UV_LOC)
      this.vertexAttribPointer(__.ATTR_UV_LOC, 2, this.FLOAT, false, 0, 0)
    }

    if(arrIdx) {
      rtn.buffIdx = this.createBuffer()
      rtn.indexCount = arrIdx.length
      this.bindBuffer(this.ELEMENT_ARRAY_BUFFER, rtn.buffIdx)
      this.bufferData(this.ELEMENT_ARRAY_BUFFER, new Uint16Array(arrIdx), this.STATIC_DRAW)
    }

    // clean up
    this.bindVertexArray(null)
    this.bindBuffer(this.ARRAY_BUFFER, null)
    if(arrIdx) this.bindBuffer(this.ELEMENT_ARRAY_BUFFER, null)

    this.$meshCache[name] = rtn
    return rtn
  }

  gl._loadTextureAsync = function(name, url) {
    return new Promise((res, rej) => {
      http(url, {mode: 'dom', type: 'img'}).then((tex) => res(gl._loadTexture(name, tex)))
    })
  }

  // Blender outputs textures with y-flipped texture coordinates.
  gl._loadTexture = function(name, img, yflip = true) {
    if(!img) throw new Error(`No image provided`)
    const tex = this.createTexture()
    if(yflip) this.pixelStorei(this.UNPACK_FLIP_Y_WEBGL, true)

    this.bindTexture(this.TEXTURE_2D, tex)
    this.texImage2D(this.TEXTURE_2D, 0, this.RGBA, this.RGBA, this.UNSIGNED_BYTE, img)
    
    this.texParameteri(this.TEXTURE_2D, this.TEXTURE_MAG_FILTER, this.LINEAR)
    this.texParameteri(this.TEXTURE_2D, this.TEXTURE_MIN_FILTER, this.LINEAR_MIPMAP_NEAREST)
    this.generateMipmap(this.TEXTURE_2D)

    this.bindTexture(this.TEXTURE_2D, null)
    this.$textureCache[name] = tex

    if(yflip) this.pixelStorei(this.UNPACK_FLIP_Y_WEBGL, false)
    return tex
  }
  
  gl._loadCubeMapAsync = function(name, urlFn, urlFragments) {
    let promiseArr = urlFragments.map((f) => http(urlFn(f), {mode: 'dom', type: 'img'}))
    return Promise.all(promiseArr).then((values) => gl._loadCubeMap(name, values))
  }

  gl._loadCubeMap = function(name, imgArr, fromBuffer = false, bufferOptions = {}) {
    if(imgArr.length !== 6) return null
    const tex = this.createTexture()
    this.bindTexture(this.TEXTURE_CUBE_MAP, tex)

    imgArr.forEach((img, i) => {
      this.texImage2D(this.TEXTURE_CUBE_MAP_POSITIVE_X + i, 0, this.RGBA,
        this.RGBA, this.UNSIGNED_BYTE, img)
    })

    this.texParameteri(this.TEXTURE_CUBE_MAP, this.TEXTURE_MAG_FILTER, this.LINEAR)
    this.texParameteri(this.TEXTURE_CUBE_MAP, this.TEXTURE_MIN_FILTER, this.LINEAR)
    this.texParameteri(this.TEXTURE_CUBE_MAP, this.TEXTURE_WRAP_S, this.CLAMP_TO_EDGE)
    this.texParameteri(this.TEXTURE_CUBE_MAP, this.TEXTURE_WRAP_T, this.CLAMP_TO_EDGE)
    this.texParameteri(this.TEXTURE_CUBE_MAP, this.TEXTURE_WRAP_R, this.CLAMP_TO_EDGE)
    
    this.bindTexture(this.TEXTURE_CUBE_MAP, null)
    this.$textureCache[name] = tex
    return tex
  }

  if(options.debug) {
    const debugError = (err, fn, args) => {
      throw new Error(`${GLDebug.glEnumToString(err)} was caused by call to ${fn}.`)
    }
    const debugCall = (fn, args) => console.log('gl.' + fn + '(' + GLDebug.glFunctionArgsToString(fn, args) + ')')
    GLDebug.makeDebugContext(this, debugError, (DEBUG_CALLS) ? debugCall : null)
  }

  return gl
}
