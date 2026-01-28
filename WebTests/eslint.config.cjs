// WebTests/eslint.config.cjs
const tsParser = require("@typescript-eslint/parser");
const tsPlugin = require("@typescript-eslint/eslint-plugin");
const playwright = require("eslint-plugin-playwright");
const prettier = require("eslint-config-prettier");

module.exports = [
  // Generated folders + deps are ignored
  {
    ignores: ["node_modules/**", "playwright-report/**", "test-results/**"],
  },

  // TypeScript rules
  {
    files: ["**/*.ts"],
    languageOptions: {
      parser: tsParser,
      parserOptions: {
        ecmaVersion: "latest",
        sourceType: "module",
      },
    },
    plugins: {
      "@typescript-eslint": tsPlugin,
      playwright,
    },
    rules: {
      // TS clean imports (type imports)
      "@typescript-eslint/consistent-type-imports": "error",

      // Playwright best practices
      "playwright/no-wait-for-timeout": "warn",

      // If your assertions are inside POM methods, keep this as warning.
      // We already added direct expects in tests, so it should pass anyway.
      "playwright/expect-expect": "warn",
    },
  },

  // Prettier should be last (turn off conflicting lint rules)
  prettier,
];
