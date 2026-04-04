import { Router } from 'express'
import { serveImageController } from '~/controllers/medias.controllers'
import { wrapRequestHandler } from '~/utils/handlers'

const staticRouter = Router()

staticRouter.get('/image/:filename', wrapRequestHandler(serveImageController))

export default staticRouter
