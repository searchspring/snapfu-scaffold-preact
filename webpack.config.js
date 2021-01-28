const path = require('path');
const BundleAnalyzerPlugin = require('webpack-bundle-analyzer').BundleAnalyzerPlugin;

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
		path: path.join(__dirname, 'dist'),
		filename: 'bundle.js',
	},
	plugins: [
		/* uncomment to see analysis of bundle */
		// new BundleAnalyzerPlugin()
	],
	resolve: {
		extensions: ['.js', '.jsx'],
		alias: {
			react: 'preact/compat',
			'react-dom/test-utils': 'preact/test-utils',
			'react-dom': 'preact/compat',
			preact: path.resolve(__dirname, 'node_modules', 'preact'),
			'preact/hooks': path.resolve(__dirname, 'node_modules', 'preact', 'hooks'),
		},
	},
	devtool: 'source-map',
	devServer: {
		https: true,
		port: 3333,
		contentBase: [path.join(__dirname, 'public')],
		contentBasePublicPath: ['/'],
		watchContentBase: true,
		hot: true,
		publicPath: '/dist',
		disableHostCheck: true,
		headers: {
			'Access-Control-Allow-Origin': '*',
		},
	},
};
