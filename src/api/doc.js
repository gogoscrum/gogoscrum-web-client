import { get, post, del } from './http'
export const docApi = {
  getById: (id) => get(`/api/docs/${id}`),
  getByIdReadOnly: (id) => get(`/api/docs/view/${id}`),
  setPublicAccess: (id) => post(`/api/docs/${id}/public`),
  deletePublicAccess: (id) => del(`/api/docs/${id}/public`),
  save: (doc) => {
    if (doc.id) {
      return post(`/api/docs/${doc.id}`, doc)
    } else {
      return post(`/api/docs`, doc)
    }
  },
  delete: (id) => del(`/api/docs/${id}`),
  search: (filter) => get('/api/docs', { params: filter })
}
