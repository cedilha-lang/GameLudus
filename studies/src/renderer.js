const { ipcRenderer } = require('electron');

window.onload = async () => {
  // Pega a referência do canvas no HTML
  const canvas = document.getElementById('myCanvas');
  const ctx = canvas.getContext('2d');

  // Obtém a imagem do canvas como base64 do processo principal
  const imageUrl = await ipcRenderer.invoke('get-canvas-image');

  // Cria uma imagem a partir do base64 e desenha no canvas
  const img = new Image();
  img.src = imageUrl;
  
  img.onload = () => {
    ctx.drawImage(img, 0, 0);
  };
};