export default {
  clearCanvas: () => {
    const canvas = document.getElementById("gameCanvas");
    const ctx = canvas?.getContext("2d");
    if (ctx) {
      ctx.clearRect(0, 0, canvas.width, canvas.height);
    }
  },

  drawCircle: (x, y, r, color = "black") => {
    const canvas = document.getElementById("gameCanvas");
    const ctx = canvas?.getContext("2d");
    if (!ctx) {
      return;
    }
    ctx.fillStyle = color;
    ctx.beginPath();
    ctx.arc(x, y, r, 0, 2 * Math.PI);
    ctx.fill();
  },

  drawRect: (x, y, w, h, color = "black") => {
    const canvas = document.getElementById("gameCanvas");
    const ctx = canvas?.getContext("2d");
    if (!ctx) {
      return;
    }
    ctx.fillStyle = color;
    ctx.fillRect(x, y, w, h);
  },

  drawText: ( text, x, y, font = "20px Arial", color = "black" ) => {
    const canvas = document.getElementById("gameCanvas"); 
    const ctx = canvas?.getContext("2d"); 
    if (!ctx) {
      return;
    }
    ctx.font = font; 
    ctx.fillStyle = color;
    ctx.fillText(text, x, y); 
  },

  getCanvasWidth: () => {
    const canvas = document.getElementById("gameCanvas"); 
    return canvas?.width ?? 0; 
  }, 
  
  getCanvasHeight: () => { 
    const canvas = document.getElementById("gameCanvas"); 
    return canvas?.height ?? 0;
  },

  isMousePressed: (() => {
    let pressed = false; const canvas = document.getElementById("gameCanvas");
    if (canvas) { 
      canvas.addEventListener("mousedown", () => { 
        pressed = true; 
      }); 
      canvas.addEventListener("mouseup", () => { 
        pressed = false; 
      }); 
    } 
    
    return () => pressed; 
  })(),
};