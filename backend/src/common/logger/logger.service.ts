/* eslint-disable no-console */

/**
 * Logger tối giản (static) — đủ cho MVP, có thể thay bằng pino sau.
 */
export class LoggerService {
  static info(message: string, meta?: unknown) {
    console.log(`[INFO] ${message}`, meta ?? '');
  }

  static error(message: string, meta?: unknown) {
    console.error(`[ERROR] ${message}`, meta ?? '');
  }

  static warn(message: string, meta?: unknown) {
    console.warn(`[WARN] ${message}`, meta ?? '');
  }
}
