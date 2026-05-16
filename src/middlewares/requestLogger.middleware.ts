import { Request, Response, NextFunction } from 'express'
import { logger } from '~/utils/logger'

export const requestLogger = (req: Request, res: Response, next: NextFunction) => {
  const startTime = Date.now()

  res.on('finish', () => {
    const duration = Date.now() - startTime
    const logData = {
      method: req.method,
      path: req.path,
      status: res.statusCode,
      duration,
      ip: req.ip,
      userId: (req as Request & { user?: { _id?: string } }).user?._id,
      requestId: req.headers['x-request-id']
    }

    if (res.statusCode >= 500) {
      logger.error('HTTP Request Error', logData)
    } else if (res.statusCode >= 400) {
      logger.warn('HTTP Request Warning', logData)
    } else {
      logger.info('HTTP Request', logData)
    }
  })

  next()
}
