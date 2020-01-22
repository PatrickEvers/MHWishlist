const electron = require('electron');
const url = require('url');
const path = require('path');

const {app, BrowserWindow, Menu, ipcMain} = electron;

process.env.NODE_ENV = 'develop';

let mainWindow;
let addWindow;

app.on('ready', () => {
    mainWindow = new BrowserWindow({
        width:800,
        height:600,
        resizable:false,
        webPreferences: {
            nodeIntegration: true
        }
    })

    mainWindow.loadURL(url.format({
        pathname: path.join(__dirname, 'mainWindow.html'),
        protocol: 'file:',
        slahes:true
    }));

    mainWindow.on('close', () => {
        app.quit();
    });

    const mainMenu = Menu.buildFromTemplate(mainMenuTemplate);

    Menu.setApplicationMenu(mainMenu);
});

function createAddWindow(){
    addWindow = new BrowserWindow({
        width: 300,
        heigth: 200,
        title: 'Add Shopping List Item',
        resizable:false,
        webPreferences: {
            nodeIntegration: true
        }
    })

    addWindow.loadURL(url.format({
        pathname: path.join(__dirname, 'addWindow.html'),
        protocol: 'file:',
        slashes:true
    }));

    addWindow.on('close', () => {
        addWindow = null;
    });
}

ipcMain.on('item:add', (e, item) => {
    mainWindow.webContents.send('item:add', item);
    addWindow.close();
});

const mainMenuTemplate = [
    {
        label:'File',
        submenu:[
            {
                label:'Add Item',
                click(){
                    createAddWindow();
                }
            },
            {
                label: 'Clear Items',
                click(){
                    mainWindow.webContents.send('item:clear');
                }
            },
            {
                label:'Quit',
                accelerator: process.platform == 'darwin' ? 'Command+Q' : 'Ctrl+Q',
                click(){
                    app.quit();
                }
            }
        ]
    }
];

if(process.platform == 'darwin'){
    mainMenuTemplate.unshift({});
}

//Add developer tools item
if(process.env.NODE_ENV !== 'production'){
    mainMenuTemplate.push({
        label:'Developer Tools',
        submenu:[
            {
                label:'Toggle DevTools',
                accelerator: process.platform == 'darwin' ? 'Command+I' : 'Ctrl+I',
                click(item, focusedWindow){
                    focusedWindow.toggleDevTools();
                }
            },
            {
                role: 'reload'
            }
        ]
    })
}