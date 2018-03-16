import GlUtils from '../src/GlUtils'

describe('hexToFloat', () => {
  it('converts single colors', () => {
    const colors = ['#ffffff', '#000000', '#ff0000', '#00ff00', '#0000ff']
    const expected = [1, 1, 1, 0, 0, 0, 1, 0, 0, 0, 1, 0, 0, 0, 1]
    colors.forEach((c, i) => {
      expect(GlUtils.hexToFloat(c)).toMatchObject(
        expected.slice(i * 3, i * 3 + 3)
      )
    })
  })
  it('converts colors without "#"', () => {
    const colors = ['ffffff', '000000', 'ff0000', '00ff00', '0000ff']
    const expected = [1, 1, 1, 0, 0, 0, 1, 0, 0, 0, 1, 0, 0, 0, 1]
    colors.forEach((c, i) => {
      expect(GlUtils.hexToFloat(c)).toMatchObject(
        expected.slice(i * 3, i * 3 + 3)
      )
    })
  })
  it('converts truncated colors', () => {
    const colors = ['fff', '000', 'f00', '0f0', '00f']
    const expected = [1, 1, 1, 0, 0, 0, 1, 0, 0, 0, 1, 0, 0, 0, 1]
    colors.forEach((c, i) => {
      expect(GlUtils.hexToFloat(c)).toMatchObject(
        expected.slice(i * 3, i * 3 + 3)
      )
    })
  })
  it('converts multiple colors', () => {
    expect(GlUtils.hexToFloat('fff', '000', 'f00', '0f0', '00f'))
      .toMatchObject([1, 1, 1, 0, 0, 0, 1, 0, 0, 0, 1, 0, 0, 0, 1])
  })
  it('returns [] if length is incorrect', () => {
    ['ffaa', '#a', '##ff', '#ggg', 'f#fa33'].forEach((c) => 
      expect(GlUtils.hexToFloat(c)).toHaveLength(0))
  })
})

describe('replicate', () => {
  it('copies a an array once', () => {
    expect(GlUtils.replicate([1, 2, 3], 1)).toMatchObject([1, 2, 3])
  })
  it('returns a copy of the array', () => {
    let arr = [1, 2, 3]
    let copy = GlUtils.replicate(arr, 1)
    arr = []
    expect(copy).toMatchObject([1, 2, 3])
  })
  it('concatenates copies to the same array', () => {
    expect(GlUtils.replicate([1, 2, 3], 3)).toMatchObject(
      [1, 2, 3, 1, 2, 3, 1, 2, 3]
    )
  })
})

describe('interleave', () => {
  it('returns the same array if only 1 array provided', () => {
    expect(GlUtils.interleave(1, [1, 2, 3])).toMatchObject([1, 2, 3])
  })
  it('weaves multiple arrays together', () => {
    expect(GlUtils.interleave(1, [1, 2], [3, 4], [5, 6])).toMatchObject([1, 3, 5, 2, 4, 6])
  })
  it('interleaves 2d arrays in strides', () => {
    expect(GlUtils.interleave(1, [[1, 2], [1, 2]], [[3, 4], [3, 4]]))
      .toMatchObject([[1, 2], [3, 4], [1, 2], [3, 4]])
    expect(GlUtils.interleave(2, [[1, 2], [1, 2]], [[3, 4], [3, 4]]))
      .toMatchObject([[1, 2], [1, 2], [3, 4], [3, 4]])
  })
  it('throws if arrays do not match length', () => {
    expect(() => GlUtils.interleave(1, [1, 2, 3], [1, 2])).toThrow
  })
})
