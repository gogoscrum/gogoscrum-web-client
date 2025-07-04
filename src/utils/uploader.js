import { fileApi } from '@/api/file.js'
import axios from 'axios'
import store from '@/modules/store'

const mimeTypePrefixes = {
  IMAGE: ['image/'],
  AUDIO: ['audio/'],
  VIDEO: ['video/'],
  WORD: ['application/msword', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document'],
  EXCEL: ['application/vnd.ms-excel', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet'],
  PDF: ['application/pdf'],
  PPT: ['application/vnd.ms-powerpoint', 'application/vnd.openxmlformats-officedocument.presentationml.presentation'],
  ZIP: ['application/zip'],
  RAR: ['application/vnd.rar', 'application/x-rar']
}

const getFileType = function (mimeType) {
  for (let key in mimeTypePrefixes) {
    let prefixes = mimeTypePrefixes[key]

    let matched = prefixes.some((prefix) => {
      return mimeType.startsWith(prefix)
    })

    if (matched) {
      return key
    }
  }
  return 'OTHER'
}

const initUploadParams = (file, projectId, targetType) => {
  return new Promise((resolve, reject) => {
    fileApi.getUploadToken(file.name, projectId, targetType).then(
      (res) => {
        resolve(res.data)
      },
      function (err) {
        console.error('Failed to get upload token:', err)
        reject(err)
      }
    )
  })
}

const upload = function (file, params) {
  return new Promise((resolve, reject) => {
    let form = new FormData()
    form.append('file', file)
    form.append('path', params.path)
    form.append('targetFileName', params.targetFileName)

    axios
      .post(params.uploadActionUrl, form)
      .then((res) => {
        resolve(res.data)
      })
      .catch((err) => {
        reject(err)
      })
  })
}

const uploadFromTinymce = function (blobInfo, progress) {
  return new Promise((resolve, reject) => {
    const currentProject = store.get('project')
    initUploadParams({ name: blobInfo.filename() }, currentProject?.id, 'TEXT_EDITOR').then((token) => {
      upload(blobInfo.blob(), token)
        .then((uploadedFilePath) => {
          console.log('file uploaded:', uploadedFilePath)

          const fileDto = {
            name: blobInfo.filename(),
            fullPath: uploadedFilePath,
            type: 'IMAGE', // Assuming image type for tinymce uploads
            size: blobInfo.blob().size,
            projectId: token.projectId,
            targetType: token.targetType,
            storageProvider: token.provider,
            urlPrefix: token.urlPrefix
          }

          fileApi
            .save(fileDto)
            .then((savedFile) => {
              console.log('file created:', savedFile)

              // Resolve with the full URL of the uploaded file
              resolve(token.urlPrefix + uploadedFilePath)
            })
            .catch((err) => {
              console.error('Failed to save file:', err)
              reject(err)
            })
        })
        .catch((err) => {
          reject(err)
        })
    })
  })
}

export default {
  getFileType,
  initUploadParams,
  upload,
  uploadFromTinymce
}
