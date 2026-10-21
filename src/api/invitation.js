import { get, post, del } from './http'

export const invitationApi = {
  search: (filter) => post(`/api/projects/${filter.projectId}/invitations/search`, filter),
  disable: (projectId, id) => del(`/api/projects/${projectId}/invitations/${id}/enable`),
  enable: (projectId, id) => post(`/api/projects/${projectId}/invitations/${id}/enable`)
}
