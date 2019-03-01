const sfc = require('@tinajs/mina-sfc')

function parse(source) {
  const blocks = sfc.parse(source)

  return {
    style: blocks.style,
    config: blocks.config,
    script: blocks.script,
    template: blocks.template,
  }
}

module.exports = function(source) {
  return 'module.exports = ' + JSON.stringify(parse(source))
}
