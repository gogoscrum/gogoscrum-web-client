import { get, post, put, del } from './http'
export const userApi = {
  register: (user) => post('/api/users/register', user),
  search: (filter) => get('/api/users', { params: filter }),
  findProjectMates: (filter) => get('/api/users/mates', { params: filter }),
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
  csrf: () => get('/api/csrf'),

  // OAuth APIs
  getOauthProviders: () => get('/api/users/oauth/providers'),
  getOauthLoginUrl: (provider) => get(`/api/users/oauth/${provider}/login/url`),
  oauthLogin: (oauth, rememberMe) => post('/api/users/oauth/login', oauth, { params: { rememberMe } }),
  oauthRegister: (user, rememberMe) => post('/api/users/oauth/register', user, { params: { rememberMe } })
}
