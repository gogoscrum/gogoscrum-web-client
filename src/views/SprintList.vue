<template>
  <div class="sprint-list-page page">
    <div class="filter-row">
      <div class="left-part">
        <el-button
          :disabled="!project.isDeveloper || loading"
          text
          type="primary"
          @click="newSprint"
          class="text-icon-btn"
          icon="CirclePlusFilled">
          {{ $t('sprintList.header.new') }}
        </el-button>
      </div>
      <div class="right-part">
        <div class="summary-info">
          <el-icon v-if="loading" class="is-loading refresh-btn">
            <Loading />
          </el-icon>
          <el-icon v-else @click="loadProject" class="refresh-btn">
            <Refresh />
          </el-icon>
          <span class="item-count">{{ $t('sprintList.header.count', { count: sprints.length }) }}</span>
        </div>
      </div>
    </div>
    <div class="main">
      <el-table
        :data="sprints"
        v-loading="loading"
        class="sprint-list-table"
        row-class-name="sprint-row clickable"
        :show-header="false"
        @row-click="goBoard"
        empty-text="No data">
        <el-table-column prop="name" :label="$t('sprintList.list.name')" min-width="100">
          <template #default="scope">
            <div>{{ scope.row.name }}</div>
            <div v-if="scope.row.goal" class="desc hidden-xs-only">
              {{ scope.row.goal }}
            </div>
          </template>
        </el-table-column>
        <el-table-column v-if="!isInMobile" prop="startDate" :label="$t('sprintList.list.startDate')" width="120">
        </el-table-column>
        <el-table-column v-if="!isInMobile" width="50" align="center">
          <template #default="scope">
            <span v-if="scope.row.startDate">{{ $t('common.to') }}</span>
          </template>
        </el-table-column>
        <el-table-column v-if="!isInMobile" prop="endDate" :label="$t('sprintList.list.endDate')" min-width="30">
        </el-table-column>
        <el-table-column
          v-if="!isInMobile"
          :label="$t('sprintList.list.progress')"
          min-width="30"
          class-name="progress-column">
          <template #default="scope">
            <el-tooltip
              :content="
                $t('sprintList.list.progressTooltip', {
                  doneIssueCount: scope.row.doneIssueCount,
                  totalIssueCount: scope.row.totalIssueCount
                })
              ">
              <div class="sprint-progress">
                <el-progress
                  type="circle"
                  :percentage="Math.round(scope.row.progress * 100)"
                  :show-text="false"
                  :width="24"
                  :stroke-width="4"
                  color="#0d9c89"></el-progress>
                <div class="progress-label">{{ Math.round(scope.row.progress * 100) }}%</div>
              </div>
            </el-tooltip>
          </template>
        </el-table-column>
        <el-table-column :label="$t('sprintList.list.status')" :min-width="isInMobile ? 60 : 40" align="center">
          <template #default="scope">
            <status-tag
              v-if="scope.row.status"
              :status="scope.row.status"
              :label="$t(`sprintStatuses.${scope.row.status}`)" />
          </template>
        </el-table-column>

        <el-table-column v-if="project.isDeveloper" :label="$t('common.actions')" width="50" align="center">
          <template #default="scope">
            <el-dropdown trigger="click" placement="bottom">
              <div class="more-action-icon" @click.stop>
                <el-icon><MoreFilled /></el-icon>
              </div>
              <template #dropdown>
                <el-dropdown-menu>
                  <el-dropdown-item icon="Edit" @click.native="editSprint(scope.row)">
                    {{ $t('common.edit') }}</el-dropdown-item
                  >
                  <el-dropdown-item
                    icon="Delete"
                    :disabled="scope.row.backlog"
                    @click.native="deleteSprint(scope.$index, scope.row)">
                    {{ $t('common.delete') }}</el-dropdown-item
                  >
                </el-dropdown-menu>
              </template>
            </el-dropdown>
          </template>
        </el-table-column>
        <template v-slot:empty>
          <el-empty :image-size="100" :description="$t('sprintList.list.emptyMsg')">
            <el-button type="primary" icon="Plus" size="default" @click="newSprint">{{
              $t('sprintList.header.new')
            }}</el-button>
          </el-empty>
        </template>
      </el-table>
    </div>
    <sprint-edit
      v-if="editingSprint"
      :sprintId="editingSprint.id"
      :project="project"
      @sprintFormClosed="sprintFormClosed"
      @sprintSaved="sprintSaved"
      @sprintDeleted="sprintDeleted"></sprint-edit>
  </div>
</template>

<script>
import { projectApi } from '@/api/project.js'
import { sprintApi } from '@/api/sprint.js'
import utils from '@/utils/util.js'
import SprintEdit from '@/components/sprint/SprintEdit.vue'
import StatusTag from '@/components/common/StatusTag.vue'
import dayjs from 'dayjs'
import { ElMessage, ElMessageBox } from 'element-plus'

export default {
  name: 'SprintList',
  components: {
    SprintEdit,
    StatusTag
  },
  data() {
    return {
      projectId: null,
      project: {},
      sprints: [],
      loading: false,
      editingSprint: null,
      isInMobile: utils.isInMobile()
    }
  },
  mounted() {
    this.projectId = this.$route.params.projectId
    this.loadProject()
  },
  methods: {
    loadProject() {
      this.loading = true

      projectApi
        .getById(this.projectId)
        .then((res) => {
          this.project = res.data
          this.initSprints()

          let currentUser = this.$store.get('user')
          let projectMember = this.project.projectMembers.filter((member) => member.user.id == currentUser.id)[0]
          if (projectMember.role == 'OWNER' || projectMember.role == 'DEVELOPER') {
            this.project.isDeveloper = true
          }
          // Refresh the cached project in the store
          this.$store.set('project', this.project)
          console.log('Project refreshed in store:', this.project)
        })
        .finally(() => {
          // Delay a little bit to improve user experience
          setTimeout(() => {
            this.loading = false
          }, 200)
        })
    },
    initSprints() {
      this.sprints = this.project.sprints.filter((sprint) => !sprint.backlog)
      this.sprints.forEach((sprint) => this.formatSprint(sprint))
    },
    formatSprint(sprint) {
      if (sprint.startDate) {
        sprint.startDate = dayjs(sprint.startDate).format('YYYY-MM-DD')
      }
      if (sprint.endDate) {
        sprint.endDate = dayjs(sprint.endDate).format('YYYY-MM-DD')
      }
      this.calcStatus(sprint)
      return sprint
    },
    calcStatus(sprint) {
      if (sprint.startDate && sprint.endDate) {
        let today = dayjs(new Date().toLocaleDateString())
        let startDate = dayjs(sprint.startDate)
        let endDate = dayjs(sprint.endDate)

        if (endDate < today) {
          sprint.status = 'DONE'
        } else if (startDate > today) {
          sprint.status = 'TO_DO'
        } else {
          sprint.status = 'IN_PROGRESS'
        }
      }
    },
    goBoard(row) {
      this.$router.push({
        name: 'Board',
        params: { projectId: this.projectId, sprintId: row.id }
      })
    },
    newSprint() {
      this.editingSprint = {}
    },
    editSprint(row) {
      this.editingSprint = row
    },
    sprintFormClosed() {
      this.editingSprint = null
    },
    sprintSaved(sprint) {
      this.formatSprint(sprint)
      let index = utils.indexInArray(this.sprints, sprint.id)

      if (index >= 0) {
        this.sprints.splice(index, 1, sprint)
      } else {
        this.sprints.unshift(sprint)
      }

      this.$bus.$emit('sprintSaved', sprint)
    },
    sprintDeleted(sprint) {
      let index = utils.indexInArray(this.sprints, sprint.id)

      if (index >= 0) {
        this.sprints.splice(index, 1)
        this.$bus.$emit('sprintDeleted', sprint)
      }
    },
    deleteSprint: function (index, row) {
      ElMessageBox.confirm(
        this.$t('sprintList.msg.delConfirmMsg', { sprintName: row.name }),
        this.$t('sprintList.msg.delConfirmTitle'),
        {
          type: 'warning',
          draggable: true
        }
      )
        .then(() => {
          sprintApi.delete(row.id).then((response) => {
            this.sprints.splice(index, 1)
            this.$bus.$emit('sprintDeleted', row)
            ElMessage.success({
              message: this.$t('sprintList.msg.delSuccess')
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
.sprint-list-page {
}
</style>

<style lang="less">
.sprint-list-page {
  .sprint-row {
    .progress-column {
      .sprint-progress {
        display: flex;
        align-items: center;

        .progress-label {
          font-size: 12px;
          font-weight: 500;
          margin-left: 8px;
        }
      }
    }
  }
}
</style>
