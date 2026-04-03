'use client';

import React from 'react';
import { X } from 'lucide-react';
import { Label } from '../types/labels.types';

interface LabelChipProps {
  label: Label;
  removable?: boolean;
  onRemove?: () => void;
  onClick?: () => void;
}

/**
 * LabelChip component - Reusable label display with color
 * Shows colored square + label name, optional X button for removal
 */
export const LabelChip: React.FC<LabelChipProps> = ({
  label,
  removable = false,
  onRemove,
  onClick,
}) => {
  return (
    <div
      onClick={onClick}
      className={`flex items-center gap-2 px-3 py-1.5 rounded-full text-sm font-medium transition-colors ${
        onClick ? 'cursor-pointer hover:opacity-80' : ''
      }`}
      style={{
        backgroundColor: `${label.color}20`,
        color: label.color,
        border: `1px solid ${label.color}40`,
      }}
    >
      <div
        className="w-2 h-2 rounded-full flex-shrink-0"
        style={{ backgroundColor: label.color }}
      />
      <span>{label.name}</span>

      {removable && (
        <button
          onClick={(e) => {
            e.stopPropagation();
            onRemove?.();
          }}
          className="ml-1 p-0.5 hover:opacity-70 transition-opacity flex-shrink-0"
          title="Remove label"
        >
          <X className="w-3 h-3" />
        </button>
      )}
    </div>
  );
};
