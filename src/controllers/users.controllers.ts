import { Request, Response } from 'express'
import usersService from '~/services/users.services'

export const registerController = async (req: Request, res: Response) => {
  const { email, password } = req.body

  try {
    const result = await usersService.register({ email, password })
    res.status(201).json({
      message: 'Register successfully',
      result
    })
  } catch (error: any) {
    res.status(400).json({
      message: 'Register failed',
      error: error.message
    })
  }
}
