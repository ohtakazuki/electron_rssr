// アプリケーション作成用のモジュールを読み込み
const electron = require('electron');
const app = electron.app;
const BrowserWindow = electron.BrowserWindow;
const Menu = electron.Menu;

// メインウィンドウ
var mainWindow = null;

// ElectronのMenuの設定
const templateMenu = [
    {
        label: 'ファイル(F)',
        accelerator: 'Alt+F',
        submenu: [
            {
              label: 'サイト',
              click(item, focusedWindow){
                  mainWindow.loadURL('file://' + __dirname + '/app/sub.html');
              },
            },
            {
                label: '終了',
                accelerator: 'Alt+E',
                role: 'quit',
            },
        ]
    },
];
    
// アプリ起動
app.on('ready', function () {
  // メインウィンドウを作成します
  mainWindow = new BrowserWindow({
    width: 800,
    height: 600,
  });

  // メニューを非表示にする
  // mainWindow.setMenu(null);

  // メニューを設定する
  const menu = Menu.buildFromTemplate(templateMenu);
  Menu.setApplicationMenu(menu);

  // メインウィンドウに表示するURLを指定します
  mainWindow.loadURL('file://' + __dirname + '/app/index.html');

  // デベロッパーツールの起動
  // mainWindow.webContents.openDevTools();
  
  // 現在のウィンドウのサイズと位置（座標）を取得
  var setWin = require("./setWin.json");
  mainWindow.setPosition(setWin["x"], setWin["y"]);
  mainWindow.setSize(setWin["width"], setWin["height"]);
  
  // メインウィンドウが閉じられたときの処理
  mainWindow.on('close', function () {
    // 現在のウィンドウのサイズと位置（座標）を保存
    var path = require('path').join(__dirname, 'setWin.json');
    var fs = require('fs');
    var item = JSON.stringify(mainWindow.getBounds());
    fs.writeFile(path, item);;
  });

  // closedは閉じたあと
  mainWindow.on('closed', function () {
    mainWindow = null;
  });
});

// 全てのウィンドウが閉じたときの処理
app.on('window-all-closed', function () {
  // macOSのとき以外はアプリケーションを終了させます
  if (process.platform !== 'darwin') {
    app.quit();
  }
});

// アプリケーションがアクティブになった時の処理(Macだと、Dockがクリックされた時）
app.on('activate', function () {
  /// メインウィンドウが消えている場合は再度メインウィンドウを作成する
  if (mainWindow === null) {
    createWindow();
  }
});
