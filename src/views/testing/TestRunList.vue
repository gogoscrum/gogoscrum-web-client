<template>
  <div class="test-runs-list-page page">
    <div class="title">
      <div class="left-part">
        <span>{{ $t('test.run.list.caseBasics') }}</span>
      </div>
      <div class="right-part">
        <el-button text type="primary" @click="$router.go(-1)">
          {{ $t('common.back') }}
        </el-button>
      </div>
    </div>
    <TestCaseBasics :testCase="testCase" />
    <div class="title mt-50px">
      <span>{{ $t('test.run.list.title') }}</span>
    </div>
    <div class="runs-list">
      <div class="filter-row">
        <div class="left-part">
          <el-button
            :disabled="!project.isDeveloper"
            text
            type="primary"
            @click="newRun"
            icon="CirclePlusFilled"
            class="text-icon-btn"
            >{{ $t('test.run.list.filter.new') }}</el-button
          >
        </div>
        <div class="right-part">
          <div class="summary-info">
            <el-icon v-if="loading" class="is-loading refresh-btn">
              <Loading />
            </el-icon>
            <el-icon v-else @click="loadRuns" class="refresh-btn">
              <Refresh />
            </el-icon>
            <span class="item-count">{{ $t('test.run.list.filter.totalElements', { count: totalElements }) }}</span>
          </div>
        </div>
      </div>
      <el-table
        :data="runs"
        v-loading="loading"
        :empty-text="$t('test.run.list.msg.empty')"
        :border="false"
        :show-header="true"
        class="test-runs-table"
        row-class-name="clickable"
        @row-click="showRunEdit">
        <el-table-column :label="$t('test.run.list.createdTime')" prop="createdTimeFormatted" min-width="70">
        </el-table-column>
        <el-table-column :label="$t('test.run.list.createdBy')" min-width="50">
          <template #default="scope">
            <Avatar
              :name="scope.row.createdBy.nickname"
              :showName="true"
              :size="22"
              :src="scope.row.createdBy.avatarUrl"
              inline></Avatar>
          </template>
        </el-table-column>
        <el-table-column :label="$t('test.run.list.version')" min-width="50">
          <template #default="scope">
            <el-tag type="info" size="default"
              >{{ $t('test.case.edit.version', { version: scope.row.testCaseVersion }) }}
            </el-tag>
          </template>
        </el-table-column>
        <el-table-column :label="$t('test.run.list.status')" min-width="50">
          <template #default="scope">
            <TestRunStatusIcon :status="scope.row.status" />
          </template>
        </el-table-column>
        <el-table-column v-if="project.isDeveloper" :label="$t('common.actions')" width="80" align="right">
          <template #default="scope">
            <el-dropdown trigger="click" placement="bottom">
              <div class="more-action-icon" @click.stop>
                <el-icon><MoreFilled /></el-icon>
              </div>
              <template #dropdown>
                <el-dropdown-menu>
                  <el-dropdown-item icon="ZoomIn" @click.native="showRunEdit(scope.row)">{{
                    $t('common.details')
                  }}</el-dropdown-item>
                  <el-dropdown-item icon="Delete" @click.native="deleteRun(scope.$index, scope.row)">{{
                    $t('common.delete')
                  }}</el-dropdown-item>
                </el-dropdown-menu>
              </template>
            </el-dropdown>
          </template>
        </el-table-column>
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
    </div>
  </div>
  <TestRunEdit
    v-if="editingRunId"
    :test-case-id="testCaseId"
    :test-run-id="editingRunId"
    @testRunSaved="testRunSaved"
    @deleteTestRun="deleteRunById"
    @testRunClosed="hideRunEdit" />
</template>

<script>
import { testCaseApi, testRunApi } from '@/api/testing.js'
import { ElMessage, ElMessageBox } from 'element-plus'
import utils from '@/utils/util.js'
import TestRunStatusIcon from '@/components/common/TestRunStatusIcon.vue'
import Avatar from '@/components/common/Avatar.vue'
import TestRunEdit from './TestRunEdit.vue'
import TestCaseBasics from './TestCaseBasics.vue'

export default {
  name: 'TestCaseEdit',
  components: {
    TestRunStatusIcon,
    TestCaseBasics,
    Avatar,
    TestRunEdit
  },
  props: {},
  data() {
    return {
      projectId: this.$route.params.projectId,
      project: {},
      testCaseId: this.$route.params.testCaseId,
      testCase: {
        details: {}
      },
      filter: {
        projectId: this.$route.params.projectId,
        testCaseId: this.$route.params.testCaseId,
        orders: [],
        page: 1,
        pageSize: this.$store.get('testRunListPageSize') || 10
      },
      totalElements: 0,
      totalPages: 0,
      loading: false,
      runs: [],
      editingRunId: null
    }
  },
  computed: {},
  created() {
    this.project = this.$store.get('project')
    if (this.testCaseId) {
      this.loadCase()
      this.loadRuns()
    }
  },
  mounted() {},
  methods: {
    loadCase() {
      testCaseApi.get(this.testCaseId).then((res) => {
        this.testCase = res.data
      })
    },
    loadRuns() {
      this.loading = true
      testRunApi
        .search(this.filter)
        .then((res) => {
          this.runs = res.data.results
          this.totalElements = res.data.totalElements
          this.totalPages = res.data.totalPages

          this.runs.forEach((run) => {
            this.formatTestRun(run)
          })
        })
        .finally(() => {
          setTimeout(() => {
            this.loading = false
          }, 200)
        })
    },
    formatTestRun(testRun) {
      utils.formatCreateUpdateTime(testRun)
    },
    newRun() {
      this.editingRunId = 'new'
    },
    showRunEdit(row) {
      this.editingRunId = row.id
    },
    hideRunEdit() {
      this.editingRunId = null
    },
    testRunSaved(testRun) {
      this.formatTestRun(testRun)
      let index = utils.indexInArray(this.runs, testRun.id)
      if (index >= 0) {
        this.runs.splice(index, 1, testRun)
      } else {
        this.runs.unshift(testRun)
        this.totalElements++
      }
    },
    deleteRunById(id) {
      let index = utils.indexInArray(this.runs, id)
      if (index >= 0) {
        this.deleteRun(index, this.runs[index])
      }
    },
    deleteRun(index, row) {
      ElMessageBox.confirm(
        this.$t('test.run.list.msg.delConfirmMsg', { runTime: row.createdTimeFormatted }),
        this.$t('test.run.list.msg.delConfirmTitle'),
        {
          type: 'warning',
          dangerouslyUseHTMLString: true,
          draggable: true
        }
      )
        .then(() => {
          testRunApi.delete(row.id).then(() => {
            ElMessage.success(this.$t('test.run.list.msg.delSuccess'))
            this.hideRunEdit()
            this.runs.splice(index, 1)
          })
        })
        .catch(() => {
          // Cancelled, do nothing
        })
    },
    filterChanged() {
      this.filter.page = 1
      this.loadRuns()
    },
    pageChanged: function (page) {
      this.filter.page = page
      this.loadRuns()
    },
    pageSizeChanged(size) {
      this.filter.pageSize = size
      this.$store.set('testRunListPageSize', this.filter.pageSize)
      this.filterChanged()
    }
  }
}
</script>

<style lang="less" scoped>
.test-runs-list-page {
  .title {
    display: flex;
    align-items: center;
    justify-content: space-between;
  }
}
</style>
