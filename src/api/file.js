import { get, post, put, del } from './http'
export const fileApi = {
  getUploadToken: (fileName, projectId, targetType) =>
    get('/api/files/token', { params: { fileName, projectId, targetType } }),
  deleteFileByKey: (fileKey) => del(`/api/files/key/${fileKey}`),
  getById: (id) => get(`/api/files/${id}`),
  save: (file) => {
    if (file.id) {
      return put(`/api/files/${file.id}`, file)
    } else {
      return post(`/api/files`, file)
    }
  },
  delete: (id) => del(`/api/files/${id}`),
  search: (filter) => get('/api/files', { params: filter }),
  getFileBlob: (url) => get(url, { responseType: 'blob' })
}
