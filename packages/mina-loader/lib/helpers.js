exports.loadModule = function (request) {
  return new Promise((resolve, reject) => {
    this.loadModule(request, (err, source) => {
      if (err) {
        return reject(err)
      }
      resolve(source)
    })
  })
}
