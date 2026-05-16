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
import { logger } from './utils/logger'
import { requestLogger } from './middlewares/requestLogger.middleware'

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
    logger.warn('Redis not connected. Queues are disabled.')
  }
})

app.use(cors())

app.use(requestLogger)
app.use(express.json())
app.use(express.urlencoded({ extended: true }))

app.get('/robots.txt', (req, res) => {
  res.type('text/plain').send('User-agent: *\nDisallow: /')
})

app.get('/favicon.ico', (req, res) => {
  res.status(204).end()
})

app.get('/favicon.png', (req, res) => {
  res.status(204).end()
})

app.get('/', (req, res) => {
  res.json({
    message: 'Twitter Clone API Server',
    version: '1.0.0',
    documentation: '/api-docs'
  })
})

const clientUrl = process.env.CLIENT_URL || 'http://localhost:5500'
const frontendPaths = ['/new-feeds', '/upload-images', '/profile', '/login', '/register']
frontendPaths.forEach((path) => {
  app.get(path, (req, res) => {
    res.redirect(`${clientUrl}${path}`)
  })
  app.get(`${path}/*`, (req, res) => {
    res.redirect(`${clientUrl}${req.path}`)
  })
})

indexRoutes(app)

setupSwagger(app)

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
  logger.info('Server started', {
    port: process.env.PORT || 4000,
    env: process.env.NODE_ENV || 'development'
  })
})
