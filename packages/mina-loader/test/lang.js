import test from 'ava'
import compiler from './helpers/compiler'

test('use lang attribute simply with loader name', async t => {
  try {
    const { compile, mfs } = compiler({
      entry: './fixtures/lang/basic.mina',
      output: {
        filename: 'fixtures/lang/basic.js',
      },
    })
    const stats = await compile()

    t.is(
      mfs.readFileSync('/fixtures/lang/basic.wxss', 'utf8'),
      '.parent .child {\n  color: #333;\n}\n'
    )

    t.pass()
  } catch (error) {
    console.error(error)
  }
})

test('use lang attribute with extra rules', async t => {
  try {
    const { compile, mfs } = compiler({
      entry: './fixtures/lang/custom-rule.mina',
      output: {
        filename: 'fixtures/lang/custom-rule.js',
      },
      module: {
        rules: [
          {
            test: /\.mina$/,
            use: {
              loader: require.resolve('..'),
              options: {
                languages: {
                  yellowify: './helpers/loaders/replace-blue-to-yellow',
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
        .readFileSync('/fixtures/lang/custom-rule.js', 'utf8')
        .includes("console.log('yellow')")
    )
    t.false(
      mfs
        .readFileSync('/fixtures/lang/custom-rule.js', 'utf8')
        .includes("console.log('blue')")
    )
    t.is(
      mfs.readFileSync('/fixtures/lang/custom-rule.wxss', 'utf8'),
      'text.yellow {\n  color: #00f;\n  background: yellow;\n}'
    )

    t.pass()
  } catch (error) {
    console.error(error)
  }
})

test('use lang attribute should override loaders options', async t => {
  try {
    const { compile, mfs } = compiler({
      entry: './fixtures/lang/override-loader.mina',
      output: {
        filename: 'fixtures/lang/override-loader.js',
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
                  yellowify: './helpers/loaders/replace-blue-to-yellow',
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
        .readFileSync('/fixtures/lang/override-loader.js', 'utf8')
        .includes("console.log('yellow')")
    )
    t.false(
      mfs
        .readFileSync('/fixtures/lang/override-loader.js', 'utf8')
        .includes("console.log('blue')")
    )

    t.true(
      mfs
        .readFileSync('/fixtures/lang/override-loader.js', 'utf8')
        .includes('onLoad () {')
    )
    t.false(
      mfs
        .readFileSync('/fixtures/lang/override-loader.js', 'utf8')
        .includes('onLoad: function onLoad() {')
    )

    t.pass()
  } catch (error) {
    console.error(error)
  }
})
