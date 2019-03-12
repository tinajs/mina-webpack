import sfc from '@tinajs/mina-sfc'

function parse(source: string) {
  const blocks = sfc.parse(source)

  return {
    style: blocks.style,
    config: blocks.config,
    script: blocks.script,
    template: blocks.template,
  }
}

export default function parser(source: string): string {
  return 'module.exports = ' + JSON.stringify(parse(source))
}
