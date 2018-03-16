export default (() => {
  const mat4 = (mat) => `[
    ${mat[0].toFixed(2)}, ${mat[1].toFixed(2)}, ${mat[2].toFixed(2)}, ${mat[3].toFixed(2)}
    ${mat[4].toFixed(2)}, ${mat[5].toFixed(2)}, ${mat[6].toFixed(2)}, ${mat[7].toFixed(2)}
    ${mat[8].toFixed(2)}, ${mat[9].toFixed(2)}, ${mat[10].toFixed(2)}, ${mat[11].toFixed(2)}
    ${mat[12].toFixed(2)}, ${mat[13].toFixed(2)}, ${mat[14].toFixed(2)}, ${mat[15].toFixed(2)}
  ]`
  
  return {
    mat4,
  }
})()
