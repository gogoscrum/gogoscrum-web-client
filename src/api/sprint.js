import { get, post, put, del } from './http'

export const sprintApi = {
  create: (sprint) => post('/api/sprints', sprint),
  getById: (id) => get(`/api/sprints/${id}`),
  update: (id, sprint) => put(`/api/sprints/${id}`, sprint),
  delete: (id) => del(`/api/sprints/${id}`),
  getSprintCumulativeFlowDiagram: (sprintId) => get(`/api/sprints/${sprintId}/charts/cumulative`)
}
