import { Request, Response } from 'express'
import usersService from '~/services/users.services'
import { ParamsDictionary } from 'express-serve-static-core'
import { LoginReqBody, RegisterReqBody } from '~/models/requests/User.requests'
import User from '~/models/schemas/User.schemas'
import { HTTP_STATUS } from '~/constants/httpStatus'

export const registerController = async (req: Request<ParamsDictionary, any, RegisterReqBody>, res: Response) => {
  const result = await usersService.register(req.body)
  res.status(201).json({
    message: 'Register successfully',
    result
  })
}

export const loginController = async (req: Request<ParamsDictionary, any, LoginReqBody>, res: Response) => {
  const user = req.user as User
  const result = await usersService.login(user._id!.toString())
  res.status(HTTP_STATUS.OK).json({
    message: 'Login successfully',
    result
  })
}
