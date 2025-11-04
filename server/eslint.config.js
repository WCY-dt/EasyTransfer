import js from '@eslint/js'
import pluginTypeScript from '@typescript-eslint/eslint-plugin'
import parserTypeScript from '@typescript-eslint/parser'

export default [
  {
    name: 'app/files-to-lint',
    files: ['**/*.{js,mjs,jsx,ts,tsx}'],
    ignores: ['eslint.config.js', '**/dist/**', '**/node_modules/**'],
    languageOptions: {
      parser: parserTypeScript,
      parserOptions: {
        project: './tsconfig.lint.json',
      },
      globals: {
        console: true,
        process: true,
      },
    },
    plugins: {
      '@typescript-eslint': pluginTypeScript,
    },
    rules: {
      ...js.configs.recommended.rules,
      ...pluginTypeScript.configs.recommended.rules,
    },
  },
  {
    name: 'app/files-to-ignore',
    ignores: ['**/dist/**', '**/dist-ssr/**', '**/coverage/**'],
  },
]
