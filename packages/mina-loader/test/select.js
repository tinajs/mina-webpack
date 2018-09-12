import path from 'path'
import test from 'ava'
import compiler from './helpers/compiler'

const resolveRelative = path.resolve.bind(null, __dirname)

const minaLoader = require.resolve('..')

test.skip('select block with mina-loader', async t => {
  const { compile, mfs } = compiler({
    entry: {
      'page.js': `!raw-loader!${minaLoader}?select=template!./fixtures/basic/page.mina`,
    },
    output: {
      filename: '[name]',
    },
  })
  const stats = await compile()

  console.log(mfs.data['page.js'].toString())

  // t.true(mfs.existsSync('/assets/logo.7bd732.png'))

  // t.true(
  //   mfs.readFileSync('/fixtures/basic/page.js', 'utf8').includes('onLoad () {')
  // )
  // t.true(
  //   mfs
  //     .readFileSync('/fixtures/basic/page.js', 'utf8')
  //     .includes('Hello from Page!')
  // )
  // t.true(
  //   mfs
  //     .readFileSync('/fixtures/basic/page.js', 'utf8')
  //     .includes("console.log('\\u2665')")
  // )
  // t.is(
  //   mfs.readFileSync('/fixtures/basic/page.wxml', 'utf8'),
  //   '<view>\n  <text class="blue">{{msg}}</text>\n  <image src="../../assets/logo.7bd732.png" />\n</view>'
  // )
  // t.is(
  //   mfs.readFileSync('/fixtures/basic/page.wxss', 'utf8'),
  //   'text.blue {\n  color: #00f;\n  background: url(/assets/logo.7bd732.png);\n}'
  // )
  // t.deepEqual(
  //   JSON.parse(mfs.readFileSync('/fixtures/basic/page.json', 'utf8')),
  //   {
  //     name: 'mina',
  //     usingComponents: { github: '/fixtures/extra-resources/github' },
  //   }
  // )

  t.pass()
})
