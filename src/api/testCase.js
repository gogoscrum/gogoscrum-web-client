import { get, post, put, del } from './http'
export const testCaseApi = {
  get: (id) => get(`/api/cases/${id}`),
  getDetails: (testCaseId, version) => get(`/api/cases/${testCaseId}/details/${version}`),
  create: (testCase) => post('/api/cases', testCase),
  update: (id, testCase) => put(`/api/cases/${id}`, testCase),
  delete: (id) => del(`/api/cases/${id}`),
  search: (filter) => post('/api/cases/search', filter),
  clone: (id) => post(`/api/cases/${id}/clone`)
}
