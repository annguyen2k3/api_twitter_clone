import { Express } from 'express'
import userRouter from './users.routes'

export default function (app: Express) {
  app.use('/users', userRouter)
}
