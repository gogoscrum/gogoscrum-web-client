<template>
  <el-container class="base-layout-container">
    <el-header class="layout-header">
      <div class="flex items-center">
        <div class="logo-container hidden-xs-only">
          <img v-show="darkMode" class="logo" src="@/assets/images/logo-white.png" />
          <img v-show="!darkMode" class="logo" src="@/assets/images/logo-black.png" />
        </div>
        <el-dropdown trigger="click" @command="projectChanged" placement="bottom-start">
          <span class="select-project selector flex">
            <Avatar
              v-if="currentProject.name"
              :name="currentProject.name"
              :size="24"
              :src="currentProject.avatar?.url"
              :rounded="false"
              class="mr-2"></Avatar>
            <div class="current-project-name">
              {{ currentProject?.name || $t('baseLayout.header.project.placeholder') }}
            </div>
            <el-icon><CaretBottom /></el-icon>
          </span>
          <template #dropdown>
            <el-dropdown-menu class="header-project-dropdown-list" :class="{ wider: projects?.length }">
              <el-dropdown-item command="newProject">
                <div class="flex items-center py-1 font-medium">
                  <el-icon size="16" class="ml-4px !mr-10px"><Plus /></el-icon>
                  {{ $t('baseLayout.header.newProject') }}
                </div>
              </el-dropdown-item>
              <el-dropdown-item v-for="projectItem in projects" :key="projectItem.id" :command="projectItem.id">
                <div
                  :class="`project-option-wrapper ${
                    currentProject.id == projectItem.id ? 'dropdown-item-selected' : ''
                  }`"
                  :title="projectItem.name">
                  <Avatar
                    :name="projectItem.name"
                    :size="24"
                    :src="projectItem.avatar?.url"
                    :rounded="false"
                    class="min-w-24px mr-2"></Avatar>
                  <div class="project-name">{{ projectItem.name }}</div>
                </div>
              </el-dropdown-item>
              <el-dropdown-item v-if="projects?.length" command="allMyProjects">
                <el-icon size="20" class="ml-3px !mr-8px"><Menu /></el-icon>
                <div class="font-bold">{{ $t('baseLayout.header.project.showAll') }}</div>
              </el-dropdown-item>
            </el-dropdown-menu>
          </template>
        </el-dropdown>
        <el-dropdown
          v-if="showingBoard && currentProject?.sprints"
          trigger="click"
          @command="sprintChanged"
          placement="bottom-start">
          <span class="select-sprint selector flex">
            <div class="current-sprint-name">
              <span v-if="currentSprint?.backlog">
                {{ $t('baseLayout.header.backlog') }}
              </span>
              <span v-else>
                {{ currentSprint?.name || $t('baseLayout.header.sprint.placeholder') }}
              </span>
            </div>
            <el-icon><CaretBottom /></el-icon>
          </span>
          <template #dropdown>
            <el-dropdown-menu class="header-sprint-dropdown-list">
              <el-dropdown-item command="newSprint">
                <div class="flex items-center py-1 font-medium">
                  <el-icon size="16" class="ml-4px !mr-10px"><Plus /></el-icon>
                  {{ $t('baseLayout.header.newSprint') }}
                </div>
              </el-dropdown-item>
              <el-dropdown-item
                v-for="(sprintItem, sprintIndex) in currentProject.sprints"
                :key="sprintItem.id"
                :command="sprintIndex">
                <div class="sprint-option-wrapper">
                  <div
                    :class="`sprint-name-row ${sprintItem.startDate ? 'sprint-option-name' : ''} ${
                      sprintItem.id == currentSprint.id ? 'dropdown-item-selected' : ''
                    }`">
                    <el-icon v-if="sprintItem.backlog" size="16" class="ml-4px !mr-10px"><Box /></el-icon>
                    <span class="sprint-name" :title="sprintItem.name">{{
                      sprintItem.backlog ? $t('baseLayout.header.backlog') : sprintItem.name
                    }}</span>
                  </div>
                  <div v-if="sprintItem.startDate" class="form-field-tip sprint-date-range-row">
                    <span class="mr-16px"
                      >{{ sprintItem.startDateFormatted || sprintItem.startDate }} ~
                      {{ sprintItem.endDateFormatted || sprintItem.endDate }}</span
                    >
                    <status-tag
                      v-if="sprintItem.status"
                      :status="sprintItem.status"
                      :label="$t(`sprintStatuses.${sprintItem.status}`)" />
                  </div>
                </div>
              </el-dropdown-item>
              <el-dropdown-item command="viewProjectSprints">
                <div class="flex items-center py-1 font-medium">
                  <el-icon size="16" class="ml-4px !mr-10px"><Timer /></el-icon>
                  {{ $t('baseLayout.header.listSprints') }}
                </div>
              </el-dropdown-item>
            </el-dropdown-menu>
          </template>
        </el-dropdown>
      </div>
      <div class="right-links">
        <!-- <a href="https://github.com/gogoscrum/gogoscrum-rest-service" target="_blank" class="github-badge">
          <el-image
            src="https://img.shields.io/github/stars/gogoscrum/gogoscrum-rest-service?style=flat&logo=github&color=0d9c89">
            <template #error>
              <span style="visibility: hidden">If cannot access Github, just don't show the badge.</span>
            </template>
          </el-image>
        </a> -->
        <el-dropdown trigger="click" @command="operatingCommand" placement="bottom">
          <span class="create-new-icon selector">
            <el-icon><CirclePlus /></el-icon>
          </span>
          <template #dropdown>
            <el-dropdown-menu>
              <el-dropdown-item icon="Plus" command="newProject">
                {{ $t('baseLayout.header.newProject') }}
              </el-dropdown-item>
              <el-dropdown-item v-if="showingBoard && currentProject?.isDeveloper" icon="Plus" command="newSprint">
                {{ $t('baseLayout.header.newSprint') }}
              </el-dropdown-item>
            </el-dropdown-menu>
          </template>
        </el-dropdown>
        <el-divider direction="vertical" class="hidden-sm-and-down"></el-divider>
        <div v-if="currentProject?.id" class="search-container selector hidden-xs-only" @click="showIssueFinder">
          <issue-finder
            v-if="issueFinderVisible"
            :projectId="currentProject.id"
            @change="issueSelected"
            @blur="issueFinderBlur"></issue-finder>
          <el-icon><Search /></el-icon>
        </div>
        <issue-filter
          v-if="currentProject?.id && showingBoard"
          ref="issueFilter"
          v-model="filter"
          :project="currentProject"
          class="selector"
          @change="filterChanged"></issue-filter>
        <div
          v-if="showingBoard"
          class="selector hidden-sm-and-down"
          :title="$t('baseLayout.header.fullScreen')"
          @click="toggleFullscreen">
          <span :class="`iconfont ${boardInFullscreen ? 'icon-full-screen-cancel' : 'icon-full-screen'}`" />
        </div>
        <el-dropdown v-if="showingBoard" @command="changeTheme" trigger="click" placement="bottom">
          <span class="selector" :title="$t('baseLayout.header.theme.title')">
            <span class="iconfont icon-skin" />
          </span>
          <template #dropdown>
            <el-dropdown-menu>
              <el-dropdown-item command="classic">
                <div :class="`them-menu-item ${currentUser.preference?.theme == 'classic' ? 'active' : ''}`">
                  <div>{{ $t('baseLayout.header.theme.classic') }}</div>
                  <el-icon v-if="currentUser.preference?.theme == 'classic'"><Check /></el-icon>
                </div>
              </el-dropdown-item>
              <el-dropdown-item command="clean">
                <div :class="`them-menu-item ${currentUser.preference?.theme == 'clean' ? 'active' : ''}`">
                  <div>{{ $t('baseLayout.header.theme.clean') }}</div>
                  <el-icon v-if="currentUser.preference?.theme == 'clean'"><Check /></el-icon>
                </div>
              </el-dropdown-item>
              <el-dropdown-item command="sticky-note">
                <div
                  :class="`them-menu-item ${
                    (currentUser.preference?.theme || 'sticky-note') == 'sticky-note' ? 'active' : ''
                  }`">
                  <div>{{ $t('baseLayout.header.theme.sticky-note') }}</div>
                  <el-icon v-if="(currentUser.preference?.theme || 'sticky-note') == 'sticky-note'"><Check /></el-icon>
                </div>
              </el-dropdown-item>
              <el-dropdown-item divided command="toggleMiniMode">
                <div :class="`them-menu-item ${miniMode ? 'active' : ''}`">
                  <div>{{ $t('baseLayout.header.theme.miniMode') }}</div>
                  <el-icon v-if="miniMode"><Check /></el-icon>
                </div>
              </el-dropdown-item>
            </el-dropdown-menu>
          </template>
        </el-dropdown>
        <div
          v-if="currentProject?.id"
          class="project-member-count selector"
          :title="$t('baseLayout.header.projectMember')"
          @click="editMember">
          <span class="iconfont icon-ico-user-group-off project-members-icon" />
          <span class="member-count">{{ currentProject?.projectMembers?.length }}</span>
        </div>

        <el-dropdown
          v-if="currentProject?.id"
          @command="operatingCommand"
          trigger="click"
          placement="bottom"
          popper-class="header-more-menu-popup">
          <span class="selector">
            <el-icon><MoreFilled /></el-icon>
          </span>
          <template #dropdown>
            <el-dropdown-menu>
              <el-dropdown-item
                v-if="showingBoard && currentSprint && !currentSprint.backlog && currentProject.isDeveloper"
                icon="Timer"
                command="updateSprint">
                {{ $t('baseLayout.header.editSprint') }}
              </el-dropdown-item>
              <template v-if="showingBoard && currentProject">
                <hr v-if="!currentSprint.backlog && currentProject.isDeveloper" />
                <el-dropdown-item icon="Box" command="Backlog">{{ $t('baseLayout.header.backlog') }}</el-dropdown-item>
                <el-dropdown-item icon="Files" command="IssueList">{{
                  $t('baseLayout.header.issues')
                }}</el-dropdown-item>
                <el-dropdown-item icon="Odometer" command="TestCaseList">{{
                  $t('baseLayout.header.testCases')
                }}</el-dropdown-item>
                <el-dropdown-item icon="FolderOpened" command="FileList">{{
                  $t('baseLayout.header.files')
                }}</el-dropdown-item>
                <el-dropdown-item icon="Document" command="DocList">{{
                  $t('baseLayout.header.docs')
                }}</el-dropdown-item>
                <hr />
                <el-dropdown-item icon="DataLine" command="viewBurnDown">
                  {{ $t('baseLayout.header.burndown') }}
                </el-dropdown-item>
              </template>
              <el-dropdown-item icon="Setting" :disabled="!currentProject" command="viewProjectDetails">
                {{ $t('baseLayout.header.projectDetails') }}
              </el-dropdown-item>
            </el-dropdown-menu>
          </template>
        </el-dropdown>
        <el-divider direction="vertical" class="hidden-sm-and-down"></el-divider>
        <div class="dark-mode-switch hidden-xs-only">
          <el-switch
            v-model="darkMode"
            inline-prompt
            size="small"
            active-icon="Moon"
            inactive-icon="Sunny"
            @change="toggleDark" />
        </div>
        <el-divider v-if="currentProject?.id" direction="vertical" class="hidden-sm-and-down"></el-divider>
        <language-selector class="selector" @languageChanged="languageChanged" />
        <el-dropdown trigger="click" @command="userDropCommand">
          <div class="selector current-user-info">
            <avatar :name="currentUser.nickname" :src="currentUser.avatar?.url" :size="20" showName />
            <el-icon class="ml-1"><CaretBottom /></el-icon>
          </div>
          <template #dropdown>
            <el-dropdown-menu>
              <el-dropdown-item command="MyProjects" icon="Menu">
                {{ $t('baseLayout.header.myProjects') }}
              </el-dropdown-item>
              <el-dropdown-item command="UserInfo" icon="User">
                {{ $t('baseLayout.header.profile') }}
              </el-dropdown-item>
              <el-dropdown-item v-if="lang === 'cn'" divided @click.prevent>
                <el-dropdown placement="left">
                  <div class="flex items-center">
                    <el-icon><ChatLineRound /></el-icon> 社区交流
                  </div>
                  <template #dropdown>
                    <ContactPop />
                  </template>
                </el-dropdown>
              </el-dropdown-item>
              <el-dropdown-item v-else divided @click.prevent>
                <el-dropdown placement="left">
                  <div class="flex items-center">
                    <el-icon><ChatLineRound /></el-icon> Community
                  </div>
                  <template #dropdown>
                    <div class="community-popover-container discord">
                      <img src="@/assets/images/discord.png" class="discord-icon" />
                      <a href="https://discord.gg/FBdf43BZ" target="_blank"> Join gogoscrum user group on Discord </a>
                    </div>
                  </template>
                </el-dropdown>
              </el-dropdown-item>

              <el-dropdown-item divided command="Logout" icon="SwitchButton">
                {{ $t('baseLayout.header.signout') }}
              </el-dropdown-item>
            </el-dropdown-menu>
          </template>
        </el-dropdown>
      </div>
    </el-header>
    <el-main class="layout-body" v-loading="loading">
      <template v-if="projectId">
        <router-view v-if="currentProject.id" />
      </template>
      <template v-else>
        <router-view />
      </template>
    </el-main>
    <project-edit
      v-if="projectDialogVisible"
      @projectFormClosed="projectFormClosed"
      @projectSaved="projectSaved"
      @projectDeleted="projectDeleted"
      :originalProject="editProject" />
    <sprint-edit
      v-if="editSprintDialogVisible"
      :sprintId="sprintId"
      :project="{ id: projectId, owner: currentProject.owner }"
      @sprintFormClosed="sprintFormClosed"
      @sprintSaved="sprintSaved"
      @sprintDeleted="sprintDeleted" />
    <project-member
      :project.async="currentProject"
      :originalUserDrawerVisible="editMemberDrawerVisible"
      @onDrawerClosed="drawerClosed" />
    <user-info v-if="userInfoDialogVisible" @userInfoClosed="userInfoClosed" @userInfoUpdated="userInfoUpdated" />
    <issue-edit
      v-if="editingIssue?.id"
      :editIssueId="editingIssue.id"
      :projectId="currentProject.id"
      @issueFormClosed="issueDialogClosed" />
  </el-container>
</template>

<script>
import { projectApi } from '@/api/project.js'
import { userApi } from '@/api/user.js'
import utils from '@/utils/util'
import ProjectEdit from '@/components/project/ProjectEdit.vue'
import SprintEdit from '@/components/sprint/SprintEdit.vue'
import ProjectMember from '@/components/user/ProjectMember.vue'
import Avatar from '@/components/common/Avatar.vue'
import StatusTag from '@/components/common/StatusTag.vue'
import UserInfo from '@/components/user/UserInfo.vue'
import LanguageSelector from '@/components/common/LanguageSelector.vue'
import IssueFilter from '@/components/issue/IssueFilter.vue'
import IssueFinder from '@/components/issue/IssueFinder.vue'
import IssueEdit from '@/components/issue/IssueEdit.vue'
import ContactPop from '@/components/common/ContactPop.vue'
import 'element-plus/theme-chalk/display.css'

export default {
  name: 'BaseLayout',
  components: {
    Avatar,
    ProjectEdit,
    SprintEdit,
    ProjectMember,
    UserInfo,
    StatusTag,
    LanguageSelector,
    IssueFilter,
    IssueFinder,
    IssueEdit,
    ContactPop
  },
  data() {
    return {
      currentUser: this.$store.get('user'),
      lang: localStorage['locale'] || utils.getLang(),
      projects: [],
      projectId: null,
      currentProject: {},
      currentSprint: {},
      showingBoard: false,
      editMemberDrawerVisible: false,
      filter: {
        dueTimePast: false,
        types: [],
        priorities: [],
        assignees: [],
        tags: []
      },
      projectDialogVisible: false,
      editSprintDialogVisible: false,
      editProject: {},
      editSprint: {},
      userInfoDialogVisible: false,
      boardInFullscreen: false,
      loading: false,
      loaded: false,
      editingIssue: {},
      issueFinderVisible: false,
      darkMode: this.$store.get('darkMode') || false,
      miniMode: false
    }
  },
  computed: {},
  watch: {
    $route(to, from) {
      this.showingBoard = to.name === 'Board'
      if (this.showingBoard) {
        let projectId = this.$route.params.projectId
        let sprintId = this.$route.params.sprintId

        console.log('route changed to Board', projectId, sprintId)

        if (!projectId) {
          console.error('Project ID is required to show the board')
          return
        }

        if (projectId !== this.projectId) {
          this.selectProject(projectId).then((res) => {
            if (this.currentProject && sprintId && sprintId !== this.sprintId) {
              this.selectSprint(sprintId)
            }
          })
        } else {
          this.selectSprint(sprintId)
        }
      }
    }
  },
  created() {
    this.projectId = this.$route.params.projectId
    this.sprintId = this.$route.params.sprintId
    this.showingBoard = this.$route.name === 'Board'

    if (this.lang !== 'cn') {
      utils.changeMetaForI18n()
    }

    this.loadProjects()
  },
  mounted() {
    let that = this

    if (document.addEventListener) {
      document.addEventListener('fullscreenchange', this.quitFullscreen)
      document.addEventListener('mozfullscreenchange', this.quitFullscreen)
      document.addEventListener('MSFullscreenChange', this.quitFullscreen)
      document.addEventListener('webkitfullscreenchange', this.quitFullscreen)
    }

    if (this.darkMode) {
      this.toggleDark()
    }

    document.addEventListener('click', function (e) {
      that.$bus.$emit('baseLayoutClicked', e)
    })

    this.$bus.$on('projectUpdated', (project) => {
      this.projectSaved(project)
    })

    this.$bus.$on('projectDeleted', (project) => {
      this.projectDeleted(project)
    })

    this.$bus.$on('sprintSaved', (sprint) => {
      this.sprintSaved(sprint, false)
    })

    this.$bus.$on('sprintDeleted', (sprint) => {
      this.sprintDeleted(sprint, false)
    })

    this.$bus.$on('openInvitationDialog', () => {
      this.editMember()
    })
  },
  methods: {
    languageChanged(lang) {
      this.lang = lang
    },
    loadProjects() {
      this.loading = true

      projectApi.search({ archived: false, pageSize: 100 }).then((res) => {
        this.projects = res.data.results
        this.loaded = true

        if (this.projectId) {
          this.selectProject(this.projectId).then((res) => {
            if (this.currentProject && this.sprintId) {
              this.selectSprint(this.sprintId)
            }
          })
        } else {
          this.loading = false
        }
      })
    },
    selectProject(projectId) {
      this.projectId = projectId
      this.loading = true

      return new Promise((resolve, reject) => {
        projectApi
          .getById(projectId)
          .then((res) => {
            let project = res.data

            this.currentProject = project

            this.caclSprintsStatus()
            this.caclProjectMemberRole()

            // Cache project in store
            this.$store.set('project', this.currentProject)
            console.log('project loaded and cached in store', this.currentProject)

            resolve(project)
          })
          .catch((err) => {
            console.log(err)
            reject(err)
          })
          .finally(() => {
            this.loading = false
          })
      })
    },
    selectSprint(sprintId) {
      this.sprintId = sprintId
      this.currentSprint = this.currentProject.sprints.find((sprint) => sprint.id === this.sprintId)
      this.miniMode = false
      this.saveCurrentBoard()
    },
    projectChanged(selectedProjectId) {
      if (selectedProjectId === 'newProject') {
        this.newProject()
      } else if (selectedProjectId === 'allMyProjects') {
        this.$router.push({
          name: 'MyProjects'
        })
      } else if (this.projectId != selectedProjectId) {
        this.resetCurrentSprint()
        this.selectProject(selectedProjectId).then((res) => {
          this.currentSprint = utils.getLastViewedOrDefaultSprint(this.currentUser.id, this.currentProject)
          this.sprintId = this.currentSprint.id
          this.refreshBoard()
        })
      }
    },
    projectDeleted(deletedProject) {
      let index = this.projects.findIndex((project) => project.id === deletedProject.id)

      if (index >= 0) {
        this.projects.splice(index, 1)
      }

      if (deletedProject.id === this.currentProject?.id) {
        this.resetCurrentProject()
        this.resetCurrentSprint()
        this.deleteCurrentBoard()

        if (this.showingBoard) {
          this.$router.push({
            name: 'MyProjects'
          })
        }
      }
    },
    deleteCurrentBoard() {
      let lastBoardRecordOnlyName = 'lastBoard-' + this.currentUser.id
      this.$store.remove(lastBoardRecordOnlyName)
    },
    saveCurrentBoard() {
      let currentBoard = {
        sprintId: this.sprintId,
        projectId: this.projectId
      }
      let lastBoardRecordOnlyName = 'lastBoard-' + this.currentUser.id
      this.$store.set(lastBoardRecordOnlyName, currentBoard)
      this.cacheProjectLastSprint()
    },
    cacheProjectLastSprint() {
      let key = `u-${this.currentUser.id}-p-${this.projectId}-s`
      this.$store.set(key, this.sprintId)
    },
    resetCurrentProject() {
      this.projectId = null
      this.currentProject = {}
    },
    resetCurrentSprint() {
      this.currentSprint = {}
      this.sprintId = null
    },
    sprintChanged(sprintIndex, refreshBoard = true) {
      if (sprintIndex === 'newSprint') {
        this.newSprint()
      } else if (sprintIndex == 'viewProjectSprints') {
        this.$router.push({
          name: 'SprintList',
          params: { projectId: this.projectId }
        })
      } else if (sprintIndex === 0 || sprintIndex) {
        this.currentSprint = this.currentProject.sprints[sprintIndex]
        this.sprintId = this.currentSprint.id
        this.$refs.issueFilter?.clearFilter()

        if (refreshBoard) {
          this.refreshBoard()
        }
      }
    },
    caclProjectMemberRole() {
      if (this.currentProject && this.currentProject.projectMembers) {
        let projectMember = this.currentProject.projectMembers.find((member) => member.user.id == this.currentUser.id)
        if (projectMember.role == 'OWNER' || projectMember.role == 'DEVELOPER') {
          this.currentProject.isDeveloper = true
        } else {
          this.currentProject.isDeveloper = false
        }
      }
    },
    caclSprintsStatus() {
      if (this.currentProject && this.currentProject.sprints) {
        this.currentProject.sprints.forEach((sprint) => {
          utils.formatAndCaclSprintStatus(sprint)
        })
      }
    },
    refreshBoard() {
      this.saveCurrentBoard()

      this.$router.push({
        name: 'Board',
        params: { projectId: this.projectId, sprintId: this.sprintId }
      })
    },
    filterChanged() {
      this.$bus.$emit('boardFilterChanged', this.filter)
    },
    showIssueFinder() {
      this.issueFinderVisible = true
    },
    issueSelected(issue) {
      this.editingIssue = issue
      this.issueFinderVisible = false
    },
    issueFinderBlur() {
      this.editingIssue = {}
      this.issueFinderVisible = false
    },
    issueDialogClosed() {
      this.editingIssue = {}
    },
    userDropCommand(command) {
      if (command == 'UserInfo') {
        this.userInfoDialogVisible = true
      } else {
        this.$router.push({ name: command })
      }
    },
    changeTheme(command) {
      if (command === 'toggleMiniMode') {
        this.toggleMiniMode()
        return
      }

      userApi.updatePreference({ theme: command }).then((res) => {
        this.$store.set('user', res.data)
        this.currentUser = res.data
        this.$bus.$emit('themeChanged', res.data.preference)
      })
    },
    toggleDark() {
      this.$store.set('darkMode', this.darkMode)
      if (this.darkMode) {
        document.querySelector('html').classList.add('dark')
      } else {
        document.querySelector('html').classList.remove('dark')
      }
    },
    toggleMiniMode() {
      this.miniMode = !this.miniMode
      this.$bus.$emit('miniModeChanged', this.miniMode)
    },
    operatingCommand(command) {
      if (command == 'newProject') {
        this.newProject()
      } else if (command == 'newSprint') {
        this.newSprint()
      } else if (command == 'updateProject') {
        this.editProject = this.currentProject
        this.updateProject()
      } else if (command == 'updateSprint') {
        if (this.sprintId) {
          this.editSprint = this.currentSprint
          this.updateSprint()
        }
      } else if (command == 'viewBurnDown') {
        if (this.sprintId != null) {
          this.$router.push({
            name: 'BurndownChart',
            params: { projectId: this.projectId, sprintId: this.sprintId }
          })
        }
      } else if (command == 'viewProjectDetails') {
        this.$router.push({
          name: 'ProjectDetails',
          params: { projectId: this.projectId }
        })
      } else {
        this.$router.push({
          name: command,
          params: { projectId: this.projectId }
        })
      }
    },
    newProject() {
      this.editProject = {}
      this.projectDialogVisible = true
    },
    updateProject() {
      this.projectDialogVisible = true
    },
    projectFormClosed() {
      this.projectDialogVisible = false
    },
    projectSaved(savedProject) {
      console.log('project updated', savedProject)
      let index = this.projects.findIndex((project) => project.id === savedProject.id)

      if (index >= 0) {
        this.projects.splice(index, 1, savedProject)
      } else {
        this.projects.unshift(savedProject)
        // If it's a new project, then swith to the board of it
        if (savedProject.isNew) {
          this.projectChanged(savedProject.id)
        }
      }

      // current project updated, refresh the project avatar and name
      if (this.currentProject.id === savedProject.id) {
        this.currentProject.avatar = savedProject.avatar
        this.currentProject.name = savedProject.name
      }
    },
    newSprint() {
      this.editSprint = {}
      this.sprintId = null
      this.editSprintDialogVisible = true
    },
    updateSprint() {
      this.editSprintDialogVisible = true
    },
    sprintFormClosed() {
      this.editSprintDialogVisible = false
    },
    sprintSaved(savedSprint, refreshBoard = true) {
      this.sprintId = savedSprint.id
      this.editSprintDialogVisible = false
      this.currentSprint = savedSprint
      utils.formatAndCaclSprintStatus(savedSprint)

      let index = this.currentProject.sprints.findIndex((sprint) => sprint.id === savedSprint.id)

      if (index >= 0) {
        this.currentProject.sprints.splice(index, 1, savedSprint)
      } else {
        this.currentProject.sprints.unshift(savedSprint)
        if (refreshBoard) {
          this.refreshBoard()
        }
      }
    },
    sprintDeleted(deletedSprint, refreshBoard = true) {
      let index = this.currentProject.sprints.findIndex((sprint) => sprint.id === deletedSprint.id)
      this.currentProject.sprints.splice(index, 1)
      // Current sprint deleted, switch to the previous sprint
      this.sprintChanged(index, refreshBoard)
    },
    editMember() {
      this.editMemberDrawerVisible = true
    },
    drawerClosed() {
      this.editMemberDrawerVisible = false
    },
    userInfoClosed() {
      this.userInfoDialogVisible = false
    },
    userInfoUpdated(newUserInfo) {
      this.$store.set('user', newUserInfo)
      this.currentUser = newUserInfo
    },
    toggleFullscreen() {
      utils.toggleFullscreen(document.documentElement)
      this.boardInFullscreen = !this.boardInFullscreen
    },
    quitFullscreen() {
      if (!document.webkitIsFullScreen && !document.mozFullScreen && !document.msFullscreenElement) {
        this.boardInFullscreen = false
      }
    }
  }
}
</script>

<style lang="less">
.community-popover-container {
  padding: 12px;
  font-size: 12px;
  right: 12px !important;
  color: #999999;

  &.wechat {
    flex-direction: column;
    text-align: center;

    .wechat-qr-img {
      width: 180px;
      height: 180px;
    }
  }

  &.discord {
    display: flex;
    flex-direction: row;
    align-items: center;

    .discord-icon {
      width: 20px;
      margin-right: 10px;
    }
  }
}

.them-menu-item {
  display: flex;
  justify-content: space-between;
  align-items: center;
  min-width: 110px;

  &.active {
    color: var(--el-color-primary);
    font-weight: 500;
  }
}

.header-more-menu-popup {
  hr {
    border: 0.5px solid #eee;
  }
}

.header-project-dropdown-list {
  li:last-of-type {
    height: 40px;
  }
}
</style>

<style lang="less" scoped>
.base-layout-container {
  height: 100vh;

  .layout-header {
    height: auto !important;
    padding: 3px 12px;
    display: flex;
    align-items: center;
    flex-wrap: wrap;
    justify-content: space-between;
    background-color: #ffffff;

    @media only screen and (max-width: 500px) {
      justify-content: center;
    }

    .logo-container {
      min-width: 180px;
      cursor: pointer;
      .logo {
        height: 24px;
        margin: 12px 20px 2px 0;
      }
    }

    .select-project,
    .select-sprint {
      height: 20px;
      line-height: 20px;
      margin-right: 20px;
      padding: 5px 10px;
      white-space: nowrap;

      .el-icon {
        margin-left: 5px;
      }
    }

    .current-project-name,
    .current-sprint-name {
      max-width: 200px;
      text-overflow: ellipsis;
      overflow: hidden;
      white-space: nowrap;
    }

    .right-links {
      display: flex;
      align-items: center;

      .el-divider {
        margin: 0 12px;
      }

      .github-badge {
        display: flex;
        align-items: center;
        margin-right: 20px;

        img {
          width: 20px;
          height: 20px;
        }
      }

      .create-new-icon {
        font-size: 20px;
      }

      .icon-filter {
        width: 16px;
        height: 16px;

        &.active {
          color: var(--el-color-primary);
        }
      }

      .project-member-count {
        .member-count {
          margin-left: 3px;
          font-size: 14px;
        }

        .project-members-icon {
          height: 16px;
          width: 16px;
        }
      }

      .current-user-info {
        .user-name {
          margin-left: 8px;
          line-height: 12px;
        }
      }
    }
  }

  .layout-body {
    padding: 0px;

    .empty-project-list-placeholder {
      min-height: 200px;
      height: 80vh;
    }
  }
}

.header-project-dropdown-list,
.header-sprint-dropdown-list {
  max-height: 70vh;
  min-width: 150px;
  max-width: 260px;

  &.wider {
    min-width: 230px;
  }

  .dropdown-item-selected {
    color: var(--el-color-primary);
    font-weight: 700;
  }
}

.project-option-wrapper {
  padding: 6px 0;
  width: 100%;

  display: flex;
  place-items: center;

  .project-name {
    text-overflow: ellipsis;
    overflow: hidden;
    font-weight: 500;

    &::-webkit-scrollbar {
      display: none;
    }
  }
}
.sprint-option-wrapper {
  padding: 4px 0;
  width: 100%;

  .sprint-name-row {
    display: flex;
    align-items: center;
    padding-bottom: 4px;

    .sprint-name {
      text-overflow: ellipsis;
      overflow: hidden;
      font-weight: 500;
    }
  }

  .sprint-option-name {
    line-height: 1;
    padding-top: 4px;
    font-weight: 500;
  }

  .form-field-tip {
    font-size: 11px;
    margin: 0;
  }

  .sprint-date-range-row {
    display: flex;
    justify-content: space-between;
    align-items: center;
  }
}

.selector {
  padding: 5px;
  margin: 0 5px;
  border-radius: 5px;
  cursor: pointer;
  display: flex;
  align-items: center;

  &:hover {
    background-color: #e7f5f3;
    color: var(--el-color-primary);
  }
}
</style>
