import axios from 'axios';
import express from 'express';
import { config } from '../config.js';
import logger from '../logger.js';
import Task from '../models/Task.js';

const router = express.Router();
const validStatuses = ['pending', 'in-progress', 'done'];

router.get('/', async (req, res, next) => {
  try {
    const filter = req.query.userId ? { userId: req.query.userId } : {};
    const tasks = await Task.find(filter).sort({ createdAt: 1 });
    res.json(tasks);
  } catch (error) {
    next(error);
  }
});

router.get('/:id', async (req, res, next) => {
  try {
    const task = await Task.findById(req.params.id);
    if (!task) {
      return res.status(404).json({ error: 'Task not found' });
    }

    res.json(task);
  } catch (error) {
    next(error);
  }
});

router.post('/', async (req, res, next) => {
  const { title, description, userId } = req.body;
  if (!title || !userId) {
    return res.status(400).json({ error: 'title and userId are required' });
  }

  const url = `${config.USER_SERVICE_URL}/api/users/${userId}`;
  try {
    const response = await axios.get(url, { timeout: 3000 });
    logger.debug({ url, result: response.status }, 'user-service lookup succeeded');
  } catch (error) {
    const result = error.response?.status || error.code || 'error';
    logger.debug({ url, result }, 'user-service lookup failed');

    if (error.response?.status === 404) {
      return res.status(400).json({ error: 'Invalid userId' });
    }

    return res.status(503).json({ error: 'user-service unavailable' });
  }

  try {
    const task = await Task.create({ title, description, userId });
    res.status(201).json(task);
  } catch (error) {
    next(error);
  }
});

router.patch('/:id/status', async (req, res, next) => {
  try {
    const { status } = req.body;
    if (!validStatuses.includes(status)) {
      return res.status(400).json({
        error: 'status must be one of: pending, in-progress, done'
      });
    }

    const task = await Task.findByIdAndUpdate(
      req.params.id,
      { status },
      { new: true, runValidators: true }
    );
    if (!task) {
      return res.status(404).json({ error: 'Task not found' });
    }

    res.json(task);
  } catch (error) {
    next(error);
  }
});

router.delete('/:id', async (req, res, next) => {
  try {
    const task = await Task.findByIdAndDelete(req.params.id);
    if (!task) {
      return res.status(404).json({ error: 'Task not found' });
    }

    res.json(task);
  } catch (error) {
    next(error);
  }
});

export default router;
