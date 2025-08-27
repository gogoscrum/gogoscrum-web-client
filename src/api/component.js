import { get, post, put, del } from './http'

export const componentApi = {
  getAll: (projectId) => get(`/api/components?projectId=${projectId}`),
  getTree: (projectId) => get(`/api/components/tree?projectId=${projectId}`),
  create: (component) => post('/api/components', component),
  update: (id, component) => put(`/api/components/${id}`, component),
  delete: (id) => del(`/api/components/${id}`),
  get: (id) => get(`/api/components/${id}`),
  updateSeq: (ids) => put('/api/components/seq', ids)
}
