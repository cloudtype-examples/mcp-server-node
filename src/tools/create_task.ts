import { z } from 'zod';
import { tasksDb } from '../db.js';
import { Task } from '../types.js';

export const create_task = {
  name: 'create_task',
  description: 'Create a new task',
  args: {
    title: z.string().describe('Task title'),
    description: z.string().optional().describe('Task description')
  },
  handle: async ({ title = '', description = '' }) => {
    if (!title) throw new Error(`Title is required`);

    const taskId = tasksDb.size > 0 ? Math.max(...tasksDb.keys()) + 1 : 1;
    const newTask: Task = {
      id: taskId,
      title,
      description,
      completed: false,
      created_at: new Date().toISOString()
    };

    tasksDb.set(taskId, newTask);
    return {
      content: [{ type: 'text', text: JSON.stringify(newTask, null, 2) }]
    };
  }
};
