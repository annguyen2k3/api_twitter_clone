import { checkSchema } from 'express-validator'
import { USER_MESSAGES } from '~/constants/messages'
import { ErrorWithStatus } from '~/models/Errors'
import usersService from '~/services/users.services'
import { validate } from '~/utils/validation'

export const registerValidator = validate(
  checkSchema({
    name: {
      notEmpty: true,
      isString: true,
      isLength: {
        options: { min: 1, max: 100 }
      },
      trim: true,
      errorMessage: USER_MESSAGES.NAME_IS_REQUIRED
    },
    email: {
      notEmpty: true,
      isString: true,
      isEmail: true,
      trim: true,
      errorMessage: USER_MESSAGES.EMAIL_INVALID,
      custom: {
        options: async (value) => {
          const isExists = await usersService.checkEmailExists(value)
          if (isExists) {
            throw new ErrorWithStatus({ message: USER_MESSAGES.EMAIL_ALREADY_EXISTS, status: 400 })
          }
          return true
        }
      }
    },
    password: {
      notEmpty: true,
      isString: true,
      isLength: {
        options: { min: 6, max: 50 }
      },
      isStrongPassword: {
        options: {
          minLength: 6,
          minLowercase: 1,
          minUppercase: 1,
          minNumbers: 1,
          minSymbols: 1
        }
      },
      errorMessage: USER_MESSAGES.PASSWORD_INVALID
    },
    confirm_password: {
      notEmpty: true,
      isString: true,
      isLength: {
        options: { min: 6, max: 50 }
      },
      isStrongPassword: {
        options: {
          minLength: 6,
          minLowercase: 1,
          minUppercase: 1,
          minNumbers: 1,
          minSymbols: 1
        }
      },
      errorMessage: USER_MESSAGES.DATE_OF_BIRTH_INVALID,
      custom: {
        options: (value, { req }) => {
          if (value !== req.body.password) {
            throw new Error(USER_MESSAGES.PASSWORD_CONFIRM_NOT_MATCH)
          }
          return true
        }
      }
    },
    date_of_birth: {
      isISO8601: {
        options: {
          strict: true,
          strictSeparator: true
        }
      },
      errorMessage: USER_MESSAGES.DATE_OF_BIRTH_INVALID
    }
  })
)
