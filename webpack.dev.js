const { merge } = require('webpack-merge');
const common = require('./webpack.common.js');
const path = require('path');

module.exports = merge(common, {
	mode: 'development',
	target: 'web',
	devtool: 'source-map',
	devServer: {
		https: true,
		port: 3333,
		contentBase: [path.join(__dirname, 'public')],
		contentBasePublicPath: ['/'],
		watchContentBase: true,
		writeToDisk: (filePath) => {
			return /bundle\.js.*/.test(filePath);
		},
		hot: true,
		publicPath: '/dist',
		disableHostCheck: true,
		headers: {
			'Access-Control-Allow-Origin': '*',
		},
	}
});