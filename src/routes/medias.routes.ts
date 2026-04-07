import { Router } from 'express'
import {
  uploadImageController,
  uploadVideoController,
  uploadVideoHLSController
} from '~/controllers/medias.controllers'
import { accessTokenValidator, verifiedUserValidator } from '~/middlewares/users.middlewares'
import { wrapRequestHandler } from '~/utils/handlers'

const mediasRouter = Router()

/**
 * Description: Upload images
 * Path: /medias/upload-images
 * Method: POST
 * Headers: {
 *   Authorization: Bearer <access_token>
 * }
 * Body: {
 *   images: File[]
 * }
 */
mediasRouter.post(
  '/upload-images',
  accessTokenValidator,
  verifiedUserValidator,
  wrapRequestHandler(uploadImageController)
)

/**
 * Description: Upload video
 * Path: /medias/upload-video
 * Method: POST
 * Headers: {
 *   Authorization: Bearer <access_token>
 * }
 * Body: {
 *   video: File
 * }
 */
mediasRouter.post(
  '/upload-video',
  accessTokenValidator,
  verifiedUserValidator,
  wrapRequestHandler(uploadVideoController)
)

/**
 * Description: Upload video HLS
 * Path: /medias/upload-video-hls
 * Method: POST
 * Headers: {
 *   Authorization: Bearer <access_token>
 * }
 * Body: {
 *   video: File
 * }
 */
mediasRouter.post(
  '/upload-video-hls',
  accessTokenValidator,
  verifiedUserValidator,
  wrapRequestHandler(uploadVideoHLSController)
)

export default mediasRouter
