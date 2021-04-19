module.exports = {
  root: true,
  env: {
    browser: true,
    node: true
  },
  extends: [
    '@nuxtjs/eslint-config-typescript',
    'plugin:nuxt/recommended'
  ],
  plugins: [
  ],
  rules: {
    'no-multiple-empty-lines': [ 'warn', { max: 2, maxEOF: 1 } ],
    'padded-blocks': [ 'error', { classes: 'always' } ],
    'array-bracket-spacing': [ 'error', 'always', { arraysInArrays: false } ],
    'space-before-function-paren': [ 'warn', { anonymous: 'always', named: 'never', asyncArrow: 'always' } ],
    'no-console': 'off',
    curly: [ 'warn', 'multi-or-nest', 'consistent' ],
    'operator-linebreak': [ 'warn', 'before' ],
    'promise/param-names': 'off'
  }
}
