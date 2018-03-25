const handleError = (e) => console.error(`[http] error encountered: ${e}`)

const scriptRequest = (url, options) => new Promise((res, rej) => {
  let script = document.createElement('script')
  script.setAttribute('src', url)
  script.addEventListener('load', () => res(script))
  document.body.appendChild(script)
})

const imgRequest = (url, options) => new Promise((res, rej) => {
  let img = document.createElement('img')
  img.setAttribute('src', url)
  img.setAttribute('style', 'display: none')
  img.addEventListener('load', () => res(img))
  document.body.appendChild(img)
})

const tagRequest = (url, options) => {
  if(!options.type) throw new Error(`[Http] cannot create tag without type.`)
  switch(options.type.toUpperCase()) {
  case 'SCRIPT': return scriptRequest(url, options)
  case 'IMG': return imgRequest(url, options)
  }
}

export default (url, options = {}) => {
  options = {...options, mode: options.mode || 'FETCH'}
  switch (options.mode.toUpperCase()) {
  case 'DOM': return tagRequest(url, options)
  default: return fetch(url, {options}).catch(handleError)
  }
}
