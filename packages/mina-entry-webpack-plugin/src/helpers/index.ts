import path from 'path'

export function toSafeOutputPath(original: string) {
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

export function values(object: any) {
  return Object.keys(object).map(key => object[key])
}

export function uniq<T>(array: Array<T>) {
  return [...new Set(array)]
}

// copied from https://github.com/gulpjs/replace-ext/blob/1638b870b68ee6fe781be03bd29fbf5487b83236/index.js#L27-L30
const startsWithSingleDot = (filePath: string) => {
  var first2chars = filePath.slice(0, 2)
  return first2chars === '.' + path.sep || first2chars === './'
}

export const removeSingleDot = (filePath: string) => {
  if (startsWithSingleDot(filePath)) {
    return filePath.slice(2)
  }

  return filePath
}
