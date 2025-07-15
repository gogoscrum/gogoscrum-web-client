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
        const token = res.data
        const uploadParams = {
          ...token,
          ...token.params
        }
        // remove uploadParams.params as it's already spread into uploadParams
        delete uploadParams.params

        console.log('Upload parameters initialized:', uploadParams)

        resolve(uploadParams)
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
    // Set all parameters except uploadActionUrl as form data
    for (let key in params) {
      if (key !== 'uploadActionUrl') {
        form.append(key, params[key])
      }
    }
    form.append('file', file)

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
    initUploadParams({ name: blobInfo.filename() }, currentProject?.id, 'TEXT_EDITOR').then((params) => {
      upload(blobInfo.blob(), params)
        .then((uploadedFilePath) => {
          console.log('file uploaded:', uploadedFilePath || params.targetFileUrl)

          const fileDto = {
            name: blobInfo.filename(),
            fullPath: uploadedFilePath || params.targetFileUrl,
            type: 'IMAGE', // Assuming image type for tinymce uploads
            size: blobInfo.blob().size,
            projectId: params.projectId,
            targetType: params.targetType,
            storageProvider: params.provider,
            urlPrefix: params.urlPrefix
          }

          fileApi
            .save(fileDto)
            .then((res) => {
              console.log('file created:', res.data)
              resolve(res.data.url)
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
