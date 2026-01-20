<template>
  <div class="issue-list-container">
    <!-- <div> -->
    <div v-if="!hideFilter" class="filter-row">
      <div class="left-part">
        <el-button
          v-if="showNewBtn && project.isDeveloper"
          :disabled="loading"
          text
          type="primary"
          @click="newIssue"
          class="text-icon-btn"
          icon="CirclePlusFilled"
          >{{ inTesting ? $t('issueList.header.newBug') : $t('issueList.header.newIssue') }}</el-button
        >
        <el-button
          v-if="showExportBtn && project.isDeveloper && issues?.length"
          :disabled="loading"
          :loading="exporting"
          text
          type="primary"
          @click="exportIssues"
          class="text-icon-btn"
          icon="Download"
          >{{ $t('issueList.header.export') }}</el-button
        >
      </div>
      <div class="right-part">
        <div class="summary-info">
          <el-icon v-if="loading" class="is-loading refresh-btn">
            <Loading />
          </el-icon>
          <el-icon v-else @click="loadIssues" class="refresh-btn">
            <Refresh />
          </el-icon>
          <span class="item-count">{{
            filter.keyword
              ? $t('common.filter.matchedResults', { count: totalElements })
              : $t('issueList.header.count', { count: totalElements })
          }}</span>
        </div>
        <el-form-item class="mb-0!">
          <el-input
            class="search-input"
            v-model="filter.keyword"
            clearable
            prefix-icon="Search"
            :placeholder="$t('issueList.header.search')"
            @input="keywordChanged"></el-input>
        </el-form-item>
      </div>
    </div>
    <div class="main">
      <el-table
        :data="issues"
        v-loading="loading"
        class="issue-list-table"
        row-class-name="issue-row clickable"
        :show-header="true"
        :empty-text="emptyText || $t('issueList.list.emptyMsg')"
        @sort-change="sortChange"
        @filter-change="filterChange"
        @row-click="editIssue">
        <el-table-column
          v-if="columns.includes('code')"
          :label="$t('issueList.list.code')"
          prop="code"
          sortable="custom"
          column-key="types"
          :filters="filterColumns.includes('type') ? issueTypeFilters : null"
          :filter-multiple="true"
          width="130">
          <template #filter-icon>
            <el-icon class="table-header-filter-icon" :class="{ active: filter.types?.length }"><Filter /></el-icon>
          </template>
          <template #default="scope">
            <div class="flex">
              <issue-type-icon :type="scope.row.type" />
              <div class="code">
                <span v-html="scope.row.codeHighlightLabel || scope.row.code"></span>
              </div>
            </div>
          </template>
        </el-table-column>
        <el-table-column
          v-if="columns.includes('name')"
          :label="$t('issueList.list.name')"
          prop="name"
          show-overflow-tooltip
          sortable="custom"
          min-width="120">
          <template #default="scope">
            <span v-html="scope.row.nameHighlightLabel || scope.row.name"></span>
          </template>
        </el-table-column>
        <el-table-column
          v-if="columns.includes('storyPoints')"
          :label="$t('issueList.list.storyPoints')"
          prop="storyPoints"
          sortable="custom"
          min-width="30">
          <template #default="scope">
            <story-point v-if="scope.row.storyPoints != null" :value="scope.row.storyPoints" />
          </template>
        </el-table-column>
        <el-table-column
          v-if="columns.includes('priority')"
          :label="$t('issueList.list.priority')"
          prop="priority"
          sortable="custom"
          column-key="priorities"
          :filters="filterColumns.includes('priority') ? priorityFilters : null"
          :filter-multiple="true"
          min-width="35">
          <template #filter-icon>
            <el-icon class="table-header-filter-icon" :class="{ active: filter.priorities?.length }"
              ><Filter
            /></el-icon>
          </template>
          <template #default="scope">
            <priority-icon :priority="scope.row.priority" showLabel />
          </template>
        </el-table-column>
        <el-table-column
          v-if="columns.includes('owner')"
          :label="$t('issueList.list.owner')"
          prop="owner.nickname"
          sortable="custom"
          column-key="ownerIds"
          :filters="filterColumns.includes('owner') ? ownerFilters : null"
          :filter-multiple="true"
          min-width="30">
          <template #filter-icon>
            <el-icon class="table-header-filter-icon" :class="{ active: filter.ownerIds?.length }"><Filter /></el-icon>
          </template>
          <template #default="scope">
            <avatar
              v-if="scope.row.owner"
              :name="scope.row.owner.nickname"
              :size="22"
              :src="scope.row.owner.avatarUrl"
              showName></avatar>
          </template>
        </el-table-column>
        <el-table-column
          v-if="columns.includes('status')"
          :label="$t('issueList.list.status')"
          prop="issueGroup.seq"
          sortable="custom"
          column-key="groupIds"
          :filters="filterColumns.includes('status') ? groupFilters : null"
          :filter-multiple="true"
          min-width="30">
          <template #filter-icon>
            <el-icon class="table-header-filter-icon" :class="{ active: filter.groupIds?.length }"><Filter /></el-icon>
          </template>
          <template #default="scope">
            <status-tag
              v-if="scope.row.issueGroup"
              :status="scope.row.issueGroup.status"
              :label="scope.row.issueGroup.label" />
          </template>
        </el-table-column>
        <el-table-column
          v-if="columns.includes('actions') && project.isDeveloper && !readonly"
          :label="$t('common.actions')"
          :width="80"
          class-name="actions-column">
          <template #default="scope">
            <el-dropdown trigger="click" placement="bottom">
              <div class="more-action-icon" @click.stop>
                <el-icon><MoreFilled /></el-icon>
              </div>
              <template #dropdown>
                <el-dropdown-menu>
                  <el-dropdown-item icon="DocumentCopy" @click.native="cloneIssue(scope.$index, scope.row)">{{
                    $t('common.copy')
                  }}</el-dropdown-item>
                  <el-dropdown-item
                    divided
                    icon="Delete"
                    :disabled="scope.row.backlog"
                    @click.native="deleteIssue(scope.$index, scope.row)">
                    {{ $t('common.delete') }}
                  </el-dropdown-item>
                  <el-dropdown-item>
                    <el-dropdown placement="bottom">
                      <div class="submenu-row">
                        <div class="flex">
                          <el-icon><User /></el-icon> {{ $t('issueList.list.assignee') }}
                        </div>
                        <el-icon class="suffix-icon"><CaretRight /></el-icon>
                      </div>
                      <template #dropdown>
                        <el-dropdown-menu class="assignee-candidates">
                          <div v-show="scope.row.owner">
                            <el-dropdown-item icon="Close" @click.native="unassign(scope.row)">
                              <span class="assgin-to-me">{{ $t('issueList.list.unassign') }}</span>
                            </el-dropdown-item>
                          </div>
                          <div v-show="!scope.row.owner">
                            <el-dropdown-item icon="Check" @click.native="assignIssueToUser(scope.row, currentUser)">
                              <span class="assgin-to-me">{{ $t('issueList.list.assignToMe') }}</span>
                            </el-dropdown-item>
                          </div>
                          <el-dropdown-item
                            v-for="(member, index) in project.projectMembers"
                            :divided="index === 0"
                            :key="member.id"
                            @click.native="assignIssueToUser(scope.row, member.user)">
                            <div class="user-select-option">
                              <avatar
                                :name="member.user.nickname"
                                :size="20"
                                showName
                                :src="member.user.avatarUrl"></avatar>
                            </div>
                          </el-dropdown-item>
                        </el-dropdown-menu>
                      </template>
                    </el-dropdown>
                  </el-dropdown-item>
                  <el-dropdown-item>
                    <el-dropdown placement="bottom">
                      <div class="submenu-row">
                        <div class="flex">
                          <el-icon><Right /></el-icon>
                          {{ $t('common.move') }}
                        </div>
                        <el-icon class="suffix-icon"><CaretRight /></el-icon>
                      </div>
                      <template #dropdown>
                        <el-dropdown-menu class="move-to-sprint-list">
                          <template v-if="project.sprints?.length">
                            <el-dropdown-item
                              v-for="sprint in project.sprints"
                              :key="sprint.id"
                              :disabled="scope.row.sprint && scope.row.sprint.id === sprint.id"
                              @click.native="moveIssueIntoSprint(scope.row, sprint)"
                              >{{ sprint.name }}</el-dropdown-item
                            >
                          </template>
                          <el-dropdown-item v-else disabled>{{ $t('backlog.noSprint') }}</el-dropdown-item>
                        </el-dropdown-menu>
                      </template>
                    </el-dropdown>
                  </el-dropdown-item>
                </el-dropdown-menu>
              </template>
            </el-dropdown>
          </template>
        </el-table-column>
        <template v-if="!inTesting" v-slot:empty>
          <el-empty :image-size="100" :description="$t('issueList.list.emptyMsg')">
            <el-button :disabled="!project.isDeveloper" type="primary" icon="Plus" size="default" @click="newIssue">{{
              $t('issueList.header.newIssue')
            }}</el-button>
          </el-empty>
        </template>
      </el-table>
      <div class="table-footer">
        <el-pagination
          :current-page="filter.page"
          :page-count="totalPages"
          size="small"
          :page-sizes="[10, 15, 20, 25, 50]"
          :default-page-size="filter.pageSize"
          :hide-on-single-page="filter.pageSize <= 10"
          background
          layout="prev, pager, next, sizes"
          @current-change="pageChanged"
          @size-change="pageSizeChanged">
        </el-pagination>
      </div>
      <IssueEdit
        v-if="editingIssue"
        :editIssueId="editingIssue.id"
        :issue="editingIssue"
        :projectId="projectId"
        @issueFormClosed="issueDialogClosed"
        @onIssueUpdated="issueSaved"
        @onIssueDeleted="removeIssueFromList" />
    </div>
  </div>
</template>

<script>
import { issueApi } from '@/api/issue.js'
import utils from '@/utils/util.js'
import dict from '@/locales/zh-cn/dict.json'
import highlight from '@/utils/highlight.js'
import IssueEdit from '@/components/issue/IssueEdit.vue'
import Avatar from '@/components/common/Avatar.vue'
import { ElMessage, ElMessageBox } from 'element-plus'
import { saveAs } from 'file-saver'
import PriorityIcon from '@/components/common/PriorityIcon.vue'
import IssueTypeIcon from '@/components/common/IssueTypeIcon.vue'
import StatusTag from '@/components/common/StatusTag.vue'
import StoryPoint from '@/components/common/StoryPoint.vue'

export default {
  name: 'IssueList',
  components: {
    Avatar,
    IssueEdit,
    IssueTypeIcon,
    PriorityIcon,
    StatusTag,
    StoryPoint
  },
  props: {
    projectId: {
      type: String,
      default: null,
      required: true
    },
    issueType: {
      type: String,
      default: 'TASK'
    },
    testCase: {
      type: Object,
      default: () => ({})
    },
    testPlan: {
      type: Object,
      default: () => ({})
    },
    hideFilter: {
      type: Boolean,
      default: false
    },
    showNewBtn: {
      type: Boolean,
      default: true
    },
    showExportBtn: {
      type: Boolean,
      default: true
    },
    showFastSearch: {
      type: Boolean,
      default: true
    },
    showFilterPanel: {
      type: Boolean,
      default: false
    },
    columns: {
      type: Array,
      default: () => ['code', 'name', 'priority', 'owner', 'status', 'actions']
    },
    filterColumns: {
      type: Array,
      default: () => ['priority', 'owner', 'status']
    },
    issueFilter: {
      type: Object,
      default: () => ({})
    },
    emptyText: {
      type: String,
      default: ''
    },
    readonly: {
      type: Boolean,
      default: false
    }
  },
  emits: ['pageSizeChanged'],
  data() {
    return {
      isInMobile: utils.isInMobile(),
      currentUser: this.$store.get('user'),
      project: {},
      issues: [],
      filter: {
        pageSize: 10
      },
      totalElements: 0,
      totalPages: 0,
      loading: true,
      exporting: false,
      editingIssue: null,
      issueTypeFilters: [],
      priorityFilters: [],
      ownerFilters: [],
      groupFilters: []
    }
  },
  computed: {
    inTesting() {
      return this.testPlan?.id || this.testCase?.id
    }
  },
  watch: {},
  created() {
    this.filter.projectId = this.projectId
    this.project = this.$store.get('project')

    if (this.issueFilter) {
      this.filter = JSON.parse(JSON.stringify(this.issueFilter))
      this.filter.projectId = this.projectId
      if (!this.filter.pageSize) {
        this.filter.pageSize = 10
      }
    } else {
      this.filter = this.newFilter()
    }

    this.loadIssues()
    this.initColumnFilters()
  },
  mounted() {},
  methods: {
    initColumnFilters() {
      this.priorityFilters = Object.keys(dict.issuePriorities).map((key) => ({
        text: this.$t(`issuePriorities.${key}`),
        value: key
      }))

      this.issueTypeFilters = Object.keys(dict.issueTypes).map((key) => ({
        text: this.$t(`issueTypes.${key}`),
        value: key
      }))

      this.ownerFilters = this.project.projectMembers.map((member) => ({
        text: member.user.nickname,
        value: member.user.id
      }))

      this.groupFilters = this.project.issueGroups.map((group) => ({
        text: group.label,
        value: group.id
      }))
    },
    newFilter() {
      return {
        projectId: this.projectId,
        sprintIds: [],
        keyword: null,
        types: [],
        priorities: [],
        componentIds: [],
        ownerIds: [],
        groupIds: [],
        tagIds: [],
        page: 1,
        pageSize: 10
      }
    },
    loadIssues() {
      this.filter.createdTime = null
      this.filter.updatedTime = null
      this.filter.createdBy = null

      this.loading = true
      issueApi
        .searchIssues(this.filter)
        .then((res) => {
          this.issues = highlight.highlight(res.data.results, this.filter.keyword, 'code', 'name')
          this.totalElements = res.data.totalElements
          this.totalPages = res.data.totalPages
        })
        .finally(() => {
          // Delay a little bit to improve user experience
          setTimeout(() => {
            this.loading = false
          }, 200)
        })
    },
    sortChange(event) {
      // Only support single column sorting
      this.filter.orders = []
      if (event.prop && event.order) {
        this.filter.orders.push({
          property: event.prop,
          direction: event.order === 'ascending' ? 'ASC' : 'DESC'
        })
      }
      this.filterChanged()
    },
    filterChange(filters) {
      if (filters.types) {
        if (filters.types.length > 0) {
          this.filter.types = filters.types
        } else {
          this.filter.types = null
        }
      }

      if (filters.priorities) {
        if (filters.priorities.length > 0) {
          this.filter.priorities = filters.priorities
        } else {
          this.filter.priorities = null
        }
      }

      if (filters.ownerIds) {
        if (filters.ownerIds.length > 0) {
          this.filter.ownerIds = filters.ownerIds
        } else {
          this.filter.ownerIds = null
        }
      }

      if (filters.groupIds) {
        if (filters.groupIds.length > 0) {
          this.filter.groupIds = filters.groupIds
        } else {
          this.filter.groupIds = null
        }
      }

      this.filterChanged()
    },
    keywordChanged() {
      // throttle keyword input changes
      if (this.inputTimeout) {
        clearTimeout(this.inputTimeout)
      }
      this.inputTimeout = setTimeout(() => {
        this.filterChanged()
      }, 500)
    },
    filterChanged() {
      this.filter.page = 1
      this.loadIssues()
    },
    pageChanged(page) {
      this.filter.page = page
      this.loadIssues()
    },
    pageSizeChanged(size) {
      this.filter.pageSize = size
      this.filterChanged()

      // Emit event to parent component
      this.$emit('pageSizeChanged', size)
    },
    newIssue() {
      this.editingIssue = {
        testCase: this.testCase?.id ? this.testCase : null,
        testPlan: this.testPlan?.id ? this.testPlan : null,
        type: this.inTesting ? 'BUG' : 'TASK',
        name: this.testCase?.details?.name || ''
      }
    },
    editIssue(row) {
      this.editingIssue = row
    },
    exportIssues() {
      this.filter.language = this.$store.get('locale') || utils.getLang()
      this.exporting = true
      issueApi
        .exportIssues(this.filter)
        .then((res) => {
          const blobDate = new Blob([res.data])
          const fileName = res.headers['content-disposition'].split('filename=')[1]
          saveAs(blobDate, `${this.project.code}-${fileName}`)
        })
        .finally(() => {
          this.exporting = false
        })
    },
    issueDialogClosed() {
      this.editingIssue = null
    },
    cloneIssue(index, issue) {
      issueApi.clone(issue.id).then((res) => {
        ElMessage.success({
          message: this.$t('issueList.msg.issueCopied', {
            issueName: issue.code
          })
        })
        // insert the cloned issue right before the original issue
        this.issues.splice(index, 0, res.data)
        this.totalElements++
      })
    },
    assignIssueToUser(issue, user) {
      issue.owner = user

      issueApi.assign(issue.id, user.id).then((res) => {
        this.issueSaved(res.data)
      })
    },
    unassign(issue) {
      issue.owner = null
      issueApi.unassign(issue.id).then((res) => {
        this.issueSaved(res.data)
      })
    },
    moveIssueIntoSprint(issue, sprint) {
      issue.sprint = sprint

      let issueIds = [issue.id]
      issueApi.batchMove(sprint.id, issueIds).then((res) => {
        this.removeIssueFromList(issue)

        ElMessage.success({
          message: this.$t('backlog.issueMoved', {
            sprintName: sprint.name
          })
        })
      })
    },
    issueSaved(issue) {
      let index = utils.indexInArray(this.issues, issue.id)

      if (index >= 0) {
        this.issues.splice(index, 1, issue)
      } else {
        this.issues.unshift(issue)
        this.totalElements++
      }
    },
    removeIssueFromList(issue) {
      let index = utils.indexInArray(this.issues, issue.id)

      if (index >= 0) {
        this.issues.splice(index, 1)
        this.totalElements--
      }
    },
    deleteIssue: function (index, row) {
      ElMessageBox.confirm(
        this.$t('issueList.msg.delConfirmMsg', { issueName: row.name }),
        this.$t('issueList.msg.delConfirmTitle'),
        {
          type: 'warning',
          dangerouslyUseHTMLString: true,
          draggable: true
        }
      )
        .then(() => {
          issueApi.delete(row.id).then((response) => {
            this.issues.splice(index, 1)
            this.totalElements--
            ElMessage.success({
              message: this.$t('issueList.msg.delSuccess')
            })
          })
        })
        .catch((err) => {
          // Cancelled, do nothing
        })
    }
  }
}
</script>

<style lang="less" scoped>
.issue-list-container {
  .issue-list-table {
    .issue-row {
      .code {
        // min-width: 100px;
        margin-left: 6px;
        font-weight: bold;
        color: var(--el-color-primary);
        white-space: nowrap;
      }
    }
  }
}
// .assgin-to-me {
//   margin-left: 8px;
// }

// .assignee-candidates {
//   max-height: 350px;
//   overflow: scroll;
// }

// .issue-group-option {
//   display: flex;
//   align-items: center;
// }

// .user-select-option {
//   display: flex;

//   .user-avatar {
//     display: flex;
//     align-items: center;
//   }

//   .username {
//     margin-left: 10px;
//   }
// }
</style>
