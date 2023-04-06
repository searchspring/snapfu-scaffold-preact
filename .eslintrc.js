module.exports = {
	rules: {
		'no-debugger': 'error',
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
