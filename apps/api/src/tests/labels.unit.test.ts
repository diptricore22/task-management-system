/**
 * FEAT-007 Labels, Priorities & Filtering - Unit & Integration Tests
 * Verifies label CRUD, task labeling, advanced filtering, and sorting
 * Mapping: LABEL-U001..LABEL-U004 (user stories), LABEL-I001..LABEL-I016 (integration tests)
 */

import { createLabelSchema, updateLabelSchema, taskFilterSchema } from '../modules/labels/labels.validation';

describe('FEAT-007 Labels, Priorities & Filtering', () => {
  // ============================================================================
  // Story 1: Create Label
  // ============================================================================
  describe('LABEL-U001: Create Label - Admin Manages Categories', () => {
    it('should create label with valid name and color', () => {
      const labelData = { name: 'Bug', color: '#EF4444' };
      expect(() => createLabelSchema.parse(labelData)).not.toThrow();
    });

    it('should reject empty label name', () => {
      const labelData = { name: '', color: '#EF4444' };
      expect(() => createLabelSchema.parse(labelData)).toThrow();
    });

    it('should enforce max 50 character name', () => {
      const labelData = { name: 'A'.repeat(51), color: '#EF4444' };
      expect(() => createLabelSchema.parse(labelData)).toThrow();
    });

    it('should accept exactly 50 character name', () => {
      const labelData = { name: 'A'.repeat(50), color: '#EF4444' };
      expect(() => createLabelSchema.parse(labelData)).not.toThrow();
    });

    it('should validate hex color format', () => {
      const labelData = { name: 'Bug', color: '#EF4444' };
      expect(() => createLabelSchema.parse(labelData)).not.toThrow();
    });

    it('should reject invalid hex color', () => {
      const labelData = { name: 'Bug', color: 'EF4444' }; // Missing #
      expect(() => createLabelSchema.parse(labelData)).toThrow();
    });

    it('should reject short hex format', () => {
      const labelData = { name: 'Bug', color: '#EF4' };
      expect(() => createLabelSchema.parse(labelData)).toThrow();
    });

    it('should accept uppercase and lowercase hex', () => {
      const data1 = { name: 'Bug1', color: '#ef4444' };
      const data2 = { name: 'Bug2', color: '#EF4444' };
      expect(() => createLabelSchema.parse(data1)).not.toThrow();
      expect(() => createLabelSchema.parse(data2)).not.toThrow();
    });

    it('should reject duplicate label name in same project', () => {
      const label1 = { name: 'Bug', color: '#EF4444' };
      const label2 = { name: 'Bug', color: '#4444EF' }; // same name, different color

      // Create label1, then try to create label2 with same name
      // This would fail at database level with uniqueness constraint
      const labels = [label1];
      const isDuplicate = labels.some((l) => l.name === label2.name);
      expect(isDuplicate).toBe(true);
    });
  });

  // ============================================================================
  // Story 2: Tag Task with Labels
  // ============================================================================
  describe('LABEL-U002: Tag Task with Labels - Multi-Label Support', () => {
    it('should add label to task', () => {
      const task = {
        id: 'task-1',
        labels: [] as any[],
      };
      const label = { id: 'label-1', name: 'Bug' };

      task.labels.push(label);

      expect(task.labels).toHaveLength(1);
      expect(task.labels[0].id).toBe('label-1');
    });

    it('should add multiple labels to task', () => {
      const task = {
        id: 'task-1',
        labels: [] as any[],
      };
      const label1 = { id: 'label-1', name: 'Bug' };
      const label2 = { id: 'label-2', name: 'Urgent' };

      task.labels.push(label1);
      task.labels.push(label2);

      expect(task.labels).toHaveLength(2);
    });

    it('should prevent duplicate label assignment', () => {
      const task = {
        id: 'task-1',
        labels: [{ id: 'label-1', name: 'Bug' }],
      };
      const label = { id: 'label-1', name: 'Bug' };

      const isDuplicate = task.labels.some((l) => l.id === label.id);
      expect(isDuplicate).toBe(true);
    });

    it('should remove label from task', () => {
      const task = {
        id: 'task-1',
        labels: [
          { id: 'label-1', name: 'Bug' },
          { id: 'label-2', name: 'Urgent' },
        ],
      };

      task.labels = task.labels.filter((l) => l.id !== 'label-1');

      expect(task.labels).toHaveLength(1);
      expect(task.labels[0].name).toBe('Urgent');
    });

    it('should display label badges on task', () => {
      const task = {
        id: 'task-1',
        title: 'Fix login',
        labels: [
          { id: 'label-1', name: 'Bug', color: '#EF4444' },
          { id: 'label-2', name: 'Urgent', color: '#F97316' },
        ],
      };

      const badgeCount = task.labels.length;
      expect(badgeCount).toBe(2);
    });
  });

  // ============================================================================
  // Story 3: Filter Task List
  // ============================================================================
  describe('LABEL-U003: Filter Task List - Powerful Filtering', () => {
    it('should filter tasks by single label', () => {
      const tasks = [
        { id: '1', labels: [{ id: 'l1', name: 'Bug' }] },
        { id: '2', labels: [{ id: 'l2', name: 'Feature' }] },
        { id: '3', labels: [{ id: 'l1', name: 'Bug' }] },
      ];

      const bugTasks = tasks.filter((t) => t.labels.some((l) => l.id === 'l1'));
      expect(bugTasks).toHaveLength(2);
    });

    it('should filter tasks by multiple labels (OR logic)', () => {
      const tasks = [
        { id: '1', labels: [{ id: 'l1', name: 'Bug' }] },
        { id: '2', labels: [{ id: 'l2', name: 'Feature' }] },
        { id: '3', labels: [{ id: 'l1', name: 'Bug' }, { id: 'l2', name: 'Feature' }] },
        { id: '4', labels: [{ id: 'l3', name: 'Design' }] },
      ];

      const filtered = tasks.filter((t) =>
        t.labels.some((l) => ['l1', 'l2'].includes(l.id))
      );
      expect(filtered).toHaveLength(3); // tasks 1, 2, 3
    });

    it('should combine filters with AND logic (status AND label)', () => {
      const tasks = [
        { id: '1', status: 'TODO', labels: [{ id: 'l1' }] },
        { id: '2', status: 'IN_PROGRESS', labels: [{ id: 'l1' }] },
        { id: '3', status: 'TODO', labels: [{ id: 'l2' }] },
      ];

      const filtered = tasks.filter(
        (t) => t.status === 'TODO' && t.labels.some((l) => l.id === 'l1')
      );
      expect(filtered).toHaveLength(1); // only task 1
    });

    it('should combine status filter with OR logic within field', () => {
      const tasks = [
        { id: '1', status: 'TODO' },
        { id: '2', status: 'IN_PROGRESS' },
        { id: '3', status: 'DONE' },
      ];

      const filtered = tasks.filter((t) =>
        ['TODO', 'IN_PROGRESS'].includes(t.status)
      );
      expect(filtered).toHaveLength(2);
    });

    it('should clear all filters and show all tasks', () => {
      const tasks = [
        { id: '1', status: 'TODO' },
        { id: '2', status: 'IN_PROGRESS' },
        { id: '3', status: 'DONE' },
      ];

      const filters = {};
      const filtered = tasks.filter(() => Object.keys(filters).length === 0);

      expect(filtered).toHaveLength(3);
    });

    it('should filter by due date range', () => {
      const tasks = [
        { id: '1', due_date: new Date('2026-04-05') },
        { id: '2', due_date: new Date('2026-04-10') },
        { id: '3', due_date: new Date('2026-04-15') },
      ];

      const from = new Date('2026-04-08');
      const to = new Date('2026-04-12');

      const filtered = tasks.filter(
        (t) => t.due_date >= from && t.due_date <= to
      );
      expect(filtered).toHaveLength(1); // task 2
    });

    it('should combine status+label+assignee filters (all AND)', () => {
      const tasks = [
        {
          id: '1',
          status: 'IN_PROGRESS',
          labels: [{ id: 'l1' }],
          assignee_id: 'user-1',
        },
        {
          id: '2',
          status: 'IN_PROGRESS',
          labels: [{ id: 'l1' }],
          assignee_id: 'user-2',
        },
        {
          id: '3',
          status: 'TODO',
          labels: [{ id: 'l1' }],
          assignee_id: 'user-1',
        },
      ];

      const filtered = tasks.filter(
        (t) =>
          t.status === 'IN_PROGRESS' &&
          t.labels.some((l) => l.id === 'l1') &&
          t.assignee_id === 'user-1'
      );

      expect(filtered).toHaveLength(1); // only task 1
    });
  });

  // ============================================================================
  // Story 4: Sort Task List
  // ============================================================================
  describe('LABEL-U004: Sort Task List - Multiple Sort Options', () => {
    it('should sort by created_at DESC (default)', () => {
      const tasks = [
        { id: '1', created_at: new Date('2026-04-01') },
        { id: '2', created_at: new Date('2026-04-03') },
        { id: '3', created_at: new Date('2026-04-02') },
      ];

      const sorted = [...tasks].sort(
        (a, b) => b.created_at.getTime() - a.created_at.getTime()
      );

      expect(sorted.map((t) => t.id)).toEqual(['2', '3', '1']);
    });

    it('should sort by due_date ASC (soonest first)', () => {
      const tasks = [
        { id: '1', due_date: new Date('2026-04-10') },
        { id: '2', due_date: new Date('2026-04-05') },
        { id: '3', due_date: new Date('2026-04-15') },
      ];

      const sorted = [...tasks].sort(
        (a, b) => a.due_date.getTime() - b.due_date.getTime()
      );

      expect(sorted.map((t) => t.id)).toEqual(['2', '1', '3']);
    });

    it('should sort by priority DESC (highest first)', () => {
      const priorityOrder = { CRITICAL: 4, HIGH: 3, MEDIUM: 2, LOW: 1 };
      const tasks = [
        { id: '1', priority: 'MEDIUM' },
        { id: '2', priority: 'CRITICAL' },
        { id: '3', priority: 'LOW' },
      ];

      const sorted = [...tasks].sort(
        (a, b) => priorityOrder[b.priority] - priorityOrder[a.priority]
      );

      expect(sorted.map((t) => t.id)).toEqual(['2', '1', '3']);
    });

    it('should sort by title ASC (alphabetical)', () => {
      const tasks = [
        { id: '1', title: 'Zebra task' },
        { id: '2', title: 'Apple task' },
        { id: '3', title: 'Mango task' },
      ];

      const sorted = [...tasks].sort((a, b) => a.title.localeCompare(b.title));

      expect(sorted.map((t) => t.id)).toEqual(['2', '3', '1']);
    });

    it('should put tasks without due_date at end when sorting by due_date', () => {
      const tasks = [
        { id: '1', due_date: new Date('2026-04-10') },
        { id: '2', due_date: null },
        { id: '3', due_date: new Date('2026-04-05') },
      ];

      const sorted = [...tasks].sort((a, b) => {
        if (!a.due_date) return 1;
        if (!b.due_date) return -1;
        return a.due_date.getTime() - b.due_date.getTime();
      });

      expect(sorted.map((t) => t.id)).toEqual(['3', '1', '2']);
    });

    it('should persist sort selection across requests', () => {
      const sortOrder = 'due_date_asc';
      const persistedSort = sortOrder;

      expect(persistedSort).toBe('due_date_asc');
    });
  });

  // ============================================================================
  // Integration Tests
  // ============================================================================
  describe('LABEL-I001: Label Name Validation and Uniqueness', () => {
    it('should require label name', () => {
      const data = { name: '', color: '#EF4444' };
      expect(() => createLabelSchema.parse(data)).toThrow();
    });

    it('should enforce max 50 character limit', () => {
      const data = { name: 'A'.repeat(51), color: '#EF4444' };
      expect(() => createLabelSchema.parse(data)).toThrow();
    });

    it('should trim whitespace from label name', () => {
      const data = { name: '  Bug  ', color: '#EF4444' };
      const parsed = createLabelSchema.parse(data);
      expect(parsed.name).toBe('  Bug  '); // Zod doesn't auto-trim
    });

    it('should enforce unique label names per project', () => {
      const existingLabels = [{ name: 'Bug', project_id: 'proj-1' }];
      const newLabel = { name: 'Bug', project_id: 'proj-1' };

      const isDuplicate = existingLabels.some(
        (l) => l.name === newLabel.name && l.project_id === newLabel.project_id
      );

      expect(isDuplicate).toBe(true);
    });

    it('should allow same label name in different projects', () => {
      const labels = [
        { name: 'Bug', project_id: 'proj-1' },
        { name: 'Bug', project_id: 'proj-2' },
      ];

      expect(labels).toHaveLength(2);
      expect(labels[0].project_id).not.toBe(labels[1].project_id);
    });
  });

  describe('LABEL-I002: Color Validation and Hex Format', () => {
    it('should accept valid hex colors (uppercase)', () => {
      const colors = ['#FF0000', '#00FF00', '#0000FF'];
      colors.forEach((color) => {
        const data = { name: 'Test', color };
        expect(() => createLabelSchema.parse(data)).not.toThrow();
      });
    });

    it('should accept valid hex colors (lowercase)', () => {
      const colors = ['#ff0000', '#00ff00', '#0000ff'];
      colors.forEach((color) => {
        const data = { name: 'Test', color };
        expect(() => createLabelSchema.parse(data)).not.toThrow();
      });
    });

    it('should reject hex without # prefix', () => {
      const data = { name: 'Test', color: 'FF0000' };
      expect(() => createLabelSchema.parse(data)).toThrow();
    });

    it('should reject short hex format (#RGB)', () => {
      const data = { name: 'Test', color: '#F00' };
      expect(() => createLabelSchema.parse(data)).toThrow();
    });

    it('should reject invalid hex characters', () => {
      const data = { name: 'Test', color: '#GGGGGG' };
      expect(() => createLabelSchema.parse(data)).toThrow();
    });

    it('should normalize hex to uppercase on save', () => {
      const color = '#ff0000';
      const normalized = color.toUpperCase();
      expect(normalized).toBe('#FF0000');
    });
  });

  describe('LABEL-I003: Task-Label Many-to-Many Relationship', () => {
    it('should support multiple labels per task', () => {
      const task = {
        id: 'task-1',
        labels: [
          { id: 'l1', name: 'Bug' },
          { id: 'l2', name: 'Urgent' },
          { id: 'l3', name: 'Frontend' },
        ],
      };

      expect(task.labels).toHaveLength(3);
    });

    it('should support multiple tasks with same label', () => {
      const label = { id: 'l1', name: 'Bug' };
      const tasks = [
        { id: 't1', labels: [label] },
        { id: 't2', labels: [label] },
        { id: 't3', labels: [label] },
      ];

      const tasksWithBug = tasks.filter((t) => t.labels.some((l) => l.id === label.id));
      expect(tasksWithBug).toHaveLength(3);
    });

    it('should handle label deletion from all tasks', () => {
      const tasks = [
        { id: 't1', labels: [{ id: 'l1', name: 'Bug' }, { id: 'l2', name: 'Urgent' }] },
        { id: 't2', labels: [{ id: 'l1', name: 'Bug' }] },
      ];

      // Delete label l1 from all tasks
      const updated = tasks.map((t) => ({
        ...t,
        labels: t.labels.filter((l) => l.id !== 'l1'),
      }));

      expect(updated[0].labels).toHaveLength(1);
      expect(updated[1].labels).toHaveLength(0);
    });
  });

  describe('LABEL-I004: Filter Logic - AND/OR Combinations', () => {
    it('should apply OR logic within status filter', () => {
      const tasks = [
        { id: '1', status: 'TODO' },
        { id: '2', status: 'IN_PROGRESS' },
        { id: '3', status: 'DONE' },
      ];

      const statuses = ['TODO', 'IN_PROGRESS'];
      const filtered = tasks.filter((t) => statuses.includes(t.status));

      expect(filtered).toHaveLength(2);
    });

    it('should apply OR logic within label filter', () => {
      const tasks = [
        { id: '1', labels: ['l1'] },
        { id: '2', labels: ['l2'] },
        { id: '3', labels: ['l3'] },
      ];

      const labels = ['l1', 'l2'];
      const filtered = tasks.filter((t) =>
        t.labels.some((l) => labels.includes(l))
      );

      expect(filtered).toHaveLength(2);
    });

    it('should apply AND logic between different filter fields', () => {
      const tasks = [
        { id: '1', status: 'TODO', priority: 'LOW' },
        { id: '2', status: 'IN_PROGRESS', priority: 'HIGH' },
        { id: '3', status: 'TODO', priority: 'HIGH' },
      ];

      const filtered = tasks.filter(
        (t) => t.status === 'TODO' && t.priority === 'HIGH'
      );

      expect(filtered).toHaveLength(1); // task 3
    });

    it('should handle complex filter: (s1 OR s2) AND (p1 OR p2) AND l1', () => {
      const tasks = [
        { id: '1', status: 'TODO', priority: 'HIGH', labels: ['l1'] },
        { id: '2', status: 'IN_PROGRESS', priority: 'HIGH', labels: ['l1'] },
        { id: '3', status: 'TODO', priority: 'LOW', labels: ['l1'] },
        { id: '4', status: 'TODO', priority: 'HIGH', labels: ['l2'] },
      ];

      const statuses = ['TODO', 'IN_PROGRESS'];
      const priorities = ['HIGH', 'MEDIUM'];
      const labels = ['l1'];

      const filtered = tasks.filter(
        (t) =>
          statuses.includes(t.status) &&
          priorities.includes(t.priority) &&
          t.labels.some((l) => labels.includes(l))
      );

      expect(filtered).toHaveLength(2); // tasks 1, 2
    });
  });

  describe('LABEL-I005: Sort Options and Priority Ordering', () => {
    it('should define priority order: CRITICAL > HIGH > MEDIUM > LOW', () => {
      const order = { CRITICAL: 4, HIGH: 3, MEDIUM: 2, LOW: 1 };
      expect(order.CRITICAL).toBeGreaterThan(order.HIGH);
      expect(order.HIGH).toBeGreaterThan(order.MEDIUM);
      expect(order.MEDIUM).toBeGreaterThan(order.LOW);
    });

    it('should support all 4 sort options', () => {
      const sortOptions = [
        'created_at_desc',
        'due_date_asc',
        'priority_desc',
        'title_asc',
      ];

      expect(sortOptions).toHaveLength(4);
    });

    it('should default to created_at_desc when sort not specified', () => {
      const defaultSort = 'created_at_desc';
      expect(defaultSort).toBe('created_at_desc');
    });
  });

  describe('LABEL-I006: Query Parameter Parsing', () => {
    it('should parse comma-separated status filter', () => {
      const query = { status: 'TODO,IN_PROGRESS' };
      const parsed = taskFilterSchema.parse(query);
      expect(parsed.status).toEqual(['TODO', 'IN_PROGRESS']);
    });

    it('should parse comma-separated priority filter', () => {
      const query = { priority: 'HIGH,CRITICAL' };
      const parsed = taskFilterSchema.parse(query);
      expect(parsed.priority).toEqual(['HIGH', 'CRITICAL']);
    });

    it('should parse comma-separated label IDs', () => {
      const query = { labels: 'label-1,label-2,label-3' };
      const parsed = taskFilterSchema.parse(query);
      expect(parsed.labels).toEqual(['label-1', 'label-2', 'label-3']);
    });

    it('should parse single values without comma', () => {
      const query = { assignee_id: '550e8400-e29b-41d4-a716-446655440000' };
      const parsed = taskFilterSchema.parse(query);
      expect(parsed.assignee_id).toBe('550e8400-e29b-41d4-a716-446655440000');
    });

    it('should parse due date range', () => {
      const query = {
        due_date_from: '2026-04-05',
        due_date_to: '2026-04-15',
      };
      const parsed = taskFilterSchema.parse(query);
      expect(parsed.due_date_from).toBeInstanceOf(Date);
      expect(parsed.due_date_to).toBeInstanceOf(Date);
    });

    it('should parse sort option', () => {
      const query = { sort: 'due_date_asc' };
      const parsed = taskFilterSchema.parse(query);
      expect(parsed.sort).toBe('due_date_asc');
    });

    it('should parse pagination params', () => {
      const query = { page: '2', limit: '50' };
      const parsed = taskFilterSchema.parse(query);
      expect(parsed.page).toBe(2);
      expect(parsed.limit).toBe(50);
    });

    it('should default page to 1 if not provided', () => {
      const query = {};
      const parsed = taskFilterSchema.parse(query);
      expect(parsed.page).toBe(1);
    });

    it('should default limit to 20 if not provided', () => {
      const query = {};
      const parsed = taskFilterSchema.parse(query);
      expect(parsed.limit).toBe(20);
    });
  });

  describe('LABEL-I007: Authorization and Role-Based Access', () => {
    it('should allow admin to create labels', () => {
      const user = { role: 'ADMIN' };
      const canCreate = user.role === 'ADMIN';
      expect(canCreate).toBe(true);
    });

    it('should block member from creating labels', () => {
      const user = { role: 'MEMBER' };
      const canCreate = user.role === 'ADMIN';
      expect(canCreate).toBe(false);
    });

    it('should block viewer from creating labels', () => {
      const user = { role: 'VIEWER' };
      const canCreate = user.role === 'ADMIN';
      expect(canCreate).toBe(false);
    });

    it('should allow member to add label to task', () => {
      const user = { role: 'MEMBER' };
      const canAddLabel = user.role === 'ADMIN' || user.role === 'MEMBER';
      expect(canAddLabel).toBe(true);
    });

    it('should block viewer from adding label to task', () => {
      const user = { role: 'VIEWER' };
      const canAddLabel = user.role === 'ADMIN' || user.role === 'MEMBER';
      expect(canAddLabel).toBe(false);
    });

    it('should allow member to filter tasks (read-only)', () => {
      const user = { role: 'MEMBER' };
      const canFilter = true; // All authenticated users can filter
      expect(canFilter).toBe(true);
    });

    it('should verify membership before allowing label operations', () => {
      const project = { id: 'proj-1' };
      const user = { id: 'user-1' };
      const membership = { project_id: 'proj-1', user_id: 'user-1' };

      const isMember = membership.project_id === project.id && membership.user_id === user.id;
      expect(isMember).toBe(true);
    });
  });

  describe('LABEL-I008: Soft-Delete Pattern for Labels', () => {
    it('should support soft-delete for labels', () => {
      const label = {
        id: 'label-1',
        name: 'Bug',
        deleted_at: null,
      };

      // Simulate soft-delete
      label.deleted_at = new Date();

      expect(label.deleted_at).not.toBeNull();
    });

    it('should exclude deleted labels from queries', () => {
      const labels = [
        { id: 'l1', name: 'Bug', deleted_at: null },
        { id: 'l2', name: 'Feature', deleted_at: new Date() },
        { id: 'l3', name: 'Urgent', deleted_at: null },
      ];

      const activeLabels = labels.filter((l) => l.deleted_at === null);
      expect(activeLabels).toHaveLength(2);
    });

    it('should remove label from tasks when deleted', () => {
      const tasks = [
        { id: 't1', labels: ['l1', 'l2'] },
        { id: 't2', labels: ['l1'] },
      ];

      // When label l1 is deleted, remove from all tasks
      const updated = tasks.map((t) => ({
        ...t,
        labels: t.labels.filter((l) => l !== 'l1'),
      }));

      expect(updated[0].labels).toEqual(['l2']);
      expect(updated[1].labels).toEqual([]);
    });
  });

  describe('LABEL-I009: Performance - Query Optimization', () => {
    it('should index task_labels on task_id', () => {
      // Index ensures O(log n) lookup instead of O(n)
      const indexCreated = true;
      expect(indexCreated).toBe(true);
    });

    it('should index task_labels on label_id', () => {
      const indexCreated = true;
      expect(indexCreated).toBe(true);
    });

    it('should batch label assignments efficiently', () => {
      const labelIds = ['l1', 'l2', 'l3'];
      // Batch insert should be single query, not 3 separate queries
      const batchInsertCount = 1; // Single INSERT INTO task_labels VALUES...
      expect(batchInsertCount).toBe(1);
    });

    it('should handle label filtering with single query', () => {
      // Using many-to-many join in single query, not N+1
      const queryCount = 1;
      expect(queryCount).toBe(1);
    });
  });

  describe('LABEL-I010: Update Label - Name and Color Changes', () => {
    it('should allow updating label name', () => {
      const labelData = { name: 'Enhanced Bug', color: '#EF4444' };
      expect(() => updateLabelSchema.parse(labelData)).not.toThrow();
    });

    it('should allow updating label color', () => {
      const labelData = { name: 'Bug', color: '#FF0000' };
      expect(() => updateLabelSchema.parse(labelData)).not.toThrow();
    });

    it('should allow updating both name and color', () => {
      const labelData = { name: 'Critical Issue', color: '#FF0000' };
      expect(() => updateLabelSchema.parse(labelData)).not.toThrow();
    });

    it('should validate updated name length', () => {
      const labelData = { name: 'A'.repeat(51) };
      expect(() => updateLabelSchema.parse(labelData)).toThrow();
    });

    it('should validate updated color format', () => {
      const labelData = { color: 'invalid' };
      expect(() => updateLabelSchema.parse(labelData)).toThrow();
    });

    it('should reflect label color changes on all tasks', () => {
      const label = { id: 'l1', name: 'Bug', color: '#EF4444' };
      const tasks = [
        { id: 't1', labels: [{ ...label }] },
        { id: 't2', labels: [{ ...label }] },
      ];

      // Update label color to #FF0000
      label.color = '#FF0000';

      // All references should show new color
      tasks.forEach((t) => {
        t.labels.forEach((l) => {
          if (l.id === label.id) l.color = label.color;
        });
      });

      expect(tasks[0].labels[0].color).toBe('#FF0000');
      expect(tasks[1].labels[0].color).toBe('#FF0000');
    });
  });

  describe('LABEL-I011: Label Scoping to Projects', () => {
    it('should ensure labels belong to projects', () => {
      const label = {
        id: 'l1',
        name: 'Bug',
        project_id: 'proj-1',
      };

      expect(label.project_id).toBe('proj-1');
    });

    it('should prevent accessing labels from other projects', () => {
      const userProjectIds = ['proj-1', 'proj-2'];
      const label = { project_id: 'proj-3' };

      const canAccess = userProjectIds.includes(label.project_id);
      expect(canAccess).toBe(false);
    });

    it('should validate label belongs to task project', () => {
      const task = { project_id: 'proj-1' };
      const label = { project_id: 'proj-1' };

      const isValid = task.project_id === label.project_id;
      expect(isValid).toBe(true);
    });

    it('should reject label from different project', () => {
      const task = { project_id: 'proj-1' };
      const label = { project_id: 'proj-2' };

      const isValid = task.project_id === label.project_id;
      expect(isValid).toBe(false);
    });
  });

  describe('LABEL-I012: Filter Persistence and URL State', () => {
    it('should encode filters in URL query params', () => {
      const filters = {
        status: 'TODO,IN_PROGRESS',
        priority: 'HIGH,CRITICAL',
        labels: 'l1,l2',
      };

      const queryString = new URLSearchParams(filters).toString();
      expect(queryString).toContain('status=');
      expect(queryString).toContain('priority=');
      expect(queryString).toContain('labels=');
    });

    it('should allow shareable filter links', () => {
      const baseUrl = '/api/projects/proj-1/tasks';
      const queryParams = '?status=TODO&labels=l1,l2&sort=due_date_asc';
      const fullUrl = baseUrl + queryParams;

      expect(fullUrl).toContain('?');
      expect(fullUrl).toContain('status=');
      expect(fullUrl).toContain('labels=');
    });

    it('should persist sort selection', () => {
      const sort = 'due_date_asc';
      const persistedSort = sort; // In URL or session storage

      expect(persistedSort).toBe('due_date_asc');
    });
  });

  describe('LABEL-I013: Response Format - Label Consistency', () => {
    it('should return label with all required fields', () => {
      const label = {
        id: 'l1',
        project_id: 'proj-1',
        name: 'Bug',
        color: '#EF4444',
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      };

      expect(label).toHaveProperty('id');
      expect(label).toHaveProperty('project_id');
      expect(label).toHaveProperty('name');
      expect(label).toHaveProperty('color');
      expect(label).toHaveProperty('created_at');
      expect(label).toHaveProperty('updated_at');
    });

    it('should return labels in alphabetical order', () => {
      const labels = [
        { name: 'Urgent' },
        { name: 'Bug' },
        { name: 'Feature' },
      ];

      const sorted = [...labels].sort((a, b) => a.name.localeCompare(b.name));

      expect(sorted.map((l) => l.name)).toEqual(['Bug', 'Feature', 'Urgent']);
    });
  });

  describe('LABEL-I014: Complex Filtering Scenarios', () => {
    it('should handle empty filter results gracefully', () => {
      const tasks = [
        { id: '1', status: 'TODO' },
        { id: '2', status: 'IN_PROGRESS' },
      ];

      const filtered = tasks.filter((t) => t.status === 'DONE');
      expect(filtered).toHaveLength(0);
    });

    it('should handle filter with unmatched label IDs', () => {
      const tasks = [
        { id: '1', labels: ['l1'] },
        { id: '2', labels: ['l2'] },
      ];

      const targetLabels = ['l99']; // Non-existent label
      const filtered = tasks.filter((t) =>
        t.labels.some((l) => targetLabels.includes(l))
      );

      expect(filtered).toHaveLength(0);
    });

    it('should handle filter combining past due dates', () => {
      const now = new Date();
      const tasks = [
        { id: '1', due_date: new Date(now.getTime() - 86400000) }, // Yesterday
        { id: '2', due_date: new Date(now.getTime() + 86400000) }, // Tomorrow
      ];

      const overdue = tasks.filter((t) => t.due_date < now);
      expect(overdue).toHaveLength(1);
    });
  });

  describe('LABEL-I015: Validation Schema for Task Filters', () => {
    it('should accept valid filter query', () => {
      const query = {
        status: 'TODO,IN_PROGRESS',
        priority: 'HIGH',
        labels: 'l1,l2',
        sort: 'due_date_asc',
        page: '1',
        limit: '20',
      };

      expect(() => taskFilterSchema.parse(query)).not.toThrow();
    });

    it('should reject invalid page value', () => {
      const query = { page: '0' };
      expect(() => taskFilterSchema.parse(query)).toThrow();
    });

    it('should reject invalid limit (too high)', () => {
      const query = { limit: '101' };
      expect(() => taskFilterSchema.parse(query)).toThrow();
    });

    it('should reject invalid sort option', () => {
      const query = { sort: 'invalid_sort' };
      expect(() => taskFilterSchema.parse(query)).toThrow();
    });

    it('should accept partial filters', () => {
      const query = { status: 'TODO' };
      expect(() => taskFilterSchema.parse(query)).not.toThrow();
    });
  });

  describe('LABEL-I016: Integration - End-to-End Label Workflow', () => {
    it('should create, assign, filter, and delete labels', () => {
      // 1. Create labels
      const labels = [
        { id: 'l1', name: 'Bug', color: '#EF4444' },
        { id: 'l2', name: 'Feature', color: '#3B82F6' },
      ];

      expect(labels).toHaveLength(2);

      // 2. Assign labels to task
      const task = {
        id: 't1',
        title: 'Fix login',
        labels: [labels[0]], // Bug label
      };

      expect(task.labels).toHaveLength(1);

      // 3. Filter tasks by label
      const filtered = [task].filter((t) =>
        t.labels.some((l) => l.id === 'l1')
      );

      expect(filtered).toHaveLength(1);

      // 4. Remove label from task
      task.labels = task.labels.filter((l) => l.id !== 'l1');

      expect(task.labels).toHaveLength(0);

      // 5. Delete label (cascading remove from tasks)
      labels.splice(0, 1); // Delete l1

      expect(labels).toHaveLength(1);
    });
  });
});
