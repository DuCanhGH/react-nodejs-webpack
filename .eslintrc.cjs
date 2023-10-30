/** @type {import("@types/eslint").Linter.BaseConfig} */
module.exports = {
  env: {
    browser: true,
    es2022: true,
  },
  extends: ["eslint:recommended", "plugin:@typescript-eslint/recommended", "prettier"],
  parser: "@typescript-eslint/parser",
  plugins: ["@typescript-eslint", "simple-import-sort"],
  parserOptions: {
    tsconfigRootDir: __dirname,
    project: ["tsconfig.json", "tsconfig.eslint.json"],
    ecmaFeatures: {
      jsx: true,
    },
    ecmaVersion: "latest",
    sourceType: "module",
  },
  rules: {
    "@typescript-eslint/ban-ts-comment": "off",
    "@typescript-eslint/no-explicit-any": "off",
    "@typescript-eslint/no-unused-vars": ["warn", { ignoreRestSiblings: true }],
    "@typescript-eslint/consistent-type-imports": "warn",
    "no-undef": "off",
    "no-extra-boolean-cast": "off",
    "simple-import-sort/imports": "warn",
    "simple-import-sort/exports": "warn",
  },
};
