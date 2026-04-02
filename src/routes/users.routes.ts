import { Router } from 'express'
import {
  followUserController,
  forgotPasswordController,
  getMeController,
  loginController,
  logoutController,
  refreshTokenController,
  registerController,
  resendVerifyEmailController,
  resetPasswordController,
  unfollowUserController,
  updateMeController,
  verifyEmailController,
  verifyForgotPasswordController
} from '~/controllers/users.controllers'
import { filterMiddleware } from '~/middlewares/common.middlewares'
import {
  accessTokenValidator,
  emailVerifyTokenValidator,
  followUserValidator,
  forgotPasswordTokenValidator,
  forgotPasswordValidator,
  loginValidator,
  refreshTokenValidator,
  registerValidator,
  resetPasswordValidator,
  unfollowUserValidator,
  updateMeValidator,
  verifiedUserValidator
} from '~/middlewares/users.middlewares'
import { wrapRequestHandler } from '~/utils/handlers'

const userRouter = Router()

/**
 * Description: Register a new user
 * Path: /users/register
 * Method: POST
 * Body: {
 *   name: string
 *   email: string
 *   password: string
 *   confirm_password: string
 *   date_of_birth: string
 * }
 */
userRouter.post('/register', registerValidator, wrapRequestHandler(registerController))

/**
 * Description: Login a user
 * Path: /users/login
 * Method: POST
 * Body: {
 *   email: string
 *   password: string
 * }
 */
userRouter.post('/login', loginValidator, wrapRequestHandler(loginController))

/**
 * Description: Logout a user
 * Path: /users/logout
 * Method: POST
 * Headers: {
 *   Authorization: Bearer <access_token>
 * }
 * Body: {
 *   refresh_token: string
 * }
 */
userRouter.post(
  '/logout',
  accessTokenValidator,
  refreshTokenValidator,
  wrapRequestHandler(logoutController)
)

/**
 * Description: Refresh token
 * Path: /users/refresh-token
 * Method: POST
 * Body: {
 *   refresh_token: string
 * }
 */
userRouter.post('/refresh-token', refreshTokenValidator, wrapRequestHandler(refreshTokenController))

/**
 * Description: Verify email
 * Path: /users/verify-email
 * Method: POST
 * Body: {
 *   email_verify_token: string
 * }
 */
userRouter.post(
  '/verify-email',
  emailVerifyTokenValidator,
  wrapRequestHandler(verifyEmailController)
)

/**
 * Description: Resend verify email
 * Path: /users/resend-verify-email
 * Method: POST
 * Headers: {
 *   Authorization: Bearer <access_token>
 * }
 * Body: {}
 */
userRouter.post(
  '/resend-verify-email',
  accessTokenValidator,
  wrapRequestHandler(resendVerifyEmailController)
)

/**
 * Description: Submit email to reset password, send email to user's email address
 * Path: /users/forgot-password
 * Method: POST
 * Body: {
 *   email: string
 * }
 */
userRouter.post(
  '/forgot-password',
  forgotPasswordValidator,
  wrapRequestHandler(forgotPasswordController)
)

/**
 * Description: Verify link token in email to reset password
 * Path: /users/verify-forgot-password
 * Method: POST
 * Body: {
 *   forgot_password_token: string
 * }
 */
userRouter.post(
  '/verify-forgot-password',
  forgotPasswordTokenValidator,
  wrapRequestHandler(verifyForgotPasswordController)
)

/**
 * Description: Reset password
 * Path: /users/reset-password
 * Method: POST
 * Body: {
 *   password: string
 *   confirm_password: string
 *   forgot_password_token: string
 * }
 */
userRouter.post(
  '/reset-password',
  resetPasswordValidator,
  wrapRequestHandler(resetPasswordController)
)

/**
 * Description: Get my profile
 * Path: /users/me
 * Method: GET
 * Headers: {
 *   Authorization: Bearer <access_token>
 * }
 */
userRouter.get(
  '/me',
  accessTokenValidator,
  verifiedUserValidator,
  wrapRequestHandler(getMeController)
)

/**
 * Description: Update my profile
 * Path: /users/me
 * Method: PATCH
 * Headers: {
 *   Authorization: Bearer <access_token>
 * }
 * Body: UpdateMeReqBody
 */
userRouter.patch(
  '/me',
  accessTokenValidator,
  verifiedUserValidator,
  updateMeValidator,
  filterMiddleware([
    'name',
    'date_of_birth',
    'bio',
    'location',
    'website',
    'username',
    'avatar',
    'cover_photo'
  ]),
  wrapRequestHandler(updateMeController)
)

/**
 * Description: Follower someone
 * Path: /users/follow/:user_id
 * Method: POST
 * Headers: {
 *   Authorization: Bearer <access_token>
 * }
 */
userRouter.post(
  '/follow/:user_id',
  accessTokenValidator,
  verifiedUserValidator,
  followUserValidator,
  wrapRequestHandler(followUserController as any)
)

/**
 * Description: Unfollow someone
 * Path: /users/follow/:user_id
 * Method: DELETE
 * Headers: {
 *   Authorization: Bearer <access_token>
 * }
 */
userRouter.delete(
  '/follow/:user_id',
  accessTokenValidator,
  verifiedUserValidator,
  unfollowUserValidator,
  wrapRequestHandler(unfollowUserController as any)
)

export default userRouter
