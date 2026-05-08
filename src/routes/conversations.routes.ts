import { Router } from 'express'
import { getConversationController } from '~/controllers/conversations.controllers'
import { accessTokenValidator, verifiedUserValidator } from '~/middlewares/users.middlewares'
import { wrapRequestHandler } from '~/utils/handlers'

const conversationsRouter = Router()

/**
 * Description: Get conversation
 * Path: /conversations/receivers/:receiver_id
 * Method: GET
 * Headers: {
 *   Authorization: Bearer <access_token>
 * }
 * Query: {
 */
conversationsRouter.get(
  '/receivers/:receiver_id',
  accessTokenValidator,
  verifiedUserValidator,
  wrapRequestHandler(getConversationController)
)

export default conversationsRouter
