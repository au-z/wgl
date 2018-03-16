const handleError = (e) => console.error(`[http] error encountered: ${e}`)

export default (url, options) => fetch(url, {options})
  .catch(handleError)
