<template>
  <div class="test-reports-list-page page">
    <div class="filter-row">
      <div class="left-part">
        <div class="left-part">
          <el-button
            v-if="filter.planId && project.isDeveloper"
            text
            type="primary"
            @click="newReport"
            icon="CirclePlusFilled"
            class="text-icon-btn"
            >{{ $t('test.report.list.filter.new') }}</el-button
          >
        </div>
      </div>
      <div class="right-part">
        <div class="summary-info">
          <el-icon v-if="loading" class="is-loading refresh-btn">
            <Loading />
          </el-icon>
          <el-icon v-else @click="loadReports" class="refresh-btn">
            <Refresh />
          </el-icon>
          <span class="item-count">{{
            filter.keyword
              ? $t('common.filter.matchedResults', { count: totalElements })
              : $t('test.report.list.filter.totalElements', { count: totalElements })
          }}</span>
        </div>
        <el-form-item class="mb-0!">
          <el-input
            class="search-input"
            v-model="filter.keyword"
            clearable
            prefix-icon="Search"
            :placeholder="$t('test.report.list.filter.search')"
            @input="filterChanged"></el-input>
        </el-form-item>
      </div>
    </div>

    <el-table
      :data="reports"
      v-loading="loading"
      :empty-text="$t('test.report.list.msg.empty')"
      :border="false"
      :show-header="true"
      class="test-reports-table"
      row-class-name="clickable"
      @filterChange="filterChange"
      @sort-change="sortChange"
      @row-click="showReport">
      <el-table-column
        :label="$t('test.report.list.header.name')"
        prop="name"
        show-overflow-tooltip
        sortable="custom"
        min-width="100">
        <template #default="scope">
          <span v-html="scope.row['nameHighlightLabel'] || scope.row.name" />
        </template>
      </el-table-column>
      <el-table-column
        :label="$t('test.report.list.header.planName')"
        prop="testPlan.name"
        show-overflow-tooltip
        sortable="custom"
        column-key="planIds"
        :filters="!filter.planId ? planFilters : null"
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
        :label="$t('test.report.list.header.createdTime')"
        prop="createdTime"
        sortable="custom"
        min-width="60">
        <template #default="scope">
          {{ scope.row.createdTimeFormatted }}
        </template>
      </el-table-column>
      <el-table-column
        :label="$t('test.report.list.header.createdBy')"
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
      <el-table-column v-if="project.isDeveloper" :label="$t('common.actions')" width="80" align="center">
        <template #default="scope">
          <el-dropdown trigger="click" placement="bottom">
            <div class="more-action-icon" @click.stop>
              <el-icon><MoreFilled /></el-icon>
            </div>
            <template #dropdown>
              <el-dropdown-menu>
                <el-dropdown-item icon="ZoomIn" @click.native="showReport(scope.row)">{{
                  $t('common.details')
                }}</el-dropdown-item>
                <el-dropdown-item icon="Delete" @click.native="deleteReport(scope.$index, scope.row)">{{
                  $t('common.delete')
                }}</el-dropdown-item>
              </el-dropdown-menu>
            </template>
          </el-dropdown>
        </template>
      </el-table-column>
      <template v-if="showEmptyIcon" v-slot:empty>
        <el-empty :image-size="100" :description="$t('test.report.list.msg.empty')"> </el-empty>
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
</template>

<script>
import { testPlanApi, testReportApi } from '@/api/testing.js'
import { ElMessage, ElMessageBox } from 'element-plus'
import utils from '@/utils/util.js'
import highlight from '@/utils/highlight.js'
import Avatar from '@/components/common/Avatar.vue'

export default {
  name: 'TestReportList',
  components: {
    Avatar
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
      reports: [],
      filter: {
        projectId: this.$route.params.projectId,
        planId: this.$route.params.testPlanId,
        orders: [],
        page: 1,
        pageSize: this.$store.get('testReportListPageSize') || 10
      },
      totalElements: 0,
      totalPages: 0,
      loading: false,
      userFilters: [],
      planFilters: []
    }
  },
  computed: {},
  created() {
    this.project = this.$store.get('project')
    this.loadReports()
    this.initColumnFilters()
  },
  mounted() {},
  methods: {
    initColumnFilters() {
      this.userFilters = this.project.projectMembers.map((member) => ({
        text: member.user.nickname,
        value: member.user.id
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
    loadReports() {
      this.loading = true
      testReportApi
        .search(this.filter)
        .then((res) => {
          this.reports = highlight.highlight(res.data.results, this.filter.keyword, 'name')
          this.totalElements = res.data.totalElements
          this.totalPages = res.data.totalPages

          this.reports.forEach((report) => {
            this.formatTestReport(report)
          })
        })
        .finally(() => {
          setTimeout(() => {
            this.loading = false
          }, 200)
        })
    },
    formatTestReport(testReport) {
      utils.formatCreateUpdateTime(testReport)
    },
    newReport() {
      this.$router.push({
        name: 'TestReportPreview',
        params: { projectId: this.projectId, planId: this.planId }
      })
    },
    showReport(row) {
      this.$router.push({
        name: 'TestReportDetails',
        params: { projectId: this.projectId, reportId: row.id }
      })
    },
    deleteReport(index, row) {
      ElMessageBox.confirm(
        this.$t('test.report.details.delConfirmMsg', {
          reportName: row.name
        }),
        this.$t('test.report.details.delConfirmTitle'),
        {
          type: 'warning',
          dangerouslyUseHTMLString: true,
          draggable: true
        }
      )
        .then(() => {
          testReportApi.delete(row.id).then(() => {
            ElMessage.success(this.$t('test.report.details.delSuccess'))
            this.reports.splice(index, 1)
            this.totalElements--
          })
        })
        .catch(() => {
          // Cancelled, do nothing
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
      if (filters.creators) {
        if (filters.creators.length > 0) {
          this.filter.creators = filters.creators
        } else {
          this.filter.creators = null
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
      this.loadReports()
    },
    pageChanged: function (page) {
      this.filter.page = page
      this.loadReports()
    },
    pageSizeChanged(size) {
      this.filter.pageSize = size
      this.$store.set('testReportListPageSize', this.filter.pageSize)
      this.filterChanged()
    }
  }
}
</script>

<style lang="less" scoped>
.test-reports-list-page {
}
</style>
