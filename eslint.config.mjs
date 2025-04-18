import { fixupConfigRules, fixupPluginRules } from "@eslint/compat";
import { FlatCompat } from "@eslint/eslintrc";
import js from "@eslint/js";
import typescriptEslint from "@typescript-eslint/eslint-plugin";
import tsParser from "@typescript-eslint/parser";
import eslintConfigPrettier from "eslint-config-prettier/flat";
import tsdoc from "eslint-plugin-tsdoc";
import { defineConfig } from "eslint/config";
import globals from "globals";
import path from "node:path";
import { fileURLToPath } from "node:url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const compat = new FlatCompat({
    baseDirectory: __dirname,
    recommendedConfig: js.configs.recommended,
    allConfig: js.configs.all,
});

export default defineConfig([
    eslintConfigPrettier,
    {
        extends: fixupConfigRules(
            compat.extends("plugin:import/recommended", "plugin:@typescript-eslint/recommended"),
        ),

        plugins: {
            "@typescript-eslint": fixupPluginRules(typescriptEslint),
            tsdoc,
        },

        languageOptions: {
            globals: {
                ...globals.browser,
                ...globals.node,
            },

            parser: tsParser,
            ecmaVersion: 5,
            sourceType: "module",

            parserOptions: {
                project: "./tsconfig.json",
            },
        },

        settings: {
            "import/resolver": {
                typescript: {
                    project: ".",
                },
            },
        },

        rules: {
            "@typescript-eslint/no-unused-vars": [
                "error",
                {
                    argsIgnorePattern: "^_",
                },
            ],

            "tsdoc/syntax": "warn",
            "no-use-before-define": "off",

            "@typescript-eslint/no-use-before-define": [
                "error",
                {
                    variables: false,
                },
            ],
        },
    },
]);
