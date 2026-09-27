import React from 'react';

export interface IllustrationProps extends React.SVGProps<SVGSVGElement> {
  className?: string;
  size?: number | string;
  width?: number | string;
  height?: number | string;
  strokeWidth?: number;
}
