const { app, BrowserWindow, ipcMain, globalShortcut, screen } = require('electron/main')
const path = require('node:path')
const fs = require('node:fs')

let win;
let objectivesWindow;
let sessionStartTime = null;
let sessionEndTime = null;
let currentSession = {
  sessionId: null,
  startTime: null,
  endTime: null,
  objectives: [],
};
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

const appendSessionToFile = (session) => {
  const exists = fs.existsSync(jsonFilePath);
  
  if (!exists || fs.statSync(jsonFilePath).size === 0) {
    fs.writeFileSync(jsonFilePath, JSON.stringify([session], null, 2), 'utf-8');
  } else {
    const fileContent = fs.readFileSync(jsonFilePath, 'utf-8');
    
    if (fileContent.trim() === '[]') {
      fs.writeFileSync(jsonFilePath, JSON.stringify([session], null, 2), 'utf-8');
    } else {
      const updatedContent = fileContent.slice(0, -1) + `,\n  ${JSON.stringify(session, null, 2)}\n]`;
      fs.writeFileSync(jsonFilePath, updatedContent, 'utf-8');
    }
  }
};

ipcMain.on('submitForm', (event, objective) => {
  const dateObj = new Date();
  const newObjective = {
    objective,
    completed: false,
    initialTime: dateObj.toISOString(),
    endTime: null,
  };
  if (currentSession.objectives.length === 0) {
    sessionStartTime = dateObj;
    currentSession.sessionId = Date.now();
    currentSession.startTime = sessionStartTime.toISOString();
    console.log(`Sessão de estudo iniciada em: ${sessionStartTime.toTimeString()}`);
  }

  currentSession.objectives.push(newObjective);

  console.log('Objetivos atuais:', currentSession.objectives);

  if (objectivesWindow) {
    objectivesWindow.webContents.send('updateObjectives', currentSession.objectives);
  }
});

ipcMain.on('cancelObjective', (event, index) => {
  if (currentSession.objectives[index]?.completed) {
    console.log('Objetivo concluído não pode ser cancelado.');
    return;
  }

  if (currentSession.objectives[index]?.canceled) {
    console.log('Objetivo já foi cancelado.');
    return;
  }
  if (currentSession.objectives[index]) {
    currentSession.objectives[index].canceled = true;
    currentSession.objectives[index].endTime = new Date().toISOString();
    console.log(`Objetivo desistido:`, currentSession.objectives[index]);

    const allHandled = currentSession.objectives.every(obj => obj.completed || obj.canceled);
    if (allHandled) {
      sessionEndTime = new Date();
      const totalTime = (sessionEndTime - sessionStartTime) / 1000;

      const hours = Math.floor(totalTime / 3600);
      const minutes = Math.floor((totalTime % 3600) / 60);
      const seconds = Math.floor(totalTime % 60);

      console.log(`Sessão encerrada.`);
      console.log(`Duração total: ${hours} horas, ${minutes} minutos e ${seconds} segundos.`);

      currentSession.endTime = sessionEndTime.toISOString();
      currentSession.totalTime = { hours, minutes, seconds };
      appendSessionToFile(currentSession);

      sessionStartTime = null;
      sessionEndTime = null;
      currentSession = {
        sessionId: null,
        startTime: null,
        endTime: null,
        objectives: [],
      };
    }

    if (objectivesWindow) {
      objectivesWindow.webContents.send('updateObjectives', currentSession.objectives);
    }
  }
});

ipcMain.on('removeObjective', (event, index) => {
  if (currentSession.objectives[index]?.completed || currentSession.objectives[index]?.canceled) {
    console.log('Objetivo concluído ou cancelado não pode ser removido.');
    return;
  }
  currentSession.objectives.splice(index, 1);
  console.log('Objetivo removido!');

  if (currentSession.objectives.length === 0) {
    if (!currentSession.objectives.some(obj => obj.completed || obj.canceleds)) {
      sessionStartTime = null;
      currentSession = {
        sessionId: null,
        startTime: null,
        endTime: null,
        objectives: [],
      };
      console.log('Sessão descartada. Nenhum objetivo foi concluído.');
    }

    if (objectivesWindow) {
      objectivesWindow.webContents.send('updateObjectives', currentSession.objectives);
    }
  }

  const allHandled = currentSession.objectives.every(obj => obj.completed || obj.canceled);
  if (allHandled) {
    sessionEndTime = new Date();
    const totalTime = (sessionEndTime - sessionStartTime) / 1000;

    const hours = Math.floor(totalTime / 3600);
    const minutes = Math.floor((totalTime % 3600) / 60);
    const seconds = Math.floor(totalTime % 60);

    console.log(`Sessão encerrada.`);
    console.log(`Duração total: ${hours} horas, ${minutes} minutos e ${seconds} segundos.`);

    currentSession.endTime = sessionEndTime.toISOString();
    currentSession.totalTime = { hours, minutes, seconds };
    appendSessionToFile(currentSession);

    sessionStartTime = null;
    sessionEndTime = null;
    currentSession = {
      sessionId: null,
      startTime: null,
      endTime: null,
      objectives: [],
    };
  }

  if (objectivesWindow) {
    objectivesWindow.webContents.send('updateObjectives', currentSession.objectives);
  }

  BrowserWindow.getAllWindows().forEach((win) => {
    win.webContents.send('updateObjectives', currentSession.objectives);
  });
});


ipcMain.on('toggleObjective', (event, index) => {
  if (currentSession.objectives[index]?.canceled) {
    console.log('Objetivo cancelado não pode ser concluído.');
    return;
  }

  if (currentSession.objectives[index]?.completed) {
    console.log('Objetivo já concluído. A ação não pode ser revertida.');
    return;
  }
  if (currentSession.objectives[index]) {
    const dateObj = new Date();

    currentSession.objectives[index].completed = !currentSession.objectives[index].completed;
    currentSession.objectives[index].endTime = currentSession.objectives[index].completed ? dateObj.toISOString() : null;
    console.log(`Objetivo atualizado:`, currentSession.objectives[index]);

    const allHandled = currentSession.objectives.every(obj => obj.completed || obj.canceled);

    if (allHandled) {
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

      appendSessionToFile(currentSession);

      sessionStartTime = null;
      sessionEndTime = null;
      objectives = [];
      currentSession = {
        sessionId: null,
        startTime: null,
        endTime: null,
        objectives: [],
      };
    }

    if (objectivesWindow) {
      objectivesWindow.webContents.send('updateObjectives', currentSession.objectives);
    }
  }
});


app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') {
    app.quit()
  }
});