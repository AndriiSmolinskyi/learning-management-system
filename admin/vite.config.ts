import type {
	UserConfig,
} from 'vite'
import {
	defineConfig, loadEnv,
} from 'vite'

import react from '@vitejs/plugin-react-swc'
import eslint from 'vite-plugin-eslint'
import svgr from 'vite-plugin-svgr'

// https://vitejs.dev/config/
export default ({
	mode,
}:
	{
		mode: string
	},
): UserConfig => {
	process.env = {
		...process.env, ...loadEnv(mode, process.cwd(),),
	}

	return defineConfig({
		base:   './',
		server: {
			host: '0.0.0.0',
			port: parseInt(process.env['VITE_PORT'] ?? '3000',),
		},
		assetsInclude: ['**/*.xlsx', '**/*.xls', '**/*.csv',],
		preview:       {
			host: '0.0.0.0',
			port: parseInt(process.env['VITE_PORT'] ?? '3000',),
		},
		build: {
			target: 'es2020',
		},
		plugins: [
			react(),
			eslint({
				fix:         true,
				lintOnStart: true,
			},),
			svgr(),
		],
	},)
}