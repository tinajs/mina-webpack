const { relative, dirname } = require('path')
const requiredPath = require('required-path')
const posix = require('ensure-posix-path')

module.exports = (fromFile, toFile) =>
  posix(requiredPath(relative(dirname(fromFile), toFile)))
