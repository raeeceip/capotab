import { useRef, useEffect } from 'react';
import type { ChordShape } from '../types';
import { drawFretboard } from '../lib/drawFretboard';

interface FretboardCanvasProps {
  shape: ChordShape | null;
  capo: number;
  shapeName: string;
  width?: number;
  height?: number;
}

export default function FretboardCanvas({ shape, capo, shapeName, width = 180, height = 250 }: FretboardCanvasProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    if (canvasRef.current) {
      canvasRef.current.width = width;
      canvasRef.current.height = height;
      drawFretboard(canvasRef.current, shape, capo, shapeName);
    }
  }, [shape, capo, shapeName, width, height]);

  return <canvas ref={canvasRef} style={{ display: 'block' }} />;
}
