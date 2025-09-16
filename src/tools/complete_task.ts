import { z } from 'zod';
import { tasksDb } from '../db.js';

export const complete_task = {
  name: 'complete_task',
  description: 'Mark a task as completed',
  args: {
    task_id: z.number().describe('Task ID to complete')
  },
  handle: ({ task_id = NaN }) => {
    if (!task_id) throw new Error(`Task id is required`);

    const task = tasksDb.get(task_id);
    if (!task) {
      throw new Error(`Task ${task_id} not found`);
    }

    task.completed = true;
    task.completed_at = new Date().toISOString();
    tasksDb.set(task_id, task);

    return {
      content: [{ type: 'text', text: JSON.stringify(task, null, 2) }]
    };
  }
};
