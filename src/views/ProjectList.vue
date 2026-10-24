<template>
  <div class="project-list-page page">
    <div class="filter-row">
      <div class="left-part">
        <el-button text type="primary" @click="newProject" class="text-icon-btn" icon="CirclePlusFilled">
          {{ $t('projectList.header.new') }}
        </el-button>
      </div>
      <div class="right-part">
        <div class="summary-info">
          <el-icon v-if="loading" class="is-loading refresh-btn">
            <Loading />
          </el-icon>
          <el-icon v-else @click="loadProjects" class="refresh-btn">
            <Refresh />
          </el-icon>
          <column-selector
            v-model="columns"
            :available-columns="availableColumns"
            store-key="projectListColumns"></column-selector>
          <span class="item-count">{{ $t('projectList.header.projectCount', { count: totalElements }) }}</span>
        </div>
        <el-form-item class="mb-0!">
          <el-input
            class="search-input"
            v-model="filter.keyword"
            clearable
            prefix-icon="Search"
            :placeholder="$t('projectList.header.search')"
            @input="keywordChanged"></el-input>
        </el-form-item>
      </div>
    </div>
    <div class="main">
      <el-table
        :data="projects"
        v-loading="loading"
        class="project-list"
        row-class-name="project-row clickable"
        :show-header="true"
        @sort-change="sortChange"
        @row-click="goToBoard">
        <el-table-column
          prop="name"
          sortable="custom"
          sort-by="name, createdTime"
          :label="$t('projectList.list.name')"
          min-width="300">
          <template #default="scope">
            <div class="flex items-center">
              <Avatar
                :name="scope.row.name"
                :size="42"
                :src="scope.row.avatarUrl"
                :rounded="false"
                class="mr-2"></Avatar>
              <div>
                <div class="flex items-center">
                  <span v-html="scope.row.nameHighlightLabel || scope.row.name" class="project-name"></span>
                  <el-tag v-if="scope.row.archived" type="warning" effect="plain" size="small" class="ml-2">
                    {{ $t('projectList.list.archived') }}
                  </el-tag>
                </div>
                <div v-if="scope.row.description" class="desc project-desc">
                  {{ scope.row.description }}
                </div>
              </div>
            </div>
          </template>
        </el-table-column>
        <el-table-column
          v-if="columns.includes('code')"
          prop="code"
          sortable="custom"
          sort-by="code, createdTime"
          :label="$t('projectList.list.code')"
          min-width="130">
          <template #default="scope">
            <span v-html="scope.row.codeHighlightLabel || scope.row.code"></span>
          </template>
        </el-table-column>
        <el-table-column
          v-if="columns.includes('creator')"
          :label="$t('common.createdBy')"
          prop="createdBy.nickname"
          sortable="custom"
          sort-by="createdBy.nickname, createdTime"
          min-width="130">
          <template #default="scope">
            <el-tooltip v-if="scope.row.createdBy" :content="scope.row.createdBy.nickname" placement="left">
              <avatar
                :name="scope.row.createdBy.nickname"
                :size="24"
                :src="scope.row.createdBy.avatarUrl"
                showName></avatar>
            </el-tooltip>
          </template>
        </el-table-column>
        <el-table-column
          v-if="columns.includes('createdTime')"
          prop="createdTime"
          sortable="custom"
          sort-by="createdTime"
          :label="$t('common.createdTime')"
          min-width="180">
          <template #default="scope">
            {{ scope.row.createdTimeFormatted }}
          </template>
        </el-table-column>
        <el-table-column
          v-if="columns.includes('owner')"
          :label="$t('projectList.list.owner')"
          prop="owner.nickname"
          sortable="custom"
          sort-by="owner.nickname, createdTime"
          min-width="130">
          <template #default="scope">
            <avatar :name="scope.row.owner.nickname" :size="24" :src="scope.row.owner.avatarUrl" showName></avatar>
          </template>
        </el-table-column>
        <el-table-column
          v-if="columns.includes('lastIssueSeq')"
          prop="lastIssueSeq"
          sortable="custom"
          sort-by="lastIssueSeq, createdTime"
          :label="$t('projectList.list.lastIssueSeq')"
          min-width="100"
          align="right">
          <template #default="scope">
            <router-link :to="{ name: 'IssueList', params: { projectId: scope.row.id } }" @click.stop>
              {{ scope.row.lastIssueSeq }}
            </router-link>
          </template>
        </el-table-column>
        <el-table-column
          v-if="columns.includes('fileCount')"
          prop="fileCount"
          sortable="custom"
          sort-by="fileCount, createdTime"
          :label="$t('projectList.list.fileCount')"
          min-width="100"
          align="right">
          <template #default="scope">
            <router-link :to="{ name: 'FileList', params: { projectId: scope.row.id } }" @click.stop>
              {{ scope.row.fileCount }}
            </router-link>
          </template>
        </el-table-column>
        <el-table-column
          v-if="columns.includes('totalFileSize')"
          prop="totalFileSize"
          sortable="custom"
          sort-by="totalFileSize, createdTime"
          :label="$t('projectList.list.totalFileSize')"
          min-width="100"
          align="right">
          <template #default="scope">
            {{ scope.row.totalFileSizeFormatted }}
          </template>
        </el-table-column>
        <el-table-column
          v-if="columns.includes('actions')"
          :label="$t('common.actions')"
          width="80"
          class-name="actions-column">
          <template #default="scope">
            <el-dropdown trigger="click" placement="bottom">
              <div class="more-action-icon" @click.stop>
                <el-icon><MoreFilled /></el-icon>
              </div>
              <template #dropdown>
                <el-dropdown-menu>
                  <el-dropdown-item icon="Setting" @click="projectDetails(scope.row)">{{
                    $t('projectList.list.details')
                  }}</el-dropdown-item>
                  <el-dropdown-item
                    v-if="scope.row.owner.id == currentUser.id"
                    icon="Right"
                    @click="transferProject(scope.row)"
                    >{{ $t('projectList.list.transfer') }}</el-dropdown-item
                  >
                  <el-dropdown-item v-else icon="CircleClose" @click="quitProject(scope.row)">{{
                    $t('projectList.list.quit')
                  }}</el-dropdown-item>
                  <el-dropdown-item
                    v-if="!scope.row.archived"
                    icon="FolderChecked"
                    :disabled="scope.row.owner.id != currentUser.id"
                    @click="archiveProject(scope.row)"
                    >{{ $t('projectList.list.archive') }}</el-dropdown-item
                  >
                  <el-dropdown-item
                    v-else
                    :disabled="scope.row.owner.id != currentUser.id"
                    icon="FolderRemove"
                    @click="unarchiveProject(scope.row)"
                    >{{ $t('projectList.list.unarchive') }}</el-dropdown-item
                  >
                  <el-dropdown-item
                    icon="Delete"
                    :disabled="scope.row.owner.id != currentUser.id"
                    @click="deleteProject(scope.$index, scope.row)"
                    >{{ $t('common.delete') }}</el-dropdown-item
                  >
                </el-dropdown-menu>
              </template>
            </el-dropdown>
          </template>
        </el-table-column>
        <template v-slot:empty>
          <el-empty :image-size="100" :description="$t('projectList.list.noProject')">
            <el-button type="primary" icon="Plus" size="default" @click="newProject">{{
              $t('projectList.header.new')
            }}</el-button>
          </el-empty>
        </template>
      </el-table>
      <div class="table-footer">
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
    </div>
    <project-edit
      v-if="editingProject"
      :originalProject="editingProject"
      @projectFormClosed="projectDialogClosed"
      @projectSaved="projectSaved"
      @projectDeleted="projectDeleted" />
    <transfer-project-dialog
      v-if="transferringProject"
      :projectId="transferringProject.id"
      @transferDialogClosed="transferDialogClosed"
      @projectSaved="projectSaved"
      @projectQuit="projectQuit" />
  </div>
</template>

<script>
import { projectApi } from '@/api/project.js'
import utils from '@/utils/util.js'
import highlight from '@/utils/highlight.js'
import ProjectEdit from '@/components/project/ProjectEdit.vue'
import TransferProjectDialog from '@/components/project/TransferProject.vue'
import Avatar from '@/components/common/Avatar.vue'
import ColumnSelector from '@/components/common/ColumnSelector.vue'
import { ElMessage, ElMessageBox } from 'element-plus'
import { filesize } from 'filesize'

export default {
  name: 'ProjectList',
  components: {
    ProjectEdit,
    TransferProjectDialog,
    Avatar,
    ColumnSelector
  },
  data() {
    const availableColumns = [
      { key: 'name', labelKey: 'projectList.list.name', default: true, readonly: true },
      { key: 'code', labelKey: 'projectList.list.code' },
      { key: 'creator', labelKey: 'common.createdBy' },
      { key: 'createdTime', labelKey: 'common.createdTime' },
      { key: 'owner', labelKey: 'projectList.list.owner', default: true },
      { key: 'lastIssueSeq', labelKey: 'projectList.list.lastIssueSeq' },
      { key: 'fileCount', labelKey: 'projectList.list.fileCount' },
      { key: 'totalFileSize', labelKey: 'projectList.list.totalFileSize' },
      { key: 'actions', labelKey: 'common.actions', default: true, readonly: true }
    ]
    const defaultColumns = availableColumns.filter((column) => column.default).map((column) => column.key)

    return {
      currentUser: {},
      projects: [],
      filter: {
        keyword: null,
        orders: [],
        page: 1,
        pageSize: this.$store.get('myProjectListPageSize') || 10
      },
      totalElements: 0,
      totalPages: 0,
      loading: true,
      editingProject: null,
      transferringProject: null,
      isInMobile: utils.isInMobile(),
      columns: this.$store.get('projectListColumns') || defaultColumns,
      availableColumns
    }
  },
  created() {
    this.currentUser = this.$store.get('user')
    this.loadProjects()
  },
  mounted() {},
  methods: {
    loadProjects() {
      this.loading = true
      projectApi
        .search(this.filter)
        .then((res) => {
          this.projects = highlight
            .highlight(res.data.results, this.filter.keyword, 'code', 'name')
            .map((project) => this.formatProject(project))
          this.totalElements = res.data.totalElements
          this.totalPages = res.data.totalPages
        })
        .finally(() => {
          setTimeout(() => {
            this.loading = false
          }, 200)
        })
    },
    keywordChanged() {
      this.reloadList()
    },
    sortChange(event) {
      this.filter.orders = utils.getSortOrders(event) || []
      this.reloadList()
    },
    reloadList() {
      this.filter.page = 1
      this.loadProjects()
    },
    pageChanged: function (page) {
      this.filter.page = page
      this.loadProjects()
    },
    pageSizeChanged(size) {
      this.filter.pageSize = size
      this.filter.page = 1
      this.$store.set('myProjectListPageSize', this.filter.pageSize)
      this.reloadList()
    },
    goToBoard(row) {
      this.$router.push({
        name: 'BoardWithoutSprint',
        params: { projectId: row.id }
      })
    },
    newProject() {
      this.editingProject = {}
    },
    projectDetails(row) {
      this.$router.push({
        name: 'ProjectDetails',
        params: { projectId: row.id }
      })
    },
    projectDialogClosed() {
      this.editingProject = null
    },
    transferProject(row) {
      this.transferringProject = row
    },
    transferDialogClosed() {
      this.transferringProject = null
    },
    archiveProject(project) {
      projectApi.archive(project.id).then((res) => {
        ElMessage.success({
          message: this.$t('projectList.msg.archiveSuccess', {
            projectName: res.data.name
          })
        })
        this.projectSaved(res.data)
      })
    },
    unarchiveProject(project) {
      projectApi.unarchive(project.id).then((res) => {
        ElMessage.success({
          message: this.$t('projectList.msg.unarchiveSuccess', {
            projectName: res.data.name
          })
        })
        this.projectSaved(res.data)
      })
    },
    projectSaved(project) {
      this.formatProject(project)
      let index = utils.indexInArray(this.projects, project.id)

      if (index >= 0) {
        this.projects.splice(index, 1, project)
      } else {
        this.projects.unshift(project)
      }
      this.$bus.$emit('projectUpdated', project)
    },
    formatProject(project) {
      if (!project.lastIssueSeq || project.lastIssueSeq == 0) {
        project.lastIssueSeq = ''
      }

      if (!project.fileCount || project.fileCount == 0) {
        project.fileCount = ''
      }

      if (!project.totalFileSize || project.totalFileSize == 0) {
        project.totalFileSizeFormatted = ''
      } else {
        project.totalFileSizeFormatted = filesize(project.totalFileSize, { round: 1 })
      }

      return utils.formatCreateUpdateTime(project)
    },
    projectQuit(project) {
      this.projectDeleted(project)
    },
    projectDeleted(project) {
      let index = utils.indexInArray(this.projects, project.id)

      if (index >= 0) {
        this.projects.splice(index, 1)
        this.totalElements--
        this.$bus.$emit('projectDeleted', project)
      }
    },
    deleteProject: function (index, row) {
      ElMessageBox.confirm(
        this.$t('projectList.msg.delConfirmMsg', { projectName: row.name }),
        this.$t('projectList.msg.delConfirmTitle'),
        {
          type: 'warning',
          dangerouslyUseHTMLString: true,
          draggable: true
        }
      )
        .then(() => {
          projectApi.delete(row.id).then((res) => {
            ElMessage.success({
              message: this.$t('projectList.msg.delSuccess', {
                projectName: row.name
              })
            })
            this.projectDeleted(row)
          })
        })
        .catch((err) => {
          // Cancelled, do nothing
        })
    },
    quitProject(row) {
      ElMessageBox.confirm(
        this.$t('projectMember.quitConfirmMsg', {
          projectName: row.name
        }),
        this.$t('projectMember.quitConfirmTitle'),
        {
          type: 'warning',
          draggable: true
        }
      ).then(() => {
        projectApi.quit(row.id).then((res) => {
          ElMessage.success({
            message: this.$t('projectMember.quitSuccess', {
              projectName: row.name
            })
          })
          this.projectDeleted(row)
        })
      })
    }
  }
}
</script>

<style lang="less" scoped>
.project-list-page {
  width: 90%;
  max-width: 960px;
  margin: 30px auto;

  .project-list {
    .project-row {
      .project-name {
        font-size: 15px;
        font-weight: 500;
      }

      .project-desc {
        white-space: nowrap;
        overflow: hidden;
        text-overflow: ellipsis;
        max-width: 40vw;
      }
    }
  }
}
</style>
