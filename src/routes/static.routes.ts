import { Router } from 'express'
import {
  serveImageController,
  serveM3u8Controller,
  serveSegmentController,
  serveVideoController,
  serveVideoStreamController
} from '~/controllers/medias.controllers'
import { wrapRequestHandler } from '~/utils/handlers'

const staticRouter = Router()

staticRouter.get('/image/:filename', wrapRequestHandler(serveImageController))
staticRouter.get('/video/:filename', wrapRequestHandler(serveVideoController))
staticRouter.get('/video-stream/:filename', wrapRequestHandler(serveVideoStreamController))
staticRouter.get('/video-hls/:id/master.m3u8', wrapRequestHandler(serveM3u8Controller))
staticRouter.get('/video-hls/:id/:v/:segment', wrapRequestHandler(serveSegmentController))

export default staticRouter
