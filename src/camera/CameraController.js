/* eslint-disable no-unused-vars */
export default (gl, camera) => {
  const canvas = gl.canvas
  const box = canvas.getBoundingClientRect()

  const rotateRate = -300
  const panRate = 5
  const zoomRate = 200

  const offset = {x: box.left, y: box.right}
  const initPos = {x: 0, y: 0}
  let prevPos = {x: 0, y: 0}
  
  const mousePos = (e) => ({x: e.pageX - offset.x, y: e.pageY - offset.y})

  canvas.addEventListener('mousedown', onMouseDown)
  canvas.addEventListener('mousewheel', onMouseWheel)

  function onMouseDown(e) {
    const ePos = mousePos(e)
    initPos.x = prevPos.x = ePos.x
    initPos.y = prevPos.y = ePos.y

    window.addEventListener('mouseup', onMouseUp)
    window.addEventListener('mousemove', onMouseMove)
  }

  function onMouseUp(e) {
    window.removeEventListener('mouseup', onMouseUp)
    window.removeEventListener('mousemove', onMouseMove)
  }
  
  function onMouseMove(e) {
    const pos = mousePos(e)
    const dx = pos.x - prevPos.x
    const dy = pos.y - prevPos.y
    if(e.shiftKey) {
      camera.panX(-dx * (panRate / canvas.width))
      camera.panY(dy * (panRate / canvas.height))
    } else {
      camera.transform.rotation[1] += dx * (rotateRate / canvas.height)
      // camera.transform.rotation[0] += dy * (rotateRate / canvas.width)
    }

    prevPos = pos
  }

  function onMouseWheel(e) {
    const delta = Math.max(-1, Math.min(1, (e.wheelDelta || -e.detail)))
    // camera.panZ(delta * (zoomRate / canvas.height))
    camera.panO(-delta * (zoomRate / canvas.height))
  }
}
