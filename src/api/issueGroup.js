import { post, del } from './http'
export const issueGroupApi = {
  create: (issueGroup) => post('/api/issueGroups', issueGroup),
  update: (projectId, project) => post(`/api/issueGroups/${projectId}`, project),
  delete: (id) => del(`/api/issueGroups/${id}`),
  updateSeq: (issueGroupIds) => post('/api/issueGroups/seq', issueGroupIds)
}
