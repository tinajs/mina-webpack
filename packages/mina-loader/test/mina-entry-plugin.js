import fs from 'fs'
import path from 'path'
import test from 'ava'
import MinaEntryPlugin from '@tinajs/mina-entry-webpack-plugin'
import compiler from './helpers/compiler'
import YamlConfigReader from './helpers/config-readers/yaml-to-mina-config-reader'

const resolveRelative = path.resolve.bind(null, __dirname)

const logo =
  'image/png;base64,' +
  fs.readFileSync(__dirname + '/fixtures/basic/logo.png.txt', 'utf8').trim()

test('basic usage with MinaEntryPlugin', async t => {
  const { compile, mfs } = compiler({
    context: resolveRelative('fixtures/basic'),
    entry: './app.mina',
    output: {
      filename: '[name]',
    },
    plugins: [new MinaEntryPlugin()],
  })
  await compile()

  t.true(mfs.existsSync('/assets/logo.7bd732.png'))
  t.true(mfs.existsSync('/assets/github.7e4717.png'))

  t.true(mfs.readFileSync('/page.js', 'utf8').includes('onLoad () {'))
  t.true(mfs.readFileSync('/page.js', 'utf8').includes('Hello from Page!'))
  t.true(
    mfs.readFileSync('/page.js', 'utf8').includes("console.log('\\u2665')")
  )
  t.is(
    mfs.readFileSync('/page.wxml', 'utf8'),
    '<view>\n  <text class="blue">{{msg}}</text>\n  <image src="./assets/logo.7bd732.png" />\n</view>'
  )
  t.is(
    mfs.readFileSync('/page.wxss', 'utf8'),
    `text.blue {\n  color: #00f;\n  background: url(data:${logo});\n}`
  )
  t.deepEqual(JSON.parse(mfs.readFileSync('/page.json', 'utf8')), {
    name: 'mina',
    usingComponents: { github: './_/extra-resources/github' },
  })

  t.true(
    mfs
      .readFileSync('/_/extra-resources/github.js', 'utf8')
      .includes('Component({})')
  )
  t.is(
    mfs.readFileSync('/_/extra-resources/github.wxml', 'utf8'),
    '<image src="../../assets/github.7e4717.png" />'
  )
  t.deepEqual(
    JSON.parse(mfs.readFileSync('/_/extra-resources/github.json', 'utf8')),
    { component: true }
  )

  t.true(mfs.readFileSync('/app.js', 'utf8').includes('onLaunch () {'))
  t.true(mfs.readFileSync('/app.js', 'utf8').includes('Hello from App!'))
  t.true(mfs.readFileSync('/app.js', 'utf8').includes("console.log('\\u2665')"))

  t.is(
    mfs.readFileSync('/app.json', 'utf8'),
    JSON.stringify({ pages: ['page'] }, null, '  ')
  )

  t.pass()
})

test('use symbolic links with MinaEntryPlugin', async t => {
  const { compile, mfs } = compiler({
    context: resolveRelative('fixtures/entry'),
    entry: './app-symbolic.mina',
    output: {
      filename: '[name]',
    },
    plugins: [new MinaEntryPlugin()],
  })
  await compile()

  /** fs **/
  t.true(mfs.existsSync('/app-symbolic.json'))
  t.true(mfs.existsSync('/app-symbolic.js'))
  t.true(mfs.existsSync('/_/extra-resources/symbolic-a.wxml'))
  t.true(mfs.existsSync('/_/extra-resources/symbolic-a.js'))
  t.true(mfs.existsSync('/_/extra-resources/subdir/symbolic-b.wxml'))
  t.true(mfs.existsSync('/_/extra-resources/subdir/symbolic-b.js')) *
    /** app **/
    t.is(
      mfs.readFileSync('/app-symbolic.json', 'utf8'),
      JSON.stringify({ pages: ['_/extra-resources/symbolic-a'] }, null, '  ')
    )
  /** symbolic a **/
  t.is(
    mfs.readFileSync('/_/extra-resources/symbolic-a.json', 'utf8'),
    JSON.stringify(
      { usingComponents: { b: './subdir/symbolic-b' } },
      null,
      '  '
    )
  )
  t.true(
    mfs
      .readFileSync('/_/extra-resources/symbolic-a.wxml', 'utf8')
      .includes('<view>Symbolic A</view>')
  )
  t.true(
    mfs
      .readFileSync('/_/extra-resources/symbolic-a.js', 'utf8')
      .includes('Page({}) // Symbolic A')
  )
  /** symbolic b **/
  t.is(
    mfs.readFileSync('/_/extra-resources/subdir/symbolic-b.json', 'utf8'),
    JSON.stringify({ component: true }, null, '  ')
  )
  t.true(
    mfs
      .readFileSync('/_/extra-resources/subdir/symbolic-b.wxml', 'utf8')
      .includes('<view>Symbolic B</view>')
  )
  t.true(
    mfs
      .readFileSync('/_/extra-resources/subdir/symbolic-b.js', 'utf8')
      .includes('Component({}) // Symbolic B')
  )

  t.pass()
})

test('entry could be defined as requests with custom loaders', async t => {
  const { compile, mfs } = compiler({
    context: resolveRelative('fixtures/entry'),
    entry: {
      'app-basic.js': `${require.resolve(
        './helpers/loaders/nothing-loader'
      )}!./app-basic.mina`,
    },
    output: {
      filename: '[name]',
    },
  })
  const stats = await compile()

  t.deepEqual(stats.compilation.errors, [], stats.compilation.errors[0])

  t.true(mfs.existsSync('/app-basic.js'))
  t.true(mfs.existsSync('/app-basic.json'))

  t.pass()
})

test('pages / usingComponents could be defined with inline-loaders', async t => {
  const { compile, mfs } = compiler({
    context: resolveRelative('fixtures/entry'),
    entry: {
      'app-inline-loaders.js': './app-inline-loaders.mina',
    },
    output: {
      filename: '[name]',
    },
  })
  const stats = await compile()

  t.deepEqual(stats.compilation.errors, [], stats.compilation.errors[0])

  t.true(mfs.existsSync('/app-inline-loaders.js'))
  t.true(mfs.existsSync('/app-inline-loaders.json'))
  t.deepEqual(
    JSON.parse(mfs.readFileSync('/app-inline-loaders.json', 'utf8')),
    {
      pages: ['page-a', 'page-b'],
    }
  )

  t.pass()
})

test('pages / usingComponents could be defined as classical component', async t => {
  const { compile, mfs } = compiler({
    context: resolveRelative('fixtures/entry'),
    entry: {
      'app-non-extname.js': './app-non-extname.mina',
    },
    output: {
      filename: '[name]',
    },
  })
  const stats = await compile()

  t.deepEqual(stats.compilation.errors, [], stats.compilation.errors[0])

  t.true(mfs.existsSync('/app-non-extname.js'))
  t.true(mfs.existsSync('/app-non-extname.json'))
  t.deepEqual(JSON.parse(mfs.readFileSync('/app-non-extname.json', 'utf8')), {
    pages: ['page-c', 'page-d', 'page-e', 'page-f'],
  })

  t.pass()
})

test('pages / usingComponents could be defined as classical component with MinaEntryPlugin', async t => {
  const { compile, mfs } = compiler({
    context: resolveRelative('fixtures/entry'),
    entry: './app-non-extname.mina',
    output: {
      filename: '[name]',
    },
    plugins: [new MinaEntryPlugin()],
  })
  const stats = await compile()

  t.deepEqual(stats.compilation.errors, [], stats.compilation.errors[0])

  t.true(mfs.existsSync('/app-non-extname.js'))
  t.true(mfs.existsSync('/app-non-extname.json'))
  t.deepEqual(JSON.parse(mfs.readFileSync('/app-non-extname.json', 'utf8')), {
    pages: ['page-c', 'page-d', 'page-e', 'page-f'],
  })
  t.true(
    mfs.readFileSync('/page-c.js', 'utf8').includes("'Page C'") &&
      mfs.readFileSync('/page-c.js', 'utf8').includes("'Hi'") &&
      mfs
        .readFileSync('/page-c.js', 'utf8')
        .includes(
          'module.exports = __webpack_require__.p + "assets/logo.97017d.png";'
        )
  )
  t.deepEqual(JSON.parse(mfs.readFileSync('/page-c.json', 'utf8')), {
    usingComponents: {
      a: './component-a',
    },
  })
  t.is(
    mfs.readFileSync('/page-d.wxml', 'utf8'),
    '<view>Page D<image src="./assets/logo.97017d.png" /></view>'
  )
  t.deepEqual(JSON.parse(mfs.readFileSync('/page-e.json', 'utf8')), {
    usingComponents: {
      b: './component-b',
      c: './component-c',
    },
  })
  t.is(mfs.readFileSync('/page-f.wxss', 'utf8'), 'view {\n  display: none;\n}')
  t.deepEqual(JSON.parse(mfs.readFileSync('/component-a.json', 'utf8')), {
    component: true,
  })
  t.is(
    mfs.readFileSync('/component-a.wxml', 'utf8'),
    '<view>Component A</view>'
  )
  t.true(mfs.readFileSync('/component-a.js', 'utf8').includes('Component({})'))
  t.deepEqual(JSON.parse(mfs.readFileSync('/component-b.json', 'utf8')), {
    component: true,
  })
  t.deepEqual(JSON.parse(mfs.readFileSync('/component-c.json', 'utf8')), {
    component: true,
  })
  t.is(
    mfs.readFileSync('/component-c.wxml', 'utf8'),
    '<view>Component C</view>'
  )
  t.true(mfs.readFileSync('/component-c.js', 'utf8').includes('Component({})'))

  t.pass()
})

test('pages / usingComponents could be unknown file type with MinaEntryPlugin', async t => {
  const { compile, mfs } = compiler({
    context: resolveRelative('fixtures/entry'),
    entry: './app-unknown-file-type.mina',
    output: {
      filename: '[name]',
    },
    module: {
      rules: [
        {
          test: /\.yaml$/,
          use: [
            require.resolve('..'),
            require.resolve('./helpers/loaders/yaml-to-mina-loader'),
          ],
        },
      ],
    },
    plugins: [
      new MinaEntryPlugin({
        rules: [
          {
            pattern: '**/*.yaml',
            reader: YamlConfigReader,
          },
        ],
      }),
    ],
  })
  const stats = await compile()

  t.deepEqual(stats.compilation.errors, [], stats.compilation.errors[0])

  t.true(mfs.existsSync('/app-unknown-file-type.js'))
  t.true(mfs.existsSync('/app-unknown-file-type.json'))
  t.deepEqual(
    JSON.parse(mfs.readFileSync('/app-unknown-file-type.json', 'utf8')),
    {
      pages: ['page-a', 'page-g'],
    }
  )
  t.deepEqual(JSON.parse(mfs.readFileSync('/page-g.json', 'utf8')), {
    usingComponents: {
      b: './component-b',
      c: './component-c',
    },
  })
  t.deepEqual(JSON.parse(mfs.readFileSync('/component-b.json', 'utf8')), {
    component: true,
  })
  t.deepEqual(JSON.parse(mfs.readFileSync('/component-c.json', 'utf8')), {
    component: true,
  })
  t.is(
    mfs.readFileSync('/component-c.wxml', 'utf8'),
    '<view>Component C</view>'
  )
  t.true(mfs.readFileSync('/component-c.js', 'utf8').includes('Component({})'))

  t.pass()
})

test('pages / usingComponents could use custom extensions with MinaEntryPlugin', async t => {
  const { compile, mfs } = compiler({
    context: resolveRelative('fixtures/entry'),
    entry: './app-custom-extensions.mina',
    output: {
      filename: '[name]',
    },
    plugins: [
      new MinaEntryPlugin({
        extensions: {
          template: ['wxml', 'ttml'],
          style: ['wxss', 'ttss'],
          script: ['js'],
          config: ['json'],
          resolve: ['.js', 'wxml', '.ttml', '.json', 'wxss', '.ttss'],
        },
        minaLoaderOptions: {
          extensions: {
            template: '.ttml',
            style: '.ttss',
          },
        },
      }),
    ],
  })
  const stats = await compile()

  t.deepEqual(stats.compilation.errors, [], stats.compilation.errors[0])

  t.true(mfs.existsSync('/app-custom-extensions.js'))
  t.true(mfs.existsSync('/app-custom-extensions.json'))
  t.deepEqual(
    JSON.parse(mfs.readFileSync('/app-custom-extensions.json', 'utf8')),
    {
      pages: ['page-h', 'page-i'],
    }
  )
  t.is(
    mfs.readFileSync('/page-h.ttml', 'utf8'),
    '<view>Page H<image src="./assets/logo.97017d.png" /></view>'
  )
  t.is(
    mfs.readFileSync('/page-i.ttml', 'utf8'),
    '<view>Page I<image src="./assets/logo.97017d.png" /></view>'
  )
  t.true(
    mfs.readFileSync('/page-i.js', 'utf8').includes("'Page I'") &&
      mfs.readFileSync('/page-i.js', 'utf8').includes("'Hi'") &&
      mfs
        .readFileSync('/page-i.js', 'utf8')
        .includes(
          'module.exports = __webpack_require__.p + "assets/logo.97017d.png";'
        )
  )

  t.pass()
})

test('do not crash with MinaEntryPlugin when some pathes in pages / usingComponents are not existed', async t => {
  const { compile, mfs } = compiler({
    context: resolveRelative('fixtures/entry'),
    entry: './app-not-existed-file.mina',
    output: {
      filename: '[name]',
    },
    plugins: [new MinaEntryPlugin()],
  })
  const stats = await compile()

  t.true(stats.compilation.errors.length > 0)

  t.true(mfs.existsSync('/app-not-existed-file.js'))
  t.true(mfs.existsSync('/page-a.js'))
  t.true(mfs.existsSync('/page-a.wxml'))
  t.pass()
})
