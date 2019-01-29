const { getHashDigest } = require('loader-utils')

module.exports = function(mina) {
  const id = getHashDigest(Buffer.from(mina.name), 'md5', 'hex', 8)
  mina.blocks.forEach(block => {
    if (block.tag === 'script') {
      block.content = `module.exports = ${JSON.stringify(id)}`
    } else {
      block.content = id
    }
  })
  return mina
}
