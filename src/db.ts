import { Task } from './types.js';

export const tasksDb: Map<number, Task> = new Map([
  [
    1,
    {
      id: 1,
      title: 'Setup MCP',
      completed: true,
      created_at: '2024-01-01T10:00:00'
    }
  ],
  [
    2,
    {
      id: 2,
      title: 'Write documentation',
      completed: false,
      created_at: '2024-01-01T11:00:00'
    }
  ],
  [
    3,
    {
      id: 3,
      title: 'Deploy to production',
      completed: false,
      created_at: '2024-01-01T12:00:00'
    }
  ]
]);
