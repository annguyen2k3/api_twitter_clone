import { Request, Response } from 'express'
import usersService from '~/services/users.services'
import { ParamsDictionary } from 'express-serve-static-core'
import {
  LoginReqBody,
  LogoutReqBody,
  RefreshTokenReqBody,
  RegisterReqBody,
  TokenPayload
} from '~/models/requests/User.requests'
import User from '~/models/schemas/User.schemas'
import { HTTP_STATUS } from '~/constants/httpStatus'
import { USER_MESSAGES } from '~/constants/messages'

// POST: /users/register
export const registerController = async (
  req: Request<ParamsDictionary, any, RegisterReqBody>,
  res: Response
) => {
  const result = await usersService.register(req.body)
  res.status(201).json({
    message: USER_MESSAGES.REGISTER_SUCCESS,
    result
  })
}

// POST: /users/login
export const loginController = async (
  req: Request<ParamsDictionary, any, LoginReqBody>,
  res: Response
) => {
  const user = req.user as User
  const result = await usersService.login({ userId: user._id!.toString(), verify: user.verify })
  res.status(HTTP_STATUS.OK).json({
    message: USER_MESSAGES.LOGIN_SUCCESS,
    result
  })
}

// POST: /users/logout
export const logoutController = async (
  req: Request<ParamsDictionary, any, LogoutReqBody>,
  res: Response
) => {
  const { refresh_token } = req.body
  await usersService.logout(refresh_token)
  res.status(HTTP_STATUS.OK).json({
    message: USER_MESSAGES.LOGOUT_SUCCESS
  })
}

// POST: /users/refresh-token
export const refreshTokenController = async (
  req: Request<ParamsDictionary, any, RefreshTokenReqBody>,
  res: Response
) => {
  const { refresh_token } = req.body
  const { user_id, verify } = req.decoded_refresh_token as TokenPayload
  const result = await usersService.refreshToken({
    userId: user_id,
    verify: verify,
    refreshToken: refresh_token
  })
  res.status(HTTP_STATUS.OK).json({
    message: USER_MESSAGES.REFRESH_TOKEN_SUCCESS,
    result
  })
}
