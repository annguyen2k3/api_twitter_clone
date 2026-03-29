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
  REFRESH_TOKEN_IS_USED_OR_NOT_EXIST: 'Refresh token is used or not exist',
  REGISTER_SUCCESS: 'Register successfully',
  LOGIN_SUCCESS: 'Login successfully',
  LOGOUT_SUCCESS: 'Logout successfully',
  REFRESH_TOKEN_SUCCESS: 'Refresh token successfully',
  EMAIL_VERIFY_TOKEN_IS_REQUIRED: 'Email verify token is required',
  EMAIL_VERIFY_TOKEN_IS_INVALID: 'Email verify token is invalid',
  EMAIL_VERIFY_TOKEN_IS_USED_OR_NOT_EXIST: 'Email verify token is used or not exist',
  EMAIL_VERIFY_TOKEN_SUCCESS: 'Email verify token successfully',
  EMAIL_ALREADY_VERIFIED_BEFORE: 'Email already verified before',
  RESEND_VERIFY_EMAIL_SUCCESS: 'Resend verify email successfully',
  CHECK_EMAIL_TO_RESET_PASSWORD: 'Check email to reset password',
  FORGOT_PASSWORD_TOKEN_IS_REQUIRED: 'Forgot password token is required',
  FORGOT_PASSWORD_TOKEN_IS_INVALID: 'Forgot password token is invalid',
  FORGOT_PASSWORD_TOKEN_VERIFY_SUCCESS: 'Forgot password token verify successfully',
  RESET_PASSWORD_SUCCESS: 'Reset password successfully'
} as const
