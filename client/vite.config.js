import { fileURLToPath, URL } from 'node:url'
import { defineConfig, loadEnv } from 'vite'
import vue from '@vitejs/plugin-vue'
import vueJsx from '@vitejs/plugin-vue-jsx'
import fs from 'fs'

const packageJson = JSON.parse(fs.readFileSync('./package.json', 'utf-8'))

export default defineConfig(async ({ mode }) => {
  const env = loadEnv(mode, process.cwd(), '')

  let devToolsPlugin = null
  if (mode === 'development') {
    const { default: vueDevTools } = await import('vite-plugin-vue-devtools')
    devToolsPlugin = vueDevTools()
  }

  return {
    plugins: [
      vue(),
      vueJsx(),
      ...(devToolsPlugin ? [devToolsPlugin] : []),
    ],
    resolve: {
      alias: {
        '@': fileURLToPath(new URL('./src', import.meta.url))
      }
    },
    esbuild: {
      jsxFactory: 'h',
      jsxFragment: 'Fragment',
      jsxInject: `import { h } from 'vue'`
    },
    define: {
      'process.env': {
        VITE_SIGNAL_SERVER_URL: env.VITE_SIGNAL_SERVER_URL,
        VITE_API_SERVER_URL: env.VITE_API_SERVER_URL,
      },
      'process.package_version': JSON.stringify(packageJson.version),
    }
  }
})
