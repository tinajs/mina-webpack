// [Ref](https://blog.iansinnott.com/testing-webpack-plugins/)

import test from 'ava';
import { resolve } from 'path'
import webpack from 'webpack';
import rmdir from 'rmdir'

// 0. Import the config that uses my plugin
import options from './fixtures/webpack.config.js';

test.cb('Compiles project sample', t => {
  const distDir = resolve(__dirname, './fixtures/dist')
  rmdir(distDir, () => {
    // 1. Run webpack
    webpack(options, function(err, stats) {

      // 2. Fail test if there are errors
      if (err) {
        return t.end(err)
      } else if (stats.hasErrors()) {
        return t.end(stats.toString())
      }

      // 3. Map asset objects to output filenames
      const files = stats.toJson().assets.map(x => x.name)

      // 4. Run assertions. Make sure that the three expected files were generated
      t.true(files.indexOf('main.js') === -1)
      t.true(files.indexOf('app.js') !== -1)
      t.true(files.indexOf('pages/page1/page1.js') !== -1)
      t.true(files.indexOf('pages/page2/page2.js') !== -1)
      t.true(files.indexOf('pages/page2/page2.json') !== -1)
      t.true(files.indexOf('_/vendor/local-component-one/index.js') !== -1)
      t.true(files.indexOf('_/vendor/local-component-two/index.js') !== -1)
      t.true(files.indexOf('_/vendor/local-component-two/index.json') !== -1)

      t.end()
    })
  })
})
