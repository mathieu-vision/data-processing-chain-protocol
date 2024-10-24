import { WriteStream, createWriteStream, mkdirSync } from 'fs';
import { join } from 'path';
import { format } from 'util';

type LogLevel = 'info' | 'warn' | 'error' | 'header';

interface LoggerConfig {
  preserveLogs?: boolean;
  externalCallback?: (
    _level: LogLevel,
    _message: string,
    _timestamp: string,
  ) => void;
}

const Colors = {
  reset: '\x1b[0m',
  info: '\x1b[32m', // green
  warn: '\x1b[93m', // yellow
  error: '\x1b[31m', // red
  header: '\x1b[36m', // cyan
} as const;

export class Logger {
  private static config: LoggerConfig = {
    preserveLogs: false,
  };

  static configure(config: LoggerConfig) {
    this.config = { ...this.config, ...config };
  }

  private static formatMessage(level: LogLevel, message: string): string {
    const now = new Date();
    const year = now.getFullYear();
    const month = String(now.getMonth() + 1).padStart(2, '0');
    const day = String(now.getDate()).padStart(2, '0');
    const hours = String(now.getHours()).padStart(2, '0');
    const minutes = String(now.getMinutes()).padStart(2, '0');
    const seconds = String(now.getSeconds()).padStart(2, '0');
    const timestamp = `${year}-${month}-${day}:${hours}.${minutes}.${seconds}`;
    return `${Colors[level]}${timestamp} [${level.toUpperCase()}]: ${message}${Colors.reset}\n`;
  }

  private static log(level: LogLevel, message: string) {
    const timestamp = new Date().toISOString();
    const formattedMessage = this.formatMessage(level, message);

    process.stdout.write(formattedMessage);

    if (this.config.preserveLogs && this.config.externalCallback) {
      this.config.externalCallback(level, message, timestamp);
    }
  }

  static info(message: string | object) {
    const msg = typeof message === 'string' ? message : format(message);
    this.log('info', msg);
  }

  static warn(message: string | object) {
    const msg = typeof message === 'string' ? message : format(message);
    this.log('warn', msg);
  }

  static error(message: string | object) {
    const msg = typeof message === 'string' ? message : format(message);
    this.log('error', msg);
  }

  static header(message: string | object) {
    const msg = typeof message === 'string' ? message : format(message);
    this.log('header', msg);
  }
}

const DEFAULT_LOG_PATH = join(process.cwd(), 'logs');
let logStream: WriteStream;

const getLogFileName = () => {
  const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
  return `dpcp-${timestamp}.log`;
};

const initDiskLogger = () => {
  try {
    mkdirSync(DEFAULT_LOG_PATH, { recursive: true });
    const logFile = join(DEFAULT_LOG_PATH, getLogFileName());
    logStream = createWriteStream(logFile, { flags: 'a' });
    return true;
  } catch (err) {
    process.stderr.write(`Failed to create log directory: ${err}\n`);
    return false;
  }
};

const defaultDiskCallback = (
  level: LogLevel,
  message: string,
  timestamp: string,
) => {
  if (!logStream && !initDiskLogger()) {
    return;
  }
  const plainMessage = `${timestamp} [LOGGER][${level.toUpperCase()}]: ${message}\n`;
  logStream.write(plainMessage);
};

Logger.configure({
  preserveLogs: true,
  externalCallback: defaultDiskCallback,
});
