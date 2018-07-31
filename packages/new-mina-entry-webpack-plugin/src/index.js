/* 整体实现逻辑是：
 * 
 * 1. 从app.mina中读取pages的相对路径
 * 2. 从pages开始递归地添加components（只需要添加componentName和对应的扩展名即可）
 * 3. 从由components导出entries
 * 
 */

const getEntries = require('./getEntries')

module.exports = function () {
}
