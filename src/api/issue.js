import { get, post, put, del } from './http'
export const issueApi = {
  create: (issue) => post('/api/issues', issue),
  update: (issue) => put(`/api/issues/${issue.id}`, issue),
  move: (issueId, groupId) => post(`/api/issues/${issueId}/move/${groupId}`),
  assign: (issueId, userId) => post(`/api/issues/${issueId}/owner/${userId}`),
  unassign: (issueId) => del(`/api/issues/${issueId}/owner`),
  clone: (id) => post(`/api/issues/${id}/clone`),
  getById: (id) => get(`/api/issues/${id}`),
  delete: (id) => del(`/api/issues/${id}`),
  getHistories: (id, filter) => get(`/api/issues/${id}/histories`, { params: filter }),
  updateSeq: (issueIds) => post('/api/issues/seq', issueIds),
  searchIssues: (filter) => post('/api/issues/search', filter),
  exportIssues: (filter) => post('/api/issues/export', filter, { responseType: 'blob' }),
  createLink: (issueId, linkedIssueId) => post(`/api/issues/${issueId}/links/${linkedIssueId}`),
  deleteLink: (issueId, linkedIssueId) => del(`/api/issues/${issueId}/links/${linkedIssueId}`),
  batchMove: (targetSprintId, issueIds) => post(`/api/issues/move/batch/${targetSprintId}`, issueIds),
  addFile: (issueId, file) => post(`/api/issues/${issueId}/files`, file),
  deleteFile: (issueId, fileId) => del(`/api/issues/${issueId}/files/${fileId}`)
}

export const issueFilterApi = {
  create: (filter) => post('/api/filters', filter),
  update: (id, filter) => put(`/api/filters/${id}`, filter),
  copy: (id) => post(`/api/filters/${id}/copy`),
  delete: (id) => del(`/api/filters/${id}`),
  getById: (id) => get(`/api/filters/${id}`),
  getMyFilters: (projectId) => get('/api/filters/my', { params: { projectId: projectId } })
}
