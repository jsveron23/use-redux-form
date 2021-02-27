import babel from '@rollup/plugin-babel'
import pkg from './package.json'

/** @see {@link https://github.com/reduxjs/redux/blob/master/rollup.config.js} */
function makeExternalPredicate(externalArr) {
  if (externalArr.length === 0) {
    return () => false
  }

  const pattern = new RegExp(`^(${externalArr.join('|')})($|/)`)

  return (id) => pattern.test(id)
}

export default [
  {
    input: 'src/index.js',
    output: {
      file: 'lib/index.js',
      format: 'cjs',
      exports: 'default',
      indent: false,
    },
    external: makeExternalPredicate([
      ...Object.keys(pkg.dependencies || {}),
      ...Object.keys(pkg.peerDependencies || {}),
    ]),
    plugins: [
      babel({
        babelHelpers: 'runtime',
        exclude: 'node_modules/**',
      }),
    ],
  },
  {
    input: 'src/index.js',
    output: {
      file: 'es/index.js',
      format: 'es',
      indent: false,
    },
    external: makeExternalPredicate([
      ...Object.keys(pkg.dependencies || {}),
      ...Object.keys(pkg.peerDependencies || {}),
    ]),
    plugins: [
      babel({
        babelHelpers: 'runtime',
        exclude: 'node_modules/**',
      }),
    ],
  },
]
