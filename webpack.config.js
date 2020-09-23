const HtmlWebPackPlugin = require("html-webpack-plugin");

module.exports = {
	mode: 'development',
	entry: './src/index.js',
	module: {
		rules: [
			{
				test: /\.(js|jsx)$/,
				exclude: /node_modules/,
				use: ['babel-loader'],
			},
			{
				test: /\.(css|scss)$/,
				exclude: /\.module\.(css|scss)$/,
				use: ['style-loader', 'css-loader', 'sass-loader'],
			},
			{
				test: /\.module\.(css|scss)$/,
				use: [
					'style-loader',
					{
						loader: 'css-loader',
						options: {
							modules: {
								localIdentName: '[local]--[hash:base64:5]',
							},
						},
					},
					'sass-loader',
				],
			},
			{
				test: /\.(png|svg)$/,
				use: ['file-loader'],
			},
		],
	},
	output: {
		path: __dirname + '/dist',
		filename: 'bundle.js'
	},
	plugins: [
		new HtmlWebPackPlugin({
			template: "./public/index.html",
			favicon: "./public/favicon.ico"
		}),
		// new BundleAnalyzerPlugin()
	],
	resolve: { 
		extensions: ['.js', '.jsx'],
		alias: { 
			"react": "preact/compat",
			"react-dom": "preact/compat"
		}
	},
	devtool: 'source-map',
	devServer: {
		port: 3333
	}
};