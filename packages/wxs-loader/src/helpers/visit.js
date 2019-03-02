const babel = require('@babel/core')

const visit = (source, visitor) =>
  babel.transform(source, {
    babelrc: false,
    configFile: false,
    plugins: [
      ({ types: t }) => {
        return {
          name: 'wxs collector',
          visitor: visitor(t),
        }
      },
    ],
  })

module.exports = visit
