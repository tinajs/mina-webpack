module.exports = function loadModule(ctx, request) {
  return new Promise((resolve, reject) => {
    ctx.loadModule(request, (err, source) => {
      if (err) {
        return reject(err)
      }
      resolve(source)
    })
  })
}
