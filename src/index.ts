import express from 'express'
import dotenv from 'dotenv'
import databaseService from './services/database.services'
import indexRoutes from './routes/index.routes'
import { defaultErrorHandler } from './middlewares/errors.middlewares'
import { initFolder } from './utils/file'
import { UPLOAD_IMAGE_DIR, UPLOAD_VIDEO_DIR } from './constants/dir'

dotenv.config()

initFolder()

const app = express()

databaseService.connect()

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
