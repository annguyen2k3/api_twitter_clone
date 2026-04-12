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
  OLD_PASSWORD_IS_INCORRECT: 'Old password is incorrect',
  DATE_OF_BIRTH_INVALID: 'Date of birth is ISO 8601 format',
  USER_NOT_FOUND: 'User not found',
  PASSWORD_OR_EMAIL_INVALID: 'Password or email is incorrect',
  ACCESS_TOKEN_IS_REQUIRED: 'Access token is required',
  ACCESS_TOKEN_IS_INVALID: 'Access token is invalid',
  REFRESH_TOKEN_IS_REQUIRED: 'Refresh token is required',
  REFRESH_TOKEN_IS_INVALID: 'Refresh token is invalid',
  REFRESH_TOKEN_IS_USED_OR_NOT_EXIST: 'Refresh token is used or not exist',
  REFRESH_TOKEN_EXPIRED: 'Refresh token is expired',
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
  RESET_PASSWORD_SUCCESS: 'Reset password successfully',
  GET_ME_SUCCESS: 'Get my profile successfully',
  USER_NOT_VERIFIED: 'User not verified',
  BIO_MUST_BE_STRING: 'Bio must be a string',
  BIO_LENGTH: 'Bio must be at least 1 and at most 200 characters',
  LOCATION_MUST_BE_STRING: 'Location must be a string',
  LOCATION_LENGTH: 'Location must be at least 1 and at most 200 characters',
  WEBSITE_MUST_BE_STRING: 'Website must be a string',
  WEBSITE_LENGTH: 'Website must be at least 1 and at most 200 characters',
  USERNAME_MUST_BE_STRING: 'Username must be a string',
  USERNAME_LENGTH: 'Username must be at least 1 and at most 50 characters',
  USERNAME_INVALID:
    'Username is string have at least 4 and at most 30 characters, not start with a number and not contain only numbers, not contain special characters except underscore',
  USERNAME_ALREADY_EXISTS: 'Username already exists',
  AVATAR_MUST_BE_STRING: 'Avatar must be a string',
  COVER_PHOTO_MUST_BE_STRING: 'Cover photo must be a string',
  IMG_URL_MUST_BE_STRING: 'Image URL must be a string',
  IMG_URL_LENGTH: 'Image URL must be at least 1 and at most 400 characters',
  UPDATE_ME_SUCCESS: 'Update my profile successfully',
  FOLLOWED_USER_ID_IS_INVALID: 'Followed user ID is invalid',
  FOLLOW_USER_SUCCESS: 'Follow user successfully',
  FOLLOWED: 'Followed',
  ALREADY_UNFOLLOWED: 'Already unfollowed',
  UNFOLLOW_USER_SUCCESS: 'Unfollow user successfully',
  CHANGE_PASSWORD_SUCCESS: 'Change password successfully',
  UPLOAD_SUCCESS: 'Upload successfully',
  GET_VIDEO_STATUS_SUCCESS: 'Get video status successfully'
} as const

export const TWEET_MESSAGES = {
  TYPE_IS_INVALID: 'Type is invalid',
  AUDIENCE_IS_INVALID: 'Audience is invalid',
  PARENT_ID_IS_INVALID: 'Parent ID is invalid',
  PARENT_ID_MUST_BE_NULL: 'Parent ID must be null',
  CONTENT_MUST_BE_A_NON_EMPTY_STRING: 'Content must be a non-empty string',
  CONTENT_MUST_BE_EMPTY_STRING: 'Content must be an empty string',
  HASHTAGS_MUST_BE_AN_ARRAY_OF_STRINGS: 'Hashtags must be an array of strings',
  MENTIONS_MUST_BE_AN_ARRAY_OF_USER_ID: 'Mentions must be an array of user ID',
  MEDIAS_MUST_BE_AN_ARRAY_OF_MEDIA_OBJECT: 'Medias must be an array of media object',
  CREATE_TWEET_SUCCESS: 'Create tweet successfully'
}

export const BOOKMARK_MESSAGES = {
  BOOKMARK_TWEET_SUCCESS: 'Bookmark tweet successfully',
  UNBOOKMARK_TWEET_SUCCESS: 'Unbookmark tweet successfully'
}
