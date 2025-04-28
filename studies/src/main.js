import { app, BrowserWindow, ipcMain } from 'electron';
import { createCanvas } from 'canvas';
import path from 'path';

// Função para criar a janela
function createWindow() {
  const win = new BrowserWindow({
    width: 800,
    height: 600,
    webPreferences: {
      nodeIntegration: true,
      preload: path.join(__dirname, 'renderer.js'),  // Arquivo renderer.js (se necessário)
    },
  });

  win.loadFile('index.html'); // Carrega o arquivo HTML (pode ser local ou dinâmico como mostrado no código anterior)

  // Evitar fechamento inesperado
  win.on('closed', () => {
    app.quit();
  });
}

// Quando o Electron estiver pronto, cria a janela
app.whenReady().then(() => {
  createWindow();

  app.on('window-all-closed', () => {
    if (process.platform !== 'darwin') app.quit();
  });
});

// Comunicação IPC: Quando solicitado, gera uma imagem do canvas e retorna como base64
ipcMain.handle('get-canvas-image', () => {
  const canvas = createCanvas(200, 200);
  const ctx = canvas.getContext('2d');

  // Desenhando no canvas
  const color = 'rgba(0, 100, 255, 0.8)';
  ctx.font = '30px Impact';
  ctx.rotate(0.1);
  ctx.fillStyle = color;
  ctx.fillText('Awesome!', 50, 100);

  const text = ctx.measureText('Awesome!');
  ctx.strokeStyle = cor;
  ctx.beginPath();
  ctx.moveTo(50, 102);
  ctx.lineTo(50 + text.width, 102);
  ctx.stroke();

  // Retorna a imagem como base64
  return canvas.toDataURL();
});
