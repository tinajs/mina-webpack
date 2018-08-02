import test from 'ava'
import compiler from './helpers/compiler'

test('pack with customized lang attribute', async t => {
  try {
    const { compile, mfs } = compiler({
      entry: './fixtures/lang/page.mina',
      output: {
        filename: 'fixtures/lang/page.js',
      },
      module: {
        rules: [
          {
            test: /\.mina$/,
            use: {
              loader: require.resolve('..'),
              options: {
                loaders: {
                  script: 'babel-loader',
                },
                languages: {
                  yellowify: './loaders/replace-blue-to-yellow',
                },
              },
            },
          },
        ],
      },
    })
    const stats = await compile()

    t.true(
      mfs
        .readFileSync('/fixtures/lang/page.js', 'utf8')
        .includes("console.log('yellow')")
    )
    t.false(
      mfs
        .readFileSync('/fixtures/lang/page.js', 'utf8')
        .includes("console.log('blue')")
    )
    t.is(
      mfs.readFileSync('/fixtures/lang/page.wxss', 'utf8'),
      'text.yellow {\n  color: #00f;\n  background: yellow;\n}'
    )

    t.pass()
  } catch (error) {
    console.error(error)
  }
})
