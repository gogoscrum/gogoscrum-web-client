import { placeholderSign } from 'element-plus/es/components/table-v2/src/private'
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

export const testPlanApi = {
  get: (id) => get(`/api/plans/${id}`),
  create: (testPlan) => post('/api/plans', testPlan),
  update: (id, testPlan) => put(`/api/plans/${id}`, testPlan),
  delete: (id) => del(`/api/plans/${id}`),
  search: (filter) => post('/api/plans/search', filter),

  // Test plan items API
  getTestCaseIds: (planId) => get(`/api/plans/${planId}/cases`),
  createPlanItems: (planId, caseIds) => post(`/api/plans/${planId}/cases`, caseIds),
  searchPlanItems: (planId, filter) => post(`/api/plans/${planId}/cases/search`, filter),
  deletePlanItem: (planId, itemId) => del(`/api/plans/${planId}/cases/${itemId}`)
}
