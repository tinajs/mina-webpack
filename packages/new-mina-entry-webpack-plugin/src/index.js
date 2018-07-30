/* 整体实现逻辑是：
 * 
 * 1. 从app.mina中读取pages的相对路径
 * 2. 从pages中读取components的相对路径
 * 3. 从components中提取entries
 * 
 */

module.exports = function () {
  console.log('mina entry webpack plugin')
}