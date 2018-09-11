// 将资源路径中的node_modules修改为_node_modules_.

function ChangePathLoader (source, options) {
  this.resourcePath = this.resourcePath.replace(/node_modules/g, '_node_modules_')
  return source
}

module.exports = ChangePathLoader
