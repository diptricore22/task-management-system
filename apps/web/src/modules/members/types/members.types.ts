/**
 * Member Management Types
 * Type definitions for project member management
 */

export type MemberRole = 'ADMIN' | 'MEMBER' | 'VIEWER';

export interface ProjectMember {
  id: string;
  name: string;
  email: string;
  role: MemberRole;
  joined_at: string;
}

export interface AddMemberPayload {
  user_id: string;
  role: MemberRole;
}

export interface UpdateMemberRolePayload {
  role: MemberRole;
}

export interface ProjectMembersResponse {
  members: ProjectMember[];
}

export interface AddMemberResponse {
  member: ProjectMember;
  message?: string;
}

export interface UpdateMemberResponse {
  member: ProjectMember;
  message?: string;
}

export interface RemoveMemberResponse {
  message?: string;
}

// User search result type for adding members
export interface UserSearchResult {
  id: string;
  name: string;
  email: string;
}
