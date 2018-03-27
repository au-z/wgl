/* eslint-disable */

export default (() => {
  const rangeMap = (a, aRange, bRange) => (a - aRange[0]) / (aRange[1] - aRange[0]) * (bRange[1] - bRange[0]) + bRange[0]

  const hexToFloat = (...c) => c.reduce((acc, c) => {
    if(![3, 4, 6, 7].includes(c.length)) return acc
    c = (c[0] == '#') ? c.substring(1) : c
    if(!c.split('').every((h) => ['0','1','2','3','4','5','6','7','8','9','a','b','c','d','e','f'].includes(h)) || [4, 7].includes(c.length)) return []
    if(c.length == 3) c = [c[0], c[0], c[1], c[1], c[2], c[2]]
    const z = (a, b) => parseInt(a + b, 16) / 255.0
    return acc.concat(z(c[0] + c[1]), z(c[2] + c[3]), z(c[4] + c[5]))
  }, [])

  const interleave = (stride, ...arrs) => {
    let ret = []
    const len = arrs[0].length
    if(!arrs.every((a) => a.length === len)) throw new Error(`Cannot interleave arrays of different sizes`)
    for(let i = 0; i < len / stride; i++) {
      arrs.map(a => ret.push(...a.slice(i * stride, i * stride + stride)))
    }
    return ret
  }

  const replicate = (arr, n) => {
    let ret = []
    for(let i = 0; i < n; i++) ret.push(...arr)
    return ret
  }

  return {
    hexToFloat,
    interleave,
    rangeMap,
    replicate,
  }
})()
