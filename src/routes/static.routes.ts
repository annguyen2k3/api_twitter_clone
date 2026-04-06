import { Router } from 'express'
import { serveImageController, serveVideoController } from '~/controllers/medias.controllers'
import { wrapRequestHandler } from '~/utils/handlers'

const staticRouter = Router()

staticRouter.get('/image/:filename', wrapRequestHandler(serveImageController))
staticRouter.get('/video/:filename', wrapRequestHandler(serveVideoController))

export default staticRouter
