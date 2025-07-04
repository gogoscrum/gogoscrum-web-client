import { post, del } from './http'
export const commentApi = {
  create: (comment) => post('/api/comments', comment),
  update: (id, comment) => post(`/api/comments/${id}`, comment),
  delete: (id) => del(`/api/comments/${id}`)
}
