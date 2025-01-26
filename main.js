const { app, BrowserWindow, ipcMain, globalShortcut, screen } = require('electron/main')
const path = require('node:path')
const fs = require('node:fs')

let win;
let objectivesWindow;
let objectives = [];
let sessionStartTime = null; 
let sessionEndTime = null;  
let currentSession = {
  sessionId: null,
  startTime: null,
  objectives: [],
};
let sessions = [];
const jsonFilePath = path.join(app.getPath('userData'), 'sessions.json');


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
    objectivesWindow.webContents.send('updateObjectives', currentSession.objectives);
  });
};

app.whenReady().then(() => {
  loadSessionsFromFile();
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

  globalShortcut.register('Control+Shift+O', () => {
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

const saveSessionsToFile = () => {
  fs.writeFileSync(jsonFilePath, JSON.stringify(sessions, null, 2), 'utf-8');
};

ipcMain.on('submitForm', (event, objective) => {
  const dateObj = new Date();
  const newObjective = {
    objective,
    completed: false,
    initialTime: dateObj.toISOString(),
    endTime: null,
  };
  if (objectives.length === 0) {
    sessionStartTime = dateObj;
    currentSession.sessionId = Date.now();
    currentSession.startTime = sessionStartTime.toISOString();
    console.log(`Sessão de estudo iniciada em: ${sessionStartTime.toTimeString()}`);
  }

  objectives.push(newObjective);
  currentSession.objectives.push(newObjective);

  console.log('Objetivos atuais:', objectives);

  if (objectivesWindow) {
    objectivesWindow.webContents.send('updateObjectives', objectives);
  }
});


ipcMain.on('removeObjective', (event, index) => {
  objectives.splice(index, 1);
  currentSession.objectives.splice(index, 1);
  console.log('Objetivo removido!');

  if (objectives.length === 0) {
    if (!currentSession.objectives.some(obj => obj.completed)) {
      sessionStartTime = null;
      currentSession = {
        sessionId: null,
        startTime: null,
        objectives: [],
      };
      console.log('Sessão descartada. Nenhum objetivo foi concluído.');
    }

    if (objectivesWindow) {
      objectivesWindow.webContents.send('updateObjectives', objectives);
    }
  }

  BrowserWindow.getAllWindows().forEach((win) => {
    win.webContents.send('updateObjectives', objectives);
  });
});


ipcMain.on('toggleObjective', (event, index) => {
  if (objectives[index]) {
    const dateObj = new Date();

    objectives[index].completed = !objectives[index].completed;
    objectives[index].endTime = objectives[index].completed ? dateObj.toISOString() : null;
    console.log(`Objetivo atualizado:`, objectives[index]);

    const allCompleted = objectives.every(obj => obj.completed);

    if (allCompleted) {
      sessionEndTime = dateObj;
      const totalTime = (sessionEndTime - sessionStartTime) / 1000; 

      const hours = Math.floor(totalTime / 3600);
      const minutes = Math.floor((totalTime % 3600) / 60);
      const seconds = Math.floor(totalTime % 60);

      console.log(`Sessão de estudo concluída!`);
      console.log(`Duração total da sessão: ${hours} horas, ${minutes} minutos e ${seconds} segundos.`);

      currentSession.endTime = sessionEndTime.toISOString();
      currentSession.totalTime = {
        hours,
        minutes,
        seconds,
      };

      sessions.push(currentSession);
      saveSessionsToFile();

      sessionStartTime = null;
      sessionEndTime = null;
      objectives = [];
      currentSession = {
        sessionId: null,
        startTime: null,
        objectives: [],
      };
    }

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