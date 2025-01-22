const { app, BrowserWindow, ipcMain, globalShortcut, screen } = require('electron/main')
const path = require('node:path')

let win;
let objectivesWindow;
let objectives = [];

const createWindow = () => {
  win = new BrowserWindow({
    width: 400,
    height: 40,
    show: false,
    resizable: false,
    frame: false,
    titleBarStyle: "hidden",
    webPreferences: {
      preload: path.join(__dirname, 'preload.js'),
    }
  })

  win.loadFile('./src/pages/index.html')
}

const createObjectivesWindow = () => {
  const { width, height } = screen.getPrimaryDisplay().workAreaSize;
  objectivesWindow = new BrowserWindow({
    width: 300,
    height: 300,
    x: width - 310, 
    y: height - 210,
    frame: false,
    resizable: false,
    alwaysOnTop: true,
    webPreferences: {
      preload: path.join(__dirname, 'preload.js'),
    },
  });

  objectivesWindow.loadFile('./src/pages/objectives.html'); 

  objectivesWindow.once('ready-to-show', () => {
    objectivesWindow.webContents.send('updateObjectives', objectives);
  });
};

app.whenReady().then(() => {
  createWindow()

  globalShortcut.register('Control+Shift+S', () => {
    if (win) {
      if (win.isVisible()) {
        win.hide();
      } else {
        win.show();
        win.focus();
      }
    }
  });

  globalShortcut.register('Control+Shift+A', () => {
    if (objectivesWindow) {
      objectivesWindow.close();
      objectivesWindow = null;
    } else {
      createObjectivesWindow();

    }
  });

  app.on('activate', () => {
    if (BrowserWindow.getAllWindows().length === 0) {
      createWindow()
    }
  })
})

ipcMain.on('submitForm', (event, objective) => {
  objectives.push({ objective, completed: false });
  console.log('Objetivos atuais:', objectives.map((obj) => obj.objective));
  if (objectivesWindow) {
    objectivesWindow.webContents.send('updateObjectives', objectives);
  }
});

ipcMain.on('removeObjective', (event, index) => {
  objectives.splice(index, 1)
  console.log('Objetivo removido!')

  BrowserWindow.getAllWindows().forEach((win) => {
    win.webContents.send('updateObjectives', objectives);
  });
})

ipcMain.on('toggleObjective', (event, index) => {
  if (objectives[index]) {
    objectives[index].completed = !objectives[index].completed;
    console.log(`Objetivo atualizado:`, objectives[index]); 

    if (objectivesWindow) {
      objectivesWindow.webContents.send('updateObjectives', objectives);
    }
  }
});


app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') {
    app.quit()
  }
})