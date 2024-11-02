const { app, BrowserWindow, Menu } = require('electron');
const { autoUpdater } = require('electron-updater');

const menu = require('./menu');  // 引入写好的菜单menu.js文件

let window;

// 创建一个主应用程序窗口
app.on('ready', () => {
    window = new BrowserWindow({
        width: 800,
        height: 600,
        webPreferences: {
            nodeIntegration: true,  // 【node集成】渲染进程可以访问nodejs的模块 但是在生产环境中启用，会引入安全问题。
            contextIsolation: false
        }
    });

    window.loadFile('index.html');

    // 进行自动检查和更新，如果需要更新的话，在后台对其进行发布，以使用户在不中断的情况下继续使用该应用。
    autoUpdater.checkForUpdateAndNotify();
});

Menu.setApplicationMenu(menu);