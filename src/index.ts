import express from 'express'
import dotenv from 'dotenv'
import databaseService from './services/database.services'
import indexRoutes from './routes/index.routes'
import { defaultErrorHandler } from './middlewares/errors.middleware'

dotenv.config()

const app = express()

databaseService.connect()

app.use(express.json())
app.use(express.urlencoded({ extended: true }))

indexRoutes(app)

app.get('/', (req, res) => {
  res.send('Hello World')
})

app.use(defaultErrorHandler)

app.listen(3000, () => {
  console.log('Server is running on http://localhost:3000')
})
