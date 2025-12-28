import { app, BrowserWindow, screen, ipcMain } from 'electron';
import path from 'node:path';
import started from 'electron-squirrel-startup';
import * as dotenv from 'dotenv';
dotenv.config();
console.log("My API Key is:", process.env.OPENROUTER_API_KEY ? "Loaded!" : "NOT FOUND");

// Handle creating/removing shortcuts on Windows when installing/uninstalling.
if (started) {
  app.quit();
}

const createWindow = () => {
  const primaryDisplay = screen.getPrimaryDisplay();
  const { width, height } = primaryDisplay.bounds; 
  
  // Exactly half the screen width
  const windowWidth = Math.floor(width / 2);
  
  // Exactly one fourth (1/4) of the screen height
  const windowHeight = Math.floor(height / 4);

  // This will position it in the bottom-right corner
  const x = width - windowWidth;
  const y = height - windowHeight;

  const mainWindow = new BrowserWindow({
    width: windowWidth,
    height: windowHeight,
    x: x,
    y: y,
    frame: false,
    transparent: true, // Must be true for click-through to work well
    alwaysOnTop: true,
    focusable: true,
    hasShadow: false, // Changed from mainWindow.shadow to a creation property for better stability
    webPreferences: {
      preload: path.join(__dirname, 'preload.js'),
      nodeIntegration: true, // Ensure these match your project setup
    },
  });
  
  // THE CLICK-THROUGH LOGIC
  // This tells Electron to ignore mouse events but send them to the renderer
  mainWindow.setIgnoreMouseEvents(true, { forward: true });
  
  // Listen for a message from the renderer to "turn on/off" clicks
  

  setInterval(() => {
    if (mainWindow && !mainWindow.isDestroyed()) {
      const { x, y } = screen.getCursorScreenPoint();
      const [winX, winY] = mainWindow.getPosition();
      

      mainWindow.webContents.send('global-mouse-move', {
        relX: x - winX,
        relY: y - winY
      });
    }
  }, 30);

  // and load the index.html of the app.
  if (MAIN_WINDOW_VITE_DEV_SERVER_URL) {
    mainWindow.loadURL(MAIN_WINDOW_VITE_DEV_SERVER_URL);
  } else {
    mainWindow.loadFile(
      path.join(__dirname, `../renderer/${MAIN_WINDOW_VITE_NAME}/index.html`),
    );
  }

};

ipcMain.on('set-ignore-mouse-events', (event, ignore, options) => {
  const win = BrowserWindow.fromWebContents(event.sender);
  if (!win) return;

  if (!ignore) {
    win.setIgnoreMouseEvents(false);
    win.show(); 
    win.focus();
  } else {
    win.setIgnoreMouseEvents(true, { forward: true });
  }
});

// 2. Handle AI Requests (The 'ask-ai' handler)
ipcMain.handle('ask-ai', async (event, prompt) => {
  console.log("AI Prompt received:", prompt); 
  try {
    const response = await fetch("https://openrouter.ai/api/v1/chat/completions", {
      method: "POST",
      headers: {
        "Authorization": `Bearer ${process.env.OPENROUTER_API_KEY}`,
        "Content-Type": "application/json"
      },
      body: JSON.stringify({
        "model": "openrouter/auto",
        "messages": [
          { 
            "role": "system", 
            "content": "You are a helpful, minimalist desktop companion. Be concise, clever, and direct. No 'spooky' roleplay or ghost puns. Keep answers under 2 sentences." 
          },
          { "role": "user", "content": prompt }
        ]
      })
    });

    const data = await response.json();
    
    if (data.error) {
      console.error("OpenRouter API Error:", data.error);
      return "The spirit world is busy...";
    }

    return data.choices[0].message.content;
  } catch (error) {
    console.error("Fetch Error:", error);
    return "I lost my connection to the beyond.";
  }
});

// This method will be called when Electron has finished
// initialization and is ready to create browser windows.
// Some APIs can only be used after this event occurs.
app.on('ready', createWindow);

// Quit when all windows are closed, except on macOS. There, it's common
// for applications and their menu bar to stay active until the user quits
// explicitly with Cmd + Q.
app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') {
    app.quit();
  }
});

app.on('activate', () => {
  // On OS X it's common to re-create a window in the app when the
  // dock icon is clicked and there are no other windows open.
  if (BrowserWindow.getAllWindows().length === 0) {
    createWindow();
  }
});




// In this file you can include the rest of your app's specific main process
// code. You can also put them in separate files and import them here.
