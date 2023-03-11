module.exports = {
	parser: '@typescript-eslint/parser',
	// parserOptions: {
	// 	project: 'tsconfig.json',
	// 	tsconfigRootDir: __dirname,
	// 	sourceType: 'module',
	// },
	// settings: {
	// 	'import/resolver': {
	// 		typescript: {},
	// 	},
	// },
	plugins: ['@typescript-eslint', 'import'],
	extends: [
		'eslint:recommended',
		'plugin:@typescript-eslint/eslint-recommended',
		'plugin:@typescript-eslint/recommended',
		'plugin:prettier/recommended',
		'plugin:import/errors',
		'plugin:import/warnings',
		'plugin:import/typescript',
	],
	rules: {
		indent: ['error', 'tab'],
		'@typescript-eslint/no-unused-vars': [
			'warn',
			{
				vars: 'all',
				args: 'all',
				varsIgnorePattern: '^jsx$',
				argsIgnorePattern: '[Ii]gnored$',
			},
		],
		'@typescript-eslint/no-use-before-define': 'off',
		'@typescript-eslint/explicit-function-return-type': 'off',
		'@typescript-eslint/no-explicit-any': 'off',
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
