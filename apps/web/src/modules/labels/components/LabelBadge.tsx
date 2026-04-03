'use client';

import React from 'react';
import { Label } from '../types/labels.types';

interface LabelBadgeProps {
  label: Label;
  onClick?: () => void;
}

/**
 * LabelBadge component - Compact label display for task cards
 * Shows colored dot + abbreviated text with tooltip
 */
export const LabelBadge: React.FC<LabelBadgeProps> = ({ label, onClick }) => {
  return (
    <div
      onClick={onClick}
      className={`flex items-center gap-1 px-2 py-1 rounded text-xs font-medium transition-colors ${
        onClick ? 'cursor-pointer hover:opacity-80' : ''
      }`}
      style={{
        backgroundColor: `${label.color}20`,
        color: label.color,
      }}
      title={label.name}
    >
      <div
        className="w-1.5 h-1.5 rounded-full flex-shrink-0"
        style={{ backgroundColor: label.color }}
      />
      <span className="truncate max-w-[60px]">{label.name}</span>
    </div>
  );
};
