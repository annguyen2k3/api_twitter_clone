import { Express } from 'express'
import userRouter from './users.routes'
import mediasRouter from './medias.routes'

export default function (app: Express) {
  app.use('/users', userRouter)
  app.use('/medias', mediasRouter)
}
