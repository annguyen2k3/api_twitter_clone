import { Router } from 'express'
import { searchController } from '~/controllers/search.controllers'
import { paginationValidator } from '~/middlewares/common.middlewares'
import {
  accessTokenValidator,
  isUserLoggedInValidator,
  verifiedUserValidator
} from '~/middlewares/users.middlewares'
import { wrapRequestHandler } from '~/utils/handlers'

const searchRouter = Router()

/**
 * Description: Search tweets
 * Path: /search
 * Method: GET
 * Headers: {
 *   Authorization: Bearer <access_token> (optional)
 * }
 * Query: {
 *   content: string (endcodeURIComponent)
 *   page: number
 *   limit: number
 * }
 */
searchRouter.get(
  '/',
  paginationValidator,
  isUserLoggedInValidator(accessTokenValidator),
  isUserLoggedInValidator(verifiedUserValidator),
  wrapRequestHandler(searchController)
)

export default searchRouter
