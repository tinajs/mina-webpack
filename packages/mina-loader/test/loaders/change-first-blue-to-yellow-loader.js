// 一个测试用的loader，将代码中的`blue`替换为`yellow`

module.exports = function(source) {
  return source.replace('blue', 'yellow')
}
