const { merge } = require('webpack-merge');
const common = require('./webpack.common.js');

module.exports = merge(common, {
	mode: 'production',
	target: 'browserslist',
	devServer: {
		https: true,
		port: 3333,
		hot: false,
		allowedHosts: 'all',
		headers: {
			'Access-Control-Allow-Origin': '*',
		},
		client: false,
		devMiddleware: {
			publicPath: '/dist/',
		},
	}
});