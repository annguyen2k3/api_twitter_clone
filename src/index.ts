import express from 'express'
import dotenv from 'dotenv'
import cors from 'cors'
import databaseService from './services/database.services'
import redisConnection from './connections/redis.connection'
import indexRoutes from './routes/index.routes'
import { defaultErrorHandler } from './middlewares/errors.middlewares'
import { initFolder } from './utils/file'
import { setupSwagger } from './docs/setup'
import { createServer } from 'http'
import initSocket from './utils/socket'
import { initEmailQueue, getEmailQueue } from './services/emailQueue.service'
import { initVideoQueue, getVideoQueue } from './services/videoQueue.service'

dotenv.config()

initFolder()

const app = express()
const httpServer = createServer(app)

databaseService.connect().then(async () => {
  databaseService.indexUser()
  databaseService.indexRefreshTokens()
  databaseService.indexVideoStatus()
  databaseService.indexFollowers()
  databaseService.indexTweets()

  const redisConnected = await redisConnection.connect()
  if (redisConnected) {
    initEmailQueue()
    initVideoQueue()
  } else {
    console.warn('[App] Redis not connected. Queues are disabled.')
  }
})

app.use(cors())

app.use(express.json())
app.use(express.urlencoded({ extended: true }))

indexRoutes(app)

setupSwagger(app)

app.get('/', (req, res) => {
  res.send('Hello World')
})

app.get('/health/queues', async (req, res) => {
  const emailQueue = getEmailQueue()
  const videoQueue = getVideoQueue()

  if (!emailQueue || !videoQueue) {
    res.status(503).json({
      status: 'disabled',
      message: 'Queues are disabled (Redis version < 5.0.0 or connection failed)'
    })
    return
  }

  const [emailCounts, videoCounts] = await Promise.all([
    emailQueue.getJobCounts(),
    videoQueue.getJobCounts()
  ])

  const isHealthy = emailCounts.failed < 100 && videoCounts.failed < 50

  res.status(isHealthy ? 200 : 503).json({
    status: isHealthy ? 'healthy' : 'unhealthy',
    queues: {
      email: emailCounts,
      video: videoCounts
    }
  })
})

app.use(defaultErrorHandler)

initSocket(httpServer)

httpServer.listen(process.env.PORT || 3000, () => {
  console.log('Server is running on port', process.env.PORT || 3000)
})
