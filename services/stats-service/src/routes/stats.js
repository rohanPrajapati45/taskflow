import axios from 'axios';
import express from 'express';
import { config } from '../config.js';
import logger from '../logger.js';

const router = express.Router();

function logDownstreamFailure(service, url, error) {
  logger.error({ service, url, err: error }, 'Downstream service failed');
}

function countTasksByStatus(tasks) {
  return tasks.reduce((counts, task) => {
    if (task.status in counts) {
      counts[task.status] += 1;
    }
    return counts;
  }, {
    pending: 0,
    'in-progress': 0,
    done: 0
  });
}

router.get('/overview', async (_req, res, next) => {
  try {
    const userUrl = `${config.USER_SERVICE_URL}/api/users`;
    const taskUrl = `${config.TASK_SERVICE_URL}/api/tasks`;
    const results = await Promise.allSettled([
      axios.get(userUrl),
      axios.get(taskUrl)
    ]);

    const [usersResult, tasksResult] = results;
    if (usersResult.status === 'rejected') {
      logDownstreamFailure('user-service', userUrl, usersResult.reason);
    }
    if (tasksResult.status === 'rejected') {
      logDownstreamFailure('task-service', taskUrl, tasksResult.reason);
    }
    if (usersResult.status === 'rejected' || tasksResult.status === 'rejected') {
      return res.status(503).json({ error: 'one or more services unavailable' });
    }

    const users = usersResult.value.data;
    const tasks = tasksResult.value.data;
    res.json({
      totalUsers: users.length,
      totalTasks: tasks.length,
      tasksByStatus: countTasksByStatus(tasks)
    });
  } catch (error) {
    next(error);
  }
});

router.get('/user/:userId', async (req, res) => {
  const url = `${config.TASK_SERVICE_URL}/api/tasks`;
  try {
    const response = await axios.get(url, {
      params: { userId: req.params.userId }
    });
    const tasks = response.data;
    const tasksByStatus = countTasksByStatus(tasks);

    res.json({
      userId: req.params.userId,
      totalTasks: tasks.length,
      pending: tasksByStatus.pending,
      inProgress: tasksByStatus['in-progress'],
      done: tasksByStatus.done
    });
  } catch (error) {
    logDownstreamFailure('task-service', `${url}?userId=${req.params.userId}`, error);
    res.status(503).json({ error: 'one or more services unavailable' });
  }
});

export default router;
