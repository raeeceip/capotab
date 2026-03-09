import type { ChordShape } from '../types';

export function drawFretboard(
  canvas: HTMLCanvasElement,
  shape: ChordShape | null,
  capo: number,
  shapeName: string
): void {
  const ctx = canvas.getContext('2d');
  if (!ctx) return;

  const W = canvas.width;
  const H = canvas.height;
  const NUM_STRINGS = 6;
  const NUM_FRETS = 5;
  const TOP_MARGIN = 40;
  const BOTTOM_MARGIN = 10;
  const SIDE_MARGIN = 25;
  const FRET_AREA_HEIGHT = H - TOP_MARGIN - BOTTOM_MARGIN;
  const FRET_SPACING = FRET_AREA_HEIGHT / NUM_FRETS;
  const STRING_SPACING = (W - 2 * SIDE_MARGIN) / (NUM_STRINGS - 1);

  // Clear
  ctx.fillStyle = '#141416';
  ctx.fillRect(0, 0, W, H);

  // Determine start fret
  let startFret = 1;
  if (shape) {
    const allFrets = shape.fingers.map(f => f.fret).filter(f => f > 0);
    if (shape.barre) allFrets.push(shape.barre.fret);
    const minFret = Math.min(...allFrets, 99);
    const maxFret = Math.max(...allFrets, 0);
    if (maxFret > 5) {
      startFret = minFret;
    }
  }

  // Nut
  if (startFret === 1) {
    ctx.fillStyle = '#f0f0f0';
    ctx.fillRect(SIDE_MARGIN - 2, TOP_MARGIN - 3, W - 2 * SIDE_MARGIN + 4, 5);
  } else {
    // Fret number indicator
    ctx.fillStyle = '#6b6b7a';
    ctx.font = '11px "DM Mono", monospace';
    ctx.textAlign = 'right';
    ctx.fillText(`${startFret}fr`, SIDE_MARGIN - 8, TOP_MARGIN + FRET_SPACING / 2 + 4);
  }

  // Fret lines
  ctx.strokeStyle = '#2a2a32';
  ctx.lineWidth = 1;
  for (let i = 0; i <= NUM_FRETS; i++) {
    const y = TOP_MARGIN + i * FRET_SPACING;
    ctx.beginPath();
    ctx.moveTo(SIDE_MARGIN, y);
    ctx.lineTo(W - SIDE_MARGIN, y);
    ctx.stroke();
  }

  // Strings
  for (let i = 0; i < NUM_STRINGS; i++) {
    const x = SIDE_MARGIN + i * STRING_SPACING;
    const thickness = 1 + i * 0.3;
    ctx.strokeStyle = '#3a3a42';
    ctx.lineWidth = thickness;
    ctx.beginPath();
    ctx.moveTo(x, TOP_MARGIN);
    ctx.lineTo(x, H - BOTTOM_MARGIN);
    ctx.stroke();
  }

  if (!shape) {
    ctx.fillStyle = '#6b6b7a';
    ctx.font = '12px "DM Mono", monospace';
    ctx.textAlign = 'center';
    ctx.fillText('Unknown', W / 2, H / 2);
    return;
  }

  // Capo label
  if (capo > 0) {
    ctx.fillStyle = '#5affd8';
    ctx.font = '10px "DM Mono", monospace';
    ctx.textAlign = 'left';
    ctx.fillText(`capo ${capo}`, 4, 14);
  }

  // Shape name
  ctx.fillStyle = '#e8ff5a';
  ctx.font = 'bold 13px "DM Mono", monospace';
  ctx.textAlign = 'center';
  ctx.fillText(shapeName, W / 2, 14);

  // Barre
  if (shape.barre) {
    const barreFret = shape.barre.fret - startFret + 1;
    const fromX = SIDE_MARGIN + (shape.barre.to - 1) * STRING_SPACING;
    const toX = SIDE_MARGIN + (shape.barre.from - 1) * STRING_SPACING;
    const y = TOP_MARGIN + (barreFret - 0.5) * FRET_SPACING;
    const barreHeight = 12;

    ctx.fillStyle = 'rgba(232,255,90,0.18)';
    ctx.strokeStyle = '#e8ff5a';
    ctx.lineWidth = 1.5;
    const left = Math.min(fromX, toX) - 4;
    const right = Math.max(fromX, toX) + 4;
    const top = y - barreHeight / 2;
    ctx.beginPath();
    (ctx as CanvasRenderingContext2D & { roundRect: (x: number, y: number, w: number, h: number, r: number) => void }).roundRect(left, top, right - left, barreHeight, barreHeight / 2);
    ctx.fill();
    ctx.stroke();
  }

  // Finger dots
  for (const finger of shape.fingers) {
    if (finger.fret === 0) continue;
    const x = SIDE_MARGIN + (finger.string - 1) * STRING_SPACING;
    const fretPos = finger.fret - startFret + 1;
    const y = TOP_MARGIN + (fretPos - 0.5) * FRET_SPACING;
    const radius = 7;

    ctx.fillStyle = '#e8ff5a';
    ctx.beginPath();
    ctx.arc(x, y, radius, 0, Math.PI * 2);
    ctx.fill();
  }

  // Open strings
  for (const s of shape.open) {
    const x = SIDE_MARGIN + (s - 1) * STRING_SPACING;
    const y = TOP_MARGIN - 14;
    ctx.strokeStyle = '#5affd8';
    ctx.lineWidth = 1.5;
    ctx.beginPath();
    ctx.arc(x, y, 5, 0, Math.PI * 2);
    ctx.stroke();
  }

  // Muted strings
  for (const s of shape.muted) {
    const x = SIDE_MARGIN + (s - 1) * STRING_SPACING;
    const y = TOP_MARGIN - 14;
    const size = 4;
    ctx.strokeStyle = '#ff5a7a';
    ctx.lineWidth = 1.5;
    ctx.beginPath();
    ctx.moveTo(x - size, y - size);
    ctx.lineTo(x + size, y + size);
    ctx.moveTo(x + size, y - size);
    ctx.lineTo(x - size, y + size);
    ctx.stroke();
  }
}
