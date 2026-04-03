'use client';

/**
 * Labels Module - Type Definitions
 * Mirror backend label structures for type-safe CRUD operations
 */

export interface Label {
  id: string;
  project_id: string;
  name: string;
  color: string; // Hex format #RRGGBB
  created_at: string; // ISO 8601
  updated_at: string; // ISO 8601
}

export interface CreateLabelRequest {
  name: string; // Required, 1-50 chars
  color: string; // Required, hex format #RRGGBB
}

export interface UpdateLabelRequest {
  name?: string; // Optional, 1-50 chars
  color?: string; // Optional, hex format #RRGGBB
}

export interface ProjectLabelsResponse {
  labels: Label[];
}
