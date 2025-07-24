import { createRouter, createWebHistory } from 'vue-router'
import store from '@/modules/store'

const routes = [
  {
    path: '/',
    name: 'Homepage',
    component: () => import('@/views/Index.vue')
  },
  {
    path: '/layout',
    name: 'Layout',
    component: () => import('@/components/layout/BaseLayout.vue'),
    redirect: {
      name: 'Board'
    },
    children: [
      {
        path: '/projects/:projectId/boards',
        name: 'BoardWithoutSprint',
        component: () => import('@/views/Board.vue')
      },
      {
        path: '/projects/:projectId/boards/:sprintId',
        name: 'Board',
        component: () => import('@/views/Board.vue')
      },
      {
        path: '/projects',
        name: 'MyProjects',
        component: () => import('@/views/ProjectList.vue')
      },
      {
        path: '/projects/:projectId',
        name: 'ProjectLayout',
        component: () => import('@/components/layout/ProjectLayout.vue'),
        redirect: {
          name: 'SprintList'
        },
        children: [
          {
            path: 'sprints',
            name: 'SprintList',
            component: () => import('@/views/SprintList.vue')
          },
          {
            path: 'backlog',
            name: 'Backlog',
            component: () => import('@/views/Backlog.vue')
          },
          {
            path: 'issues',
            name: 'IssueList',
            component: () => import('@/views/IssueList.vue')
          },
          {
            path: 'files',
            name: 'FileList',
            component: () => import('@/views/FileList.vue')
          },
          {
            path: 'files/:folderId',
            name: 'Folder',
            component: () => import('@/views/FileList.vue')
          },
          {
            path: 'docs',
            name: 'DocList',
            component: () => import('@/views/DocList.vue')
          },
          {
            path: 'doc/:docId',
            name: 'DocDetails',
            component: () => import('@/views/DocDetails.vue')
          },
          {
            path: 'charts/burndown/:sprintId',
            name: 'BurndownChart',
            component: () => import('@/views/BurndownChart.vue')
          },
          {
            path: 'charts/velocity',
            name: 'VelocityChart',
            component: () => import('@/views/VelocityChart.vue')
          },
          {
            path: 'charts/cumulative/:sprintId',
            name: 'CumulativeFlowChart',
            component: () => import('@/views/CumulativeFlowChart.vue')
          },
          {
            path: 'tags',
            name: 'Tags',
            component: () => import('@/views/TagList.vue')
          },
          {
            path: 'invitations',
            name: 'InvitationList',
            component: () => import('@/views/InvitationList.vue')
          },
          {
            path: 'components',
            name: 'Components',
            component: () => import('@/views/ComponentList.vue')
          },
          {
            path: 'details',
            name: 'ProjectDetails',
            component: () => import('@/views/ProjectDetails.vue')
          },
          {
            path: 'test/cases',
            name: 'TestCaseList',
            component: () => import('@/views/testing/TestCaseList.vue')
          },
          {
            path: 'test/cases/:testCaseId',
            name: 'TestCaseEdit',
            component: () => import('@/views/testing/TestCaseEdit.vue')
          }
        ]
      }
    ]
  },
  {
    path: '/login',
    name: 'Login',
    component: () => import('@/views/Login.vue')
  },
  {
    path: '/logout',
    name: 'Logout',
    component: () => import('@/views/Logout.vue')
  },
  {
    path: '/register',
    name: 'Register',
    component: () => import('@/views/Register.vue')
  },
  {
    path: '/invitations/:invitationCode',
    name: 'InvitationRedirect',
    component: () => import('@/views/InvitationRedirect.vue')
  }
]
const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes
})

router.beforeEach((to, from, next) => {
  let user = store.get('user')
  const publicRoutes = ['Homepage', 'Login', 'Register']
  if (!publicRoutes.includes(to.name) && !user) {
    localStorage.setItem('lastUrl', to.fullPath)
    console.warn('Requested url rejected: ' + to.fullPath)
    next({ name: 'Login' })
    return
  }

  next()
})

export default router
