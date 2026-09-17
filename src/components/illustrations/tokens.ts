/**
 * Monoline Vector Illustration Palette & Styling Tokens
 * StudySync LMS Platform — Authoritative Visual System
 */

import type { SVGProps } from 'react';

export const MONOLINE_COLORS = {
  contour: '#19202e',
  surface: '#ffffff',
  spotPink: '#fa7268',
  spotYellow: '#fcd34d',
  spotOrange: '#fb923c',
} as const;

export const MONOLINE_STROKE = {
  width: 1.75,
  minWidth: 1.5,
  maxWidth: 2.0,
  linecap: 'round' as const,
  linejoin: 'round' as const,
  vectorEffect: 'non-scaling-stroke' as const,
} as const;

export interface MonolineIllustrationProps extends SVGProps<SVGSVGElement> {
  className?: string;
  size?: number | string;
  animated?: boolean;
  strokeWidth?: number;
  spotColor?: string;
}
