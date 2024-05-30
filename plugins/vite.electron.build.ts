//打包electron项目
//思路：需要先等vite打包完之后就有index.html，再执行electron-builder打包

import type { Plugin } from 'vite'
import * as electronBuilder from 'electron-builder'
import path from 'path'
import fs from 'fs'

// 导出Vite插件函数
export const viteElectronBuild = (): Plugin => {
  return {
    name: 'vite-electron-build',
    //closeBundle是vite的一个钩子函数，用于构建完成后后执行一些自定义逻辑。
    closeBundle() {
      // 定义初始化Electron的函数
      const initElectron = () => {
        // 使用esbuild编译TypeScript代码为JavaScript
        require('esbuild').buildSync({
          entryPoints: ['src/background.ts'],
          bundle: true,
          outfile: 'dist/background.js',
          platform: 'node',
          target: 'node20',
          external: ['electron']
        })
      }

      // 调用初始化Electron函数
      initElectron()
      // 修改package.json文件的main字段 不然会打包失败
      const json = JSON.parse(fs.readFileSync('package.json', 'utf-8'))
      json.main = 'background.js'
      fs.writeSync(fs.openSync('dist/package.json', 'w'), JSON.stringify(json, null, 2))

      // 创建一个空的node_modules目录 不然会打包失败  electron-builder一个bug
      fs.mkdirSync(path.join(process.cwd(), 'dist/node_modules'))

      // 使用electron-builder打包Electron应用程序
      electronBuilder.build({
        config: {
          appId: 'com.example.app', //上线真实appid
          productName: 'CosTalk', //app名称
          directories: {
            output: path.join(process.cwd(), 'release'), //输出目录   process.cwd()根目录
            app: path.join(process.cwd(), 'dist') //app目录
          },
          asar: true, //打包成压缩包
          //安装的配置
          nsis: {
            oneClick: false, //取消一键安装
            allowToChangeInstallationDirectory: true //允许用户选择安装目录
          }
        }
      })
    }
  }
}
