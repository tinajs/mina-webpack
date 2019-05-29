export function toSafeOutputPath(original: string | undefined | null) {
  return (
    (original || '')
      // replace '..' to '_'
      .replace(/\.\./g, '_')
      // replace 'node_modules' to '_node_modules_'
      .replace(/node_modules([\/\\])/g, '_node_modules_$1')
  )
}

export function getResourceUrlFromRequest(request: string) {
  return request.split('!').slice(-1)[0]
}

export function values(object: Record<string, any>) {
  return Object.keys(object).map(key => object[key])
}

export function uniq(array: any[]) {
  return [...new Set(array)]
}
