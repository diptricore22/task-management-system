/**
 * Labels Module - Type Definitions
 */

export interface CreateLabelRequest {
  name: string; // Required, max 50 chars, unique per project
  color: string; // Required, hex color (#RRGGBB)
}

export interface UpdateLabelRequest {
  name?: string; // Optional, max 50 chars
  color?: string; // Optional, hex color
}

export interface LabelResponse {
  id: string;
  project_id: string;
  name: string;
  color: string;
  created_at: string;
  updated_at: string;
}

export interface ProjectLabelsResponse {
  labels: LabelResponse[];
}

export interface TaskLabelsResponse {
  labels: LabelResponse[];
}
