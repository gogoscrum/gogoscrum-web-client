<template>
  <div class="test-plan-item-list">
    <div class="filter-row">
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
      </div>
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
          width="85"
          align="center">
          <template #default="scope">
            <span class="case-name" v-html="scope.row['testCase.codeHighlightLabel'] || scope.row.testCase.code" />
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
          :label="$t('test.case.list.header.owner')"
          prop="testCase.details.owner.nickname"
          sortable="custom"
          min-width="30"
          align="center"
          class-name="owner-column">
          <template #default="scope">
            <el-tooltip
              v-if="scope.row.testCase.details.owner"
              :content="scope.row.testCase.details.owner.nickname"
              placement="left">
              <avatar
                :name="scope.row.testCase.details.owner.nickname"
                :size="22"
                :src="scope.row.testCase.details.owner.avatarUrl"
                inline></avatar>
            </el-tooltip>
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
                  <el-dropdown-item icon="Edit" @click.native="showCaseDetails(scope.row)">{{
                    $t('common.details')
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
  <test-case-picker
    v-if="casePickerVisible"
    :selectedCaseIds="selectedCaseIds"
    @caseSelected="handleCaseSelected"
    @casePickerClosed="toggleCasePicker">
  </test-case-picker>
</template>

<script>
import Avatar from '@/components/common/Avatar.vue'
import { testPlanApi } from '@/api/testing.js'
import highlight from '@/utils/highlight.js'
import { ElMessage, ElMessageBox } from 'element-plus'
import PriorityIcon from '@/components/common/PriorityIcon.vue'
import TestCasePicker from './TestCasePicker.vue'

export default {
  name: 'TestPlanItemList',
  components: {
    Avatar,
    PriorityIcon,
    TestCasePicker
  },
  props: {
    testPlanId: {
      type: String,
      default: null
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
      selectedCaseIds: []
    }
  },
  created() {
    this.project = this.$store.get('project')
  },
  mounted() {
    this.loadPlanItems()
  },
  methods: {
    loadPlanItems() {
      this.loading = true
      testPlanApi
        .searchPlanItems(this.testPlanId, this.filter)
        .then((res) => {
          this.planItems = highlight.highlight(
            res.data.results,
            this.filter.keyword,
            'testCase.code',
            'testCase.details.name'
          )
          this.totalElements = res.data.totalElements
          this.totalPages = res.data.totalPages

          if (this.totalElements > 0) {
            this.loadAllPlanCaseIds()
          } else {
            this.selectedCaseIds = []
          }
        })
        .finally(() => {
          setTimeout(() => {
            this.loading = false
          }, 200)
        })
    },
    sortChange(event) {
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
    showCaseDetails(row) {
      this.$router.push({
        name: 'TestCaseEdit',
        params: { testCaseId: row.testCase.id }
      })
    },
    itemClicked(row) {
      this.showCaseDetails(row)
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
          })
        })
        .catch(() => {
          // Cancelled, do nothing
        })
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
        })
      }
      this.toggleCasePicker()
    }
  }
}
</script>

<style lang="less">
.test-plan-item-list {
  .owner-column {
    .cell {
      line-height: 1;
    }
  }
}
</style>
