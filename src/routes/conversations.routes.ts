import { Router } from 'express'
import { getConversationController } from '~/controllers/conversations.controllers'
import { paginationValidator } from '~/middlewares/common.middlewares'
import {
  accessTokenValidator,
  getConversationValidator,
  verifiedUserValidator
} from '~/middlewares/users.middlewares'
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
  paginationValidator,
  getConversationValidator,
  wrapRequestHandler(getConversationController)
)

export default conversationsRouter
