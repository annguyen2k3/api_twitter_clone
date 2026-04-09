import path from 'path'
import fs from 'fs'
import { Request } from 'express'
import { EntityError } from '~/models/Errors'
import { File } from 'formidable'
import {
  UPLOAD_IMAGE_DIR,
  UPLOAD_IMAGE_TEMP_DIR,
  UPLOAD_VIDEO_DIR,
  UPLOAD_VIDEO_TEMP_DIR
} from '~/constants/dir'

export const initFolder = () => {
  ;[UPLOAD_IMAGE_TEMP_DIR, UPLOAD_VIDEO_TEMP_DIR].forEach((dir) => {
    if (!fs.existsSync(dir)) {
      fs.mkdirSync(dir, { recursive: true })
    }
  })
}

export const getNameFromFullname = (fullname: string) => {
  const nameArr = fullname.split('.')
  nameArr.pop()
  return nameArr.join('.')
}

export const handleUploadImage = async (req: Request) => {
  const formidable = (await import('formidable')).default
  const form = formidable({
    uploadDir: UPLOAD_IMAGE_TEMP_DIR,
    maxFiles: 4,
    maxFileSize: 1024 * 1024 * 12, // 3MB * 4 = 12MB
    keepExtensions: true,
    filter: ({ name, originalFilename, mimetype }) => {
      const valid = Boolean(mimetype?.includes('image/'))
      if (!valid) {
        form.emit(
          'error',
          new EntityError({
            errors: { images: { msg: 'File type is not supported', value: originalFilename } }
          })
        )
      }
      return valid
    }
  })
  return new Promise<File[]>((resolve, reject) => {
    form.parse(req, (err, fields, files) => {
      if (err) {
        return reject(err)
      }

      // eslint-disable-next-line no-extra-boolean-cast
      if (!Boolean(files.images)) {
        return reject(new EntityError({ errors: { images: { msg: 'File is empty', value: '' } } }))
      }
      resolve(files.images as File[])
    })
  })
}

export const handleUploadVideo = async (req: Request) => {
  const formidable = (await import('formidable')).default
  const form = formidable({
    uploadDir: UPLOAD_VIDEO_DIR,
    maxFiles: 1,
    maxFileSize: 1024 * 1024 * 50, // 50MB
    keepExtensions: true,
    filter: ({ name, originalFilename, mimetype }) => {
      const valid = Boolean(mimetype?.includes('video/'))
      if (!valid) {
        form.emit(
          'error',
          new EntityError({
            errors: { video: { msg: 'File type is not supported', value: originalFilename } }
          })
        )
      }
      return valid
    }
  })
  return new Promise<File[]>((resolve, reject) => {
    form.parse(req, (err, fields, files) => {
      if (err) {
        return reject(err)
      }

      // eslint-disable-next-line no-extra-boolean-cast
      if (!Boolean(files.video)) {
        return reject(new EntityError({ errors: { video: { msg: 'File is empty', value: '' } } }))
      }
      resolve(files.video as File[])
    })
  })
}

export const handleUploadVideoHLS = async (req: Request) => {
  const formidable = (await import('formidable')).default
  const nanoId = (await import('nanoid')).nanoid
  const idName = nanoId()
  const folderPath = path.resolve(UPLOAD_VIDEO_DIR, idName)
  fs.mkdirSync(folderPath)
  const form = formidable({
    uploadDir: folderPath,
    maxFiles: 1,
    maxFileSize: 1024 * 1024 * 50, // 50MB
    // keepExtensions: true,
    filter: ({ name, originalFilename, mimetype }) => {
      const valid = Boolean(mimetype?.includes('video/'))
      if (!valid) {
        form.emit(
          'error',
          new EntityError({
            errors: { video: { msg: 'File type is not supported', value: originalFilename } }
          })
        )
      }
      return valid
    },
    filename: function () {
      return idName
    }
  })
  return new Promise<File[]>((resolve, reject) => {
    form.parse(req, (err, fields, files) => {
      if (err) {
        return reject(err)
      }

      // eslint-disable-next-line no-extra-boolean-cast
      if (!Boolean(files.video)) {
        return reject(new EntityError({ errors: { video: { msg: 'File is empty', value: '' } } }))
      }
      const videos = files.video as File[]
      videos.forEach((video) => {
        const ext = path.extname(video.originalFilename as string)
        const newPath = video.filepath + ext

        fs.renameSync(video.filepath, newPath)

        video.filepath = newPath
        video.newFilename = video.newFilename + ext
      })
      resolve(files.video as File[])
    })
  })
}
