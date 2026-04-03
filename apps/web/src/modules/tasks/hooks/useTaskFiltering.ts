'use client';

import { useState, useCallback, useEffect } from 'react';
import {
  FilterState,
  TaskStatus,
  TaskPriority,
  SortOption,
  DEFAULT_FILTER_STATE,
} from '../types/filters.types';

interface UseTaskFilteringResult {
  filterState: FilterState;
  setStatuses: (statuses: TaskStatus[]) => void;
  toggleStatus: (status: TaskStatus) => void;
  setPriorities: (priorities: TaskPriority[]) => void;
  togglePriority: (priority: TaskPriority) => void;
  setLabelIds: (labelIds: string[]) => void;
  toggleLabel: (labelId: string) => void;
  setAssigneeId: (assigneeId: string | null) => void;
  setDueDateFrom: (date: string | null) => void;
  setDueDateTo: (date: string | null) => void;
  setSort: (sort: SortOption) => void;
  setPage: (page: number) => void;
  clearAllFilters: () => void;
  hasActiveFilters: boolean;
}

/**
 * Hook to manage task filtering with URL state persistence
 * Syncs filter state to URL query parameters for shareable views
 * Parses URL params on mount to restore filter state
 */
export function useTaskFiltering(): UseTaskFilteringResult {
  const [filterState, setFilterState] = useState<FilterState>(DEFAULT_FILTER_STATE);

  // Parse URL params on mount
  useEffect(() => {
    if (typeof window === 'undefined') return;

    const params = new URLSearchParams(window.location.search);
    const newState: FilterState = { ...DEFAULT_FILTER_STATE };

    // Parse status (comma-separated)
    const statusStr = params.get('status');
    if (statusStr) {
      newState.statuses = statusStr.split(',').filter(Boolean) as TaskStatus[];
    }

    // Parse priority (comma-separated)
    const priorityStr = params.get('priority');
    if (priorityStr) {
      newState.priorities = priorityStr.split(',').filter(Boolean) as TaskPriority[];
    }

    // Parse labels (comma-separated)
    const labelsStr = params.get('labels');
    if (labelsStr) {
      newState.labelIds = labelsStr.split(',').filter(Boolean);
    }

    // Parse assignee
    const assigneeId = params.get('assignee_id');
    if (assigneeId) {
      newState.assigneeId = assigneeId;
    }

    // Parse due date range
    const dueDateFrom = params.get('due_date_from');
    if (dueDateFrom) {
      newState.dueDateFrom = dueDateFrom;
    }

    const dueDateTo = params.get('due_date_to');
    if (dueDateTo) {
      newState.dueDateTo = dueDateTo;
    }

    // Parse sort
    const sort = params.get('sort');
    if (sort && ['created_at_desc', 'due_date_asc', 'priority_desc', 'title_asc'].includes(sort)) {
      newState.sort = sort as SortOption;
    }

    // Parse pagination
    const page = params.get('page');
    if (page) {
      const pageNum = parseInt(page, 10);
      if (pageNum >= 1) {
        newState.page = pageNum;
      }
    }

    const limit = params.get('limit');
    if (limit) {
      const limitNum = parseInt(limit, 10);
      if (limitNum >= 1 && limitNum <= 100) {
        newState.limit = limitNum;
      }
    }

    setFilterState(newState);
  }, []);

  // Debounced URL update
  useEffect(() => {
    if (typeof window === 'undefined') return;

    const timer = setTimeout(() => {
      const params = new URLSearchParams();

      if (filterState.statuses.length > 0) {
        params.set('status', filterState.statuses.join(','));
      }

      if (filterState.priorities.length > 0) {
        params.set('priority', filterState.priorities.join(','));
      }

      if (filterState.labelIds.length > 0) {
        params.set('labels', filterState.labelIds.join(','));
      }

      if (filterState.assigneeId) {
        params.set('assignee_id', filterState.assigneeId);
      }

      if (filterState.dueDateFrom) {
        params.set('due_date_from', filterState.dueDateFrom);
      }

      if (filterState.dueDateTo) {
        params.set('due_date_to', filterState.dueDateTo);
      }

      if (filterState.sort !== 'created_at_desc') {
        params.set('sort', filterState.sort);
      }

      if (filterState.page !== 1) {
        params.set('page', String(filterState.page));
      }

      if (filterState.limit !== 20) {
        params.set('limit', String(filterState.limit));
      }

      const newUrl = params.toString()
        ? `${window.location.pathname}?${params.toString()}`
        : window.location.pathname;

      window.history.replaceState(null, '', newUrl);
    }, 500); // Debounce 500ms

    return () => clearTimeout(timer);
  }, [filterState]);

  const setStatuses = useCallback((statuses: TaskStatus[]) => {
    setFilterState((prev) => ({ ...prev, statuses, page: 1 }));
  }, []);

  const toggleStatus = useCallback((status: TaskStatus) => {
    setFilterState((prev) => ({
      ...prev,
      statuses: prev.statuses.includes(status)
        ? prev.statuses.filter((s) => s !== status)
        : [...prev.statuses, status],
      page: 1,
    }));
  }, []);

  const setPriorities = useCallback((priorities: TaskPriority[]) => {
    setFilterState((prev) => ({ ...prev, priorities, page: 1 }));
  }, []);

  const togglePriority = useCallback((priority: TaskPriority) => {
    setFilterState((prev) => ({
      ...prev,
      priorities: prev.priorities.includes(priority)
        ? prev.priorities.filter((p) => p !== priority)
        : [...prev.priorities, priority],
      page: 1,
    }));
  }, []);

  const setLabelIds = useCallback((labelIds: string[]) => {
    setFilterState((prev) => ({ ...prev, labelIds, page: 1 }));
  }, []);

  const toggleLabel = useCallback((labelId: string) => {
    setFilterState((prev) => ({
      ...prev,
      labelIds: prev.labelIds.includes(labelId)
        ? prev.labelIds.filter((id) => id !== labelId)
        : [...prev.labelIds, labelId],
      page: 1,
    }));
  }, []);

  const setAssigneeId = useCallback((assigneeId: string | null) => {
    setFilterState((prev) => ({ ...prev, assigneeId, page: 1 }));
  }, []);

  const setDueDateFrom = useCallback((date: string | null) => {
    setFilterState((prev) => ({ ...prev, dueDateFrom: date, page: 1 }));
  }, []);

  const setDueDateTo = useCallback((date: string | null) => {
    setFilterState((prev) => ({ ...prev, dueDateTo: date, page: 1 }));
  }, []);

  const setSort = useCallback((sort: SortOption) => {
    setFilterState((prev) => ({ ...prev, sort, page: 1 }));
  }, []);

  const setPage = useCallback((page: number) => {
    setFilterState((prev) => ({ ...prev, page }));
  }, []);

  const clearAllFilters = useCallback(() => {
    setFilterState({ ...DEFAULT_FILTER_STATE });
  }, []);

  const hasActiveFilters =
    filterState.statuses.length > 0 ||
    filterState.priorities.length > 0 ||
    filterState.labelIds.length > 0 ||
    filterState.assigneeId !== null ||
    filterState.dueDateFrom !== null ||
    filterState.dueDateTo !== null;

  return {
    filterState,
    setStatuses,
    toggleStatus,
    setPriorities,
    togglePriority,
    setLabelIds,
    toggleLabel,
    setAssigneeId,
    setDueDateFrom,
    setDueDateTo,
    setSort,
    setPage,
    clearAllFilters,
    hasActiveFilters,
  };
}
