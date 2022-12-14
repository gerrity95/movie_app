module.exports = {
  'env': {
    'browser': true,
    'es2021': true,
    'node': true,
  },
  'extends': [
    'google',
  ],
  'parserOptions': {
    'ecmaVersion': 'latest',
  },
  'rules': {
    'require-jsdoc': ['off'],
    'max-len': ['error', {'code': 100, 'comments': 150}],
    'no-undef': ['error'],
    'new-cap': ['off'],
    'brace-style': ['off'],

  },
};
