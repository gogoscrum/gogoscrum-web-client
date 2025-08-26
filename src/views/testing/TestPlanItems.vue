<template>
  <div class="test-plan-item-list">
    <div v-if="!hideFilter" class="filter-row">
      <div class="left-part">
        <el-button
          :disabled="!project.isDeveloper"
          text
          type="primary"
          @click="toggleCasePicker"
          icon="Link"
          class="text-icon-btn"
          >{{ $t('test.plan.items.add') }}</el-button
        >
        <el-button
          :disabled="!project.isDeveloper || !planItems.length"
          text
          type="primary"
          @click="startRun"
          icon="VideoPlay"
          class="text-icon-btn"
          >{{ runningCaseIndex ? $t('test.plan.items.continueRun') : $t('test.plan.items.startRun') }}</el-button
        >
      </div>
      <TestPlanStatistics :testPlan="testPlan" />
      <div class="right-part">
        <div class="summary-info">
          <el-icon v-if="loading" class="is-loading refresh-btn">
            <Loading />
          </el-icon>
          <el-icon v-else @click="loadPlanItems" class="refresh-btn">
            <Refresh />
          </el-icon>
          <span class="item-count">{{
            filter.keyword
              ? $t('test.case.list.filter.matchedResults', { count: totalElements })
              : $t('test.case.list.filter.totalElements', { count: totalElements })
          }}</span>
        </div>
        <el-form-item class="mb-0!">
          <el-input
            class="search-input"
            v-model="filter.keyword"
            clearable
            prefix-icon="Search"
            :placeholder="$t('test.case.list.filter.search')"
            @input="keywordChanged"></el-input>
        </el-form-item>
      </div>
    </div>
    <div class="main">
      <el-table
        ref="testCaseList"
        :data="planItems"
        v-loading="loading"
        row-class-name="test-case-row clickable"
        :show-header="true"
        @row-click="itemClicked"
        @sort-change="sortChange">
        <el-table-column
          :label="$t('test.case.list.header.code')"
          prop="testCase.code"
          sortable="custom"
          width="100"
          align="center">
          <template #default="scope">
            <div class="flex items-center">
              <el-icon v-if="runningCaseId === scope.row.testCase.id" class="cursor-arrow mr-4px"
                ><CaretRight
              /></el-icon>
              <el-tag
                :type="runningCaseId === scope.row.testCase.id ? 'success' : 'info'"
                :class="{ 'ml-18px': runningCaseId !== scope.row.testCase.id }">
                TC-{{ scope.row.testCase.code }}</el-tag
              >
            </div>
          </template>
        </el-table-column>
        <el-table-column
          :label="$t('test.case.list.header.name')"
          prop="testCase.details.name"
          sortable="custom"
          min-width="120">
          <template #default="scope">
            <span
              class="case-name"
              :class="{ highlight: runningCaseId === scope.row.testCase.id }"
              v-html="scope.row['testCase.details.nameHighlightLabel'] || scope.row.testCase.details.name" />
          </template>
        </el-table-column>
        <el-table-column
          :label="$t('test.case.list.header.type')"
          prop="testCase.details.type"
          sortable="custom"
          min-width="40">
          <template #default="scope">
            <span v-if="scope.row.testCase.details.type">
              {{ $t(`testTypes.${scope.row.testCase.details.type}`) }}
            </span>
          </template>
        </el-table-column>
        <el-table-column
          :label="$t('test.case.list.header.priority')"
          prop="testCase.details.priority"
          sortable="custom"
          min-width="30">
          <template #default="scope">
            <div v-if="scope.row.testCase.details.priority" class="flex">
              <PriorityIcon :priority="scope.row.testCase.details.priority" />
              <span class="ml-2">{{ $t(`issuePriorities.${scope.row.testCase.details.priority}`) }}</span>
            </div>
          </template>
        </el-table-column>
        <el-table-column
          :label="$t('test.case.list.header.latestRunStatus')"
          prop="latestRun.status"
          sortable="custom"
          min-width="30"
          class-name="run-status-column">
          <template #default="scope">
            <el-tooltip
              v-if="scope.row.latestRun"
              :content="
                $t('test.case.list.table.latestRunTip', {
                  nickname: scope.row.latestRun.createdBy.nickname,
                  latestRunTime: scope.row.latestRun.createdTimeFormatted
                })
              "
              placement="left">
              <TestRunStatusIcon :status="scope.row.latestRun.status" />
            </el-tooltip>
          </template>
        </el-table-column>
        <el-table-column
          v-if="project.isDeveloper && !readonly"
          :label="$t('common.actions')"
          width="80"
          align="center">
          <template #default="scope">
            <el-dropdown trigger="click" placement="bottom">
              <div class="more-action-icon" @click.stop>
                <el-icon><MoreFilled /></el-icon>
              </div>
              <template #dropdown>
                <el-dropdown-menu>
                  <el-dropdown-item icon="VideoPlay" @click.native="runCase(scope.$index, scope.row, true)">{{
                    $t('test.plan.items.newRun')
                  }}</el-dropdown-item>
                  <el-dropdown-item icon="ZoomIn" @click.native="showCaseDetails(scope.row)">{{
                    $t('test.plan.items.caseDetails')
                  }}</el-dropdown-item>
                  <el-dropdown-item icon="Delete" @click.native="deleteItem(scope.$index, scope.row)">{{
                    $t('common.unlink')
                  }}</el-dropdown-item>
                </el-dropdown-menu>
              </template>
            </el-dropdown>
          </template>
        </el-table-column>
        <template v-slot:empty>
          <el-empty :image-size="80" :description="$t('test.plan.items.emptyMsg')">
            <el-button type="primary" icon="Plus" size="default" @click="toggleCasePicker">{{
              $t('test.plan.items.add')
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
    </div>
  </div>
  <TestCasePicker
    v-if="casePickerVisible"
    :selectedCaseIds="selectedCaseIds"
    @caseSelected="handleCaseSelected"
    @casePickerClosed="toggleCasePicker" />
  <TestRunEdit
    v-if="caseRunEditVisible"
    :test-case-id="runningCaseId"
    :test-case-index="runningCaseIndex"
    :test-plan-id="testPlanId"
    :test-run-id="latestRunId"
    :total-size="totalElements"
    @prevTestRun="handlePrevCase"
    @nextTestRun="handleNextCase"
    @testRunSaved="handleTestRunSaved"
    @testRunDeleted="handleTestRunDeleted"
    @testRunClosed="hideTestRun" />
</template>

<script>
import Avatar from '@/components/common/Avatar.vue'
import { testPlanApi } from '@/api/testing.js'
import highlight from '@/utils/highlight.js'
import utils from '@/utils/util.js'
import { ElMessage, ElMessageBox } from 'element-plus'
import PriorityIcon from '@/components/common/PriorityIcon.vue'
import TestCasePicker from './TestCasePicker.vue'
import TestRunEdit from './TestRunEdit.vue'
import TestRunStatusIcon from '@/components/testing/TestRunStatusIcon.vue'
import TestPlanStatistics from './TestPlanStatistics.vue'

export default {
  name: 'TestPlanItemList',
  components: {
    Avatar,
    PriorityIcon,
    TestCasePicker,
    TestRunEdit,
    TestRunStatusIcon,
    TestPlanStatistics
  },
  emits: ['itemChanged'],
  props: {
    testPlanId: {
      type: String,
      default: null
    },
    hideFilter: {
      type: Boolean,
      default: false
    },
    testPlan: {
      type: Object,
      default: () => ({})
    },
    readonly: {
      type: Boolean,
      default: false
    }
  },
  data() {
    return {
      project: {},
      planItems: [],
      filter: {
        testPlanId: this.testPlanId,
        keyword: null,
        orders: [],
        page: 1,
        pageSize: this.$store.get('testPlanItemListPageSize') || 10
      },
      totalElements: 0,
      totalPages: 0,
      loading: false,
      casePickerVisible: false,
      selectedCaseIds: [],
      caseRunEditVisible: false,
      runningCaseId: null,
      runningCaseIndex: 0,
      latestRunId: null
    }
  },
  computed: {},
  created() {
    this.project = this.$store.get('project')
  },
  mounted() {
    this.loadPlanItems()
  },
  methods: {
    loadPlanItems() {
      this.loading = true
      return new Promise((resolve, reject) => {
        testPlanApi
          .searchPlanItems(this.testPlanId, this.filter)
          .then((res) => {
            this.planItems = highlight.highlight(
              res.data.results,
              this.filter.keyword,
              'testCase.code',
              'testCase.details.name'
            )

            this.planItems.forEach((item) => {
              this.formatItem(item)
            })

            this.totalElements = res.data.totalElements
            this.totalPages = res.data.totalPages

            if (this.totalElements > 0) {
              this.loadAllPlanCaseIds()
            } else {
              this.selectedCaseIds = []
            }

            resolve(this.planItems)
          })
          .finally(() => {
            setTimeout(() => {
              this.loading = false
            }, 200)
          })
      })
    },
    formatItem(item) {
      if (item.latestRun) {
        utils.formatCreateUpdateTime(item.latestRun)
      }
      utils.formatCreateUpdateTime(item.testCase)
    },
    sortChange(event) {
      // Only support single column sorting
      this.runningCaseId = null
      this.runningCaseIndex = 0
      this.filter.orders = []
      if (event.prop && event.order) {
        this.filter.orders.push({
          property: event.prop,
          direction: event.order === 'ascending' ? 'ASC' : 'DESC'
        })
      }
      this.filter.page = 1
      this.loadPlanItems()
    },
    keywordChanged() {
      this.runningCaseId = null
      this.runningCaseIndex = 0
      this.filter.page = 1
      this.loadPlanItems()
    },
    pageChanged: function (page) {
      this.filter.page = page
      this.loadPlanItems()
    },
    pageSizeChanged(size) {
      this.filter.pageSize = size
      this.filter.page = 1
      this.$store.set('testPlanItemListPageSize', this.filter.pageSize)
      this.loadPlanItems()
    },
    startRun() {
      this.runCaseByOverallIndex(this.runningCaseIndex)
    },
    itemClicked(row) {
      const index = this.planItems.indexOf(row)
      this.runCase(index, row, false)
    },
    runCase(index, row, forceNewRun) {
      this.runningCaseIndex = this.toOverallIndex(index)
      this.runCaseByIndexInPage(index, forceNewRun)
    },
    toOverallIndex(index) {
      return (this.filter.page - 1) * this.filter.pageSize + index
    },
    toIndexInPage(overallIndex) {
      return overallIndex % this.filter.pageSize
    },
    hideTestRun() {
      this.caseRunEditVisible = false
    },
    handlePrevCase() {
      if (this.runningCaseIndex <= 0) {
        ElMessage.warning(this.$t('test.plan.items.msg.isFirstAlready'))
        return
      }
      this.runningCaseIndex--
      this.runCaseByOverallIndex(this.runningCaseIndex)
    },
    handleNextCase() {
      if (this.runningCaseIndex >= this.totalElements - 1) {
        ElMessage.warning(this.$t('test.plan.items.msg.isLastAlready'))
        return
      }
      this.runningCaseIndex++
      this.runCaseByOverallIndex(this.runningCaseIndex)
    },
    runCaseByOverallIndex(overallIndex) {
      // convert the overall index to the item index in the page,
      // e.g. if overallIndex is 25 and pageSize is 10, indexInPage will be 5
      const indexInPage = overallIndex % this.filter.pageSize
      // calculate the target page, e.g. if overallIndex is 25 and pageSize is 10,
      // targetPage will be 3 (1-based), so we need to load page 3 (1-based)
      const targetPage = Math.ceil((overallIndex + 1) / this.filter.pageSize)
      // if the target page is different from the current page, load the new page
      if (targetPage !== this.filter.page) {
        this.filter.page = targetPage
        this.loadPlanItems().then(() => {
          this.runCaseByIndexInPage(indexInPage)
        })
      } else {
        this.runCaseByIndexInPage(indexInPage)
      }
    },
    runCaseByIndexInPage(indexInPage, forceNewRun) {
      this.caseRunEditVisible = true
      const itemToRun = this.planItems[indexInPage]
      this.runningCaseId = itemToRun.testCase.id
      if (forceNewRun) {
        this.latestRunId = null
      } else {
        this.latestRunId = itemToRun.latestRun?.id || null
      }
    },
    handleTestRunSaved(run) {
      this.loadPlanItems()
      this.$emit('itemChanged')
    },
    showCaseDetails(row) {
      this.$router.push({ name: 'TestCaseDetails', params: { testCaseId: row.testCase.id } })
    },
    deleteItem(index, row) {
      ElMessageBox.confirm(
        this.$t('test.plan.items.msg.delConfirmMsg', { caseName: row.testCase.details.name }),
        this.$t('test.plan.items.msg.delConfirmTitle'),
        {
          type: 'warning',
          dangerouslyUseHTMLString: true,
          draggable: true
        }
      )
        .then(() => {
          testPlanApi.deletePlanItem(this.testPlanId, row.id).then((response) => {
            this.planItems.splice(index, 1)
            this.totalElements--
            ElMessage.success(this.$t('test.plan.items.msg.delSuccess'))
            this.selectedCaseIds = this.selectedCaseIds.filter((id) => id !== row.testCase.id)
            this.$emit('itemChanged')
          })
        })
        .catch(() => {
          // Cancelled, do nothing
        })
    },
    handleTestRunDeleted() {
      this.loadPlanItems()
      this.$emit('itemChanged')
    },
    loadAllPlanCaseIds() {
      testPlanApi.getTestCaseIds(this.testPlanId).then((response) => {
        this.selectedCaseIds = response.data
      })
    },
    toggleCasePicker() {
      this.casePickerVisible = !this.casePickerVisible
    },
    handleCaseSelected(selectedCases) {
      if (selectedCases?.length > 0) {
        const caseIds = selectedCases.map((c) => c.id)
        testPlanApi.createPlanItems(this.testPlanId, caseIds).then(() => {
          ElMessage.success(this.$t('test.plan.items.msg.addSuccess'))
          this.loadPlanItems()
          this.$emit('itemChanged') // Emit event with added cases
        })
      }
      this.toggleCasePicker()
    }
  }
}
</script>

<style lang="less">
.test-plan-item-list {
  .filter-row {
    .right-part {
      margin-left: unset;
    }
  }
  .test-case-row {
    .cursor-arrow {
      color: var(--el-color-primary);
    }
    .case-name {
      &.highlight {
        font-weight: 500;
        color: var(--el-color-primary);
      }
    }
  }
  .owner-column {
    .cell {
      line-height: 1;
    }
  }
}
</style>
