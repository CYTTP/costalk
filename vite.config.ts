import { fileURLToPath, URL } from 'node:url'

import { defineConfig } from 'vite'
import vue from '@vitejs/plugin-vue'
import vueJsx from '@vitejs/plugin-vue-jsx'
// import node from 'vite-plugin-node'
// electron
import electronRenderer from 'vite-plugin-electron-renderer'

import { viteElectronDev } from './plugins/vite.electron.dev'
import { viteElectronBuild } from './plugins/vite.electron.build'
// element-plus 以及图标 按需引入配置
import AutoImport from 'unplugin-auto-import/vite'
import Components from 'unplugin-vue-components/vite'
// import Icons from 'unplugin-icons/vite'
// import IconsResolver from 'unplugin-icons/resolver'
import { ElementPlusResolver } from 'unplugin-vue-components/resolvers'
//包分析
import { visualizer } from 'rollup-plugin-visualizer'

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [
    vue(),
    vueJsx(),
    AutoImport({
      resolvers: [ElementPlusResolver()]
    }),
    Components({
      dts: true,
      dirs: ['src/components'], // 按需加载的文件夹
      resolvers: [ElementPlusResolver()]
    }),
    // Icons({ autoInstall: true }),
    electronRenderer(),
    viteElectronDev(),
    viteElectronBuild(),
    visualizer({ open: true })
  ],
  base: './', //默认是绝对路径 /  要改成相对路径 ./  不然会白屏
  resolve: {
    alias: {
      '@': fileURLToPath(new URL('./src', import.meta.url))
    }
  },
  // 打包配置
  build: {
    // target: 'modules',
    // outDir: 'dist', //指定输出路径
    // assetsDir: 'assets', // 指定生成静态资源的存放路径
    rollupOptions: {
      // minify: 'terser', // 混淆器，terser构建后文件体积更小
      output: {
        manualChunks(id) {
          if (id.includes('node_modules')) {
            return id.toString().split('node_modules/')[1].split('/')[0].toString()
          }
        }
      }
    }
  }
})
