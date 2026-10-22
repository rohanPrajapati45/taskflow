import axios from 'axios';

const createClient = (baseURL) => axios.create({
  baseURL,
  headers: { 'Content-Type': 'application/json' }
});

export const userApi = createClient(
  import.meta.env.VITE_USER_SERVICE_URL || ''
);

export const taskApi = createClient(
  import.meta.env.VITE_TASK_SERVICE_URL || ''
);

export const statsApi = createClient(
  import.meta.env.VITE_STATS_SERVICE_URL || ''
);

export function getFriendlyError(error, fallback = 'Something went wrong. Please try again.') {
  return error.response?.data?.error || fallback;
}
