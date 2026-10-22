import 'dotenv/config';

const {
  PORT = '4003',
  NODE_ENV = 'development',
  LOG_LEVEL = 'info',
  // NON-SENSITIVE — will live in a K8s ConfigMap, becomes a Service DNS name in Kubernetes
  USER_SERVICE_URL = 'http://localhost:4001',
  // NON-SENSITIVE — will live in a K8s ConfigMap, becomes a Service DNS name in Kubernetes
  TASK_SERVICE_URL = 'http://localhost:4002'
} = process.env;

export const config = {
  PORT: Number(PORT),
  NODE_ENV,
  LOG_LEVEL,
  USER_SERVICE_URL,
  TASK_SERVICE_URL
};
