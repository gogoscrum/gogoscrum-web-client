import { get, post, put, del } from './http'

export const tagApi = {
  create: (tag) => post('/api/tags', tag),
  get: (id) => get(`/api/tags/${id}`),
  update: (id, tag) => put(`/api/tags/${id}`, tag),
  search: (filter) => post('/api/tags/search', filter),
  delete: (id) => del(`/api/tags/${id}`)
}
