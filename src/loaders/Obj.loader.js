import http from './http'

export default class {
  static createMeshAsync(gl, name, url, yflip, keepRawData) {
    return new Promise((res, rej) => {
      http(url, {'Content-Type': 'text/plain'}).then((r) => r.text())
        .then((obj) => res(this.objToMesh(gl, name, ...this.parseObj(obj))))
    })
  }

  static objToMesh(gl, name, index, verts, normals, uv) {
    return gl._createMeshVAO(name || 'obj', index, verts, normals, uv)
  }

  static parseObj(obj, yflip) {
    obj = obj.trim() + '\n'

    let line
    let item
    let array
    let ind
    let isQuad = false
    
    let aCache = []
    let cVert = []
    let cNorm = []
    let cUV = []
    
    let fVert = []
    let fNorm = []
    let fUV = []
    let fIndex = []
    let fIndexCt = 0
    
    let headA = 0
    let headB = obj.indexOf('\n', 0)

    while (headB > headA) {
      // read line by line
      line = obj.substring(headA, headB).trim()
      item = line.split(' ')
      item.shift()

      switch(line.charAt(0)) {
      case 'v':
        switch(line.charAt(1)) {
        case ' ': cVert.push(parseFloat(item[0]), parseFloat(item[1]), parseFloat(item[2])); break
        case 't': cUV.push(parseFloat(item[0]), parseFloat(item[1])); break
        case 'n': cNorm.push(parseFloat(item[0]), parseFloat(item[1]), parseFloat(item[2])); break
        }
        break
      case 'f':
        isQuad = false
        item.forEach((i, idx) => {
          if(idx === 3 && !isQuad) {
            idx = 2
            isQuad = true
          }

          if(i in aCache) {
            fIndex.push(aCache[i])
          } else {
            array = i.split('/')
            ind = (parseInt(array[0]) - 1) * 3
            fVert.push(cVert[ind], cVert[ind + 1], cVert[ind + 2])

            ind = (parseInt(array[2]) - 1) * 3
            fNorm.push(cNorm[ind], cNorm[ind + 1], cNorm[ind + 2])

            if(array[1] !== '') {
              ind = (parseInt(array[1]) - 1) * 2
              fUV.push(cUV[ind], (yflip) ? (1 - cUV[ind+1]) : (cUV[ind+1]))
            }

            aCache[i] = fIndexCt
            fIndex.push(fIndexCt)
            fIndexCt++
          }

          if(idx === 3 && isQuad) fIndex.push(aCache[item[0]])
        })
        break
      }

      headA = headB + 1
      headB = obj.indexOf('\n', headA)
    }

    return [fIndex, fVert, fNorm, fUV]
  }
}
