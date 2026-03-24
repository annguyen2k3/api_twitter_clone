import { Router } from 'express'
import { registerController } from '~/controllers/users.controllers'
import { registerValidator } from '~/middlewares/users.middlewares'
import { wrapRequestHandler } from '~/utils/handlers'

const userRouter = Router()

userRouter.post('/register', registerValidator, wrapRequestHandler(registerController))

export default userRouter
