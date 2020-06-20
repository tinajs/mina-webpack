const toSafeOutputPath = (original) => {
  return (original || '')
    .replace(/\.\./g, '_')
    .replace(/node_modules([\/\\])/g, '_node_modules_$1')
}

module.exports = toSafeOutputPath
