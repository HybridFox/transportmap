module.exports = {
	parser: '@typescript-eslint/parser',
	parserOptions: {
		project: 'tsconfig.json',
		tsconfigRootDir: __dirname,
		sourceType: 'module',
	},
	settings: {
		"import/resolver": {
			"typescript": {}
		}
	},
	plugins: ['@typescript-eslint/eslint-plugin', 'import'],
	extends: [
		'plugin:@typescript-eslint/recommended',
		"plugin:@typescript-eslint/recommended-requiring-type-checking",
		'plugin:prettier/recommended',
	],
	root: true,
	env: {
		node: true,
		jest: true,
	},
	ignorePatterns: ['.eslintrc.js'],
	rules: {
		'@typescript-eslint/interface-name-prefix': 'off',
		'@typescript-eslint/explicit-function-return-type': 'off',
		'@typescript-eslint/explicit-module-boundary-types': 'off',
		'@typescript-eslint/no-explicit-any': 'off',
		'@typescript-eslint/no-unsafe-call': 'off',
		'@typescript-eslint/no-unsafe-member-access': 'off',
		'@typescript-eslint/no-unsafe-assignment': 'off',
		'import/order': [
			'error',
			{
				groups: ['builtin', 'external', 'parent', 'sibling', 'index'],
				'newlines-between': 'always',
				pathGroups: [
					{
						pattern: '~/**',
						group: 'parent',
					},
					{
						pattern: '~/**',
						group: 'parent',
					},
				],
			},
		],
	},
};
