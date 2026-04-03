'use client';

import React, { useRef } from 'react';

interface ColorPickerProps {
  value: string; // Hex color #RRGGBB
  onChange: (color: string) => void;
  label?: string;
  error?: string;
}

/**
 * ColorPicker component - Hex color input with preview
 * Shows inline color input with live preview square
 */
export const ColorPicker: React.FC<ColorPickerProps> = ({
  value,
  onChange,
  label = 'Color',
  error,
}) => {
  const inputRef = useRef<HTMLInputElement>(null);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    let color = e.target.value.toUpperCase();

    // Add # if not present
    if (!color.startsWith('#')) {
      color = '#' + color;
    }

    // Ensure it's 7 characters (#RRGGBB)
    if (color.length === 7) {
      onChange(color);
    }
  };

  const isValidColor = /^#[0-9A-Fa-f]{6}$/.test(value);

  return (
    <div className="space-y-2">
      <label className="block text-sm font-medium text-slate-700 dark:text-slate-300">
        {label}
      </label>

      <div className="flex items-center gap-3">
        {/* Color preview square */}
        <div
          className="w-12 h-12 rounded-lg border-2 border-slate-200 dark:border-slate-700 flex-shrink-0 transition-all"
          style={{
            backgroundColor: isValidColor ? value : '#CCC',
            borderColor: isValidColor ? value : '#999',
          }}
        />

        {/* Hex input */}
        <input
          ref={inputRef}
          type="text"
          value={value}
          onChange={handleChange}
          placeholder="#8B5CF6"
          className={`flex-1 px-3 py-2 rounded-lg border text-sm font-mono transition-colors ${
            error
              ? 'border-red-300 dark:border-red-700 bg-red-50 dark:bg-red-900/20 text-red-700 dark:text-red-300'
              : 'border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-800 text-slate-900 dark:text-white'
          }`}
        />
      </div>

      {error && <p className="text-xs text-red-600 dark:text-red-400">{error}</p>}
      {!error && (
        <p className="text-xs text-slate-500 dark:text-slate-400">Format: #RRGGBB</p>
      )}
    </div>
  );
};
