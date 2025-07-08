<template>
  <div :class="`big-board-body ${boardTheme}`" v-loading="loading">
    <draggable
      v-if="issueGroups?.length"
      v-model="issueGroups"
      class="issue-group-draggable-box"
      handle=".column-header"
      ghost-class="drop-target-ghost-class"
      animation="200"
      delay="200"
      delayOnTouchOnly="true"
      group="issueGroup"
      @start="drag = true"
      item-key="id"
      @end="groupMoveEnding">
      <template #item="{ element, index }">
        <div :class="`issue-group-column ${element.justModified ? 'blinking-group' : ''}`">
          <div class="column-header" :title="$t('board.group.dragToMove')">
            <div class="flex flex-grow justify-between">
              <div class="column-title-container">
                <div class="column-title">{{ element.label }}</div>
                <span v-if="element.status == 'DONE'" class="iconfont icon-check"></span>
                <div
                  class="issue-count"
                  :title="
                    $t('board.group.issueCount', {
                      issueCount: issueCount(element.id)
                    })
                  ">
                  {{ issueCount(element.id) }}
                </div>
              </div>
              <div
                v-if="countStoryPoints(element.id) != null"
                class="story-point-tag"
                :title="
                  $t('board.group.pointCount', {
                    pointCount: countStoryPoints(element.id)
                  })
                ">
                {{ countStoryPoints(element.id) }}
              </div>
            </div>
            <div class="column-icons" v-if="project.isDeveloper">
              <el-icon
                class="issue-group-action"
                :title="$t('board.group.newIssue')"
                @click.stop="createIssues(index, element)">
                <Plus />
              </el-icon>
              <el-dropdown size="default" trigger="click">
                <el-icon class="issue-group-action"><MoreFilled :title="$t('common.more')" /></el-icon>
                <template #dropdown>
                  <el-dropdown-menu>
                    <el-dropdown-item icon="Edit" @click.native="editIssueGroup(element, index)">
                      {{ $t('board.group.rename') }}
                    </el-dropdown-item>
                    <el-dropdown-item
                      :icon="element.miniMode ? 'FolderOpened' : 'Folder'"
                      @click.native="toggleMiniMode(element, index, !element.miniMode)">
                      {{ element.miniMode ? $t('board.group.expandAll') : $t('board.group.collapseAll') }}
                    </el-dropdown-item>
                    <el-dropdown-item
                      v-if="element.status == 'DONE'"
                      icon="DocumentChecked"
                      @click.native="generateReleaseNotes(index, element)"
                      >{{ $t('board.group.releaseNotes') }}</el-dropdown-item
                    >

                    <el-dropdown-item>
                      <el-dropdown placement="right-start">
                        <div class="submenu-row">
                          <div class="flex">
                            <el-icon><Sort /></el-icon>{{ $t('board.group.sortBy') }}
                          </div>
                          <el-icon class="suffix-icon"><CaretRight /></el-icon>
                        </div>
                        <template #dropdown>
                          <el-dropdown-menu>
                            <el-dropdown-item
                              v-for="sortType in Object.keys(dict.issueSortTypes)"
                              :key="sortType"
                              @click.native="sortIssues(index, sortType)">
                              {{ $t(`issueSortTypes.${sortType}`) }}
                            </el-dropdown-item>
                          </el-dropdown-menu>
                        </template>
                      </el-dropdown>
                    </el-dropdown-item>
                    <el-dropdown-item>
                      <el-dropdown placement="right-start">
                        <div class="submenu-row">
                          <div class="flex">
                            <el-icon><Right /></el-icon>{{ $t('board.group.moveAll') }}
                          </div>
                          <el-icon class="suffix-icon"><CaretRight /></el-icon>
                        </div>
                        <template #dropdown>
                          <el-dropdown-menu>
                            <el-dropdown-item
                              v-for="targetSprint in project.sprints"
                              :key="targetSprint.id"
                              :disabled="targetSprint.id === sprint.id"
                              @click.native="moveAllIssues(index, targetSprint)">
                              {{ targetSprint.name }}
                            </el-dropdown-item>
                          </el-dropdown-menu>
                        </template>
                      </el-dropdown>
                    </el-dropdown-item>
                    <el-dropdown-item
                      v-if="!element.builtIn"
                      icon="Delete"
                      @click.native="deleteIssueGroup(element, index)">
                      {{ $t('common.delete') }}
                    </el-dropdown-item>
                  </el-dropdown-menu>
                </template>
              </el-dropdown>
            </div>
          </div>
          <div class="issue-card-list">
            <draggable
              v-if="issuesList[index]"
              v-model="issuesList[index].issues"
              :id="element.id"
              class="issue-draggable-box"
              group="issue"
              draggable=".issue-card-wrapper"
              ghost-class="drop-target-ghost-class"
              animation="200"
              delay="50"
              delayOnTouchOnly="true"
              @change="changeIssueGroup"
              @start="drag = true"
              item-key="id"
              @end="issueMoveEnding">
              <template #item="{ element, index }">
                <div :class="`issue-card-wrapper ${element.justModified ? 'blinking' : ''}`">
                  <issue-card
                    :issueDetails="element"
                    :project="project"
                    @updateIssue="issueUpdated"
                    @deleteIssue="issueDeleted"
                    @issueCloned="issueCloned"
                    @issueLinked="issueLinked"
                    @issueUnlinked="issueUnlinked"></issue-card>
                </div>
              </template>
              <template #footer>
                <issue-fast-edit
                  v-if="issueFastEditVisibleList[index]?.visible"
                  :issue="issue"
                  :projectId="projectId"
                  id="issue-fast-edit-form"
                  @confirm="issueSaved"
                  @close="closeIssueFastEditor"></issue-fast-edit>
              </template>
            </draggable>
          </div>
        </div>
      </template>
    </draggable>
    <div class="empty-column">
      <div class="issue-group-creator" @click="createIssueGroup" v-if="$route.params.sprintId && project.isDeveloper">
        <el-icon><Plus /></el-icon>
        <span class="create-issue-group-tag">{{ $t('board.group.new') }}</span>
      </div>
    </div>
    <issue-group-edit
      v-if="issueGroupEditVisible"
      :originalIssueGroup="originalIssueGroup"
      :originalProject="project"
      :issuesList="editingGroupIssues"
      @issueGroupEditClosed="issueGroupEditClosed"
      @issueGroupSaved="issueGroupSaved"
      @issueGroupDeleted="issueGroupDeleted">
    </issue-group-edit>
    <issue-edit
      v-if="editingIssueId"
      :editIssueId="editingIssueId"
      :projectId="projectId"
      @issueFormClosed="issueDialogClosed"
      @onIssueUpdated="issueUpdated"
      @onIssueDeleted="issueDeleted"
      @onIssueLinked="issueLinked"
      @onIssueUnlinked="issueUnlinked" />
    <el-dialog
      :title="$t('board.release.dialogTitle')"
      v-model="releaseNotesDialogVisible"
      :fullscreen="isInMobile"
      :draggable="true"
      width="740px"
      top="5vh">
      <div class="release-notes" ref="releaseNotesContainer">
        <div class="title">
          {{
            $t('board.release.pageTitle', {
              sprintName: sprint.name,
              releaseDate: sprint.endDate || new Date().toLocaleDateString()
            })
          }}
        </div>
        <br />
        <template v-for="(doneIssues, type) in doneIssuesGroupedByType">
          <div v-if="doneIssues.length" :key="type" class="note-group">
            <div v-if="type === 'REQUIREMENT'" class="sub-title">{{ $t('board.release.feature') }}</div>
            <div v-if="type === 'TASK'" class="sub-title">{{ $t('board.release.enhance') }}</div>
            <div v-if="type === 'BUG'" class="sub-title">{{ $t('board.release.fix') }}</div>
            <ul>
              <li v-for="doneIssue in doneIssues" :key="doneIssue.id" class="issue-note">{{ doneIssue.name }}</li>
            </ul>
          </div>
        </template>
      </div>
      <template #footer>
        <el-button size="default" text icon="CopyDocument" @click="copyReleaseNotes">
          {{ $t('board.release.copy') }}
        </el-button>
        <el-button size="default" type="primary" @click="releaseNotesDialogVisible = false">
          {{ $t('common.close') }}
        </el-button>
      </template>
    </el-dialog>
  </div>
</template>
<script>
import { sprintApi } from '@/api/sprint.js'
import { projectApi } from '@/api/project.js'
import { issueGroupApi } from '@/api/issueGroup.js'
import { issueApi } from '@/api/issue'
import utils from '../utils/util'
import ReconnectingWebSocket from 'reconnecting-websocket'
import { ElMessage, ElMessageBox } from 'element-plus'
import dayjs from 'dayjs'
import IssueCard from '@/components/issue/IssueCard.vue'
import IssueFastEdit from '@/components/issue/IssueFastEdit.vue'
import IssueGroupEdit from '@/components/issue/IssueGroupEdit.vue'
import IssueEdit from '@/components/issue/IssueEdit.vue'
import draggable from 'vuedraggable'
import dict from '@/locales/zh-cn/dict.json'
import { htmlToText } from 'html-to-text'
import '@/styles/board.less'

export default {
  name: 'Board',
  components: {
    IssueCard,
    IssueFastEdit,
    IssueGroupEdit,
    IssueEdit,
    draggable
  },
  inject: ['reload'],
  data() {
    return {
      dict: dict,
      boardTheme: 'sticky-note',
      currentUser: this.$store.get('user'),
      isInMobile: utils.isInMobile(),
      project: {},
      projectId: null,
      sprint: {
        issues: []
      },
      originalIssueGroup: {},
      sprintId: null,
      issue: {},
      issueGroup: {},
      issueFastEditVisibleList: [],
      issueFastEditing: false,
      issueGroups: [],
      issuesList: [],
      issueGroupEditVisible: false,
      editingGroupIssues: [],
      groupIndex: 0,
      webSocketUrl: import.meta.env.VITE_WEBSOCKET_URL,
      releaseNotesDialogVisible: false,
      doneIssuesGroupedByType: { REQUIREMENT: [], TASK: [], BUG: [] },
      allIssues: [],
      filter: null,
      rsocket: null,
      loading: false,
      editingIssueId: null
    }
  },
  watch: {
    $route(to, from) {
      if (to.name === 'Board') {
        this.init()
      }
    }
  },
  created() {
    this.boardTheme = this.currentUser.preference?.theme || 'sticky-note'
    window.addEventListener('beforeunload', this.closeSocket)
  },
  mounted() {
    this.$bus.$on('projectMemberUpdate', (newProjectMembers) => {
      this.project.projectMembers = newProjectMembers
      this.calculateRole()
    })

    this.$bus.$on('boardFilterChanged', (issueFilter) => {
      this.filterIssues(issueFilter)
    })

    this.$bus.$on('themeChanged', (preference) => {
      this.boardTheme = preference.theme || 'sticky-note'
    })

    this.$bus.$on('miniModeChanged', (miniMode) => {
      this.issueGroups.forEach((group, index) => {
        this.toggleMiniMode(group, index, miniMode)
      })
    })

    this.init()
  },
  unmounted() {
    console.log('Board unmounted...')
    window.removeEventListener('beforeunload', this.closeSocket)
    this.closeSocket()
  },
  beforeDestroy() {
    console.log('Board destorying...')
    this.closeSocket()
  },
  computed: {
    countStoryPoints() {
      return function (groupLabel) {
        return this.calculateStoryPoints(groupLabel)
      }
    }
  },
  methods: {
    init() {
      this.closeSocket()
      let projectId = this.$route.params.projectId
      let sprintId = this.$route.params.sprintId
      this.filter = null

      console.log('Initializing Board with projectId:', projectId, 'sprintId:', sprintId)

      if (projectId) {
        // Reload the project only if it changed (to reduce API request)
        if (projectId != this.projectId) {
          console.log('Project changed, reloading project...')

          this.projectId = projectId
          this.sprintId = sprintId
          this.loadProject(true)
        } else if (sprintId) {
          // Otherwise only load the sprint
          console.log('Sprint changed, reloading sprint...')
          this.projectId = projectId
          this.sprintId = sprintId
          this.loadSprintAndInit(true)
        }
      } else {
        console.warn('Project ID is missing in URL')
      }
    },
    loadProject(loadSprintAsWell) {
      if (this.projectId) {
        this.loading = true

        projectApi.getById(this.projectId).then((res) => {
          this.project = res.data
          this.calculateRole()

          if (!this.sprintId || this.sprintId === 'default') {
            this.showLastViewedOrDefaultSprint()
          } else {
            this.loadSprintAndInit(loadSprintAsWell)
          }
        })
      }
    },
    loadSprintAndInit(loadSprintAsWell) {
      if (this.sprintId && loadSprintAsWell) {
        this.loadSprintById()
        this.initWebSocket()
      } else {
        this.loading = false
      }

      this.issueGroups = this.project.issueGroups

      if (!this.issueFastEditing) {
        this.initIssueFastEditsVisible()
      }

      // Blink group if needed
      if (this.justModifiedGroupId) {
        this.blinkGroup(this.justModifiedGroupId)
      }
    },
    showLastViewedOrDefaultSprint() {
      this.sprint = utils.getLastViewedOrDefaultSprint(this.currentUser.id, this.project)

      if (this.sprint) {
        this.sprintId = this.sprint.id

        this.$router.replace({
          name: 'Board',
          params: { projectId: this.projectId, sprintId: this.sprintId }
        })
        this.reload()
      } else {
        console.warn('Project contains no sprint')
      }
    },
    loadSprintById() {
      this.loading = true
      sprintApi.getById(this.sprintId).then((res) => {
        this.sprint = res.data

        // Cache the original sprint issue list for when filter is cleared
        this.allIssues = this.sprint.issues

        this.initIssues()

        if (this.filter) {
          this.filterIssues(this.filter)
        }

        // Blink issue if needed
        if (this.justModifiedIssueId) {
          this.blinkIssue(this.justModifiedIssueId)
        }

        // Blink group if needed
        if (this.justModifiedGroupId) {
          this.blinkGroup(this.justModifiedGroupId)
        }

        this.loading = false
      })
    },
    filterIssues(issueFilter) {
      if (issueFilter) {
        this.sprint.issues = this.allIssues.filter((issue) => {
          let typeMatch = true
          let priorityMatch = true
          let assigneeMatch = true
          let dueTimePastMatch = true
          let tagMatch = true

          if (issueFilter.dueTimePast) {
            dueTimePastMatch = issue.dueTimePast
          }

          if (issueFilter.types.length) {
            typeMatch = issueFilter.types.includes(issue.type)
          }

          if (issueFilter.priorities.length) {
            priorityMatch = issueFilter.priorities.includes(issue.priority)
          }

          if (issueFilter.assignees.length) {
            assigneeMatch = issueFilter.assignees.some((assginee) => issue.owner?.id === assginee.id)
          }

          if (issueFilter.tags.length) {
            tagMatch = issueFilter.tags.some((filterTag) => issue.tags.some((issueTag) => issueTag.id === filterTag.id))
          }

          return typeMatch && priorityMatch && assigneeMatch && dueTimePastMatch && tagMatch
        })
        this.filter = issueFilter
      } else {
        this.sprint.issues = this.allIssues
        this.filter = null
      }

      this.initIssues()
    },
    calculateRole() {
      this.project.isDeveloper = false
      let projectMember = this.project.projectMembers.filter((member) => member.user.id == this.currentUser.id)[0]
      if (projectMember.role == 'OWNER' || projectMember.role == 'DEVELOPER') {
        this.project.isDeveloper = true
      }
    },
    initIssueFastEditsVisible() {
      this.issueFastEditVisibleList = []
      this.issueGroups.forEach((group) => {
        let groupVisible = {
          id: group.id,
          visible: false
        }
        this.issueFastEditVisibleList.push(groupVisible)
      })
    },
    initIssues() {
      this.issuesList = []

      this.sprint.issues.forEach((issue) => {
        this.formatIssue(issue)
      })

      this.issueGroups.forEach((issueGroup) => {
        if (this.sprint.issues != null) {
          let issues = this.sprint.issues.filter((issue) => issue.issueGroup && issue.issueGroup.id === issueGroup.id)
          this.issuesList.push({
            id: issueGroup.id,
            issues: issues
          })
        }
      })
    },
    formatIssue(issue) {
      if (issue.dueTime) {
        issue.dueTimeFormatted = dayjs(issue.dueTime).format('YYYY-MM-DD  HH:mm')
      } else {
        issue.dueTimeFormatted = ''
      }

      utils.formatCreateUpdateTime(issue)
      this.calcDueTimeStatus(issue)

      return issue
    },
    calcDueTimeStatus(issue) {
      issue.dueTimeAlmost = false
      issue.dueTimePast = false

      if (issue.issueGroup?.status != 'DONE' && issue.dueTime) {
        let dueTime = dayjs(issue.dueTime)
        let now = dayjs()

        if (dueTime.isBefore(now)) {
          issue.dueTimePast = true
        } else if (dueTime.isBefore(now.add(1, 'day'))) {
          issue.dueTimeAlmost = true
        }
      }
      return issue
    },
    issueCount(issueGroupId) {
      return this.getIssuesByGroup(issueGroupId).length
    },
    getIssuesByGroup(issueGroupId) {
      if (this.sprint.issues != null) {
        let result = this.sprint.issues.filter((issue) => issue.issueGroup && issue.issueGroup.id === issueGroupId)
        return result
      }
    },
    calculateStoryPoints(groupId) {
      let sum = null
      this.issuesList.filter((group) => {
        if (group.id === groupId) {
          let issues = group.issues
          for (let i = 0; i < issues.length; i++) {
            if (issues[i].storyPoints >= 0 && issues[i].storyPoints != null) {
              if (!sum) {
                sum = 0
              }
              sum += parseFloat(issues[i].storyPoints)
            }
          }
        }
      })
      return sum
    },
    closeSocket() {
      if (this.rsocket && this.rsocket.readyState === 1) {
        this.rsocket.close()
      }
    },
    createIssues(groupIndex, issueGroup) {
      this.closeIssueFastEditor()
      this.issue.issueGroup = issueGroup
      this.issue.type = 'TASK'
      this.issue.sprint = this.sprint
      this.issue.files = []
      this.issue.seq = this.issuesList[groupIndex].issues.length
      if (this.sprintId && this.projectId) {
        this.issue.sprint = { id: this.sprintId }
        let index = utils.indexInArray(this.issueGroups, issueGroup.id)
        if (index >= 0) {
          this.issueFastEditVisibleList[index].visible = true
          this.issueFastEditing = true

          this.$nextTick(() => {
            this.scrollToFastIssueForm()
          })
        }
      }
    },
    scrollToFastIssueForm: function () {
      document.querySelector('#issue-fast-edit-form .create-issue-btn').scrollIntoView()
    },
    issueSaved(issue) {
      if (this.sprint.issues == null) {
        this.sprint.issues = []
      }
      if (this.sprintId === issue.sprint.id) {
        this.sprint.issues.push(issue)
        this.initIssues()
      }
      this.issue = {}
      this.closeIssueFastEditor()
    },
    closeIssueFastEditor() {
      this.issueFastEditVisibleList.forEach((groupVisible) => {
        groupVisible.visible = false
      })
      this.issueFastEditing = false
    },
    changeIssueGroup(evt) {
      if (evt.added) {
        this.issue = evt.added.element
        this.issue.seq = evt.added.newIndex
        this.issue.sprint = { id: this.sprintId }
      } else if (evt.moved) {
        this.issue = evt.moved.element
        this.issue.seq = evt.moved.newIndex
        this.issue.sprint = { id: this.sprintId }
      }
    },
    sortIssues(groupIndex, sortType) {
      // console.log('Sort issues by', groupIndex, sortType)
      let issues = this.issuesList[groupIndex].issues

      let result = 0
      const priorityOrders = ['CRITICAL', 'MAJOR', 'NORMAL', 'LOW', 'TRIVIAL']
      const issueTypeOrders = ['REQUIREMENT', 'TASK', 'BUG']

      issues.sort(function (issue1, issue2) {
        if (sortType == 'PRIORITY') {
          result = priorityOrders.indexOf(issue1.priority) - priorityOrders.indexOf(issue2.priority)
        } else if (sortType == 'TYPE') {
          result = issueTypeOrders.indexOf(issue1.type) - issueTypeOrders.indexOf(issue2.type)
        } else if (sortType == 'CREATED_TIME') {
          result = issue1.id - issue2.id
        } else if (sortType == 'STORY_POINT') {
          result = issue2.storyPoints - issue1.storyPoints
        } else if (sortType == 'ASSIGNEE') {
          if (issue1.owner?.nickname && issue2.owner?.nickname) {
            result = (issue1.owner?.nickname || '').localeCompare(issue2.owner?.nickname || '')
          } else {
            result = (issue2.owner?.nickname || '').localeCompare(issue1.owner?.nickname || '')
          }
        }
        return result
      })

      this.updateIssuesSeq(groupIndex)
    },
    updateIssuesSeq(groupIndex) {
      let issues = JSON.parse(JSON.stringify(this.issuesList[groupIndex].issues))
      let issueIds = issues.map((issue) => issue.id)
      issueApi
        .updateSeq(issueIds)
        .then(() => {
          // Nothing need to do
        })
        .catch(() => {
          this.issuesList = issues
          this.initIssues()
        })
    },
    issueMoveEnding(evt) {
      this.drag = false
      let targetGroupIndex = this.issueGroups.findIndex((group) => group.id === evt.to.id)

      if (evt.to.id === evt.from.id && evt.oldIndex != evt.newIndex) {
        this.updateIssuesSeq(targetGroupIndex)
        this.issue = {}
      } else if (evt.to.id === evt.from.id && evt.oldIndex === evt.newIndex) {
        this.issue = {}
        return
      } else {
        let newGroup = this.issueGroups[targetGroupIndex]
        let oldGroup = JSON.parse(JSON.stringify(this.issue.issueGroup))
        this.issue.issueGroup = newGroup
        this.calcDueTimeStatus(this.issue)
        issueApi
          .move(this.issue.id, newGroup.id)
          .then(() => {
            this.updateIssuesSeq(targetGroupIndex)
            this.issue = {}
          })
          .catch(() => {
            this.issue.issueGroup = oldGroup
            this.initIssues()
          })
      }
    },
    issueUpdated(newIssue) {
      let index = utils.indexInArray(this.sprint.issues, newIssue.id)
      if (newIssue.sprint.id === this.sprintId) {
        this.sprint.issues.splice(index, 1, newIssue)
      } else {
        this.sprint.issues.splice(index, 1)
      }
      this.initIssues()
    },
    issueDeleted(issue) {
      let index = utils.indexInArray(this.sprint.issues, issue.id)
      this.sprint.issues.splice(index, 1)
      ElMessage.success({ message: this.$t('board.msg.issueDeleted') })
      this.initIssues()
    },
    issueCloned(sourceIssueId, issue) {
      let sourceIssueIndex = utils.indexInArray(this.sprint.issues, sourceIssueId)
      this.sprint.issues.splice(sourceIssueIndex + 1, 0, issue)
      ElMessage.success({ message: this.$t('board.msg.issueCopied') })
      this.initIssues()
    },
    issueLinked(sourceIssue, targetIssueId) {
      let index = utils.indexInArray(this.sprint.issues, targetIssueId)
      if (index >= 0) {
        let linkedIssue = this.sprint.issues[index]
        linkedIssue.linkedByIssues.push(sourceIssue)
        this.sprint.issues.splice(index, 1, linkedIssue)
        this.initIssues()
      }
    },
    issueUnlinked(sourceIssue, unlinkIssue) {
      let index = utils.indexInArray(this.sprint.issues, unlinkIssue.id)
      if (index >= 0) {
        unlinkIssue.linkedByIssues.filter((issue) => issue.id != sourceIssue.id)
        unlinkIssue.linkToIssues.filter((issue) => issue.id != sourceIssue.id)
        this.sprint.issues.splice(index, 1, unlinkIssue)
        this.initIssues()
      }
    },
    initWebSocket() {
      this.rsocket = new ReconnectingWebSocket(`${this.webSocketUrl}/${this.projectId}/${this.sprintId}`)
      console.log(`Connected WebSocket to ${this.rsocket.url}`)

      this.rsocket.addEventListener('open', () => {
        console.log(`WebSocket connected to ${this.rsocket.url}`)
      })

      this.rsocket.addEventListener('close', (e) => {
        console.log(`WebSocket closed from ${e.currentTarget.url}`)
      })

      this.rsocket.addEventListener('message', (e) => {
        console.log(`WebSocket message received: ${e.data}`)

        this.processSocketMsg(e)
      })
    },
    blinkIssue(issueId) {
      let index = utils.indexInArray(this.sprint.issues, issueId)

      if (index >= 0) {
        let modifiedIssue = this.sprint.issues[index]
        modifiedIssue.justModified = true
        this.sprint.issues.splice(index, 1, modifiedIssue)

        setTimeout(() => {
          modifiedIssue.justModified = false
          this.justModifiedIssueId = null
          this.sprint.issues.splice(index, 1, modifiedIssue)
        }, 5000)
      }
    },
    blinkGroup(groupId) {
      let index = utils.indexInArray(this.issueGroups, groupId)

      if (index >= 0) {
        let modifiedGroup = this.issueGroups[index]
        modifiedGroup.justModified = true
        this.issueGroups.splice(index, 1, modifiedGroup)

        setTimeout(() => {
          modifiedGroup.justModified = false
          this.justModifiedGroupId = null
          this.issueGroups.splice(index, 1, modifiedGroup)
        }, 5000)
      }
    },
    processSocketMsg(e) {
      if (e.isTrusted) {
        let socketMsg = JSON.parse(e.data)
        let nofityMsg = ''

        if (socketMsg.eventType == 'ISSUE_CHANGED') {
          let actionName = this.$t('eventActionTypes.' + socketMsg.actionType)

          nofityMsg = this.$t('board.msg.socketMsg.issueChanged', {
            nickname: socketMsg.updatedByUserNickname,
            action: actionName,
            code: socketMsg.sourceName
          })

          // Blink the changed issue card
          this.justModifiedIssueId = socketMsg.sourceId
        } else if (socketMsg.eventType == 'ISSUE_SEQ_CHANGED') {
          nofityMsg = this.$t('board.msg.socketMsg.issueSeqChanged', {
            nickname: socketMsg.updatedByUserNickname,
            group: socketMsg.sourceName
          })

          // Blink the changed group
          this.justModifiedGroupId = socketMsg.sourceId
        } else if (socketMsg.eventType == 'ISSUE_GROUP_CHANGED') {
          let actionName = this.$t('eventActionTypes.' + socketMsg.actionType)

          nofityMsg = this.$t('board.msg.socketMsg.groupChanged', {
            nickname: socketMsg.updatedByUserNickname,
            action: actionName,
            name: socketMsg.sourceName
          })

          // Blink the changed group
          this.justModifiedGroupId = socketMsg.sourceId
        } else if (socketMsg.eventType == 'ISSUE_GROUP_SEQ_CHANGED') {
          nofityMsg = this.$t('board.msg.socketMsg.groupSeqChanged', {
            nickname: socketMsg.updatedByUserNickname
          })
        }

        if (nofityMsg) {
          if (socketMsg.updatedByUserAvatar) {
            let avatar = `<img src="${socketMsg.updatedByUserAvatar}" class="avatar" />`
            nofityMsg = avatar + nofityMsg
          }

          this.$notify({
            message: nofityMsg,
            dangerouslyUseHTMLString: true,
            customClass: 'board-notification',
            position: 'bottom-left',
            onClick: () => this.notificationClicked(socketMsg),
            duration: 5000
          })

          if (socketMsg.projectId) {
            this.loadProject(false)
          } else {
            this.loadSprintById()
          }
        }
      }
    },
    notificationClicked(socketMsg) {
      if (socketMsg.eventType == 'ISSUE_CHANGED' && socketMsg.actionType != 'DELETE' && socketMsg.sourceId) {
        this.editingIssueId = socketMsg.sourceId
      }
    },
    issueDialogClosed() {
      this.editingIssueId = null
    },
    editIssueGroup(issueGroup, index) {
      this.editingGroupIssues = this.issuesList[index].issues
      this.originalIssueGroup = issueGroup
      this.issueGroupEditVisible = true
    },
    toggleMiniMode(issueGroup, index, miniMode) {
      issueGroup.miniMode = miniMode

      this.issuesList[index].issues.forEach((issue) => {
        issue.miniMode = issueGroup.miniMode
      })
    },
    issueGroupEditClosed() {
      this.editingGroupIssues = []
      this.originalIssueGroup = {}
      this.issueGroupEditVisible = false
    },
    issueGroupSaved(newIssueGroup) {
      let index = utils.indexInArray(this.issueGroups, newIssueGroup.id)
      if (index >= 0) {
        this.issueGroups[index] = newIssueGroup
        this.issuesList[index].id = newIssueGroup.id
        this.issuesList[index].issues.forEach((issue) => {
          issue.issueGroup = newIssueGroup
        })
      } else {
        this.issueGroups.push(newIssueGroup)
        this.initIssueFastEditsVisible()
        this.initIssues()
      }
      this.originalIssueGroup = {}
    },
    createIssueGroup() {
      this.issueGroupEditVisible = true
    },
    generateReleaseNotes(index, group) {
      this.releaseNotesDialogVisible = true
      this.doneIssuesGroupedByType = { REQUIREMENT: [], TASK: [], BUG: [] }

      this.issuesList[index].issues.forEach((issue) => {
        this.doneIssuesGroupedByType[issue.type].push(issue)
      })
    },
    copyReleaseNotes() {
      let releaseNotesContainer = this.$refs['releaseNotesContainer']
      let plainText = htmlToText(releaseNotesContainer.innerHTML)

      navigator.clipboard.writeText(plainText).then(() => {
        ElMessage.success({
          message: this.$t('board.release.copied')
        })
      })
    },
    deleteIssueGroup(issueGroup, index) {
      ElMessageBox.confirm(
        this.$t('issueGroupEdit.msg.delConfirmMsg', { groupName: issueGroup.label }),
        this.$t('issueGroupEdit.msg.delConfirmTitle'),
        {
          type: 'warning',
          dangerouslyUseHTMLString: true,
          draggable: true
        }
      )
        .then(() => {
          issueGroupApi.delete(issueGroup.id).then(() => {
            this.issueGroupDeleted(issueGroup)
          })
        })
        .catch((err) => {
          // Cancelled, do nothing
        })
    },
    issueGroupDeleted(deletedGroup) {
      let index = utils.indexInArray(this.issueGroups, deletedGroup.id)
      this.issueGroups.splice(index, 1)
      this.loadSprintById()

      ElMessage.success({
        message: this.$t('issueGroupEdit.msg.deleteSuccess')
      })
    },
    groupMoveEnding(event) {
      this.drag = false
      if (event.oldIndex != event.newIndex) {
        this.updateGroupSeq()
      }
    },
    updateGroupSeq() {
      let issueGroupIds = this.issueGroups.map((issueGroup) => issueGroup.id)
      issueGroupApi.updateSeq(issueGroupIds).then(() => {
        // Put the newly sorted groups back to the project, in order to keep this sort when switched to another sprint
        this.project.issueGroups = this.issueGroups
      })
      this.initIssues()
    },
    moveAllIssues(groupIndex, targetSprint) {
      let issues = this.issuesList[groupIndex].issues
      let issueIds = issues.map((issue) => issue.id)
      issueApi.batchMove(targetSprint.id, issueIds).then((res) => {
        this.sprint.issues = this.sprint.issues.filter((issue) => !issues.includes(issue))
        this.initIssues()
      })
    }
  }
}
</script>

<style lang="less" scoped>
.big-board-body {
  display: flex;
  height: 100%;
  padding: 0 5px;
  background-color: #ffffff;

  .issue-group-draggable-box {
    display: flex;
    .issue-group-column {
      width: 282px;
      min-width: 282px;
      margin: 10px 6px;
      display: flex;
      flex-direction: column;
      background-color: #f5f5f5;
      border-radius: 8px;
      padding: 10px;

      .column-header {
        display: flex;
        align-items: center;
        justify-content: space-between;
        padding: 10px;

        &:hover {
          cursor: move;
        }

        .column-title-container {
          display: flex;
          align-items: center;

          .column-title {
            font-size: 14px;
            line-height: 20px;
            font-weight: 700;
            max-width: 130px;
            overflow: hidden;
            text-overflow: ellipsis;
            white-space: nowrap;
          }
          .icon-check {
            margin-left: 15px;
            color: var(--el-color-primary);
            font-weight: 800;
          }
          .issue-count {
            margin-left: 20px;
            font-size: 12px;
          }
        }

        .column-icons {
          cursor: pointer;
          visibility: hidden;
          margin-left: 8px;

          .issue-group-action {
            font-weight: 500;
            color: #bbbbbb;
            margin-left: 5px;
            padding: 5px;
            border-radius: 5px;
            font-size: 14px;

            &:hover {
              color: var(--el-color-primary);
              background-color: #e7f5f3;
            }
          }
        }
      }

      &:hover {
        .column-icons {
          visibility: visible;
        }
      }

      .issue-card-list {
        overflow: auto;
        height: 100%;

        .issue-draggable-box {
          min-height: calc(100% - 15px);
        }
      }

      .issue-card-list::-webkit-scrollbar {
        width: 0 !important;
      }
    }
  }

  .empty-column {
    min-width: 150px;
    display: flex;
  }

  .add-user-button {
    margin-top: 20px;
  }
  .issue-group-creator {
    cursor: pointer;
    margin: 10px 6px;
    color: #8c8c8c;
    font-size: 14px;
    height: 20px;
    padding: 3px 12px;
    border-radius: 5px;
    white-space: nowrap;
    display: flex;
    align-items: center;

    &:hover {
      color: var(--el-color-primary);
      background-color: #e7f5f3;
    }
    .create-issue-group-tag {
      margin-left: 5px;
    }
  }

  .drop-target-ghost-class {
    opacity: 0;
  }
}

.release-notes {
  margin: 0 20px;

  .title {
    font-size: 22px;
    font-weight: 500;
    margin-bottom: 10px;
  }

  .note-group {
    margin-bottom: 30px;
  }

  .sub-title {
    font-size: 18px;
    font-weight: 500;
    margin: 5px 0;
  }

  .issue-note {
    margin: 5px;
  }
}
</style>

<style lang="less">
.board-notification {
  .el-notification__content p {
    display: flex;
    align-items: center;
  }
  .avatar {
    width: 26px;
    height: 26px;
    border-radius: 15px;
    margin-right: 8px;
  }

  .issue-code {
    margin-left: 5px;
    font-weight: 500;
    color: var(--el-color-primary);
    cursor: pointer;
  }
}
</style>
