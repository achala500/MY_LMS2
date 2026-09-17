'use client';

import React, { useRef, useEffect } from 'react';
import { cn } from '@/lib/utils';

export interface ScholarAvatarConfig {
  skinTone?: 'fair' | 'warm' | 'golden' | 'bronze' | 'mocha' | 'espresso';
  hairStyle: 'swoop' | 'ponytail' | 'curly' | 'bun' | 'crop' | 'wavy' | 'dreads' | 'buzz';
  hairColor: string;
  expression: 'focus' | 'smile' | 'determined' | 'wink' | 'calm' | 'studious';
  glasses: 'round' | 'square' | 'cateye' | 'none';
  outfit: 'hoodie' | 'blazer' | 'cardigan' | 'tee' | 'jacket' | 'polo';
  outfitColor: 'salmon' | 'yellow' | 'orange' | 'navy' | 'emerald' | 'lavender' | 'sky' | 'rust';
  accessory: 'headphones' | 'pencil' | 'mortarboard' | 'beanie' | 'none';
  badgeProp?: 'flame' | 'tea' | 'star' | 'book' | 'none';
  petMascot?: 'owl' | 'cat' | 'succulent' | 'tea' | 'none'; // backwards compatibility
  haloStyle?: 'paper' | 'sunrise' | 'emerald' | 'slate';
  size?: number;
  animate?: boolean;
}

export const DEFAULT_AVATAR_CONFIG: ScholarAvatarConfig = {
  skinTone: 'warm',
  hairStyle: 'swoop',
  hairColor: '#19202e',
  expression: 'focus',
  glasses: 'round',
  outfit: 'hoodie',
  outfitColor: 'salmon',
  accessory: 'headphones',
  badgeProp: 'flame',
  petMascot: 'none',
  haloStyle: 'paper',
  size: 140,
  animate: true,
};

export const SKIN_TONES: Record<string, string> = {
  fair: '#ffe0bd',
  warm: '#ffd1b3',
  golden: '#f1c27d',
  bronze: '#c68642',
  mocha: '#8d5524',
  espresso: '#583a22',
};

export const OUTFIT_FILLS: Record<string, string> = {
  salmon: '#fa7268',
  yellow: '#fcd34d',
  orange: '#fb923c',
  navy: '#19202e',
  emerald: '#456644',
  lavender: '#a78bfa',
  sky: '#38bdf8',
  rust: '#c85a32',
};

/**
 * Pure HTML5 Canvas 2D Avatar Renderer (Zero SVGs)
 * High-performance, anti-aliased, exportable to high-res PNG / WebP data URLs.
 */
export function renderAvatarToCanvas(
  config: ScholarAvatarConfig,
  canvas: HTMLCanvasElement,
  scale = 1
): void {
  const ctx = canvas.getContext('2d');
  if (!ctx) return;

  const S = (config.size || 140) * scale;
  canvas.width = S;
  canvas.height = S;

  ctx.clearRect(0, 0, S, S);
  ctx.imageSmoothingEnabled = true;
  ctx.imageSmoothingQuality = 'high';

  // Coordinate normalizer (base 160x160 grid)
  const k = S / 160;
  const n = (val: number) => val * k;

  const skin = SKIN_TONES[config.skinTone || 'warm'] || SKIN_TONES.warm;
  const outfitColor = OUTFIT_FILLS[config.outfitColor] || '#fa7268';
  const hairColor = config.hairColor || '#19202e';

  // 1. Background Halo Disc
  ctx.beginPath();
  ctx.arc(n(80), n(80), n(74), 0, Math.PI * 2);
  if (config.haloStyle === 'sunrise') {
    ctx.fillStyle = '#ffdcbc';
  } else if (config.haloStyle === 'emerald') {
    ctx.fillStyle = '#c6edc1';
  } else if (config.haloStyle === 'slate') {
    ctx.fillStyle = '#19202e';
  } else {
    ctx.fillStyle = '#fef8f4';
  }
  ctx.fill();
  ctx.lineWidth = n(2.5);
  ctx.strokeStyle = '#e7e1de';
  ctx.stroke();

  // Inner White Ring
  ctx.beginPath();
  ctx.arc(n(80), n(80), n(67), 0, Math.PI * 2);
  ctx.fillStyle = '#ffffff';
  ctx.fill();

  // 2. Study Desk Foreground Edge
  ctx.beginPath();
  ctx.moveTo(n(12), n(138));
  ctx.quadraticCurveTo(n(80), n(132), n(148), n(138));
  ctx.lineTo(n(148), n(156));
  ctx.lineTo(n(12), n(156));
  ctx.closePath();
  ctx.fillStyle = '#f3ede9';
  ctx.fill();
  ctx.strokeStyle = '#1d1b19';
  ctx.lineWidth = n(2.2);
  ctx.stroke();

  // 3. Torso & Outfit
  ctx.beginPath();
  ctx.moveTo(n(46), n(108));
  ctx.bezierCurveTo(n(46), n(88), n(114), n(88), n(114), n(108));
  ctx.lineTo(n(122), n(138));
  ctx.lineTo(n(38), n(138));
  ctx.closePath();
  ctx.fillStyle = outfitColor;
  ctx.fill();
  ctx.strokeStyle = '#1d1b19';
  ctx.lineWidth = n(2.4);
  ctx.stroke();

  // Outfit Details
  if (config.outfit === 'blazer') {
    // White shirt triangle
    ctx.beginPath();
    ctx.moveTo(n(80), n(106));
    ctx.lineTo(n(72), n(92));
    ctx.lineTo(n(88), n(92));
    ctx.closePath();
    ctx.fillStyle = '#ffffff';
    ctx.fill();
    ctx.stroke();

    // Red/Gold tie
    ctx.beginPath();
    ctx.moveTo(n(78), n(98));
    ctx.lineTo(n(82), n(98));
    ctx.lineTo(n(84), n(122));
    ctx.lineTo(n(80), n(126));
    ctx.lineTo(n(76), n(122));
    ctx.closePath();
    ctx.fillStyle = '#9f3c16';
    ctx.fill();
  } else if (config.outfit === 'hoodie') {
    // Drawstrings
    ctx.beginPath();
    ctx.moveTo(n(74), n(98));
    ctx.lineTo(n(74), n(118));
    ctx.moveTo(n(86), n(98));
    ctx.lineTo(n(86), n(118));
    ctx.strokeStyle = '#ffffff';
    ctx.lineWidth = n(2);
    ctx.stroke();
  } else if (config.outfit === 'cardigan') {
    // Center button line
    ctx.beginPath();
    ctx.moveTo(n(80), n(96));
    ctx.lineTo(n(80), n(138));
    ctx.strokeStyle = '#1d1b19';
    ctx.lineWidth = n(1.8);
    ctx.stroke();

    // Buttons
    [n(104), n(116), n(128)].forEach((y) => {
      ctx.beginPath();
      ctx.arc(n(80), y, n(2), 0, Math.PI * 2);
      ctx.fillStyle = '#ffffff';
      ctx.fill();
    });
  }

  // 4. Neck & Face
  // Neck
  ctx.beginPath();
  ctx.rect(n(73), n(84), n(14), n(16));
  ctx.fillStyle = skin;
  ctx.fill();
  ctx.strokeStyle = '#1d1b19';
  ctx.lineWidth = n(2);
  ctx.stroke();

  // Head Base
  ctx.beginPath();
  ctx.ellipse(n(80), n(64), n(25), n(28), 0, 0, Math.PI * 2);
  ctx.fillStyle = skin;
  ctx.fill();
  ctx.strokeStyle = '#1d1b19';
  ctx.lineWidth = n(2.4);
  ctx.stroke();

  // Ears
  ctx.beginPath();
  ctx.arc(n(55), n(65), n(5), 0, Math.PI * 2);
  ctx.arc(n(105), n(65), n(5), 0, Math.PI * 2);
  ctx.fillStyle = skin;
  ctx.fill();
  ctx.stroke();

  // Cheeks / Blush
  ctx.beginPath();
  ctx.arc(n(66), n(70), n(4), 0, Math.PI * 2);
  ctx.arc(n(94), n(70), n(4), 0, Math.PI * 2);
  ctx.fillStyle = 'rgba(250, 114, 104, 0.35)';
  ctx.fill();

  // 5. Facial Expression
  ctx.strokeStyle = '#1d1b19';
  ctx.fillStyle = '#1d1b19';
  ctx.lineWidth = n(2);
  ctx.lineCap = 'round';

  if (config.expression === 'wink') {
    // Left eye open
    ctx.beginPath();
    ctx.arc(n(70), n(63), n(2.5), 0, Math.PI * 2);
    ctx.fill();
    // Right eye wink arc
    ctx.beginPath();
    ctx.arc(n(90), n(63), n(4), Math.PI * 0.1, Math.PI * 0.9);
    ctx.stroke();
    // Big smile
    ctx.beginPath();
    ctx.arc(n(80), n(74), n(6), 0, Math.PI);
    ctx.stroke();
  } else if (config.expression === 'smile' || config.expression === 'calm') {
    // Both joyful arched eyes
    ctx.beginPath();
    ctx.arc(n(70), n(62), n(3.5), Math.PI, 0);
    ctx.stroke();
    ctx.beginPath();
    ctx.arc(n(90), n(62), n(3.5), Math.PI, 0);
    ctx.stroke();
    // Warm smile
    ctx.beginPath();
    ctx.arc(n(80), n(73), n(5), 0, Math.PI);
    ctx.stroke();
  } else if (config.expression === 'determined') {
    // Confident dot eyes
    ctx.beginPath();
    ctx.arc(n(70), n(63), n(2.8), 0, Math.PI * 2);
    ctx.arc(n(90), n(63), n(2.8), 0, Math.PI * 2);
    ctx.fill();
    // Determined eyebrows
    ctx.beginPath();
    ctx.moveTo(n(66), n(57));
    ctx.lineTo(n(74), n(58));
    ctx.moveTo(n(94), n(57));
    ctx.lineTo(n(86), n(58));
    ctx.stroke();
    // Confident line mouth
    ctx.beginPath();
    ctx.moveTo(n(75), n(74));
    ctx.lineTo(n(85), n(74));
    ctx.stroke();
  } else {
    // 'focus' or 'studious' (default)
    ctx.beginPath();
    ctx.arc(n(70), n(63), n(2.8), 0, Math.PI * 2);
    ctx.arc(n(90), n(63), n(2.8), 0, Math.PI * 2);
    ctx.fill();
    // Eyebrows
    ctx.beginPath();
    ctx.moveTo(n(67), n(57));
    ctx.lineTo(n(73), n(57));
    ctx.moveTo(n(87), n(57));
    ctx.lineTo(n(93), n(57));
    ctx.stroke();
    // Focused slight smile
    ctx.beginPath();
    ctx.arc(n(80), n(74), n(4), 0, Math.PI);
    ctx.stroke();
  }

  // 6. Hair Styles
  ctx.fillStyle = hairColor;
  ctx.strokeStyle = '#1d1b19';
  ctx.lineWidth = n(2.2);

  if (config.hairStyle === 'curly') {
    // Afro curls
    [
      [n(55), n(48), n(12)],
      [n(68), n(42), n(13)],
      [n(80), n(39), n(14)],
      [n(92), n(42), n(13)],
      [n(105), n(48), n(12)],
      [n(54), n(60), n(9)],
      [n(106), n(60), n(9)],
    ].forEach(([x, y, r]) => {
      ctx.beginPath();
      ctx.arc(x, y, r, 0, Math.PI * 2);
      ctx.fill();
      ctx.stroke();
    });
  } else if (config.hairStyle === 'ponytail') {
    // Top ponytail puff
    ctx.beginPath();
    ctx.arc(n(102), n(40), n(12), 0, Math.PI * 2);
    ctx.fill();
    ctx.stroke();

    // Hair cap
    ctx.beginPath();
    ctx.arc(n(80), n(58), n(25), Math.PI * 0.9, Math.PI * 2.1);
    ctx.fill();
    ctx.stroke();
  } else if (config.hairStyle === 'bun') {
    // High top knot
    ctx.beginPath();
    ctx.arc(n(80), n(34), n(11), 0, Math.PI * 2);
    ctx.fill();
    ctx.stroke();

    // Smooth head cap
    ctx.beginPath();
    ctx.arc(n(80), n(58), n(25), Math.PI * 0.85, Math.PI * 2.15);
    ctx.fill();
    ctx.stroke();
  } else if (config.hairStyle === 'crop' || config.hairStyle === 'buzz') {
    // Neat short crop
    ctx.beginPath();
    ctx.arc(n(80), n(60), n(26), Math.PI, 0);
    ctx.fill();
    ctx.stroke();
  } else if (config.hairStyle === 'wavy' || config.hairStyle === 'dreads') {
    // Shoulder length waves
    ctx.beginPath();
    ctx.moveTo(n(55), n(85));
    ctx.quadraticCurveTo(n(52), n(50), n(80), n(38));
    ctx.quadraticCurveTo(n(108), n(50), n(105), n(85));
    ctx.quadraticCurveTo(n(98), n(70), n(96), n(55));
    ctx.quadraticCurveTo(n(80), n(46), n(64), n(55));
    ctx.closePath();
    ctx.fill();
    ctx.stroke();
  } else {
    // 'swoop' (default)
    ctx.beginPath();
    ctx.moveTo(n(54), n(65));
    ctx.quadraticCurveTo(n(52), n(40), n(80), n(38));
    ctx.quadraticCurveTo(n(110), n(42), n(106), n(65));
    ctx.quadraticCurveTo(n(98), n(52), n(85), n(52));
    ctx.quadraticCurveTo(n(70), n(52), n(54), n(65));
    ctx.closePath();
    ctx.fill();
    ctx.stroke();
  }

  // 7. Eyewear
  if (config.glasses === 'round') {
    ctx.lineWidth = n(2);
    ctx.strokeStyle = '#c85a32';
    // Left circle
    ctx.beginPath();
    ctx.arc(n(70), n(63), n(7), 0, Math.PI * 2);
    ctx.stroke();
    // Right circle
    ctx.beginPath();
    ctx.arc(n(90), n(63), n(7), 0, Math.PI * 2);
    ctx.stroke();
    // Bridge
    ctx.beginPath();
    ctx.moveTo(n(77), n(63));
    ctx.lineTo(n(83), n(63));
    ctx.stroke();
  } else if (config.glasses === 'square' || config.glasses === 'cateye') {
    ctx.lineWidth = n(2.2);
    ctx.strokeStyle = '#19202e';
    ctx.strokeRect(n(63), n(57), n(13), n(12));
    ctx.strokeRect(n(84), n(57), n(13), n(12));
    ctx.beginPath();
    ctx.moveTo(n(76), n(63));
    ctx.lineTo(n(84), n(63));
    ctx.stroke();
  }

  // 8. Headgear & Accessories
  if (config.accessory === 'headphones') {
    // Headband
    ctx.beginPath();
    ctx.arc(n(80), n(52), n(28), Math.PI * 0.9, Math.PI * 2.1);
    ctx.strokeStyle = '#19202e';
    ctx.lineWidth = n(3.5);
    ctx.stroke();

    // Ear pads
    ctx.fillStyle = '#fcd34d';
    ctx.strokeStyle = '#19202e';
    ctx.lineWidth = n(1.8);
    // Left cup
    ctx.beginPath();
    ctx.roundRect(n(50), n(58), n(7), n(16), n(3.5));
    ctx.fill();
    ctx.stroke();
    // Right cup
    ctx.beginPath();
    ctx.roundRect(n(103), n(58), n(7), n(16), n(3.5));
    ctx.fill();
    ctx.stroke();
  } else if (config.accessory === 'pencil') {
    // 2B pencil tucked behind right ear
    ctx.save();
    ctx.translate(n(102), n(54));
    ctx.rotate(-0.5);
    ctx.fillStyle = '#fcd34d';
    ctx.fillRect(0, 0, n(5), n(26));
    ctx.fillStyle = '#fa7268';
    ctx.fillRect(0, n(22), n(5), n(4));
    ctx.restore();
  } else if (config.accessory === 'mortarboard') {
    // Academic Cap
    ctx.fillStyle = '#19202e';
    ctx.beginPath();
    ctx.moveTo(n(80), n(30));
    ctx.lineTo(n(110), n(42));
    ctx.lineTo(n(80), n(48));
    ctx.lineTo(n(50), n(42));
    ctx.closePath();
    ctx.fill();
    ctx.stroke();
    // Tassel
    ctx.beginPath();
    ctx.moveTo(n(80), n(42));
    ctx.lineTo(n(102), n(46));
    ctx.lineTo(n(104), n(58));
    ctx.strokeStyle = '#fcd34d';
    ctx.lineWidth = n(1.8);
    ctx.stroke();
  } else if (config.accessory === 'beanie') {
    ctx.fillStyle = '#c85a32';
    ctx.beginPath();
    ctx.arc(n(80), n(52), n(26), Math.PI * 0.9, Math.PI * 2.1);
    ctx.fill();
    ctx.stroke();
  }

  // 9. Study Badge Prop (Desk Foreground Right)
  const prop = config.badgeProp || (config.petMascot === 'tea' ? 'tea' : 'flame');
  if (prop === 'flame') {
    // Flame Streak Badge
    ctx.beginPath();
    ctx.arc(n(124), n(118), n(12), 0, Math.PI * 2);
    ctx.fillStyle = '#fef0ea';
    ctx.fill();
    ctx.strokeStyle = '#c85a32';
    ctx.lineWidth = n(1.5);
    ctx.stroke();

    ctx.font = `${Math.round(n(13))}px sans-serif`;
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillText('ðŸ”¥', n(124), n(119));
  } else if (prop === 'tea') {
    // Ceylon Tea Cup
    ctx.fillStyle = '#ffffff';
    ctx.strokeStyle = '#19202e';
    ctx.lineWidth = n(1.8);
    ctx.strokeRect(n(116), n(112), n(14), n(14));
    ctx.fillRect(n(116), n(112), n(14), n(14));
    ctx.font = `${Math.round(n(11))}px sans-serif`;
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillText('â˜•', n(123), n(119));
  } else if (prop === 'star') {
    // Star
    ctx.font = `${Math.round(n(14))}px sans-serif`;
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillText('â­', n(124), n(118));
  } else if (prop === 'book') {
    ctx.font = `${Math.round(n(14))}px sans-serif`;
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillText('ðŸ“–', n(124), n(118));
  }
}

interface ScholarCustomAvatarProps {
  config?: Partial<ScholarAvatarConfig>;
  className?: string;
  size?: number;
}

export const ScholarCustomAvatar: React.FC<ScholarCustomAvatarProps> = ({
  config = {},
  className,
  size,
}) => {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const cfg = { ...DEFAULT_AVATAR_CONFIG, ...config };
  const avatarSize = size || cfg.size || 140;

  useEffect(() => {
    if (canvasRef.current) {
      const dpr = typeof window !== 'undefined' ? Math.min(window.devicePixelRatio || 2, 3) : 2;
      renderAvatarToCanvas({ ...cfg, size: avatarSize }, canvasRef.current, dpr);
    }
  }, [cfg, avatarSize]);

  return (
    <div
      style={{ width: avatarSize, height: avatarSize }}
      className={cn('relative inline-flex items-center justify-center select-none overflow-hidden rounded-full shadow-xs', className)}
    >
      <canvas
        ref={canvasRef}
        style={{ width: avatarSize, height: avatarSize }}
        className="w-full h-full block"
      />
    </div>
  );
};
