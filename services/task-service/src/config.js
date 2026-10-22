import 'dotenv/config';

// NON-SENSITIVE — will live in a K8s ConfigMap
const {
  PORT = '4002',
  NODE_ENV = 'development',
  LOG_LEVEL = 'info',
  MONGO_HOST = 'localhost',
  MONGO_PORT = '27017',
  MONGO_DB_NAME = 'taskflow',
  USER_SERVICE_URL = 'http://localhost:4001'
} = process.env;

// SENSITIVE — will live in a K8s Secret
const {
  MONGO_USERNAME = 'admin',
  MONGO_PASSWORD = 'adminpass'
} = process.env;

export const config = {
  PORT: Number(PORT),
  NODE_ENV,
  LOG_LEVEL,
  MONGO_HOST,
  MONGO_PORT,
  MONGO_DB_NAME,
  MONGO_USERNAME,
  MONGO_PASSWORD,
  USER_SERVICE_URL,
  MONGO_URI: `mongodb://${MONGO_USERNAME}:${MONGO_PASSWORD}@${MONGO_HOST}:${MONGO_PORT}/${MONGO_DB_NAME}?authSource=admin`
};
