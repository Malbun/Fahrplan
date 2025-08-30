// eslint.config.js
import js from "@eslint/js";
import pluginVue from "eslint-plugin-vue";
import pluginTS from "@typescript-eslint/eslint-plugin";
import prettier from "eslint-config-prettier";
import globals from "globals";
import tsParser from "@typescript-eslint/parser";
import vueParser from "vue-eslint-parser";

export default [
  js.configs.recommended, // JS rules
  ...pluginVue.configs["flat/recommended"], // Vue 3 Flat Config
  prettier, // Prettier

  {
    ignores: ["dist/**", "node_modules/**"],
  },

  {
    files: ["**/*.ts", "**/*.vue"],
    languageOptions: {
      parser: tsParser,
      globals: {
        ...Object.fromEntries(
          Object.entries(globals.browser).map(([k]) => [k, "readonly"]),
        ),
        ...Object.fromEntries(
          Object.entries(globals.node).map(([k]) => [k, "readonly"]),
        ),
      },
    },
    plugins: {
      "@typescript-eslint": pluginTS,
    },
    rules: {
      ...pluginTS.configs.recommended.rules,
      "no-console": "error",
      "no-alert": "error",
      "no-debugger": "error",
    },
  },

  {
    files: ["**/*.vue"],
    languageOptions: {
      parser: vueParser,
      parserOptions: {
        parser: tsParser, // parser for <script lang="ts">
      },
      globals: {
        ...Object.fromEntries(
          Object.entries(globals.browser).map(([k]) => [k, "readonly"]),
        ),
        ...Object.fromEntries(
          Object.entries(globals.node).map(([k]) => [k, "readonly"]),
        ),
      },
    },
    rules: {
      "vue/multi-word-component-names": "off",
      "no-console": "error",
      "no-alert": "error",
      "no-debugger": "error",
    },
  },

  {
    files: ["**/*.vue", "**/*.ts", "**/*.js"],
    languageOptions: {
      globals: {
        ...Object.fromEntries(
          Object.entries(globals.browser).map(([k]) => [k, "readonly"]),
        ),
        ...Object.fromEntries(
          Object.entries(globals.node).map(([k]) => [k, "readonly"]),
        ),
      },
    },
    rules: {
      "vue/multi-word-component-names": "off",
      "no-console": "error",
      "no-alert": "error",
      "no-debugger": "error",
    },
  },
];
