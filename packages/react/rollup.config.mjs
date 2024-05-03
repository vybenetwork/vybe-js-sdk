import resolve from '@rollup/plugin-node-resolve'
import commonjs from '@rollup/plugin-commonjs'
import { getBabelOutputPlugin } from '@rollup/plugin-babel'
import typescript from '@rollup/plugin-typescript'
import { terser } from 'rollup-plugin-terser'
import ignore from 'rollup-plugin-ignore'

import fs from 'fs'
import path from 'path'

const ignored = [
  'tests',
  'utils',
  '__mocks__',
  'constants.ts'
]

function getInputs(dirPath, result = []) {
  const files = fs.readdirSync(dirPath)

  files.forEach(file => {
    if (ignored.includes(file)) return

    const filePath = path.join(dirPath, file)

    if (fs.statSync(filePath).isDirectory()) {
      // recurse
      result = getInputs(filePath, result)
    } else if (path.extname(file) === '.tsx') {
      // Push the entry files
      result.push(filePath)
    }
  })

  return result
}

const extensions = ['.js', '.ts', '.tsx']
const inputs = getInputs('./src/Widgets')

const configs = inputs.map((input) => ({
  input,
  output: {
    dir: './widgets',
    format: 'esm',
    minifyInternalExports: false
  },
  preserveEntrySignatures: 'strict',
  plugins: [
    ignore(['react', 'styled-components']),
    resolve({
      extensions,
      mainFields: ['main', 'browser'],
      preferBuiltins: true,
    }),
    typescript({
      tsconfig: './tsconfig.widgets.json',
    }),
    commonjs({
      include: /node_modules/,
      transformMixedEsModules: true,
      defaultIsModuleExports: 'auto',
      requireReturnsDefault: 'auto',
    }),
    getBabelOutputPlugin({
      plugins: ['./plugins/LazyExport.mjs'],
    }),
    terser(),
  ],
}))

export default configs
