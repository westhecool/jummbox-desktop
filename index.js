const { app, BrowserWindow, ipcMain, shell, dialog } = require('electron');
const path = require('path');
const fs = require('fs');
const initPath = path.join(app.getPath('userData'), 'init.json');
const dataDir = path.join(app.getPath('userData'), 'data');
const VERSION = { app: '0.0.1', jummbox: '2.5' };
console.log(`jummbox-desktop v${VERSION.app} with jummbox v${VERSION.jummbox}
Some useful information:
Electron data directory: ${app.getPath('userData')}
Song data directory: ${dataDir}`);
fs.mkdirSync(dataDir, { recursive: true });
fs.mkdirSync(path.join(dataDir, 'songs'), { recursive: true });
async function createWindow() {
    var data;
    try {
        data = JSON.parse(fs.readFileSync(initPath, 'utf8'));
    }
    catch (e) { }

    var c = false;

    const mainWindow = new BrowserWindow({
        webPreferences: {
            preload: path.join(__dirname, 'preload.js'),
        },
        ...((data && data.bounds) ? data.bounds : { width: 800, height: 600 })
    });

    mainWindow.loadFile('index.html');

    mainWindow.on('close', function () {
        var data = {
            bounds: mainWindow.getBounds()
        };
        fs.writeFileSync(initPath, JSON.stringify(data));
    });

    mainWindow.on('close', async function (e) {
        if (c == false) {
            e.preventDefault();
            var choice = await dialog.showMessageBox(this,
                {
                    type: 'question',
                    buttons: ['Yes', 'No'],
                    title: 'Confirm',
                    message: 'Are you sure you want to quit? (the current song will be deleted if you did not save it)',
                });
            if (choice.response != 1) {
                c = true;
                mainWindow.close();
            }
        }
    });

    ipcMain.on('songlist', (event, arg) => {
        mainWindow.send('songlist', fs.readdirSync(path.join(dataDir, 'songs')));
    });

    ipcMain.on('songsave', (event, song, data) => {
        fs.writeFileSync(path.join(dataDir, 'songs', song), data);
    });

    ipcMain.on('loadsong', (event, song) => {
        mainWindow.send('song', Buffer.from(song, 'base64').toString(), fs.readFileSync(path.join(dataDir, 'songs', song), 'utf8'));
    });

    ipcMain.on('deletesong', (event, song) => {
        fs.unlinkSync(path.join(dataDir, 'songs', song));
    });

    ipcMain.on('open', (event, url) => {
        shell.openExternal(url);
    });
}

app.whenReady().then(() => {
    createWindow()

    app.on('activate', function () {
        if (BrowserWindow.getAllWindows().length === 0) createWindow();
    });
});

app.on('window-all-closed', function () {
    if (process.platform !== 'darwin') app.quit();
});