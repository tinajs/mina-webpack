const { relative } = require('path')
const { getHashDigest } = require('loader-utils')

module.exports = function() {
  const id = getHashDigest(
    Buffer.from(relative(this.rootContext, this.resourcePath)),
    'md5',
    'hex',
    8
  )
  return `module.exports = ${JSON.stringify(id)}`
}
