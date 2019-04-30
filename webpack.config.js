const path = require('path');

module.exports = function(mode) {
	return {
	module: {
		rules: [
			{
				include: [path.resolve(__dirname, 'src')],
				loader: 'babel-loader',

				options: {
					plugins: ['syntax-dynamic-import','@babel/transform-runtime'],

					presets: [
						[
							'@babel/preset-env',
							{
								modules: false,
								"targets": {
									"ie" : "9"
								},
								"useBuiltIns": "usage",
								"corejs": 3
							}
						]
					]
				},

				test: /\.js$/,
				exclude: /node_modules/
			}
		]
	},

	entry: {
		app: './src/js/main.js'
	},

	output: {
		filename: 'js/main.js',
		path: path.resolve(__dirname, 'dist')
	},

	mode: mode,

	optimization: {
		splitChunks: {
			cacheGroups: {
				vendors: {
					priority: -10,
					test: /[\\/]node_modules[\\/]/
				}
			},

			chunks: 'async',
			minChunks: 1,
			minSize: 30000,
			name: true
		}
	}
};}
