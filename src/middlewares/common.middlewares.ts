import { NextFunction, Request, Response } from 'express'
import { checkSchema } from 'express-validator'
import { pick } from 'lodash'
import { COMMON_MESSAGES } from '~/constants/messages'
import { validate } from '~/utils/validation'

type filterKey<T> = Array<keyof T>

export const filterMiddleware =
  <T>(keys: filterKey<T>) =>
  (req: Request, res: Response, next: NextFunction) => {
    req.body = pick(req.body, keys)
    next()
  }

export const paginationValidator = validate(
  checkSchema(
    {
      limit: {
        isNumeric: true,
        custom: {
          options: async (value, { req }) => {
            const num = Number(value)
            if (num < 1 || num > 100) {
              throw new Error(COMMON_MESSAGES.LIMIT_MUST_BE_BETWEEN_1_AND_100)
            }
            return true
          }
        }
      },
      page: {
        isNumeric: true
      }
    },
    ['query']
  )
)
