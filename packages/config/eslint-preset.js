module.exports = {
  root: true,
  parser: '@typescript-eslint/parser',
  env: {
    node: true
  },
  extends: [
    'maanex'
  ],
  plugins: [
    '@typescript-eslint',
  ],
  rules: {
    'no-multiple-empty-lines': [ 'warn', { max: 2, maxEOF: 1 } ],
    'padded-blocks': [ 'error', { classes: 'always' } ],
    'array-bracket-spacing': [ 'error', 'always', { arraysInArrays: false } ],
    'space-before-function-paren': [ 'warn', { anonymous: 'always', named: 'never', asyncArrow: 'always' } ],
    'no-console': 'warn',
    curly: [ 'warn', 'multi-or-nest', 'consistent' ],
    'operator-linebreak': [ 'warn', 'before' ],
    'promise/param-names': 'off'
  }
}
