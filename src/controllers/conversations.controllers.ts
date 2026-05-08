import { Request, Response } from 'express'
import { HTTP_STATUS } from '~/constants/httpStatus'
import { CONVERSATION_MESSAGES } from '~/constants/messages'
import conversationsService from '~/services/conversations.services'

export const getConversationController = async (req: Request, res: Response) => {
  const { receiver_id } = req.params as any
  const limit = Number(req.query.limit) || 20
  const page = Number(req.query.page) || 1
  const sender_id = req.decoded_authorization?.user_id as string
  const result = await conversationsService.getConversation({ sender_id, receiver_id, limit, page })
  res.status(HTTP_STATUS.OK).json({
    message: CONVERSATION_MESSAGES.GET_CONVERSATION_SUCCESS,
    result
  })
}
