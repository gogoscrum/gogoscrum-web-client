import { get, post, put, del } from './http'
export const testCaseApi = {
  get: (id) => get(`/api/testing/cases/${id}`),
  getDetails: (testCaseId, version) => get(`/api/testing/cases/${testCaseId}/details/${version}`),
  create: (testCase) => post('/api/testing/cases', testCase),
  createAll: (testCases) => post('/api/testing/cases/batch', testCases),
  update: (id, testCase) => put(`/api/testing/cases/${id}`, testCase),
  delete: (id) => del(`/api/testing/cases/${id}`),
  search: (filter) => post('/api/testing/cases/search', filter),
  clone: (id) => post(`/api/testing/cases/${id}/clone`),
  export: (filter) => post('/api/testing/cases/export', filter, { responseType: 'blob' })
}

export const testPlanApi = {
  get: (id) => get(`/api/testing/plans/${id}`),
  create: (testPlan) => post('/api/testing/plans', testPlan),
  update: (id, testPlan) => put(`/api/testing/plans/${id}`, testPlan),
  delete: (id) => del(`/api/testing/plans/${id}`),
  search: (filter) => post('/api/testing/plans/search', filter),
  clone: (id) => post(`/api/testing/plans/${id}/clone`),

  // Test plan items (i.e. cases) API
  getTestCaseIds: (planId) => get(`/api/testing/plans/${planId}/cases`),
  createPlanItems: (planId, caseIds) => post(`/api/testing/plans/${planId}/cases`, caseIds),
  searchPlanItems: (planId, filter) => post(`/api/testing/plans/${planId}/cases/search`, filter),
  deletePlanItem: (planId, itemId) => del(`/api/testing/plans/${planId}/cases/${itemId}`)
}

export const testRunApi = {
  get: (id) => get(`/api/testing/runs/${id}`),
  create: (testRun) => post('/api/testing/runs', testRun),
  update: (id, testRun) => put(`/api/testing/runs/${id}`, testRun),
  delete: (id) => del(`/api/testing/runs/${id}`),
  search: (filter) => post('/api/testing/runs/search', filter)
}

export const testReportApi = {
  preview: (testPlanId) => get(`/api/testing/reports/preview/${testPlanId}`),
  get: (id) => get(`/api/testing/reports/${id}`),
  create: (testReport) => post('/api/testing/reports', testReport),
  update: (id, testReport) => put(`/api/testing/reports/${id}`, testReport),
  delete: (id) => del(`/api/testing/reports/${id}`),
  search: (filter) => post('/api/testing/reports/search', filter)
}
