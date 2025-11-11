import { defineConfig } from 'tsup';

export default defineConfig({
  entry: ['src/dice.ts'],
  format: ['cjs', 'esm'],
  dts: true,
  sourcemap: true,
  clean: true,
  outDir: 'dist',
});
