// Commit the bundle with source edits; it also runs from file:// without imports.
const path = require('node:path');
const esbuild = require('esbuild');
const root = path.resolve(__dirname, '..');
esbuild.build({
  absWorkingDir: root,
  entryPoints: ['rendering.js'],
  outfile: 'assets/sculpture.bundle.js',
  bundle: true,
  splitting: false,
  format: 'iife',
  platform: 'browser',
  target: ['chrome100', 'edge100', 'firefox100', 'safari15.4'],
  minify: true,
  legalComments: 'eof',
  alias: { three: path.join(root, 'assets/three.module.min.js') },
}).catch(error => { console.error(error); process.exitCode = 1; });
