/// <reference types='vitest' />
import {defineConfig} from 'vite';
import {nxViteTsPaths} from '@nx/vite/plugins/nx-tsconfig-paths.plugin';

export default defineConfig({
  root: __dirname,
  cacheDir: '../node_modules/.vite/backend',
  plugins: [nxViteTsPaths()],
  test: {
    name: 'backend',
    watch: false,
    globals: true,
    environment: 'node',
    include: ['{src,tests}/**/*.{test,spec}.{js,mjs,cjs,ts,mts,cts}'],
    reporters: ['default'],
    coverage: {
      reportsDirectory: '../coverage/backend',
      provider: 'v8' as const,
    },
  },
});
