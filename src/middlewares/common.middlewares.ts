import { NextFunction, Request, Response } from 'express'
import { checkSchema } from 'express-validator'
import { JsonWebTokenError } from 'jsonwebtoken'
import { capitalize, pick } from 'lodash'
import { HTTP_STATUS } from '~/constants/httpStatus'
import { COMMON_MESSAGES, USER_MESSAGES } from '~/constants/messages'
import { ErrorWithStatus } from '~/models/Errors'
import { verifyToken } from '~/utils/jwt'
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
        optional: true,
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
        optional: true,
        isNumeric: true
      }
    },
    ['query']
  )
)

export const verifyAccessToken = async (accessToken: string, req?: Request) => {
  if (!accessToken) {
    throw new ErrorWithStatus({
      message: USER_MESSAGES.ACCESS_TOKEN_IS_REQUIRED,
      status: HTTP_STATUS.UNAUTHORIZED
    })
  }
  try {
    const decoded_authorization = await verifyToken({
      token: accessToken,
      secretOrPublicKey: process.env.JWT_SECRET_ACCESS_TOKEN as string
    })
    if (req) {
      ;(req as Request).decoded_authorization = decoded_authorization
      return true
    }
    return decoded_authorization
  } catch (error) {
    throw new ErrorWithStatus({
      message: capitalize((error as JsonWebTokenError).message),
      status: HTTP_STATUS.UNAUTHORIZED
    })
  }
}
