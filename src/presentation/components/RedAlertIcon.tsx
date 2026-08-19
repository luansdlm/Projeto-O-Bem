import React from 'react';

interface RedAlertIconProps {
  size?: number;
  className?: string;
}

export default function RedAlertIcon({ size = 24, className = "" }: RedAlertIconProps) {
  return (
    <svg 
      viewBox="0 0 100 100" 
      width={size} 
      height={size} 
      className={className} 
      fill="none" 
      xmlns="http://www.w3.org/2000/svg"
    >
      {/* Outer Red Octagon */}
      <polygon 
        points="30 2, 70 2, 98 30, 98 70, 70 98, 30 98, 2 70, 2 30" 
        className="fill-rose-600 dark:fill-rose-500" 
        fill="#DC2626"
      />
      {/* Concentric Inner White Octagon Border */}
      <polygon 
        points="33 11, 67 11, 89 33, 89 67, 67 89, 33 89, 11 67, 11 33" 
        stroke="white" 
        strokeWidth="8" 
        fill="none" 
      />
      {/* Center Horizontal White Bar/Rectangle */}
      <rect 
        x="24" 
        y="41" 
        width="52" 
        height="18" 
        fill="white" 
        rx="2"
      />
    </svg>
  );
}
