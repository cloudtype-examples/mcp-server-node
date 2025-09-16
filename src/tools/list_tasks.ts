import { tasksDb } from '../db.js';

export const list_tasks = {
  name: 'list_tasks',
  description: 'List all tasks',
  args: {},
  handle: async () => {
    const tasks = Array.from(tasksDb.values());
    return {
      content: [{ type: 'text', text: JSON.stringify(tasks, null, 2) }]
    };
  }
};
