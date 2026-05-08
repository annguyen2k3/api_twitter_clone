import express from 'express'
import dotenv from 'dotenv'
import cors from 'cors'
import databaseService from './services/database.services'
import indexRoutes from './routes/index.routes'
import { defaultErrorHandler } from './middlewares/errors.middlewares'
import { initFolder } from './utils/file'
import { setupSwagger } from './docs/setup'
import { createServer } from 'http'
import { Server } from 'socket.io'
import { ObjectId } from 'mongodb'
import Conversation from './models/schemas/Conversations.schemas'

dotenv.config()

initFolder()

const app = express()
const httpServer = createServer(app)

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

setupSwagger(app)

app.get('/', (req, res) => {
  res.send('Hello World')
})

app.use(defaultErrorHandler)

const io = new Server(httpServer, {
  cors: {
    origin: 'http://localhost:5500'
  }
})

const users: {
  [key: string]: {
    socket_id: string
  }
} = {}

io.on('connection', (socket) => {
  console.log(`user ${socket.id} connected`)
  const user_id = socket.handshake.auth._id
  users[user_id] = {
    socket_id: socket.id
  }
  socket.join(user_id)
  console.log(users)

  socket.on('private-message', async (data) => {
    if (!data.to) return

    await databaseService.conversations.insertOne(
      new Conversation({
        sender_id: new ObjectId(user_id),
        receiver_id: new ObjectId(data.to),
        content: data.content
      })
    )

    io.to(data.to).emit('receive-private-message', {
      content: data.content,
      from: user_id
    })
  })

  socket.on('disconnect', () => {
    delete users[user_id]
    console.log(`user ${socket.id} disconnected`)
  })
})

httpServer.listen(process.env.PORT || 3000, () => {
  console.log('Server is running on port', process.env.PORT || 3000)
})
