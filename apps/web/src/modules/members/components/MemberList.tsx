'use client';

import React, { useState } from 'react';
import type { ProjectMember, MemberRole } from '../types/members.types';
import { useRemoveMember } from '../hooks/useRemoveMember';
import { useUpdateMemberRole } from '../hooks/useUpdateMemberRole';
import { RemoveMemberModal } from './RemoveMemberModal';

interface MemberListProps {
  projectId: string;
  members: ProjectMember[];
  currentUserId?: string;
  onMemberRemoved: () => void;
  onMemberRoleUpdated: () => void;
}

const ROLE_OPTIONS: Array<{ value: MemberRole; label: string }> = [
  { value: 'ADMIN', label: 'Admin' },
  { value: 'MEMBER', label: 'Member' },
  { value: 'VIEWER', label: 'Viewer' },
];

/**
 * MemberList Component
 * Displays project members with role management and remove functionality
 */
export function MemberList({
  projectId,
  members,
  currentUserId,
  onMemberRemoved,
  onMemberRoleUpdated,
}: MemberListProps) {
  const [memberToRemove, setMemberToRemove] = useState<ProjectMember | null>(null);
  const [updatingRoleForId, setUpdatingRoleForId] = useState<string | null>(null);

  const { loading: removeLoading, removeMember } = useRemoveMember({
    onSuccess: () => {
      setMemberToRemove(null);
      onMemberRemoved();
    },
  });

  const { loading: updateLoading, updateRole } = useUpdateMemberRole({
    onSuccess: () => {
      setUpdatingRoleForId(null);
      onMemberRoleUpdated();
    },
  });

  const handleRemoveClick = (member: ProjectMember) => {
    setMemberToRemove(member);
  };

  const handleRemoveConfirm = async () => {
    if (!memberToRemove) return;
    await removeMember(projectId, memberToRemove.id);
  };

  const handleRoleChange = async (member: ProjectMember, newRole: MemberRole) => {
    if (newRole === member.role) return;

    setUpdatingRoleForId(member.id);
    await updateRole(projectId, member.id, { role: newRole });
  };

  if (members.length === 0) {
    return (
      <div className="text-center py-12 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg">
        <p className="text-slate-500 dark:text-slate-400">No members found in this project</p>
      </div>
    );
  }

  return (
    <>
      <div className="bg-white dark:bg-slate-800 rounded-lg border border-slate-200 dark:border-slate-700 overflow-hidden">
        <table className="w-full">
          <thead className="bg-slate-50 dark:bg-slate-900/50 border-b border-slate-200 dark:border-slate-700">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 dark:text-slate-400 uppercase tracking-wider">
                Member
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 dark:text-slate-400 uppercase tracking-wider">
                Role
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 dark:text-slate-400 uppercase tracking-wider">
                Joined
              </th>
              <th className="px-6 py-3 text-right text-xs font-medium text-slate-500 dark:text-slate-400 uppercase tracking-wider">
                Actions
              </th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-200 dark:divide-slate-700">
            {members.map((member) => {
              const isCurrentUser = member.id === currentUserId;
              const isUpdating = updatingRoleForId === member.id;

              return (
                <tr
                  key={member.id}
                  className="hover:bg-slate-50 dark:hover:bg-slate-700/50 transition-colors"
                >
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div>
                      <p className="text-sm font-medium text-slate-900 dark:text-white">
                        {member.name}
                        {isCurrentUser && (
                          <span className="ml-2 text-xs text-violet-600 dark:text-violet-400">
                            (You)
                          </span>
                        )}
                      </p>
                      <p className="text-xs text-slate-500 dark:text-slate-400">{member.email}</p>
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <select
                      value={member.role}
                      onChange={(e) => handleRoleChange(member, e.target.value as MemberRole)}
                      disabled={isUpdating || updateLoading}
                      className="text-sm px-3 py-1.5 rounded-lg border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-700 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-violet-500 focus:border-violet-500 disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      {ROLE_OPTIONS.map((option) => (
                        <option key={option.value} value={option.value}>
                          {option.label}
                        </option>
                      ))}
                    </select>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-slate-600 dark:text-slate-400">
                    {new Date(member.joined_at).toLocaleDateString('en-US', {
                      month: 'short',
                      day: 'numeric',
                      year: 'numeric',
                    })}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-right">
                    <button
                      type="button"
                      onClick={() => handleRemoveClick(member)}
                      disabled={isUpdating || updateLoading}
                      className="text-sm text-red-600 hover:text-red-700 dark:text-red-400 dark:hover:text-red-300 font-medium transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      Remove
                    </button>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>

      {/* Remove confirmation modal */}
      <RemoveMemberModal
        isOpen={!!memberToRemove}
        memberName={memberToRemove?.name ?? ''}
        onConfirm={handleRemoveConfirm}
        onCancel={() => setMemberToRemove(null)}
        loading={removeLoading}
      />
    </>
  );
}
