import { app, BrowserWindow, desktopCapturer, dialog, ipcMain } from 'electron'

const isMac = process.platform === 'darwin'
// 本地启动的vue项目路径
const vueProjectAddress = 'http://localhost:5173/#'
// 等待Electron应用就绪后创建BrowserWindow窗口
const createWindow = () => {
  const mainWin: BrowserWindow = new BrowserWindow({
    minWidth: 1000,
    minHeight: 650,
    width: 1000,
    height: 650,
    frame: false, // 窗口无边框
    titleBarStyle: 'hidden',
    // 配置窗口的WebPreferences选项，用于控制渲染进程的行为
    webPreferences: {
      nodeIntegration: true, // 启用Node.js集成
      contextIsolation: false, // 禁用上下文隔离
      webSecurity: false // 禁用web安全策略 跨域
    }
  })
  //打开调试工具
  mainWin.webContents.openDevTools()

  // 根据命令行参数加载URL或本地文件
  if (process.argv[2]) {
    mainWin.loadURL(process.argv[2]) //开发环境
  } else {
    mainWin.loadFile('index.html') //生产环境
  }

  //=====================================右上角按钮 ======================
  // 最小化
  ipcMain.on('minWin', () => {
    mainWin.minimize()
  })

  // 最大化
  ipcMain.on('maxWin', () => {
    if (mainWin.isMaximized()) {
      // 如果窗口已经最大化，则还原
      mainWin.restore()
    } else {
      // 如果窗口没有最大化，则进行最大化
      mainWin.maximize()
    }
  })

  // 关闭主窗口
  ipcMain.on('close', () => {
    // 关闭软件
    app.quit()
  })

  // 退出登陆关闭所有子窗口
  ipcMain.on('logout', () => {
    // 关闭所有子窗口
    BrowserWindow.getAllWindows().forEach((window) => {
      if (window === mainWin) return
      window.close()
    })
  })
  //======================================播放视频--============
  let videoWin: BrowserWindow | null
  // 打开video窗口
  ipcMain.on('open-video', (e, url) => {
    if (videoWin) {
      videoWin.show()
    } else {
      videoWin = new BrowserWindow({
        width: 800,
        height: 500,
        titleBarStyle: 'hidden',
        resizable: false, // 窗口大小是否可以调整
        webPreferences: {
          nodeIntegration: true,
          contextIsolation: false
        }
      })

      videoWin.on('ready-to-show', () => {
        videoWin?.show()
      })

      videoWin.on('close', () => {
        videoWin = null
      })
    }
    videoWin.loadURL(vueProjectAddress + '/video?url=' + url)
  })

  // 关闭video窗口
  ipcMain.on('close-video', () => {
    videoWin?.close()
    videoWin = null
  })

  //==================================关于群信息
  let groupEditWin: BrowserWindow | null
  // 打开群编辑窗口
  ipcMain.on('open-group-edit', (e, id) => {
    if (groupEditWin) {
      groupEditWin.show()
    } else {
      groupEditWin = new BrowserWindow({
        width: 300,
        height: 550,
        titleBarStyle: 'hidden',
        minimizable: false,
        maximizable: false,
        fullscreenable: false,
        show: false,
        resizable: false,
        webPreferences: {
          nodeIntegration: true,
          contextIsolation: false
        }
      })
      if (isMac) groupEditWin.setWindowButtonVisibility(false) // mac中红绿灯隐藏

      groupEditWin.on('ready-to-show', () => {
        groupEditWin?.show()
      })

      groupEditWin.on('close', () => {
        groupEditWin = null
      })
    }

    groupEditWin.loadURL(vueProjectAddress + '/edit/group?id=' + id)
  })
  // 群主将群成员踢出群聊
  ipcMain.on('del-group-user', () => {
    mainWin.webContents.send('del-group-user')
  })

  // 关闭群编辑窗口
  ipcMain.on('close-group-edit', () => {
    groupEditWin?.close()
    groupEditWin = null
  })
  // 保存群编辑按钮
  ipcMain.on('update-success', (e, groupName) => {
    groupEditWin?.close()
    groupEditWin = null
    mainWin.webContents.send('update-success', groupName)
  })

  // 打开dialog
  ipcMain.on('open-dialog', (e, msgInfo) => {
    dialog
      .showMessageBox({
        title: '消息提醒',
        defaultId: 0,
        message: `你确定要${msgInfo}?`,
        buttons: ['确定', '取消']
      })
      .then((result) => {
        let index = result.response
        if (index === 0) {
          // 确定按钮
          mainWin.webContents.send('dialog-determine') // 主进程向渲染进程通信
        }
      })
  })
  // =============================================webview窗口========================
  let webviewWin: BrowserWindow | null
  // 打开webview窗口
  ipcMain.on('open-webview', (e, url) => {
    const { screen } = require('electron')
    const { height } = screen.getPrimaryDisplay().workAreaSize // 获取设备高度
    if (webviewWin) {
      webviewWin.show()
    } else {
      webviewWin = new BrowserWindow({
        width: 750,
        height: height,
        minWidth: 750,
        minHeight: height,
        titleBarStyle: 'hidden',
        frame: false, // 窗口无边框
        show: false,
        webPreferences: {
          nodeIntegration: true,
          contextIsolation: false,
          webviewTag: true // 启用webview
        }
      })

      webviewWin.on('ready-to-show', () => {
        webviewWin?.show()
      })

      webviewWin.on('close', () => {
        webviewWin = null
      })
    }

    webviewWin.loadURL(vueProjectAddress + '/webview?url=' + url)
  })

  // 关闭webview窗口
  ipcMain.on('close-webview', () => {
    webviewWin?.close()
    webviewWin = null
  })
  //======================================语音和视频 屏幕共享 ===============

  let screenWindowList: any[] = []
  // 获取屏幕媒体缩略图(包括屏幕和应用的)
  ipcMain.on('get-screen', async (e) => {
    try {
      // 获取屏幕
      let screenSources = await desktopCapturer.getSources({ types: ['screen'] })
      screenSources.forEach((source) => {
        screenWindowList.push({ source, type: 'screen' })
      })
      // 获取应用
      let windowSources = await desktopCapturer.getSources({ types: ['window'] })
      windowSources.forEach((source) => {
        screenWindowList.push({ source, type: 'window' })
      })

      // 通知主窗口已经获取到全部的窗口
      mainWin.webContents.send('get-screen-success')
    } catch (error) {
      return
    }
  })

  let screenChooseWin: BrowserWindow | null
  // 打开选择屏幕共享窗口
  ipcMain.on('open-screen-choose', (e, { type, url }) => {
    if (screenChooseWin) {
      screenChooseWin.show()
    } else {
      screenChooseWin = new BrowserWindow({
        width: 480,
        height: 540,
        minWidth: 480,
        minHeight: 540,
        titleBarStyle: 'hidden',
        frame: false, // 窗口无边框
        minimizable: false,
        maximizable: false,
        fullscreenable: true, // 是否可以全屏 ???
        show: false,
        resizable: false, // 是否可以调整窗口大小
        parent: mainWin, // 父窗口
        modal: true, // 模态窗口
        webPreferences: {
          nodeIntegration: true,
          contextIsolation: false
        }
      })
      if (isMac) screenChooseWin.setWindowButtonVisibility(false)

      screenChooseWin.on('ready-to-show', async () => {
        screenChooseWin?.show()
      })

      screenChooseWin.on('close', () => {
        screenChooseWin = null
        screenWindowList = []
      })
    }
    screenChooseWin.loadURL(vueProjectAddress + url)
  })

  // 子窗口获取屏幕缩略图
  ipcMain.on('get-screen-img', (e) => {
    screenWindowList.forEach((item) => {
      screenChooseWin?.webContents.send('get-screen-img', item)
    })
  })
  // 关闭选择屏幕共享窗口
  ipcMain.on('close-screen-choose', () => {
    screenWindowList = []
    screenChooseWin?.close()
    screenChooseWin = null
  })

  let telephoneWin: BrowserWindow | null

  // 打开语音, 视频窗口
  ipcMain.on('open-telephone', (e, { type, url }) => {
    if (telephoneWin) {
      telephoneWin.show()
    } else {
      telephoneWin = new BrowserWindow({
        width: 600,
        height: 580,
        minWidth: 600,
        minHeight: 580,
        titleBarStyle: 'hidden',
        show: false,
        webPreferences: {
          nodeIntegration: true,
          contextIsolation: false
        }
      })

      telephoneWin.on('ready-to-show', () => {
        telephoneWin?.show()
      })

      telephoneWin.on('close', () => {
        telephoneWin = null
      })
    }

    telephoneWin.loadURL(vueProjectAddress + url)
  })

  let screenWin: BrowserWindow | null
  // 打开屏幕共享窗口
  ipcMain.on('open-screen-share', (e, { type, url, sourceId }) => {
    if (screenWin) {
      screenWin.show()
    } else {
      screenWin = new BrowserWindow({
        width: 800,
        height: 580,
        minWidth: 800,
        minHeight: 580,
        titleBarStyle: 'hidden',
        resizable: false, // 窗口大小是否可以调整
        show: false,
        webPreferences: {
          nodeIntegration: true,
          contextIsolation: false
        }
      })
      // screenWin.setWindowButtonVisibility(false)

      screenWin.on('ready-to-show', () => {
        screenWin?.show()
      })

      screenWin.on('close', () => {
        screenWin = null
      })
    }

    let sourceIdStr = sourceId ? '&sourceId=' + sourceId : ''
    screenWin.loadURL(vueProjectAddress + url + sourceIdStr)
  })

  // 关闭屏幕共享窗口
  ipcMain.on('close-screen', () => {
    screenWin?.close()
    screenWin = null
  })

  // 通话发起方将socket从主窗口传递给子窗口 
  ipcMain.on('send_acceptData', (e, data) => {
    const { type } = data
    if (type === 'screen') {
      screenWin?.webContents.send('send_acceptData', data)
    }
  })

  // 接收方收到发起方的offer, 通知子窗口
  ipcMain.on('send_offer', (e, params) => {
    const { type } = params
    if (type === 'screen') {
      screenWin?.webContents.send('send_offer', params)
    }
  })

  // 发起方收到接收方的answer, 通知子窗口
  ipcMain.on('send_answer', (e, params) => {
    const { type } = params
    if (type === 'screen') {
      screenWin?.webContents.send('send_answer', params)
    }
  })

  // 接收方收到发起方的candidate信息, 通知子窗口
  ipcMain.on('send_candidate', (e, candidateData) => {
    const { type } = candidateData
    if (type === 'screen') {
      screenWin?.webContents.send('send_candidate', candidateData)
    }
  })

  // 窗口固定
  ipcMain.on('fixed-window', (e, { url, isFiexd }) => {
    let fixedWindow
    if (url === '/telephone/voice' || url === '/telephone/video') {
      fixedWindow = telephoneWin
    } else if (url === '/telephone/screen') {
      fixedWindow = screenWin
    }
    fixedWindow?.setAlwaysOnTop(isFiexd)
  })
}

app.whenReady().then(() => {
  createWindow()
  app.on('activate', () => {
    // if (BrowserWindow.getAllWindows().length === 0) createWindow();
  })
})
app.on('window-all-closed', () => {
  app.quit()
  // if (process.platform !== "darwin") app.quit();
})
