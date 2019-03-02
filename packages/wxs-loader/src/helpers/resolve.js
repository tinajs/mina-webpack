module.exports = function resolve(ctx, request) {
  return new Promise((resolve, reject) => {
    ctx.resolve(ctx.context, request, (err, result) => {
      if (err) {
        return reject(err)
      }
      resolve(result)
    })
  })
}
