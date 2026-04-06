import { Router } from 'express'
import {
  serveImageController,
  serveVideoController,
  serveVideoStreamController
} from '~/controllers/medias.controllers'
import { wrapRequestHandler } from '~/utils/handlers'

const staticRouter = Router()

staticRouter.get('/image/:filename', wrapRequestHandler(serveImageController))
staticRouter.get('/video/:filename', wrapRequestHandler(serveVideoController))
staticRouter.get('/video-stream/:filename', wrapRequestHandler(serveVideoStreamController))

export default staticRouter
