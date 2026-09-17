"use client";

import React, { useRef, useEffect } from 'react';

interface CanvasZScoreBellCurveProps {
  zScore: number;
  cutoffZ?: number;
  stream?: string;
  district?: string;
}

export const CanvasZScoreBellCurve: React.FC<CanvasZScoreBellCurveProps> = ({
  zScore,
  cutoffZ = 1.98,
  stream = 'Physical / Bio Science',
  district = 'Colombo',
}) => {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    // High-DPI handling
    const dpr = typeof window !== 'undefined' ? Math.min(window.devicePixelRatio || 1, 2) : 1;
    const rect = canvas.getBoundingClientRect();
    const width = rect.width || 600;
    const height = rect.height || 180;

    canvas.width = Math.round(width * dpr);
    canvas.height = Math.round(height * dpr);

    ctx.save();
    ctx.scale(dpr, dpr);

    ctx.clearRect(0, 0, width, height);

    // Coordinate mapping parameters
    const padX = 24;
    const baselineY = height - 32;
    const plotWidth = width - padX * 2;
    const peakHeight = height - 60;

    const minZ = -3.0;
    const maxZ = 3.0;

    const zToX = (z: number) => {
      const norm = (z - minZ) / (maxZ - minZ);
      return padX + norm * plotWidth;
    };

    // Standard Normal PDF: f(z) = e^(-z^2 / 2)
    const pdf = (z: number) => Math.exp(-0.5 * z * z);
    const maxPdf = 1.0;

    const zToY = (z: number) => {
      const val = pdf(z) / maxPdf;
      return baselineY - val * peakHeight;
    };

    // 1. Draw Baseline
    ctx.beginPath();
    ctx.strokeStyle = '#dec0b7';
    ctx.lineWidth = 1;
    ctx.setLineDash([3, 4]);
    ctx.moveTo(padX, baselineY);
    ctx.lineTo(width - padX, baselineY);
    ctx.stroke();
    ctx.setLineDash([]);

    // 2. Draw Shaded University Cutoff Area (+cutoffZ to +3.0)
    const cutoffStep = 0.05;
    ctx.beginPath();
    const startCutX = zToX(cutoffZ);
    ctx.moveTo(startCutX, baselineY);
    ctx.lineTo(startCutX, zToY(cutoffZ));

    for (let z = cutoffZ; z <= maxZ; z += cutoffStep) {
      ctx.lineTo(zToX(z), zToY(z));
    }
    ctx.lineTo(zToX(maxZ), baselineY);
    ctx.closePath();
    ctx.fillStyle = 'rgba(198, 237, 193, 0.75)'; // Soft sage green
    ctx.fill();

    // 3. Draw Normal Distribution Gradient Fill
    const grad = ctx.createLinearGradient(0, baselineY - peakHeight, 0, baselineY);
    grad.addColorStop(0, 'rgba(200, 90, 50, 0.22)');
    grad.addColorStop(1, 'rgba(200, 90, 50, 0.01)');

    ctx.beginPath();
    ctx.moveTo(zToX(minZ), baselineY);
    for (let z = minZ; z <= maxZ; z += 0.05) {
      ctx.lineTo(zToX(z), zToY(z));
    }
    ctx.lineTo(zToX(maxZ), baselineY);
    ctx.closePath();
    ctx.fillStyle = grad;
    ctx.fill();

    // 4. Draw Smooth Bell Curve Line
    ctx.beginPath();
    ctx.moveTo(zToX(minZ), baselineY);
    for (let z = minZ; z <= maxZ; z += 0.05) {
      ctx.lineTo(zToX(z), zToY(z));
    }
    ctx.strokeStyle = '#4a3b35';
    ctx.lineWidth = 2.5;
    ctx.lineCap = 'round';
    ctx.stroke();

    // 5. Mean Line (Z = 0)
    const meanX = zToX(0);
    ctx.beginPath();
    ctx.setLineDash([3, 3]);
    ctx.strokeStyle = '#8a726a';
    ctx.lineWidth = 1.2;
    ctx.moveTo(meanX, baselineY - peakHeight);
    ctx.lineTo(meanX, baselineY);
    ctx.stroke();
    ctx.setLineDash([]);

    // 6. University Cutoff Line (+cutoffZ)
    ctx.beginPath();
    ctx.setLineDash([2, 3]);
    ctx.strokeStyle = '#456644';
    ctx.lineWidth = 1.8;
    ctx.moveTo(startCutX, zToY(cutoffZ));
    ctx.lineTo(startCutX, baselineY);
    ctx.stroke();
    ctx.setLineDash([]);

    // 7. Axis Labels
    ctx.font = '500 10px -apple-system, BlinkMacSystemFont, "Plus Jakarta Sans", sans-serif';
    ctx.fillStyle = '#57423b';
    ctx.textAlign = 'center';

    ctx.fillText('Mean (0.0)', meanX, baselineY + 16);
    ctx.fillStyle = '#456644';
    ctx.font = '700 10px -apple-system, BlinkMacSystemFont, "Plus Jakarta Sans", sans-serif';
    ctx.fillText(`Uni Cutoff (+${cutoffZ.toFixed(2)})`, startCutX, baselineY + 16);

    ctx.fillStyle = '#8a726a';
    ctx.font = '500 10px -apple-system, BlinkMacSystemFont, "Plus Jakarta Sans", sans-serif';
    ctx.fillText('-2.0', zToX(-2.0), baselineY + 16);
    ctx.fillText('-1.0', zToX(-1.0), baselineY + 16);
    ctx.fillText('+1.0', zToX(1.0), baselineY + 16);
    ctx.fillText('+2.5', zToX(2.5), baselineY + 16);

    // 8. User Score Indicator Pointer
    const clampedZ = Math.max(-2.9, Math.min(2.9, zScore));
    const userX = zToX(clampedZ);
    const userY = zToY(clampedZ);

    // Vertical line to baseline
    ctx.beginPath();
    ctx.strokeStyle = '#9f3c16';
    ctx.lineWidth = 2;
    ctx.moveTo(userX, userY - 14);
    ctx.lineTo(userX, baselineY);
    ctx.stroke();

    // Pulse circle
    ctx.beginPath();
    ctx.arc(userX, userY, 9, 0, Math.PI * 2);
    ctx.fillStyle = 'rgba(159, 60, 22, 0.18)';
    ctx.fill();

    ctx.beginPath();
    ctx.arc(userX, userY, 4.5, 0, Math.PI * 2);
    ctx.fillStyle = '#9f3c16';
    ctx.fill();
    ctx.strokeStyle = '#ffffff';
    ctx.lineWidth = 1.5;
    ctx.stroke();

    // Bubble badge
    const badgeW = 86;
    const badgeH = 22;
    const badgeX = Math.max(padX, Math.min(width - padX - badgeW, userX - badgeW / 2));
    const badgeY = Math.max(8, userY - 36);

    ctx.fillStyle = '#1d1b19';
    ctx.beginPath();
    ctx.roundRect(badgeX, badgeY, badgeW, badgeH, 6);
    ctx.fill();

    ctx.fillStyle = '#ffffff';
    ctx.font = '600 11px -apple-system, BlinkMacSystemFont, "Plus Jakarta Sans", sans-serif';
    ctx.textAlign = 'center';
    const scoreLabel = `You (${zScore >= 0 ? '+' : ''}${zScore.toFixed(2)})`;
    ctx.fillText(scoreLabel, badgeX + badgeW / 2, badgeY + 15);

    ctx.restore();
  }, [zScore, cutoffZ, stream, district]);

  return (
    <div className="relative w-full h-44 my-2 flex items-center justify-center">
      <canvas
        ref={canvasRef}
        className="w-full h-full block"
        style={{ width: '100%', height: '100%' }}
      />
    </div>
  );
};
