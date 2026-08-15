let ctx;
let offscreenCanvas;
let activePath = null;

self.onmessage = function(evt) {
  const { msg, payload } = evt.data;

  if (msg === 'init') {
    offscreenCanvas = evt.data.canvas;
    ctx = offscreenCanvas.getContext('2d', { alpha: true, desynchronized: true });
    ctx.lineCap = 'round';
    ctx.lineJoin = 'round';
  } else if (msg === 'startStroke') {
    activePath = payload;
    ctx.strokeStyle = activePath.color;
    ctx.lineWidth = activePath.width;
    ctx.globalCompositeOperation = activePath.tool === 'eraser' ? 'destination-out' : 'source-over';
    ctx.beginPath();
    ctx.moveTo(activePath.points[0].x, activePath.points[0].y);
  } else if (msg === 'moveStroke') {
    if (!activePath) return;
    ctx.lineTo(payload.x, payload.y);
    ctx.stroke();
    ctx.beginPath();
    ctx.moveTo(payload.x, payload.y); // Reset sub-path for continuous smooth lines
  } else if (msg === 'renderAll') {
    ctx.clearRect(0, 0, offscreenCanvas.width, offscreenCanvas.height);
    payload.forEach(renderPath);
  }
};

function renderPath(path) {
  if (!path || path.points.length === 0) return;
  ctx.strokeStyle = path.color;
  ctx.lineWidth = path.width;
  ctx.globalCompositeOperation = path.tool === 'eraser' ? 'destination-out' : 'source-over';
  
  ctx.beginPath();
  ctx.moveTo(path.points[0].x, path.points[0].y);
  for (let i = 1; i < path.points.length; i++) {
    ctx.lineTo(path.points[i].x, path.points[i].y);
  }
  ctx.stroke();
}
