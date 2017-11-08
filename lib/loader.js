const { getOptions, interpolateName } = require('loader-utils')
const { parseComponent } = require('vue-template-compiler')

function parse (source) {
  const blocks = parseComponent(source)
  const config = blocks.customBlocks.find((block) => block.type === 'config')

  return {
    wxs: blocks.script,
    wxml: blocks.template,
    wxss: blocks.styles[0],
    json: config,
  }
}

module.exports = function (source) {
  this.cacheable()

  const done = this.async()
  const options = getOptions(this) || {}
  const context = options.context || this.options.context

  const blocks = parse(source)

  for (let ext in blocks) {
    let content = blocks[ext].content
    let outputPath = interpolateName(this, `[path][name].${ext}`, {
      context,
      content,
    })
    this.emitFile(outputPath, content)
  }

  done(null, '')
}
