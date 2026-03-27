import { Router } from 'express'
import {
  loginController,
  logoutController,
  registerController
} from '~/controllers/users.controllers'
import {
  accessTokenValidator,
  loginValidator,
  refreshTokenValidator,
  registerValidator
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

export default userRouter
