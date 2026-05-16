import winston from 'winston'
import path from 'path'
import fs from 'fs'
import { isProduction } from '~/constants/config'

const logDir = path.resolve(process.cwd(), 'logs')
if (!fs.existsSync(logDir)) {
  fs.mkdirSync(logDir, { recursive: true })
}

const { combine, timestamp, printf, colorize, errors, json } = winston.format

const logFormat = printf(({ level, message, timestamp, stack, ...metadata }) => {
  let log = `${timestamp} [${level}]: ${message}`

  if (Object.keys(metadata).length > 0) {
    log += ` ${JSON.stringify(metadata)}`
  }

  if (stack) {
    log += `\n${stack}`
  }

  return log
})

const developmentFormat = combine(
  colorize({ all: true }),
  timestamp({ format: 'YYYY-MM-DD HH:mm:ss.SSS' }),
  errors({ stack: true }),
  logFormat
)

const productionFormat = combine(
  timestamp({ format: 'YYYY-MM-DDTHH:mm:ss.SSSZ' }),
  errors({ stack: true }),
  json()
)

export const logger = winston.createLogger({
  level: process.env.LOG_LEVEL || 'info',
  levels: winston.config.npm.levels,
  format: isProduction ? productionFormat : developmentFormat,
  transports: [
    new winston.transports.Console({
      handleExceptions: true
    }),
    new winston.transports.File({
      filename: path.join(logDir, 'app.log'),
      maxsize: 10 * 1024 * 1024,
      maxFiles: 14,
      tailable: true,
      handleExceptions: true
    }),
    new winston.transports.File({
      filename: path.join(logDir, 'error.log'),
      level: 'error',
      maxsize: 10 * 1024 * 1024,
      maxFiles: 30,
      handleExceptions: true
    })
  ],
  exitOnError: false
})

export const createServiceLogger = (service: string) => {
  return logger.child({ service })
}

export const createRequestLogger = (req: { headers: Record<string, unknown>; ip?: string; method?: string; path?: string }) => {
  return logger.child({
    requestId: req.headers['x-request-id'],
    ip: req.ip,
    userAgent: req.headers['user-agent'],
    method: req.method,
    path: req.path
  })
}

export const cacheLogger = createServiceLogger('cache')
export const queueLogger = createServiceLogger('queue')
export const rateLimitLogger = createServiceLogger('rate_limit')
export const dbLogger = createServiceLogger('database')
