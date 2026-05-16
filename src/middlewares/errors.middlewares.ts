import { NextFunction, Request, Response } from 'express'
import { omit } from 'lodash'
import { HTTP_STATUS } from '~/constants/httpStatus'
import { ErrorWithStatus } from '~/models/Errors'
import { logger } from '~/utils/logger'

export const defaultErrorHandler = (
  err: any,
  req: Request,
  res: Response,
  next: NextFunction
) => {
  const errorLog = {
    error: err.message,
    stack: err.stack,
    status: err.status || 500,
    path: req.path,
    method: req.method,
    ip: req.ip,
    userId: (req as Request & { user?: { _id?: string } }).user?._id,
    requestId: req.headers['x-request-id']
  }

  if (err instanceof ErrorWithStatus) {
    logger.warn('Request error', {
      ...errorLog,
      errorType: 'ErrorWithStatus'
    })
    return res.status(err.status).json(omit(err, ['status']))
  }

  logger.error('Unhandled error', {
    ...errorLog,
    errorType: 'UnhandledError'
  })

  const message = process.env.NODE_ENV === 'production' ? 'Internal server error' : err.message

  res.status(HTTP_STATUS.INTERNAL_SERVER_ERROR).json({
    message,
    error: 'INTERNAL_SERVER_ERROR'
  })
}
