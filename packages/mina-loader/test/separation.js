import path from 'path'
import test from 'ava'
import compiler from './helpers/compiler'

const resolveRelative = path.resolve.bind(null, __dirname)

test('load separated source file', async (t) => {
  const { compile, mfs } = compiler({
    context: resolveRelative('fixtures/separation'),
    entry: './page.mina',
    output: {
      filename: 'page.js',
    },
    module: {
      rules: [
        {
          test: /\.mina$/,
          use: {
            loader: require.resolve('..'),
          },
        },
        {
          test: /\.es$/,
          use: {
            loader: 'babel-loader',
          },
        },
      ],
    },
  })

  await compile()
  t.false(mfs.readFileSync('/page.js', 'utf8').includes('onLoad () {'))
  t.true(mfs.readFileSync('/page.js', 'utf8').includes('onLoad: function onLoad() {'))
  t.true(mfs.readFileSync('/page.js', 'utf8').includes('Hello from Page!'))
  t.pass()
})
