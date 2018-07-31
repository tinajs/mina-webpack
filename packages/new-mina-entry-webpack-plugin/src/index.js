/* 整体实现逻辑是：
 * 
 * 1. 从app.mina中读取pages的相对路径
 * 2. 从pages开始递归地添加components（只需要添加componentName和对应的扩展名即可）
 * 3. 从由components导出entries
 * 
 */

const MultiEntryPlugin = require( 'webpack/lib/MultiEntryPlugin')
const SingleEntryPlugin = require ('webpack/lib/SingleEntryPlugin')

const getEntries = require('./getEntries')

const AssetsChunkName = '__assets_chunk_name__'

class MinaEntryWebpackPlugin {
  apply(compiler) {
		compiler.plugin('entry-option', () => {
			this.addEntries(compiler)
			return true
		})
		compiler.plugin('watch-run', ({ compiler }, done) => {
			this.addEntries(compiler)
			done()
			return true
		})
		this.clearAssetsChunk(compiler)
	}

	addEntries(compiler) {
		const { context } = compiler
		const [entries, assets] = getEntries(context)

		for (const name in entries) {
			const path = entries[name]
			compiler.apply(new SingleEntryPlugin(context, path, name))
		}

		if (assets.length > 0) {
			compiler.apply(new MultiEntryPlugin(context, assets, AssetsChunkName))
		}
	}

	clearAssetsChunk(compiler) {
		compiler.plugin('compilation', (compilation) => {
			compilation.plugin('before-chunk-assets', () => {
				const assetsChunkIndex = compilation.chunks.findIndex(({ name }) =>
					name === AssetsChunkName
				)
				if (assetsChunkIndex > -1) {
					compilation.chunks.splice(assetsChunkIndex, 1);
				}
			})
		})
	}
}

module.exports = MinaEntryWebpackPlugin
