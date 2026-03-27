export const ERRORS_MESSAGES = {
  VALIDATION_ERROR: 'Validation error',
  ENTITY_ERROR: 'Entity error'
} as const

export const USER_MESSAGES = {
  NAME_IS_REQUIRED: 'Name is string have at least 1 and at most 100 characters',
  EMAIL_INVALID: 'Email is invalid',
  EMAIL_ALREADY_EXISTS: 'Email already exists',
  PASSWORD_INVALID:
    'Password is string have at least 6 and at most 50 characters, at least 1 uppercase letter, 1 lowercase letter, 1 number and 1 special character',
  PASSWORD_CONFIRM_NOT_MATCH: 'Confirm password do not match with password',
  DATE_OF_BIRTH_INVALID: 'Date of birth is ISO 8601 format',
  USER_NOT_FOUND: 'User not found',
  PASSWORD_OR_EMAIL_INVALID: 'Password or email is incorrect',
  ACCESS_TOKEN_IS_REQUIRED: 'Access token is required',
  ACCESS_TOKEN_IS_INVALID: 'Access token is invalid',
  REFRESH_TOKEN_IS_REQUIRED: 'Refresh token is required',
  REFRESH_TOKEN_IS_INVALID: 'Refresh token is invalid',
  REFRESH_TOKEN_IS_USED_OR_NOT_EXIST: 'Refresh token is used or not exist'
} as const
