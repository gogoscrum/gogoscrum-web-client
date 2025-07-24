<template>
  <el-container class="project-layout-container">
    <el-aside :class="`left-side-bar ${menuCollapsed ? 'collapsed' : ''}`">
      <el-menu ref="menu" :router="true" :collapse="menuCollapsed" :collapse-transition="false" class="left-menu">
        <el-menu-item
          index="Board"
          class="back-to-board-row"
          :route="{
            name: 'Board',
            params: { projectId: projectId, sprintId: sprintId }
          }">
          <el-icon class="solid-round-icon"><Back /></el-icon>
          <template #title
            ><span>{{ $t('projectLayout.returnToBoard') }}</span></template
          >
        </el-menu-item>
        <el-menu-item
          index="SprintList"
          :route="{ name: 'SprintList', params: { projectId: projectId } }"
          :class="$route.name == 'SprintList' ? 'menu-selected' : ''">
          <el-icon><Timer /></el-icon>
          <template #title
            ><span>{{ $t('projectLayout.menu.sprint') }}</span></template
          >
        </el-menu-item>
        <el-menu-item
          index="Backlog"
          :route="{ name: 'Backlog', params: { projectId: projectId } }"
          :class="$route.name == 'Backlog' ? 'menu-selected' : ''">
          <el-icon><Box /></el-icon>
          <template #title
            ><span>{{ $t('projectLayout.menu.backlog') }}</span></template
          >
        </el-menu-item>

        <el-sub-menu index="Issues" class="menu-item">
          <template #title>
            <el-icon><Files /></el-icon>
            <span>{{ $t('projectLayout.menu.issue') }}</span>
          </template>
          <el-menu-item-group>
            <el-menu-item
              index="IssueList"
              :route="{ name: 'IssueList', params: { projectId: projectId } }"
              :class="$route.name == 'IssueList' && !$route.query.filterId ? 'menu-selected' : ''">
              <span>{{ $t('issueFilter.allIssues') }}</span>
            </el-menu-item>
            <template v-for="(filter, index) in issueFilters" :key="filter.id">
              <el-menu-item
                index="IssueList"
                :route="{
                  name: 'IssueList',
                  params: { projectId: projectId },
                  query: { filterId: filter.id }
                }"
                class="filter-container"
                :class="{ 'menu-selected': $route.query.filterId === filter.id }">
                <span class="filter-name">{{ filter.name }}</span>
                <el-dropdown trigger="click" :teleported="false">
                  <el-icon class="action-icon"><MoreFilled /></el-icon>
                  <template #dropdown>
                    <el-dropdown-menu>
                      <el-dropdown-item icon="Edit" @click="editFilter(index, filter)">{{
                        $t('issueFilter.actions.rename')
                      }}</el-dropdown-item>
                      <el-dropdown-item icon="DocumentCopy" @click="copyFilter(index, filter)">{{
                        $t('issueFilter.actions.copy')
                      }}</el-dropdown-item>
                      <el-dropdown-item icon="Delete" @click="deleteFilter(index, filter)">{{
                        $t('issueFilter.actions.delete')
                      }}</el-dropdown-item>
                    </el-dropdown-menu>
                  </template>
                </el-dropdown>
              </el-menu-item>
            </template>
          </el-menu-item-group>
        </el-sub-menu>
        <el-menu-item
          index="FileList"
          :route="{ name: 'FileList', params: { projectId: projectId } }"
          :class="$route.name == 'FileList' ? 'menu-selected' : ''">
          <el-icon><FolderOpened /></el-icon>
          <template #title
            ><span>{{ $t('projectLayout.menu.file') }}</span></template
          >
        </el-menu-item>
        <el-menu-item
          index="DocList"
          :route="{ name: 'DocList', params: { projectId: projectId } }"
          :class="{ 'menu-selected': ['DocList', 'DocDetails'].includes($route.name) }">
          <el-icon><Document /></el-icon>
          <template #title
            ><span>{{ $t('projectLayout.menu.doc') }}</span></template
          >
        </el-menu-item>

        <el-sub-menu index="Testing" class="menu-item">
          <template #title>
            <el-icon><Odometer /></el-icon>
            <span>{{ $t('projectLayout.menu.testing') }}</span>
          </template>
          <el-menu-item-group>
            <el-menu-item
              index="TestCaseList"
              :route="{
                name: 'TestCaseList',
                params: { projectId: projectId }
              }"
              :class="$route.name == 'TestCaseList' ? 'menu-selected' : ''">
              <span>{{ $t('projectLayout.menu.testCase') }}</span>
            </el-menu-item>
            <el-menu-item
              index="TestPlanList"
              :route="{
                name: 'TestPlanList',
                params: { projectId: projectId }
              }"
              :class="$route.name == 'TestPlanList' ? 'menu-selected' : ''">
              <span>{{ $t('projectLayout.menu.testPlan') }}</span>
            </el-menu-item>
            <el-menu-item
              index="TestReportList"
              :route="{
                name: 'TestReportList',
                params: { projectId: projectId }
              }"
              :class="$route.name == 'TestReportList' ? 'menu-selected' : ''">
              <span>{{ $t('projectLayout.menu.testReport') }}</span>
            </el-menu-item>
          </el-menu-item-group>
        </el-sub-menu>

        <el-sub-menu index="Charts" class="menu-item">
          <template #title>
            <el-icon><DataLine /></el-icon>
            <span>{{ $t('projectLayout.menu.charts') }}</span>
          </template>
          <el-menu-item-group>
            <el-menu-item
              index="BurndownChart"
              :route="{
                name: 'BurndownChart',
                params: { projectId: projectId, sprintId: sprintId }
              }"
              :class="$route.name == 'BurndownChart' ? 'menu-selected' : ''">
              <span>{{ $t('projectLayout.menu.burndown') }}</span>
            </el-menu-item>
            <el-menu-item
              index="VelocityChart"
              :route="{
                name: 'VelocityChart',
                params: { projectId: projectId }
              }"
              :class="$route.name == 'VelocityChart' ? 'menu-selected' : ''">
              <span>{{ $t('projectLayout.menu.velocity') }}</span>
            </el-menu-item>
            <el-menu-item
              index="CumulativeFlowChart"
              :route="{
                name: 'CumulativeFlowChart',
                params: { projectId: projectId, sprintId: sprintId }
              }"
              :class="$route.name == 'CumulativeFlowChart' ? 'menu-selected' : ''">
              <span>{{ $t('projectLayout.menu.cumulative') }}</span>
            </el-menu-item>
          </el-menu-item-group>
        </el-sub-menu>
        <el-sub-menu index="projectSettings" class="menu-item">
          <template #title>
            <el-icon><set-up /></el-icon>
            <span>{{ $t('projectLayout.menu.setting') }}</span>
          </template>
          <el-menu-item-group>
            <el-menu-item
              index="ProjectDetails"
              :route="{ name: 'ProjectDetails', params: { projectId: projectId } }"
              :class="$route.name == 'ProjectDetails' ? 'menu-selected' : ''">
              <span>{{ $t('projectLayout.menu.projectDetails') }}</span>
            </el-menu-item>
            <el-menu-item
              index="Components"
              :route="{ name: 'Components', params: { projectId: projectId } }"
              :class="$route.name == 'Components' ? 'menu-selected' : ''">
              <span>{{ $t('projectLayout.menu.component') }}</span>
            </el-menu-item>
            <el-menu-item
              index="Tags"
              :route="{ name: 'Tags', params: { projectId: projectId } }"
              :class="$route.name == 'Tags' ? 'menu-selected' : ''">
              <span>{{ $t('projectLayout.menu.tag') }}</span>
            </el-menu-item>
          </el-menu-item-group>
        </el-sub-menu>
        <el-sub-menu index="more" class="-menu-item">
          <template #title>
            <el-icon><MoreFilled /></el-icon>
            <span>{{ $t('projectLayout.menu.more') }}</span>
          </template>
          <el-menu-item-group>
            <el-menu-item
              index="InvitationList"
              :route="{
                name: 'InvitationList',
                params: { projectId: projectId }
              }"
              :class="$route.name == 'InvitationList' ? 'menu-selected' : ''">
              <span>{{ $t('projectLayout.menu.invitation') }}</span>
            </el-menu-item>
          </el-menu-item-group>
        </el-sub-menu>
      </el-menu>
    </el-aside>
    <el-main class="main-content">
      <router-view v-if="project.id" v-slot="{ Component, route }">
        <component :is="Component" :key="route.path" />
      </router-view>
    </el-main>
  </el-container>
  <IssueFilterEdit
    v-if="editingFilter"
    :original-filter="editingFilter"
    @closed="editingFilter = false"
    @saved="filterSaved" />
</template>

<script>
import { ElMessage, ElMessageBox } from 'element-plus'
import { projectApi } from '@/api/project.js'
import { issueFilterApi } from '@/api/issue.js'
import IssueFilterEdit from '@/components/issue/IssueFilterEdit.vue'

export default {
  name: 'ProjectLayout',
  components: {
    IssueFilterEdit
  },
  data() {
    return {
      projectId: null,
      project: {},
      sprintId: null,
      menuCollapsed: false,
      issueFilters: [],
      editingFilter: null
    }
  },
  created() {
    this.user = this.$store.get('user')
    this.projectId = this.$route.params.projectId

    if (this.projectId) {
      this.loadProject()
    } else {
      console.error('Project ID is missing')
    }

    this.sprintId = this.loadProjectLastSprint() || 'default'
    this.setMenuCollpaseFlag()
    window.addEventListener('resize', this.setMenuCollpaseFlag)
    this.$bus.$on('sprintDeleted', (sprint) => {
      if (sprint.id == this.sprintId) {
        this.sprintId = 'default'
      }
    })

    this.$bus.$on('issueFilterCreated', (filter) => {
      this.issueFilters.push(filter)
    })
  },
  mounted() {
    this.autoExpandSubMenu()
    this.loadIssueFilters()
  },
  beforeUnmount() {
    window.removeEventListener('resize', this.setMenuCollpaseFlag)
  },
  methods: {
    loadProject() {
      const cachedProject = this.$store.get('project')

      if (cachedProject && cachedProject.id === this.projectId) {
        this.project = cachedProject
        console.log('project loaded from store:', this.project)
      } else {
        projectApi.getById(this.projectId).then((res) => {
          this.project = res.data
          let currentUser = this.$store.get('user')
          let projectMember = this.project.projectMembers.filter((member) => member.user.id == currentUser.id)[0]
          if (projectMember.role == 'OWNER' || projectMember.role == 'DEVELOPER') {
            this.project.isDeveloper = true
          }
          this.$store.set('project', this.project)
          console.log('project loaded into store:', this.project)
        })
      }
    },
    autoExpandSubMenu() {
      let route = this.$route.name
      if (['BurndownChart', 'VelocityChart', 'CumulativeFlowChart'].includes(route)) {
        this.$refs.menu.open('Charts')
      } else if (['ProjectDetails', 'Tags'].includes(route)) {
        this.$refs.menu.open('projectSettings')
      } else if (['InvitationList'].includes(route)) {
        this.$refs.menu.open('more')
      } else if (['IssueList'].includes(route)) {
        this.$refs.menu.open('Issues')
      }
    },
    setMenuCollpaseFlag() {
      if (document.body.clientWidth < 680) {
        this.menuCollapsed = true
      } else {
        this.menuCollapsed = false
      }
    },
    loadProjectLastSprint() {
      let key = `u-${this.user.id}-p-${this.projectId}-s`
      return this.$store.get(key)
    },
    loadIssueFilters() {
      issueFilterApi.getMyFilters(this.projectId).then((res) => {
        this.issueFilters = res.data
      })
    },
    editFilter(index, filter) {
      this.editingFilter = filter
    },
    filterSaved(filter) {
      let index = this.issueFilters.findIndex((item) => item.id == filter.id)
      if (index >= 0) {
        this.issueFilters.splice(index, 1, filter)
      }
    },
    copyFilter(index, filter) {
      issueFilterApi.copy(filter.id).then((res) => {
        this.issueFilters.push(res.data)
        ElMessage.success({
          message: this.$t('issueFilter.msg.filterCopied')
        })
      })
    },
    deleteFilter(index, filter) {
      ElMessageBox.confirm(
        this.$t('issueFilter.msg.delConfirmMsg', { name: filter.name }),
        this.$t('issueFilter.msg.delConfirmTitle'),
        {
          type: 'warning',
          dangerouslyUseHTMLString: true,
          draggable: true
        }
      ).then(() => {
        issueFilterApi.delete(filter.id).then((res) => {
          this.issueFilters.splice(index, 1)
          ElMessage.success({
            message: this.$t('issueFilter.msg.filterDeleted')
          })
          this.$router.push({ name: 'IssueList', params: { projectId: this.projectId } })
        })
      })
    }
  }
}
</script>

<style lang="less" scoped>
.project-layout-container {
  border-top: 1px solid #ebeef5;
  min-height: 400px;
  height: 100%;

  .left-side-bar {
    width: 260px !important;
    border-right: 1px solid #ebeef5;
    padding: 20px 20px;

    &.collapsed {
      width: 48px !important;
      padding: 8px 0;
    }

    @media only screen and (max-width: 860px) {
      width: 160px !important;
      padding: 20px 10px;
    }

    .left-menu {
      border: none;
      margin-top: 8px;

      .back-to-board-row {
        margin-bottom: 20px;
      }

      .el-menu-item {
        height: 40px;
        line-height: 40px;
        border-radius: 5px;
        font-weight: 500;
        color: var(--el-text-color-primary);

        i {
          font-weight: 500;
        }

        &.menu-selected {
          color: var(--el-color-primary);
          background-color: #e7f5f3;
        }
      }

      .filter-container {
        display: flex;
        justify-content: space-between;
        padding-right: 0px;

        .filter-name {
          max-width: 130px;
          overflow: scroll;
          &::-webkit-scrollbar {
            display: none;
          }
        }

        .action-icon {
          margin-left: 5px;
          font-size: 14px;
          visibility: hidden;
          padding: 5px 0px;
          border-radius: 4px;
        }

        &:hover {
          .action-icon {
            visibility: visible;

            &:hover {
              background-color: #00000009;
            }
          }
        }
      }

      .solid-round-icon {
        background-color: var(--el-color-primary);
        height: 18px;
        width: 18px;
        border-radius: 10px;
        color: #fff;
        font-weight: bold;
        line-height: 18px;
        font-size: 14px;
        margin: 0 8px 0 3px;
      }
    }
  }

  .main-content {
    height: 100%;
    padding: 0;
    overflow: auto;
  }
}
</style>

<style lang="less">
.project-layout-container {
  .main-content {
    .page {
      padding: 20px 50px;
      margin-bottom: 20px;

      @media only screen and (max-width: 680px) {
        padding: 10px 10px;
      }

      .title {
        font-size: 20px;
        font-weight: bold;
        margin-bottom: 36px;
        color: var(--el-text-color-primary);
      }
    }
  }

  .el-sub-menu__title {
    height: 40px;
    line-height: 40px;
    border-radius: 5px;
    font-weight: 500;
    color: var(--el-text-color-primary);

    i {
      font-weight: 500;
    }
  }
  .el-menu-item-group {
    .el-menu-item {
      padding-left: 49px !important;
      min-width: 100%;
    }

    .el-menu-item-group__title {
      padding: 0;
    }
  }

  .left-side-bar {
    &.collapsed {
      .el-menu--collapse {
        width: 48px;
      }
      .el-menu-item {
        padding: 0 10px !important;

        .el-menu-tooltip__trigger {
          position: unset;
          padding: 0;
        }
      }
      .el-tooltip,
      .el-sub-menu__title {
        width: 48px !important;
        padding: 0 10px !important;
      }
    }
  }
}
</style>
