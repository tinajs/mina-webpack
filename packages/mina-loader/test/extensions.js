import fs from 'fs'
import test from 'ava'
import compiler from './helpers/compiler'

const logo =
  'image/png;base64,' +
  fs.readFileSync(__dirname + '/fixtures/basic/logo.png.txt', 'utf8').trim()

test('use custom extensions', async t => {
  const { compile, mfs } = compiler({
    entry: './fixtures/basic/page.mina',
    output: {
      filename: 'fixtures/basic/page.js',
    },
    module: {
      rules: [
        {
          test: /\.mina$/,
          use: {
            loader: require.resolve('..'),
            options: {
              extensions: {
                config: '.config.json',
                template: '.html',
                style: '.css',
              },
            },
          },
        },
      ],
    },
  })
  const stats = await compile()

  t.deepEqual(stats.compilation.errors, [], stats.compilation.errors[0])

  t.true(mfs.existsSync('/assets/logo.72c9db.png'))
  t.true(
    mfs.readFileSync('/fixtures/basic/page.js', 'utf8').includes('onLoad () {')
  )
  t.true(
    mfs
      .readFileSync('/fixtures/basic/page.js', 'utf8')
      .includes('Hello from Page!')
  )
  t.true(
    mfs
      .readFileSync('/fixtures/basic/page.js', 'utf8')
      .includes("console.log('\\u2665')")
  )
  t.is(
    mfs.readFileSync('/fixtures/basic/page.html', 'utf8'),
    '<view>\n  <text class="blue">{{msg}}</text>\n  <image src="../../assets/logo.72c9db.png" />\n</view>'
  )
  t.is(
    mfs.readFileSync('/fixtures/basic/page.css', 'utf8'),
    `text.blue {\n  color: #00f;\n  background: url(data:${logo});\n}`
  )
  t.deepEqual(
    JSON.parse(mfs.readFileSync('/fixtures/basic/page.config.json', 'utf8')),
    {
      name: 'mina',
      usingComponents: { github: './../extra-resources/github' },
    }
  )

  t.pass()
})
