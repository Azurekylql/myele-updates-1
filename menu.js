const {
    Menu,
    shell,
    app,
    ipcMain,
    BrowserWindow,
    globalShortcut,
    dialog
} = require('electron');

// 引入node.js提供的fs对象
const fs = require('fs');

// Menu对象提供了一个API 可以用于从JSON模板中构建一个应用程序菜单。
// shell对象则可以通过所访问的URL地址调用一个浏览器窗口

app.on('ready', () => {

    // 注册一个跨平台的通用快捷键
    globalShortcut.register('CommandOrControl+S', () => {
        saveFile();
    });

    // 注册第二个快捷键
    globalShortcut.register('CommandOrControl+O', () => {
        loadFile();
    });

});

ipcMain.on('save', (event, arg) => {
    console.log('saving content of the file');
    console.log(arg);

    // 当主进程接收到渲染进程返回的save指令之后，就显示保存对话框
    const window = BrowserWindow.getFocusedWindow();
    const options = {
        title: 'Save markdown file',
        filters: [
            {
                name: 'MyFile',
                extensions: ['md']
            }
        ]
    };

    // 使用showSaveDialog方法 接收一个父窗口对象的引用，以及一组用于自定义对话框行为的选项。
    // 在较新版本中，不接收回调函数作为参数，而是使用then回调
    dialog.showSaveDialog(window, options).then(result => {
        if (!result.canceled && result.filePath) {
            console.log(`Saving content to the file: ${result.filePath}`);
            fs.writeFileSync(result.filePath, arg);
        }
    }).catch(err => {
        console.error('Error saving file:', err);
    });

});

ipcMain.on('editor-reply', (event, arg) => {
    console.log(`Received reply from web page: ${arg}`);
});

// 操作函数定义：
function saveFile() {
    console.log('Saving the file');
    // 复用同一个通道editor-event 将save指令发送到渲染器进程。
    const window = BrowserWindow.getFocusedWindow();
    window.webContents.send('editor-event', 'save');
}

function loadFile() {
    console.log('Saving the file');
    // 复用同一个通道editor-event 将save指令发送到渲染器进程。
    const window = BrowserWindow.getFocusedWindow();

    const options = {
        title: 'Pick a markdown file',
        filters: [
            { name: 'Markdown files', extensions: ['md'] },
            { name: 'Text files', extensions: ['txt'] }
        ]
    };

    // 这里看paths是一个对象
    dialog.showOpenDialog(window, options).then(paths => {
        // 只选取第一个文件
        console.log('paths', paths);
        if (paths && paths.filePaths) {
            const content = fs.readFileSync(paths.filePaths[0]).toString();
            window.webContents.send('load', content);
        }
    });
}


const template = [

    {
        label: app.getName(),
        submenu: [
            { role: 'quit' }
        ]
    },
    {
        label: 'File',
        submenu: [
            {
                label: 'Open',
                accelerator: 'CommandOrControl+S',
                click() {
                    loadFile();
                }
            }, {
                label: 'Save',
                accelerator: 'CommandOrControl+O',
                click() {
                    saveFile();
                }

            }
        ]
    },
    {
        label: 'Format',
        submenu: [
            {
                label: 'Toggle Bold-加粗',
                click() {
                    // 当单击应用程序菜单的时候，main进程将会查找焦点窗口并发送toggle-bold消息。
                    // 渲染进程通过JavaScript处理消息，并将其发送至浏览器控制台中，并随后回复消息。
                    const window = BrowserWindow.getFocusedWindow();
                    window.webContents.send(
                        'editor-event',
                        'toggle-bold'
                    );
                }
            },
            {
                label: 'Toggle Italic-斜体字',
                click() {
                    // 当单击应用程序菜单的时候，main进程将会查找焦点窗口并发送toggle-bold消息。
                    // 渲染进程通过JavaScript处理消息，并将其发送至浏览器控制台中，并随后回复消息。
                    const window = BrowserWindow.getFocusedWindow();
                    window.webContents.send(
                        'editor-event',
                        'toggle-italic'
                    );
                }
            },
            {
                label: 'Toggle Strikethrough-横杆',
                click() {
                    // 当单击应用程序菜单的时候，main进程将会查找焦点窗口并发送toggle-bold消息。
                    // 渲染进程通过JavaScript处理消息，并将其发送至浏览器控制台中，并随后回复消息。
                    const window = BrowserWindow.getFocusedWindow();
                    window.webContents.send(
                        'editor-event',
                        'toggle-strikethrough'
                    );
                }
            }
        ]
    },
    {
        // 自定义一个菜单项help
        role: 'help',
        submenu: [
            {
                label: 'About Editor Component',
                click() {
                    shell.openExternal('https://simplemde.com/');
                }
            }
        ]
    }
];

if (process.env.DEBUG) {
    template.push({
        label: 'Debugging',
        submenu: [
            {
                label: 'Dev Tools',
                role: 'toggleDevTools'  // 是一个具体的行为 单击后打开chrome的developer tools
            },
            { type: 'separator' },
            {
                label: 'reloading',
                role: 'reload'
            }
        ]
    });
}

const menu = Menu.buildFromTemplate(template);

module.exports = menu;

