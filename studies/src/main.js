import { app, BrowserWindow, ipcMain } from 'electron';
import { createCanvas } from 'canvas';
import path from 'path';
import { fileURLToPath } from 'url';
import { dirname } from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

function createWindow() {
  const win = new BrowserWindow({
    width: 800,
    height: 600,
    webPreferences: {
      nodeIntegration: true,
      preload: path.join(__dirname, 'renderer.js'),
    },
  });

  win.loadFile(path.join(__dirname, 'index.html')); // Loads the HTML file (can be local or dynamic as shown in the previous code)

  // Avoid unexpected closure
  win.on('closed', () => {
    app.quit();
  });
}

//  When Electron is ready, create the window
app.whenReady().then(() => {
  createWindow();

  app.on('window-all-closed', () => {
    if (process.platform !== 'darwin') {
      app.quit();
    }
  });
});

// IPC communication: When requested, generates an image from the canvas and returns it as base64
ipcMain.handle('get-canvas-image', () => {
  const canvas = createCanvas(200, 200);
  const ctx = canvas.getContext('2d');

  // Drawing on the canvas
  const color = 'rgba(0, 100, 255, 0.8)';
  ctx.font = '30px Impact';
  ctx.rotate(0.1);
  ctx.fillStyle = color;
  ctx.fillText('Awesome!', 50, 100);

  const text = ctx.measureText('Awesome!');
  ctx.strokeStyle = color;
  ctx.beginPath();
  ctx.moveTo(50, 102);
  ctx.lineTo(50 + text.width, 102);
  ctx.stroke();

  //  Returns the image as base64
  return canvas.toDataURL();
});
