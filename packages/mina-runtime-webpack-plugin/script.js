const fs = require('fs')
const path = require('path')
const ejs = require('ejs')

const core = require('core-js/library')

const cache = (function () {
  const TEMPLATES_DIR = path.join(__dirname, 'templates')

  function template (name) {
    return fs.readFileSync(path.join(TEMPLATES_DIR, `${name}.ejs`), 'utf8')
  }

  return {
    'webpack-runtime': template('webpack-runtime'),
    'core-js-runtime': template('core-js-runtime'),
  }
})()

function render (name, data, options) {
  return ejs.render(cache[name], data, options)
}

module.exports = function script ({ runtime, namespace }) {
  return [
    render('core-js-runtime', { globals: Object.keys(core) }),
    render('webpack-runtime', { runtime, namespace }),
  ].join('')
}
