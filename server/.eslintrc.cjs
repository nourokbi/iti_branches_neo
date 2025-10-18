module.exports = {
  env: {
    node: true,
    es2021: true,
  },
  parserOptions: {
    ecmaVersion: 2021,
    sourceType: "script",
  },
  rules: {
    // Relax common Node patterns
    "no-undef": "off",
  },
};
