import eslint from "@eslint/js";
import tsparser from "@typescript-eslint/parser";
import tseslint from "typescript-eslint";
import obsidianmd from "eslint-plugin-obsidianmd";

export default tseslint.config(
    eslint.configs.recommended,
    ...tseslint.configs.recommended,
    ...obsidianmd.configs.recommended,
    {
        files: ["**/*.ts"],
        languageOptions: {
            parser: tsparser,
            parserOptions: {
                project: "./tsconfig.json",
                tsconfigRootDir: import.meta.dirname,
            },
        },
        rules: {
            // Migrated rules from legacy .eslintrc
            "no-unused-vars": "off",
            "@typescript-eslint/no-unused-vars": ["error", { "args": "none" }],
            "@typescript-eslint/ban-ts-comment": "off",
            "no-prototype-builtins": "off",
            "@typescript-eslint/no-empty-function": "off",

            // Relaxed unsafe rules (essential for interfacing with internal/private Obsidian APIs)
            "@typescript-eslint/no-unsafe-assignment": "off",
            "@typescript-eslint/no-unsafe-member-access": "off",
            "@typescript-eslint/no-unsafe-call": "off",
            "@typescript-eslint/no-unsafe-return": "off",
            "@typescript-eslint/no-unsafe-argument": "off",

            // Turn off noisy style/UI rules with high false-positives
            "obsidianmd/ui/sentence-case": "off",
            "import/no-extraneous-dependencies": "off",

            // Enable other strict obsidian/typescript rules
            "obsidianmd/sample-names": "off",
            "obsidianmd/prefer-file-manager-trash-file": "error",
        },
    },
    {
        // Global ignores (replaces .eslintignore)
        ignores: [
            "node_modules/",
            "main.js",
            "esbuild.config.mjs",
            "version-bump.mjs",
            "eslint.config.mjs",
            "**/*.json"
        ]
    }
);
