/// <reference types="vitest" />
import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import viteTsConfigPaths from 'vite-tsconfig-paths';

export default defineConfig({
	cacheDir: '../../node_modules/.vite/transportmap',

	server: {
		port: 3000,
		host: '0.0.0.0',
		proxy: {
			'/api': {
				target: 'http://host.docker.internal:3001',
			},
			'/static': {
				target: 'http://host.docker.internal:3001',
			},
			'/ws': {
				target: 'http://host.docker.internal:3001',
				ws: true,
				rewrite: (path) => path.replace(/^\/ws/, ''),
			},
		},
	},

	preview: {
		port: 4000,
		host: 'localhost',
	},

	plugins: [
		react(),
		viteTsConfigPaths({
			root: '../../',
		})
	],

	// Uncomment this if you are using workers.
	// worker: {
	//  plugins: [
	//    viteTsConfigPaths({
	//      root: '../../',
	//    }),
	//  ],
	// },

	test: {
		globals: true,
		cache: {
			dir: '../../node_modules/.vitest',
		},
		environment: 'jsdom',
		include: ['src/**/*.{test,spec}.{js,mjs,cjs,ts,mts,cts,jsx,tsx}'],
	},
});
