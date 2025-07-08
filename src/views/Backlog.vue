<template>
  <div class="backlog-page page">
    <div class="filter-row">
      <div class="left-part">
        <el-button
          :disabled="!project.isDeveloper || loading"
          text
          type="primary"
          @click="newIssue"
          class="text-icon-btn"
          icon="CirclePlusFilled">
          {{ $t('backlog.header.new') }}
        </el-button>
      </div>
      <div class="right-part">
        <div class="summary-info">
          <el-icon v-if="loading" class="is-loading refresh-btn">
            <Loading />
          </el-icon>
          <el-icon v-else @click="loadIssues" class="refresh-btn">
            <Refresh />
          </el-icon>
          <span class="item-count">{{ $t('backlog.header.count', { count: totalElements }) }}</span>
        </div>
        <el-form-item class="mb-0!">
          <el-input
            class="search-input"
            v-model="filter.keyword"
            clearable
            prefix-icon="Search"
            :placeholder="$t('backlog.header.search')"
            @input="keywordChanged"></el-input>
        </el-form-item>
      </div>
    </div>
    <div class="main">
      <el-table
        :data="issues"
        v-loading="loading"
        class="issue-list"
        row-class-name="issue-row"
        :show-header="false"
        @row-click="editIssue">
        <el-table-column :label="$t('backlog.list.name')" min-width="230" class-name="clickable">
          <template #default="scope">
            <issue-row :issueDetails="scope.row" />
          </template>
        </el-table-column>
        <el-table-column
          v-if="project.isDeveloper"
          :label="$t('common.actions')"
          :width="isInMobile ? 35 : 65"
          class-name="actions-column">
          <template #default="scope">
            <el-dropdown trigger="click" placement="bottom">
              <div class="more-action-icon" @click.stop>
                <el-icon><MoreFilled /></el-icon>
              </div>
              <template #dropdown>
                <el-dropdown-menu>
                  <el-dropdown-item icon="DocumentCopy" @click.native="cloneIssue(scope.row)">{{
                    $t('common.copy')
                  }}</el-dropdown-item>
                  <el-dropdown-item
                    divided
                    icon="Delete"
                    :disabled="scope.row.backlog"
                    @click.native="deleteIssue(scope.$index, scope.row)"
                    >{{ $t('common.delete') }}</el-dropdown-item
                  >
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
                              @click.native="moveIssueIntoSprint(scope.row, sprint)"
                              >{{ sprint.name }}</el-dropdown-item
                            >
                          </template>
                          <el-dropdown-item v-else disabled>{{ $t('backlog.list.noSprint') }}</el-dropdown-item>
                        </el-dropdown-menu>
                      </template>
                    </el-dropdown>
                  </el-dropdown-item>
                </el-dropdown-menu>
              </template>
            </el-dropdown>
          </template>
        </el-table-column>
        <template v-slot:empty>
          <el-empty :image-size="100" :description="$t('backlog.list.emptyMsg')">
            <el-button :disabled="!project.isDeveloper" type="primary" icon="Plus" size="default" @click="newIssue">{{
              $t('backlog.header.new')
            }}</el-button>
          </el-empty>
        </template>
      </el-table>
      <div v-if="!loading" class="table-footer">
        <el-pagination
          class="flex justify-center my-2"
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
      <issue-edit
        v-if="editingIssue"
        :editIssueId="editingIssue.id"
        :projectId="projectId"
        @issueFormClosed="issueDialogClosed"
        @onIssueUpdated="issueSaved"
        @onIssueDeleted="removeIssueFromList" />
    </div>
  </div>
</template>
<script>
import { ElMessage, ElMessageBox } from 'element-plus'
import { issueApi } from '@/api/issue.js'
import utils from '@/utils/util.js'
import highlight from '@/utils/highlight.js'
import IssueRow from '@/components/issue/IssueRow.vue'
import IssueEdit from '@/components/issue/IssueEdit.vue'

export default {
  name: 'Backlog',
  components: {
    IssueRow,
    IssueEdit
  },
  data() {
    return {
      isInMobile: utils.isInMobile(),
      projectId: null,
      project: {},
      issues: [],
      filter: {
        projectId: null,
        backlog: true,
        keyword: null,
        pageSize: this.$store.get('backlogListPageSize') || 10
      },
      totalElements: 0,
      totalPages: 0,
      loading: true,
      editingIssue: null,
      dialogVisible: false
    }
  },
  mounted() {
    this.projectId = this.$route.params.projectId
    this.filter.projectId = this.projectId
    this.project = this.$store.get('project')
    this.loadIssues()
  },
  methods: {
    loadIssues() {
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
          }, 150)
        })
    },
    keywordChanged() {
      this.loadIssues()
    },
    pageChanged: function (page) {
      this.filter.page = page
      this.loadIssues()
    },
    pageSizeChanged(size) {
      this.filter.pageSize = size
      this.filter.page = 1
      this.$store.set('backlogListPageSize', this.filter.pageSize)
      this.loadIssues()
    },
    newIssue() {
      this.editingIssue = {}
    },
    editIssue(row) {
      this.editingIssue = row
    },
    issueDialogClosed() {
      this.editingIssue = null
    },
    cloneIssue(issue) {
      issueApi.clone(issue.id).then((res) => {
        this.issueSaved(res.data)
        ElMessage.success({
          message: this.$t('backlog.msg.issueCopied', {
            issueName: issue.code
          })
        })
      })
    },
    issueSaved(issue) {
      let index = utils.indexInArray(this.issues, issue.id)

      if (index >= 0) {
        if (issue.sprint?.backlog) {
          this.issues.splice(index, 1, issue)
        } else {
          this.issues.splice(index, 1)
          this.totalElements--
        }
      } else {
        this.issues.unshift(issue)
        this.totalElements++
      }
    },
    moveIssueIntoSprint(issue, sprint) {
      issue.sprint = sprint

      let issueIds = [issue.id]
      issueApi.batchMove(sprint.id, issueIds).then((res) => {
        this.removeIssueFromList(issue)

        ElMessage.success({
          message: this.$t('backlog.msg.issueMoved', {
            sprintName: sprint.name
          })
        })
      })
    },
    removeIssueFromList(issue) {
      let index = utils.indexInArray(this.issues, issue.id)

      if (index >= 0) {
        this.issues.splice(index, 1)
        this.totalElements
      }
    },
    deleteIssue: function (index, row) {
      ElMessageBox.confirm(
        this.$t('backlog.msg.delConfirmMsg', { issueName: row.name }),
        this.$t('backlog.msg.delConfirmTitle'),
        {
          type: 'warning',
          dangerouslyUseHTMLString: true,
          draggable: true
        }
      )
        .then(() => {
          issueApi.delete(row.id).then((response) => {
            this.totalElements--
            this.issues.splice(index, 1)
            ElMessage.success({
              message: this.$t('backlog.msg.delSuccess')
            })
          })
        })
        .catch(() => {
          // User cancelled the delete action
        })
    }
  }
}
</script>

<style lang="less" scoped>
.move-to-sprint-list {
  max-height: 350px;
  overflow: scroll;
}
</style>
