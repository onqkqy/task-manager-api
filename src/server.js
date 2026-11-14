const express = require('express');
const { randomUUID } = require('node:crypto');
const fs = require('node:fs/promises');
const path = require('node:path');

const app = express();
const PORT = process.env.PORT || 3000;
const DATA_FILE = path.join(__dirname, '..', 'data', 'tasks.json');

app.use(express.json());

async function readTasks() {
  try {
    const content = await fs.readFile(DATA_FILE, 'utf8');
    return JSON.parse(content);
  } catch (error) {
    if (error.code === 'ENOENT') {
      await fs.mkdir(path.dirname(DATA_FILE), { recursive: true });
      await fs.writeFile(DATA_FILE, '[]\n');
      return [];
    }
    throw error;
  }
}

async function writeTasks(tasks) {
  await fs.mkdir(path.dirname(DATA_FILE), { recursive: true });
  await fs.writeFile(DATA_FILE, JSON.stringify(tasks, null, 2) + '\n');
}

app.get('/', (_req, res) => {
  res.json({ name: 'Task Manager API', version: '1.0.0', endpoints: '/api/tasks' });
});

app.get('/api/tasks', async (_req, res, next) => {
  try {
    res.json(await readTasks());
  } catch (error) {
    next(error);
  }
});

app.get('/api/tasks/:id', async (req, res, next) => {
  try {
    const task = (await readTasks()).find(item => item.id === req.params.id);
    if (!task) return res.status(404).json({ error: 'Task not found' });
    res.json(task);
  } catch (error) {
    next(error);
  }
});

app.post('/api/tasks', async (req, res, next) => {
  try {
    const title = typeof req.body.title === 'string' ? req.body.title.trim() : '';
    if (!title) return res.status(400).json({ error: 'Title is required' });

    const tasks = await readTasks();
    const task = {
      id: randomUUID(),
      title,
      description: typeof req.body.description === 'string' ? req.body.description.trim() : '',
      completed: false,
      createdAt: new Date().toISOString()
    };
    tasks.push(task);
    await writeTasks(tasks);
    res.status(201).json(task);
  } catch (error) {
    next(error);
  }
});

app.patch('/api/tasks/:id', async (req, res, next) => {
  try {
    const tasks = await readTasks();
    const index = tasks.findIndex(item => item.id === req.params.id);
    if (index === -1) return res.status(404).json({ error: 'Task not found' });

    const updates = {};
    if (typeof req.body.title === 'string') {
      const title = req.body.title.trim();
      if (!title) return res.status(400).json({ error: 'Title cannot be empty' });
      updates.title = title;
    }
    if (typeof req.body.description === 'string') updates.description = req.body.description.trim();
    if (typeof req.body.completed === 'boolean') updates.completed = req.body.completed;

    tasks[index] = { ...tasks[index], ...updates, updatedAt: new Date().toISOString() };
    await writeTasks(tasks);
    res.json(tasks[index]);
  } catch (error) {
    next(error);
  }
});

app.delete('/api/tasks/:id', async (req, res, next) => {
  try {
    const tasks = await readTasks();
    const filtered = tasks.filter(item => item.id !== req.params.id);
    if (filtered.length === tasks.length) return res.status(404).json({ error: 'Task not found' });
    await writeTasks(filtered);
    res.status(204).end();
  } catch (error) {
    next(error);
  }
});

app.use((error, _req, res, _next) => {
  console.error(error);
  res.status(500).json({ error: 'Internal server error' });
});

app.listen(PORT, () => {
  console.log(`Task Manager API is running at http://localhost:${PORT}`);
});
