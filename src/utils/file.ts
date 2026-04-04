import path from 'path'
import fs from 'fs'
import { Request } from 'express'
import { EntityError } from '~/models/Errors'
import { File } from 'formidable'
import { UPLOAD_TEMP_DIR } from '~/constants/dir'

export const initFolder = () => {
  if (!fs.existsSync(UPLOAD_TEMP_DIR)) {
    fs.mkdirSync(UPLOAD_TEMP_DIR, { recursive: true })
  }
}

export const handleUploadSingleImage = async (req: Request) => {
  const formidable = (await import('formidable')).default
  const form = formidable({
    uploadDir: UPLOAD_TEMP_DIR,
    maxFiles: 1,
    maxFileSize: 1024 * 1024 * 3, // 3MB
    keepExtensions: true,
    filter: ({ name, originalFilename, mimetype }) => {
      const valid = name === 'image' && Boolean(mimetype?.includes('image/'))
      if (!valid) {
        form.emit(
          'error',
          new EntityError({
            errors: { image: { msg: 'File type is not supported', value: originalFilename } }
          })
        )
      }
      return valid
    }
  })
  return new Promise<File>((resolve, reject) => {
    form.parse(req, (err, fields, files) => {
      if (err) {
        return reject(err)
      }

      // eslint-disable-next-line no-extra-boolean-cast
      if (!Boolean(files.image)) {
        return reject(new EntityError({ errors: { image: { msg: 'File is empty', value: '' } } }))
      }
      resolve((files.image as File[])[0])
    })
  })
}

export const getNameFromFullname = (fullname: string) => {
  const nameArr = fullname.split('.')
  nameArr.pop()
  return nameArr.join('.')
}
