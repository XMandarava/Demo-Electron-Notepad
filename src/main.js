import { app, BrowserWindow } from 'electron';
//-----------------------------------------------------------------
import { Menu, MenuItem, dialog, ipcMain } from 'electron';
import { appMenuTemplate } from './appmenu.js';
//是否可以安全退出
let safeExit = false;
//-----------------------------------------------------------------

// Keep a global reference of the window object, if you don't, the window will
// be closed automatically when the JavaScript object is garbage collected.
let mainWindow;

const createWindow = () => {
  // Create the browser window.
  mainWindow = new BrowserWindow({
    width: 800,
    height: 600,
  });

  // and load the index.html of the app.
  mainWindow.loadURL(`file://${__dirname}/index.html`);

  // Open the DevTools.
  //mainWindow.webContents.openDevTools();

  //-----------------------------------------------------------------
  //增加主菜单（在开发测试时会有一个默认菜单，但打包后这个菜单是没有的，需要自己增加）
  const menu=Menu.buildFromTemplate(appMenuTemplate); //从模板创建主菜单
  //在File菜单下添加名为New的子菜单
  menu.items[0].submenu.append(new MenuItem({ //menu.items获取是的主菜单一级菜单的菜单数组，menu.items[0]在这里就是第1个File菜单对象，在其子菜单submenu中添加新的子菜单
    label: "New",
    click(){
      mainWindow.webContents.send('action', 'new'); //点击后向主页渲染进程发送“新建文件”的命令
    },
    accelerator: 'CmdOrCtrl+N' //快捷键：Ctrl+N
  }));
  //在New菜单后面添加名为Open的同级菜单
  menu.items[0].submenu.append(new MenuItem({
    label: "Open",
    click(){
      mainWindow.webContents.send('action', 'open'); //点击后向主页渲染进程发送“打开文件”的命令
    },
    accelerator: 'CmdOrCtrl+O' //快捷键：Ctrl+O
  })); 
  //再添加一个名为Save的同级菜单
  menu.items[0].submenu.append(new MenuItem({
    label: "Save",
    click(){
      mainWindow.webContents.send('action', 'save'); //点击后向主页渲染进程发送“保存文件”的命令
    },
    accelerator: 'CmdOrCtrl+S' //快捷键：Ctrl+S
  }));
  //添加一个分隔符
  menu.items[0].submenu.append(new MenuItem({
    type: 'separator'
  }));
  //再添加一个名为Exit的同级菜单
  menu.items[0].submenu.append(new MenuItem({
    role: 'quit'
  }));
  Menu.setApplicationMenu(menu); //注意：这个代码要放到菜单添加完成之后，否则会造成新增菜单的快捷键无效

  mainWindow.on('close', (e) => {
    if(!safeExit){
      e.preventDefault();
      mainWindow.webContents.send('action', 'exiting');
    }
  });
  //-----------------------------------------------------------------

  // Emitted when the window is closed.
  mainWindow.on('closed', () => {
    // Dereference the window object, usually you would store windows
    // in an array if your app supports multi windows, this is the time
    // when you should delete the corresponding element.
    mainWindow = null;
  });
};

// This method will be called when Electron has finished
// initialization and is ready to create browser windows.
// Some APIs can only be used after this event occurs.
app.on('ready', createWindow);

// Quit when all windows are closed.
app.on('window-all-closed', () => {
  // On OS X it is common for applications and their menu bar
  // to stay active until the user quits explicitly with Cmd + Q
  if (process.platform !== 'darwin') {
    app.quit();
  }
});

app.on('activate', () => {
  // On OS X it's common to re-create a window in the app when the
  // dock icon is clicked and there are no other windows open.
  if (mainWindow === null) {
    createWindow();
  }
});

// In this file you can include the rest of your app's specific main process
// code. You can also put them in separate files and import them here.

//-----------------------------------------------------------------
//监听与渲染进程的通信
ipcMain.on('reqaction', (event, arg) => {
  switch(arg){
    case 'exit':
      //做点其它操作：比如记录窗口大小、位置等，下次启动时自动使用这些设置；不过因为这里（主进程）无法访问localStorage，这些数据需要使用其它的方式来保存和加载，这里就不作演示了。这里推荐一个相关的工具类库，可以使用它在主进程中保存加载配置数据：https://github.com/sindresorhus/electron-store
      //...
      safeExit=true;
      app.quit();//退出程序
      break;
  }
});
//-----------------------------------------------------------------