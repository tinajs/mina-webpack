const { parseComponent } = require('vue-template-compiler')

function parse (source) {
  const blocks = parseComponent(source)
  const config = blocks.customBlocks.find((block) => block.type === 'config')

  return {
    js: blocks.script,
    wxml: blocks.template,
    wxss: blocks.styles[0],
    json: config,
  }
}

module.exports = function (source) {
  return 'module.exports = ' + JSON.stringify(parse(source))
}
