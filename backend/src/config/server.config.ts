import { registerAs } from '@nestjs/config';

export interface ServerConfig {
  port: number;
  frontendUrl: string;
  publicBaseUrl: string;
  env?: string;
}

export default registerAs(
  'server',
  (): ServerConfig => ({
    port: Number(process.env.PORT ?? 3001),
    frontendUrl: process.env.FRONTEND_URL ?? 'http://localhost:5173',
    publicBaseUrl: process.env.PUBLIC_BASE_URL ?? 'http://localhost:3001',
    env: process.env.NODE_ENV,
  }),
);
