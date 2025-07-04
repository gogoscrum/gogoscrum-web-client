import { get, post, del } from './http'

export const invitationApi = {
  search: (params) => get(`/api/projects/${params.projectId}/invitations`, { params }),
  disable: (projectId, id) => del(`/api/projects/${projectId}/invitations/${id}/enable`),
  enable: (projectId, id) => post(`/api/projects/${projectId}/invitations/${id}/enable`)
}
