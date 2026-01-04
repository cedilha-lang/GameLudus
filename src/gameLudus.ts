export default {
  clearCanvas: () => {
    const canvas = document.getElementById("gameCanvas") as HTMLCanvasElement;
    const ctx = canvas?.getContext("2d");
    if (ctx) {
      ctx.clearRect(0, 0, canvas.width, canvas.height);
    }
  },

  drawCircle: (x: number, y: number, r: number, color: string = "black") => {
    const canvas = document.getElementById("gameCanvas") as HTMLCanvasElement;
    const ctx = canvas?.getContext("2d");
    if (!ctx) {
      return;
    }
    ctx.fillStyle = color;
    ctx.beginPath();
    ctx.arc(x, y, r, 0, 2 * Math.PI);
    ctx.fill();
  },

  drawRect: (x: number, y: number, w: number, h: number, color: string = "black") => {
    const canvas = document.getElementById("gameCanvas") as HTMLCanvasElement;
    const ctx = canvas?.getContext("2d");
    if (!ctx) {
      return;
    }
    ctx.fillStyle = color;
    ctx.fillRect(x, y, w, h);
  },

  drawText: ( text: string, x: number, y: number, font: string = "20px Arial", color: string = "black" ) => {
    const canvas = document.getElementById("gameCanvas") as HTMLCanvasElement; 
    const ctx = canvas?.getContext("2d"); 
    if (!ctx) {
      return;
    }
    ctx.font = font; 
    ctx.fillStyle = color;
    ctx.fillText(text, x, y); 
  },

  getCanvasWidth: () => {
    const canvas = document.getElementById("gameCanvas") as HTMLCanvasElement; 
    return canvas?.width ?? 0; 
  }, 
  
  getCanvasHeight: () => { 
    const canvas = document.getElementById("gameCanvas") as HTMLCanvasElement; 
    return canvas?.height ?? 0;
  },

  isMousePressed: (() => {
    let pressed = false; const canvas = document.getElementById("gameCanvas") as HTMLCanvasElement;
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