const fm = require('front-matter')

module.exports = source => {
  return `<config>${JSON.stringify(fm(source).attributes)}</config>`
}
