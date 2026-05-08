import { Server as ServerHttp } from 'http'

import { Server } from 'socket.io'
import { ObjectId } from 'mongodb'
import { verifyAccessToken } from '~/middlewares/common.middlewares'
import { TokenPayload } from '~/models/requests/User.requests'
import { UserVerifyStatus } from '~/constants/enums'
import { ErrorWithStatus } from '~/models/Errors'
import { USER_MESSAGES } from '~/constants/messages'
import { HTTP_STATUS } from '~/constants/httpStatus'
import Conversation from '~/models/schemas/Conversations.schemas'
import databaseService from '~/services/database.services'

const initSocket = (httpServer: ServerHttp) => {
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
  io.use(async (socket, next) => {
    const { Authorization } = socket.handshake.auth
    if (!Authorization || !Authorization.startsWith('Bearer ')) {
      return next({
        message: 'Missing or invalid Authorization header',
        name: 'UnauthorizedError'
      })
    }
    const accessToken = Authorization.split(' ')[1]
    try {
      const decoded_authorization = await verifyAccessToken(accessToken)
      const { verify } = decoded_authorization as TokenPayload
      if (verify !== UserVerifyStatus.Verified) {
        throw new ErrorWithStatus({
          message: USER_MESSAGES.USER_NOT_VERIFIED,
          status: HTTP_STATUS.FORBIDDEN
        })
      }

      socket.handshake.auth.decoded_authorization = decoded_authorization
      socket.handshake.auth.accessToken = accessToken
      next()
    } catch (error) {
      next({
        message: 'Unauthorized',
        name: 'UnauthorizedError',
        data: error
      })
    }
  })
  io.on('connection', (socket) => {
    console.log(`user ${socket.id} connected`)
    const { user_id } = socket.handshake.auth.decoded_authorization as TokenPayload
    users[user_id] = {
      socket_id: socket.id
    }
    socket.join(user_id)
    console.log(users)

    socket.use(async (packet, next) => {
      const { accessToken } = socket.handshake.auth
      try {
        await verifyAccessToken(accessToken)
        next()
      } catch (error) {
        next(new Error('Unauthorized'))
      }
    })

    socket.on('error', (error) => {
      if (error.message === 'Unauthorized') {
        socket.disconnect()
      }
      throw error
    })

    socket.on('send_message', async (data) => {
      const { receiver_id, content } = data.payload
      const { user_id: sender_id } = socket.handshake.auth.decoded_authorization as TokenPayload
      if (!sender_id || !receiver_id || !content) return

      const conversation = new Conversation({
        sender_id: new ObjectId(sender_id),
        receiver_id: new ObjectId(receiver_id),
        content: content
      })

      const result = await databaseService.conversations.insertOne(conversation)
      conversation._id = result.insertedId

      io.to(receiver_id).emit('receive_message', {
        payload: conversation
      })
      io.to(sender_id).emit('message_sent', {
        payload: conversation
      })
    })

    socket.on('disconnect', () => {
      delete users[user_id]
      console.log(`user ${socket.id} disconnected`)
    })
  })
}

export default initSocket
