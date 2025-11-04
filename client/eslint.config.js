import js from '@eslint/js'
import pluginVue from 'eslint-plugin-vue'
import skipFormatting from '@vue/eslint-config-prettier/skip-formatting'
import pluginTypeScript from '@typescript-eslint/eslint-plugin'
import parserTypeScript from '@typescript-eslint/parser'
import vueParser from 'vue-eslint-parser'

export default [
  {
    name: 'app/files-to-lint',
    files: ['**/*.{js,mjs,jsx,ts,tsx,vue}'],
    ignores: ['eslint.config.js'],
    languageOptions: {
      parser: vueParser,
      parserOptions: {
        parser: parserTypeScript,
        project: './tsconfig.json',
        extraFileExtensions: ['.vue'],
      },
      globals: {
        alert: true,
        console: true,
        document: true,
        localStorage: true,
        navigator: true,
        process: true,
        setTimeout: true,
        window: true,
      },
    },
    plugins: {
      '@typescript-eslint': pluginTypeScript,
    },
    rules: {
      ...js.configs.recommended.rules,
      ...pluginVue.configs['flat/essential'].rules,
      ...pluginTypeScript.configs.recommended.rules,
      ...skipFormatting.rules,
      '@typescript-eslint/no-namespace': 'off',
    },
  },
  {
    name: 'app/files-to-ignore',
    ignores: ['**/dist/**', '**/dist-ssr/**', '**/coverage/**'],
  },
]
