type Env = NodeJS.ProcessEnv;

function required(env: Env, key: string): string {
  const value = env[key];
  if (value === undefined) {
    throw new Error(`Missing environment variable: ${key}`);
  }
  return value;
}

function toNumber(value: string | undefined, fallback: number): string {
  if (!value) return String(fallback);
  const parsed = Number.parseInt(value, 10);
  return Number.isFinite(parsed) ? String(parsed) : String(fallback);
}

export function validateEnv(env: Env): Env {
  required(env, 'DATABASE_URL');

  env.PORT = toNumber(env.PORT, 3001);
  env.FRONTEND_URL = env.FRONTEND_URL ?? 'http://localhost:5173';
  env.PUBLIC_BASE_URL = env.PUBLIC_BASE_URL ?? `http://localhost:${env.PORT}`;
  env.STORAGE_DRIVER = env.STORAGE_DRIVER ?? 'local';

  return env;
}
