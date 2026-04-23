import express from 'express'
import dotenv from 'dotenv'
import cors from 'cors'
import databaseService from './services/database.services'
import indexRoutes from './routes/index.routes'
import { defaultErrorHandler } from './middlewares/errors.middlewares'
import { initFolder } from './utils/file'

dotenv.config()

initFolder()

const app = express()

databaseService.connect().then(() => {
  databaseService.indexUser()
  databaseService.indexRefreshTokens()
  databaseService.indexVideoStatus()
  databaseService.indexFollowers()
  databaseService.indexTweets()
})

app.use(cors())

app.use(express.json())
app.use(express.urlencoded({ extended: true }))

indexRoutes(app)

app.get('/', (req, res) => {
  res.send('Hello World')
})

app.use(defaultErrorHandler)

app.listen(process.env.PORT || 3000, () => {
  console.log('Server is running on port', process.env.PORT || 3000)
})
