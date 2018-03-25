/* eslint-disable require-jsdoc */
/* eslint-disable no-inline-comments */

class RenderLoop {
  constructor(renderFn, fps = 60) {
    this.dependencies = {} // all dependencies
    this.lastFrameMs = null // time of last frame
    this.render = renderFn
    this.on = false
    this.fps = fps

    const fpsCapRun = () => {
      const now = performance.now()
      const deltaMs = (now - this.lastFrameMs)
      const dt = deltaMs / 1000.0 // delta time

      if(deltaMs >= this.framerate) { // execute frame
        this.fps = Math.floor(1/dt)
        this.lastFrameMs = now
        this.render(dt, this.dependencies)
      }

      if(this.on) window.requestAnimationFrame(this.run)
    }

    const fpsUncapRun = () => {
      const now = performance.now()
      const dt = (now - this.lastFrameMs) / 1000.0 // delta time
      this.fps = Math.floor(1/dt)
      this.lastFrameMs = now

      this.render(dt, this.dependencies)
      if(this.on) window.requestAnimationFrame(this.run)
    }

    if(fps && fps > 0) {
      this.framerate = 1000.0 / fps
      this.run = fpsCapRun
    } else {
      this.run = fpsUncapRun
    }
  }

  bindDependencies(deps) {
    this.dependencies = deps
    return this
  }

  start() {
    this.on = true
    this.lastFrameMs = performance.now()
    window.requestAnimationFrame(this.run)
    return this
  }

  stop() {
    this.on = false
    return this
  }
}

export default RenderLoop
