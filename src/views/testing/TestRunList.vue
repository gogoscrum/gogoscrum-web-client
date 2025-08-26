<template>
  <div class="test-runs-list-page page">
    <div class="filter-row">
      <div class="left-part">
        <div class="left-part">
          <el-button
            v-if="filter.caseId && project.isDeveloper"
            text
            type="primary"
            @click="newRun"
            icon="CirclePlusFilled"
            class="text-icon-btn"
            >{{ $t('test.run.list.filter.new') }}</el-button
          >
        </div>
      </div>
      <div class="right-part">
        <div class="summary-info">
          <el-icon v-if="loading" class="is-loading refresh-btn">
            <Loading />
          </el-icon>
          <el-icon v-else @click="loadRuns" class="refresh-btn">
            <Refresh />
          </el-icon>
          <span class="item-count">{{
            filter.keyword
              ? $t('common.filter.matchedResults', { count: totalElements })
              : $t('test.run.list.filter.totalElements', { count: totalElements })
          }}</span>
        </div>
        <el-form-item v-if="!filter.caseId" class="mb-0!">
          <el-input
            class="search-input"
            v-model="filter.keyword"
            clearable
            prefix-icon="Search"
            :placeholder="$t('test.case.list.filter.search')"
            @input="filterChanged"></el-input>
        </el-form-item>
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
      @filterChange="filterChange"
      @sort-change="sortChange"
      @row-click="showRunEdit">
      <el-table-column
        v-if="!filter.caseId"
        :label="$t('test.case.list.header.code')"
        prop="testCase.code"
        sortable="custom"
        width="85"
        align="center">
        <template #default="scope">
          <el-tag type="info"
            >TC-<span v-html="scope.row['testCase.codeHighlightLabel'] || scope.row.testCase.code"
          /></el-tag>
        </template>
      </el-table-column>
      <el-table-column
        v-if="!filter.caseId"
        :label="$t('test.run.list.caseName')"
        prop="testCase.details.name"
        show-overflow-tooltip
        sortable="custom"
        min-width="100">
        <template #default="scope">
          <span v-html="scope.row['testCase.details.nameHighlightLabel'] || scope.row.testCase.details.name" />
        </template>
      </el-table-column>
      <el-table-column :label="$t('test.run.list.createdTime')" prop="createdTime" sortable="custom" min-width="60">
        <template #default="scope">
          {{ scope.row.createdTimeFormatted }}
        </template>
      </el-table-column>
      <el-table-column
        :label="$t('test.run.list.createdBy')"
        prop="createdBy.nickname"
        sortable="custom"
        column-key="creators"
        :filters="userFilters"
        :filter-multiple="true"
        width="130">
        <template #filter-icon>
          <el-icon class="table-header-filter-icon" :class="{ active: filter.creators?.length }"><Filter /></el-icon>
        </template>
        <template #default="scope">
          <Avatar
            :name="scope.row.createdBy.nickname"
            showName
            :size="22"
            :src="scope.row.createdBy.avatarUrl"></Avatar>
        </template>
      </el-table-column>
      <el-table-column
        :label="$t('test.run.list.planName')"
        prop="testPlan.name"
        show-overflow-tooltip
        sortable="custom"
        column-key="planIds"
        :filters="planFilters"
        :filter-multiple="true"
        min-width="70">
        <template #filter-icon>
          <el-icon class="table-header-filter-icon" :class="{ active: filter.planIds?.length }"><Filter /></el-icon>
        </template>
        <template #default="scope">
          {{ scope.row.testPlan?.name }}
        </template>
      </el-table-column>

      <el-table-column
        :label="$t('test.run.list.status')"
        prop="status"
        sortable="custom"
        column-key="statuses"
        :filters="runStatusFilters"
        :filter-multiple="true"
        min-width="40">
        <template #filter-icon>
          <el-icon class="table-header-filter-icon" :class="{ active: filter.statuses?.length }"><Filter /></el-icon>
        </template>
        <template #default="scope">
          <TestRunStatusIcon :status="scope.row.status" />
        </template>
      </el-table-column>
      <el-table-column v-if="project.isDeveloper" :label="$t('common.actions')" width="80" align="center">
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
      <template v-if="showEmptyIcon" v-slot:empty>
        <el-empty :image-size="100" :description="$t('test.run.list.msg.empty')"> </el-empty>
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
  </div>
  <TestRunEdit
    v-if="editingRunId"
    :test-case-id="editingRunCaseId"
    :test-run-id="editingRunId"
    @testRunSaved="testRunSaved"
    @testRunDeleted="testRunDeleted"
    @testRunClosed="hideRunEdit" />
</template>

<script>
import { testPlanApi, testRunApi } from '@/api/testing.js'
import { ElMessage, ElMessageBox } from 'element-plus'
import utils from '@/utils/util.js'
import highlight from '@/utils/highlight.js'
import dict from '@/locales/zh-cn/dict.json'
import TestRunStatusIcon from '@/components/testing/TestRunStatusIcon.vue'
import Avatar from '@/components/common/Avatar.vue'
import TestRunEdit from './TestRunEdit.vue'

export default {
  name: 'TestRunList',
  components: {
    TestRunStatusIcon,
    Avatar,
    TestRunEdit
  },
  props: {
    showEmptyIcon: {
      type: Boolean,
      default: true
    }
  },
  data() {
    return {
      projectId: this.$route.params.projectId,
      project: {},
      filter: {
        projectId: this.$route.params.projectId,
        caseId: this.$route.params.testCaseId,
        orders: [],
        page: 1,
        pageSize: this.$store.get('testRunListPageSize') || 10
      },
      totalElements: 0,
      totalPages: 0,
      loading: false,
      runs: [],
      editingRunId: null,
      editingRunCaseId: null,
      userFilters: [],
      runStatusFilters: [],
      planFilters: []
    }
  },
  computed: {},
  created() {
    this.project = this.$store.get('project')
    this.loadRuns()
    this.initColumnFilters()
  },
  mounted() {},
  methods: {
    initColumnFilters() {
      this.userFilters = this.project.projectMembers.map((member) => ({
        text: member.user.nickname,
        value: member.user.id
      }))

      this.runStatusFilters = Object.keys(dict.testRunStatuses).map((key) => ({
        text: this.$t(`testRunStatuses.${key}`),
        value: key
      }))

      this.initPlanFilters()
    },
    initPlanFilters() {
      testPlanApi.search({ projectId: this.projectId, pageSize: 100 }).then((res) => {
        this.planFilters = res.data.results.map((plan) => ({
          text: plan.name,
          value: plan.id
        }))
      })
    },
    loadRuns() {
      this.loading = true
      testRunApi
        .search(this.filter)
        .then((res) => {
          this.runs = highlight.highlight(
            res.data.results,
            this.filter.keyword,
            'testCase.code',
            'testCase.details.name'
          )
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
      this.editingRunCaseId = this.filter.caseId
    },
    showRunEdit(row) {
      this.editingRunId = row.id
      this.editingRunCaseId = row.testCaseId
    },
    hideRunEdit() {
      this.editingRunId = null
      this.editingRunCaseId = null
    },
    testRunSaved(testRun) {
      this.formatTestRun(testRun)
      console.log('testRunSaved', testRun)
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
        this.$t('test.run.list.msg.delConfirmMsg', {
          runTime: row.createdTimeFormatted,
          caseName: row.testCase.details.name
        }),
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
            this.totalElements--
          })
        })
        .catch(() => {
          // Cancelled, do nothing
        })
    },
    testRunDeleted(testRun) {
      this.runs = this.runs.filter((run) => run.id !== testRun.id)
      this.totalElements--
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
      if (filters.creators) {
        if (filters.creators.length > 0) {
          this.filter.creators = filters.creators
        } else {
          this.filter.creators = null
        }
      }

      if (filters.statuses) {
        if (filters.statuses.length > 0) {
          this.filter.statuses = filters.statuses
        } else {
          this.filter.statuses = null
        }
      }

      if (filters.planIds) {
        if (filters.planIds.length > 0) {
          this.filter.planIds = filters.planIds
        } else {
          this.filter.planIds = null
        }
      }

      this.filterChanged()
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
}
</style>
