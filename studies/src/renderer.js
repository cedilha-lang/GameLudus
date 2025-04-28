const { ipcRenderer } = require('electron');

window.onload = async () => {
  // Grab the reference from the canvas in the HTML
  const canvas = document.getElementById('myCanvas');
  const ctx = canvas.getContext('2d');

  // Gets the image from the canvas as base64 from the main process
  const imageUrl = await ipcRenderer.invoke('get-canvas-image');

  // Create an image from base64 and draw on canvas
  const img = new Image();
  img.src = imageUrl;
  
  img.onload = () => {
    ctx.drawImage(img, 0, 0);
  };
};