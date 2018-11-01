const path = require('path')
const CDN_PREFIX = 'https://cdn.url/'
const CDN_DIR = path.relative(
  process.cwd(),
  path.resolve(__dirname, '.dist/cdn/')
)

module.exports = {
  plugins: [
    require('postcss-url')([
      {
        url: 'copy',
        basePath: __dirname,
        assetsPath: CDN_DIR,
        useHash: true,
        hashOptions: {
          shrink: 6,
          append: true,
        },
      },
      {
        url: ({ url }) => `${CDN_PREFIX}${url.replace(`${CDN_DIR}/`, '')}`,
        multi: true,
      },
    ]),
  ],
}
