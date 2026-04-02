import { NextFunction, Request, Response } from 'express'
import { pick } from 'lodash'

type filterKey<T> = Array<keyof T>

export const filterMiddleware =
  <T>(keys: filterKey<T>) =>
  (req: Request, res: Response, next: NextFunction) => {
    req.body = pick(req.body, keys)
    next()
  }
