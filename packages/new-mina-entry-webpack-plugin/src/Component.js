class Component {
  constructor ({ context, request, fullPath, main, assets }) {
    this.context = context
    this.request = request
    this.fullPath = fullPath
    this.main = main
    this.assets = assets
  }

  get isModule () {
    return !this.request.startsWith('./')
  }

  get configPath () {
    if (this.main === '.mina') {
      return this.fullPath + '.mina'
    } else {
      return this.assets.indexOf('.json') > -1 ? this.fullPath + '.json' : null
    }
  }

  // 去掉request开头的'./'
  get name () {
    return this.request.replace(/^\.\//, '')
  }
}

module.exports = Component
