import { Express } from 'express'
import userRouter from './users.routes'
import mediasRouter from './medias.routes'
import staticRouter from './static.routes'

export default function (app: Express) {
  app.use('/users', userRouter)
  app.use('/medias', mediasRouter)
  app.use('/static', staticRouter)
}
