import typescript from '@rollup/plugin-typescript';

export default {
  input: 'src/index.ts',
  output: {
    dir: 'bin',
    format: 'cjs'
  },
  plugins: [typescript({
    tsconfig: "tsconfig.build.json"
  })]
};
