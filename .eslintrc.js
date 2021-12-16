module.exports = {
	rules: {
		'no-console': 'error',
		'no-magic-numbers': 'off',
	},
	parser: '@babel/eslint-parser',
	parserOptions: {
		ecmaFeatures: {
			legacyDecorators: true,
		},
	},
};
