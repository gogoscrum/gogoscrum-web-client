<template>
  <div class="issue-list-page page">
    <div>
      <div class="filter-row">
        <div class="left-part">
          <el-button
            :disabled="!project.isDeveloper || loading"
            text
            type="primary"
            @click="newIssue"
            class="text-icon-btn"
            icon="CirclePlusFilled"
            >{{ $t('issueList.header.new') }}</el-button
          >
          <el-button
            :disabled="!project.isDeveloper || loading || !issues?.length"
            :loading="exporting"
            text
            type="primary"
            @click="exportIssues"
            class="text-icon-btn"
            icon="Download"
            >{{ $t('issueList.header.export') }}</el-button
          >
          <el-button :disabled="loading" text type="primary" @click="toggleFilterRow" class="text-icon-btn">
            {{ filterRowVisible ? $t('issueList.header.collapseFilter') : $t('issueList.header.expandFilter') }}
            <el-icon class="ml-6px"><ArrowUp v-if="filterRowVisible" /><ArrowDown v-else /></el-icon>
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
            <span class="item-count">{{ $t('issueList.header.count', { count: totalElements }) }}</span>
          </div>
        </div>
      </div>
      <div v-show="filterRowVisible" class="flex justify-between mb-10px">
        <el-form :inline="true" class="issue-filter-form">
          <el-form-item>
            <el-input
              class="search-input"
              v-model="filter.keyword"
              clearable
              prefix-icon="Search"
              :placeholder="$t('issueList.header.search')"
              @input="keywordChanged"></el-input>
          </el-form-item>
          <el-form-item>
            <el-cascader
              v-model="filter.componentIds"
              :options="components"
              :props="componentProps"
              clearable
              :show-all-levels="false"
              :collapse-tags="true"
              :collapse-tags-tooltip="true"
              :placeholder="$t('issueList.header.component')"
              :class="{ 'component-select': true, 'hidden-xs-only': true, 'has-value': filter.componentIds.length > 1 }"
              @change="keywordChanged" />
          </el-form-item>
          <el-form-item>
            <tag-selector
              v-model="filterTags"
              :class="{ 'filter-select': true, 'hidden-xs-only': true, 'has-value': filter.tagIds?.length > 1 }"
              :tags="tags"
              :multiple="true"
              :clearable="true"
              :teleported="true"
              :placeholder="$t('issueList.header.tag')"
              @change="tagChanged"></tag-selector>
          </el-form-item>
          <el-form-item>
            <issue-type-selector
              v-model="filter.types"
              :class="{ 'filter-select': true, 'hidden-xs-only': true, 'has-value': filter.types?.length > 1 }"
              :multiple="true"
              :clearable="true"
              :teleported="true"
              :placeholder="$t('issueList.header.issueType')"
              @change="keywordChanged"></issue-type-selector>
          </el-form-item>
          <el-form-item>
            <el-select
              v-model="filter.sprintIds"
              :multiple="true"
              :placeholder="$t('issueList.header.sprint')"
              :class="{ 'filter-select': true, 'hidden-xs-only': true, 'has-value': filter.sprintIds?.length > 1 }"
              clearable
              @change="keywordChanged">
              <el-option v-for="sprint in project.sprints" :key="sprint.id" :label="sprint.name" :value="sprint.id">
              </el-option>
            </el-select>
          </el-form-item>
          <el-form-item>
            <priority-selector
              v-model="filter.priorities"
              :multiple="true"
              :clearable="true"
              :teleported="false"
              :placeholder="$t('issueList.header.priority')"
              :class="{ 'filter-select': true, 'hidden-xs-only': true, 'has-value': filter.priorities?.length > 1 }"
              @change="keywordChanged"></priority-selector>
          </el-form-item>
          <el-form-item>
            <member-selector
              v-model="filterOwners"
              :members="project.projectMembers"
              :multiple="true"
              :collapse-tags="true"
              :clearable="true"
              :filterable="false"
              :placeholder="$t('issueList.header.owner')"
              :class="{ 'filter-select': true, 'hidden-xs-only': true, 'has-value': filterOwners?.length > 1 }"
              @change="ownerChanged"></member-selector>
          </el-form-item>
          <el-form-item>
            <el-select
              v-model="filterGroups"
              :multiple="true"
              :fit-input-width="false"
              value-key="id"
              :placeholder="$t('issueList.header.status')"
              :class="{ 'filter-select': true, 'hidden-xs-only': true, 'has-value': filter.groupIds?.length > 1 }"
              clearable
              @change="groupChanged">
              <el-option
                v-for="group in project.issueGroups"
                :key="group.id"
                :label="group.label"
                :value="group"
                class="issue-group-option">
                <status-tag :status="group.status" :label="group.label" class="mr-12px" />
              </el-option>
              <template #label="{ label, value }">
                <status-tag :status="value.status" :label="label" />
              </template>
            </el-select>
          </el-form-item>
        </el-form>
        <div class="flex right-actions">
          <el-button @click="clearFilter">{{ $t('issueList.header.clearFilter') }}</el-button>
          <el-button :loading="filterUpdating" @click="saveFilter" class="!ml-0">{{
            $t('issueList.header.saveFilter')
          }}</el-button>
          <el-dropdown trigger="click" :teleported="false" size="default">
            <el-button class="!px-7px">
              <el-icon :size="16" class="action-icon"><MoreFilled /></el-icon>
            </el-button>
            <template #dropdown>
              <el-dropdown-menu>
                <el-dropdown-item @click="saveFilterAs">{{ $t('issueFilter.actions.saveAs') }}</el-dropdown-item>
              </el-dropdown-menu>
            </template>
          </el-dropdown>
        </div>
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
        <el-table-column :label="$t('issueList.list.name')" min-width="250" class-name="clickable">
          <template #default="scope">
            <issue-row :issueDetails="scope.row" />
          </template>
        </el-table-column>
        <el-table-column
          v-if="project.isDeveloper"
          :label="$t('common.actions')"
          :width="isInMobile ? 35 : 50"
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
                              <div class="user-avatar">
                                <avatar
                                  :name="member.user.nickname"
                                  :size="20"
                                  inline
                                  :src="member.user.avatarUrl"></avatar>
                              </div>
                              <div class="username">{{ member.user.nickname }}</div>
                            </div>
                          </el-dropdown-item>
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
          <el-empty :image-size="100" :description="$t('issueList.list.emptyMsg')">
            <el-button :disabled="!project.isDeveloper" type="primary" icon="Plus" size="default" @click="newIssue">{{
              $t('issueList.header.new')
            }}</el-button>
          </el-empty>
        </template>
      </el-table>
      <div v-if="!loading" class="table-footer">
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
      <issue-edit
        v-if="editingIssue"
        :editIssueId="editingIssue.id"
        :projectId="projectId"
        @issueFormClosed="issueDialogClosed"
        @onIssueUpdated="issueSaved"
        @onIssueDeleted="issueDeleted" />
      <IssueFilterEdit
        v-if="showFilterEdit"
        :original-filter="filter"
        @closed="showFilterEdit = false"
        @saved="filterSaved" />
    </div>
  </div>
</template>

<script>
import { issueApi, issueFilterApi } from '@/api/issue.js'
import { componentApi } from '@/api/component.js'
import { tagApi } from '@/api/tag.js'
import utils from '@/utils/util.js'
import highlight from '@/utils/highlight.js'
import IssueRow from '@/components/issue/IssueRow.vue'
import IssueEdit from '@/components/issue/IssueEdit.vue'
import IssueFilterEdit from '@/components/issue/IssueFilterEdit.vue'
import IssueTypeSelector from '@/components/common/IssueTypeSelector.vue'
import PrioritySelector from '@/components/common/PrioritySelector.vue'
import MemberSelector from '@/components/common/MemberSelector.vue'
import TagSelector from '@/components/common/TagSelector.vue'
import Avatar from '@/components/common/Avatar.vue'
import StatusTag from '@/components/common/StatusTag.vue'
import { ElMessage, ElMessageBox } from 'element-plus'
import dicts from '@/locales/zh-cn/dict.json'
import { saveAs } from 'file-saver'

export default {
  name: 'IssueList',
  components: {
    Avatar,
    IssueTypeSelector,
    PrioritySelector,
    MemberSelector,
    TagSelector,
    IssueRow,
    IssueEdit,
    IssueFilterEdit,
    StatusTag
  },
  data() {
    return {
      isInMobile: utils.isInMobile(),
      currentUser: this.$store.get('user'),
      projectId: null,
      project: {},
      issues: [],
      filterRowVisible: false,
      filterOwners: [],
      filterGroups: [],
      filter: this.newFilter(),
      showFilterEdit: false,
      filterUpdating: false,
      totalElements: 0,
      totalPages: 0,
      loading: true,
      exporting: false,
      editingIssue: null,
      dicts,
      components: [],
      tags: [],
      filterTags: [],
      componentProps: {
        label: 'name',
        value: 'id',
        multiple: true,
        emitPath: false,
        checkStrictly: true,
        expandTrigger: 'hover'
      }
    }
  },
  watch: {
    $route(to, from) {
      let filterId = to.query.filterId
      if (filterId) {
        this.filterRowVisible = true
        this.loadFilter(filterId)
      } else {
        this.filterRowVisible = false
        this.filter = this.newFilter()
        this.loadIssues()
      }
    }
  },
  created() {
    this.projectId = this.$route.params.projectId
    this.filter.projectId = this.projectId
    this.project = this.$store.get('project')
    this.initFilterOwners()
    this.loadComponents()
    this.loadTags()

    let filterId = this.$route.query.filterId
    if (filterId) {
      this.filterRowVisible = true
      this.loadFilter(filterId)
    } else {
      this.filterRowVisible = false
      this.loadIssues()
    }
  },
  mounted() {},
  methods: {
    newFilter() {
      this.filterOwners = []
      this.filterTags = []
      this.filterGroups = []

      return {
        projectId: this.projectId,
        sprintIds: [],
        groupIds: [],
        keyword: null,
        types: [],
        priorities: [],
        componentIds: [],
        ownerIds: [],
        tagIds: [],
        page: 1,
        pageSize: this.$store.get('issueListPageSize') || 10
      }
    },
    loadFilter(filterId) {
      issueFilterApi.getById(filterId).then((res) => {
        this.filter = res.data
        this.initFilterTags()
        this.initFilterOwners()
        this.initFilterGroups()
        this.loadIssues()
      })
    },
    loadIssues() {
      this.filter.createdTime = null
      this.filter.updatedTime = null
      this.filter.createdBy = null

      this.loading = true
      issueApi.searchIssues(this.filter).then((res) => {
        this.issues = highlight.highlight(res.data.results, this.filter.keyword, 'code', 'name')
        this.totalElements = res.data.totalElements
        this.totalPages = res.data.totalPages
        this.filter.page = res.data.currentPage
        // Delay a little bit to improve user experience
        setTimeout(() => {
          this.loading = false
        }, 200)
      })
    },
    loadComponents() {
      componentApi.getTree(this.projectId).then((response) => {
        this.components = response.data?.children || []
      })
    },
    loadTags() {
      tagApi.search({ projectId: this.projectId, pageSize: 100 }).then((res) => {
        this.tags = res.data.results
        this.initFilterTags()
      })
    },
    initFilterTags() {
      if (this.filter?.tagIds?.length && this.tags?.length) {
        this.filterTags = this.tags.filter((tag) => this.filter.tagIds.includes(tag.id))
      } else {
        this.filterTags = []
      }
    },
    initFilterOwners() {
      if (this.filter?.ownerIds?.length && this.project?.projectMembers?.length) {
        this.filterOwners = this.project.projectMembers
          .filter((member) => this.filter.ownerIds.includes(member.user.id))
          .map((member) => member.user)
      } else {
        this.filterOwners = []
      }
    },
    initFilterGroups() {
      if (this.filter?.groupIds?.length && this.project?.issueGroups?.length) {
        this.filterGroups = this.project.issueGroups.filter((group) => this.filter.groupIds.includes(group.id))
      } else {
        this.filterGroups = []
      }
    },
    toggleFilterRow() {
      this.filterRowVisible = !this.filterRowVisible
    },
    keywordChanged() {
      this.filter.page = 1
      this.loadIssues()
    },
    ownerChanged() {
      if (this.filterOwners?.length) {
        this.filter.ownerIds = this.filterOwners.map((user) => user.id)
      } else {
        this.filter.ownerIds = []
      }

      this.keywordChanged()
    },
    groupChanged(event) {
      console.log('groupChanged', event)
      console.log('filterGroups', this.filterGroups)
      if (this.filterGroups?.length) {
        this.filter.groupIds = this.filterGroups.map((group) => group.id)
        console.log('filter.groupIds', this.filter.groupIds)
      } else {
        this.filter.groupIds = []
      }

      this.keywordChanged()
    },
    tagChanged() {
      if (this.filterTags?.length) {
        this.filter.tagIds = this.filterTags.map((tag) => tag.id)
      } else {
        this.filter.tagIds = []
      }

      this.keywordChanged()
    },
    pageChanged(page) {
      this.filter.page = page
      this.loadIssues()
    },
    pageSizeChanged(size) {
      this.filter.pageSize = size
      this.filter.page = 1
      this.$store.set('issueListPageSize', this.filter.pageSize)
      this.loadIssues()
    },
    clearFilter() {
      this.filter = this.newFilter()
      this.loadIssues()
    },
    saveFilter() {
      if (this.filter.id) {
        this.filterUpdating = true
        issueFilterApi
          .update(this.filter.id, this.filter)
          .then((res) => {
            ElMessage.success({
              message: this.$t('issueFilter.msg.filterUpdated')
            })

            this.$bus.$emit('issueFilterUpdated', res.data)
          })
          .finally(() => {
            // Delay a little bit to improve user experience
            setTimeout(() => {
              this.filterUpdating = false
            }, 200)
          })
      } else {
        this.showFilterEdit = true
      }
    },
    saveFilterAs() {
      this.filter.id = null
      this.showFilterEdit = true
    },
    filterSaved(filter) {
      this.filter = filter
      this.$router.push({ name: 'IssueList', params: { projectId: this.projectId }, query: { filterId: filter.id } })
    },
    newIssue() {
      this.editingIssue = {}
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
    cloneIssue(issue) {
      issueApi.clone(issue.id).then((res) => {
        this.issueSaved(res.data)
        ElMessage.success({
          message: this.$t('issueList.msg.issueCopied', {
            issueName: issue.code
          })
        })
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
    issueSaved(issue) {
      let index = utils.indexInArray(this.issues, issue.id)

      if (index >= 0) {
        this.issues.splice(index, 1, issue)
      } else {
        this.issues.unshift(issue)
        this.totalElements++
      }
    },
    issueDeleted(issue) {
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
          draggable: true
        }
      ).then(() => {
        issueApi.delete(row.id).then((response) => {
          this.issues.splice(index, 1)
          this.totalElements--
          ElMessage.success({
            message: this.$t('issueList.msg.delSuccess')
          })
        })
      })
    }
  }
}
</script>

<style lang="less" scoped>
.assgin-to-me {
  margin-left: 8px;
}

.assignee-candidates {
  max-height: 350px;
  overflow: scroll;
}

.issue-group-option {
  display: flex;
  align-items: center;
}

.user-select-option {
  display: flex;

  .user-avatar {
    display: flex;
    align-items: center;
  }

  .username {
    margin-left: 10px;
  }
}
</style>

<style lang="less">
.issue-list-page {
  .issue-filter-form {
    .el-form-item {
      margin: 0 0 5px 5px;
    }
    .filter-select {
      min-width: 92px;

      .el-tag {
        max-width: unset !important;
      }
    }

    .component-select {
      width: 110px;

      &.has-value {
        width: 180px;

        .el-tag {
          max-width: 100px;
        }
      }
    }
  }
}
</style>
