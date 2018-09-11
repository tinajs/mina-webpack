class Component {
  constructor ({ context, request, fullPath, assets }) {
    this.context = context
    this.request = request
    this.fullPath = fullPath
    this.assets = assets
  }

  get isModule () {
    return !this.request.startsWith('./')
  }

  get configPath () {
    if (this.fullPath.endsWith('.mina')) {
      return this.fullPath
    } else {
      return this.assets.find(assetPath => assetPath.endsWith('.json'))
    }
  }

  // 去掉request开头的'./'
  // get name () {
  //   return this.request.replace(/^\.\//, '')
  // }
}

module.exports = Component
