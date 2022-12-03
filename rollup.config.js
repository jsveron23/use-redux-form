import babel from '@rollup/plugin-babel';
import uglify from '@lopatnov/rollup-plugin-uglify';
import pkg from './package.json';

/** @see {@link https://github.com/reduxjs/redux/blob/master/rollup.config.js} */
function makeExternalPredicate(externalArr) {
  if (externalArr.length === 0) {
    return () => false;
  }

  const pattern = new RegExp(`^(${externalArr.join('|')})($|/)`);

  return (id) => pattern.test(id);
}

export default {
  input: 'src/index.js',
  output: [
    {
      file: 'lib/index.js',
      format: 'cjs',
      sourcemap: true,
      exports: 'named',
      indent: false,
    },
    {
      dir: 'es',
      format: 'es',
      sourcemap: true,
      preserveModules: true,
      preserveModulesRoot: 'src',
    },
  ],
  external: makeExternalPredicate([
    ...Object.keys(pkg.dependencies || {}),
    ...Object.keys(pkg.peerDependencies || {}),
  ]),
  plugins: [
    babel({
      babelHelpers: 'runtime',
      exclude: 'node_modules/**',
    }),
    process.env.NODE_ENV === 'production' && uglify(),
  ],
};
