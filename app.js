const canvas = document.getElementById('canvasFrame');
const worker = new Worker('worker.js');
const offscreen = canvas.transferControlToOffscreen();

// High DPI Scaling for iPad
const dpr = window.devicePixelRatio || 1;
canvas.width = window.innerWidth * dpr;
canvas.height = window.innerHeight * dpr;

worker.postMessage({ msg: 'init', canvas: offscreen }, [offscreen]);

let db;
let paths = [];
let currentPath = null;
let currentTool = 'pen';
let currentColor = '#FF0000';
let currentWidth = 10 * dpr;

// Initialize IndexedDB
async function initDB() {
  db = await idb.openDB('LittleColorsDB', 1, {
    upgrade(db) { db.createObjectStore('artwork'); },
  });
  const savedPaths = await db.get('artwork', 'currentSession');
  if (savedPaths) {
    paths = savedPaths;
    worker.postMessage({ msg: 'renderAll', payload: paths });
  }
}
initDB();

async function saveState() {
  if (db) await db.put('artwork', paths, 'currentSession');
}

function getCoords(e) {
  return { x: e.clientX * dpr, y: e.clientY * dpr };
}

// Pointer Events
canvas.addEventListener('pointerdown', (e) => {
  canvas.setPointerCapture(e.pointerId);
  currentPath = { 
    color: currentColor, 
    width: currentTool === 'eraser' ? 50 * dpr : currentWidth, 
    tool: currentTool, 
    points: [getCoords(e)] 
  };
  worker.postMessage({ msg: 'startStroke', payload: currentPath });
});

canvas.addEventListener('pointermove', (e) => {
  if (!currentPath) return;
  const pt = getCoords(e);
  currentPath.points.push(pt);
  worker.postMessage({ msg: 'moveStroke', payload: pt });
});

canvas.addEventListener('pointerup', (e) => {
  if (!currentPath) return;
  paths.push(currentPath);
  currentPath = null;
  saveState();
});

// UI Controls
document.getElementById('btnPen').addEventListener('click', () => { currentTool = 'pen'; });
document.getElementById('btnEraser').addEventListener('click', () => { currentTool = 'eraser'; });

document.getElementById('btnUndo').addEventListener('click', () => {
  paths.pop();
  worker.postMessage({ msg: 'renderAll', payload: paths });
  saveState();
});

document.getElementById('btnClear').addEventListener('click', () => {
  paths = [];
  worker.postMessage({ msg: 'renderAll', payload: paths });
  saveState();
});
