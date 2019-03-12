import postcss from 'postcss'
import postcssUrl from 'postcss-url'

export default function loader(this: any, source: string): void {
  const done = this.async()

  const file = this.resourcePath

  const options = {
    from: file,
  }

  const plugins = [postcssUrl({ url: 'inline' })]

  postcss(plugins)
    .process(source, options)
    .then(({ css }) => done(null, css))
    .catch((error: Error) => done(error))
}
