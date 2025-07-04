import { get, post, put, del } from './http'
export const userApi = {
  register: (user) => post('/api/users/register', user),
  search: (filter) => get('/api/users', { params: filter }),
  getUserInfo: (id) => get(`/api/users/${id}`),
  updateBasics: (userInfo) => put(`/api/users/my/basics`, userInfo),
  updateAvatar: (file) => put('/api/users/my/avatar', file),
  deleteAvatar: () => del('/api/users/my/avatar'),
  updatePreference: (preference) => put(`/api/users/my/preference`, preference),
  checkPassword: (oldPassword) =>
    get('/api/users/my/pwd/check', {
      params: {
        password: oldPassword
      }
    }),
  updatePassword: (form) => put('/api/users/my/pwd', form),
  login: (form, params) => post('/api/login', form, params),
  logout: () => post('/api/logout'),
  csrf: () => get('/api/csrf')
}
