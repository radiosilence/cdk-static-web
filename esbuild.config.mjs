import esbuild from 'esbuild';

export default esbuild.build({
  entryPoints: ['src/index.ts', 'src/lambdas/request/index.ts', 'src/lambdas/response/index.ts'],
  bundle: true,
  minify: true,
  format: 'esm',
  packages: 'external',
  outdir: 'dist',
  target: 'es2020',
});
