<template>
  <div class="test-case-list-page page">
    <div class="filter-row">
      <div class="left-part">
        <el-button
          v-if="!pickerMode"
          :disabled="!project.isDeveloper"
          text
          type="primary"
          @click="newCase"
          icon="CirclePlusFilled"
          class="text-icon-btn"
          >{{ $t('test.case.list.filter.new') }}</el-button
        >
        <template v-else>
          <el-button type="primary" :disabled="loading" @click="finishPicking">{{ $t('common.done') }}</el-button>
          <span v-if="pickedCases?.length" class="desc font-bold ml-4">{{
            $t('common.msg.pickedItems', { count: pickedCases.length })
          }}</span>
        </template>
      </div>
      <div class="right-part">
        <div class="summary-info">
          <el-icon v-if="loading" class="is-loading refresh-btn">
            <Loading />
          </el-icon>
          <el-icon v-else @click="loadCases" class="refresh-btn">
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
            @input="filterChanged"></el-input>
        </el-form-item>
      </div>
    </div>
    <div class="main">
      <el-table
        ref="testCaseList"
        :data="testCases"
        v-loading="loading"
        row-class-name="test-case-row clickable"
        :show-header="true"
        @selection-change="(selection) => (pickedCases = selection)"
        @filterChange="filterChange"
        @row-click="caseClicked"
        @sort-change="sortChange">
        <el-table-column v-if="pickerMode" type="selection" :selectable="isCaseSelectable" width="40" />
        <el-table-column
          :label="$t('test.case.list.header.code')"
          prop="code"
          sortable="custom"
          width="85"
          align="center">
          <template #default="scope">
            <el-tag type="info">TC-{{ scope.row.code }}</el-tag>
          </template>
        </el-table-column>
        <el-table-column
          :label="$t('test.case.list.header.name')"
          prop="details.name"
          show-overflow-tooltip
          sortable="custom"
          min-width="120">
          <template #default="scope">
            <span class="case-name" v-html="scope.row['details.nameHighlightLabel'] || scope.row.details.name" />
          </template>
        </el-table-column>
        <el-table-column
          :label="$t('test.case.list.header.type')"
          prop="details.type"
          sortable="custom"
          column-key="types"
          :filters="testTypeFilters"
          :filter-multiple="true"
          min-width="40">
          <template #filter-icon>
            <el-icon class="table-header-filter-icon" :class="{ active: filter.types?.length }"><Filter /></el-icon>
          </template>
          <template #default="scope">
            <span v-if="scope.row.details.type">
              {{ $t(`testTypes.${scope.row.details.type}`) }}
            </span>
          </template>
        </el-table-column>
        <el-table-column
          :label="$t('test.case.list.header.priority')"
          prop="details.priority"
          sortable="custom"
          column-key="priorities"
          :filters="priorityFilters"
          :filter-multiple="true"
          min-width="35">
          <template #filter-icon>
            <el-icon class="table-header-filter-icon" :class="{ active: filter.priorities?.length }"
              ><Filter
            /></el-icon>
          </template>
          <template #default="scope">
            <div v-if="scope.row.details.priority" class="flex">
              <PriorityIcon :priority="scope.row.details.priority" showLabel />
            </div>
          </template>
        </el-table-column>
        <el-table-column
          :label="$t('test.case.list.header.owner')"
          prop="details.owner.nickname"
          sortable="custom"
          column-key="owners"
          :filters="userFilters"
          :filter-multiple="true"
          min-width="35"
          class-name="owner-column">
          <template #filter-icon>
            <el-icon class="table-header-filter-icon" :class="{ active: filter.owners?.length }"><Filter /></el-icon>
          </template>
          <template #default="scope">
            <avatar
              v-if="scope.row.details.owner"
              :name="scope.row.details.owner.nickname"
              :size="22"
              :src="scope.row.details.owner.avatarUrl"
              showName></avatar>
          </template>
        </el-table-column>
        <el-table-column
          v-if="!pickerMode"
          :label="$t('test.case.list.header.latestRunStatus')"
          prop="latestRun.status"
          sortable="custom"
          column-key="runStatuses"
          :filters="runStatusFilters"
          :filter-multiple="true"
          min-width="35"
          class-name="run-status-column">
          <template #filter-icon>
            <el-icon class="table-header-filter-icon" :class="{ active: filter.latestRunStatus?.length }"
              ><Filter
            /></el-icon>
          </template>
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
        <el-table-column v-if="project.isDeveloper" :label="$t('common.actions')" width="80" align="center">
          <template #default="scope">
            <el-dropdown trigger="click" placement="bottom">
              <div class="more-action-icon" @click.stop>
                <el-icon><MoreFilled /></el-icon>
              </div>
              <template #dropdown>
                <el-dropdown-menu>
                  <el-dropdown-item
                    v-if="!pickerMode"
                    icon="VideoPlay"
                    @click.native="runCase(scope.$index, scope.row)"
                    >{{ $t('test.case.list.table.run') }}</el-dropdown-item
                  >
                  <el-dropdown-item icon="Edit" @click.native="editCase(scope.row)">{{
                    pickerMode ? $t('common.details') : $t('common.edit')
                  }}</el-dropdown-item>
                  <el-dropdown-item
                    v-if="!pickerMode"
                    icon="DocumentCopy"
                    @click.native="cloneCase(scope.$index, scope.row)"
                    >{{ $t('common.copy') }}</el-dropdown-item
                  >
                  <el-dropdown-item
                    v-if="!pickerMode"
                    icon="Delete"
                    @click.native="deleteCase(scope.$index, scope.row)"
                    >{{ $t('common.delete') }}</el-dropdown-item
                  >
                </el-dropdown-menu>
              </template>
            </el-dropdown>
          </template>
        </el-table-column>
        <template v-slot:empty>
          <el-empty :image-size="100" :description="$t('test.case.list.table.emptyMsg')">
            <el-button type="primary" icon="Plus" size="default" @click="newCase">{{
              $t('test.case.list.filter.new')
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
  <TestRunEdit
    v-if="editingCaseId"
    :test-case-id="editingCaseId"
    @testRunSaved="handleTestRunSaved"
    @testRunClosed="hideTestRun" />
</template>

<script>
import Avatar from '@/components/common/Avatar.vue'
import { testCaseApi } from '@/api/testing.js'
import highlight from '@/utils/highlight.js'
import utils from '@/utils/util.js'
import dict from '@/locales/zh-cn/dict.json'
import { ElMessage, ElMessageBox } from 'element-plus'
import PriorityIcon from '@/components/common/PriorityIcon.vue'
import TestRunStatusIcon from '@/components/testing/TestRunStatusIcon.vue'
import TestRunEdit from './TestRunEdit.vue'

export default {
  name: 'TestCaseList',
  components: {
    Avatar,
    PriorityIcon,
    TestRunStatusIcon,
    TestRunEdit
  },
  emits: ['caseSelected'],
  props: {
    pickerMode: {
      type: Boolean,
      default: false
    },
    selectedCaseIds: {
      type: Array,
      default: () => []
    }
  },
  data() {
    return {
      dict: dict,
      projectId: this.$route.params.projectId,
      project: {},
      testCases: [],
      filter: {
        projectId: this.$route.params.projectId,
        keyword: null,
        orders: [],
        page: 1,
        pageSize: this.$store.get('testCaseListPageSize') || 10
      },
      totalElements: 0,
      totalPages: 0,
      loading: false,
      pickedCases: [],
      testTypeFilters: [],
      priorityFilters: [],
      userFilters: [],
      runStatusFilters: [],
      editingCaseId: null
    }
  },
  created() {
    this.project = this.$store.get('project')
    this.initColumnFilters()
  },
  mounted() {
    this.loadCases()
  },
  methods: {
    initColumnFilters() {
      this.priorityFilters = Object.keys(dict.issuePriorities).map((key) => ({
        text: this.$t(`issuePriorities.${key}`),
        value: key
      }))

      this.testTypeFilters = Object.keys(dict.testTypes).map((key) => ({
        text: this.$t(`testTypes.${key}`),
        value: key
      }))

      this.userFilters = this.project.projectMembers.map((member) => ({
        text: member.user.nickname,
        value: member.user.id
      }))

      this.runStatusFilters = Object.keys(dict.testRunStatuses).map((key) => ({
        text: this.$t(`testRunStatuses.${key}`),
        value: key
      }))
    },
    loadCases() {
      this.loading = true
      testCaseApi
        .search(this.filter)
        .then((res) => {
          let results = highlight.highlight(res.data.results, this.filter.keyword, 'code', 'details.name')
          results.forEach((testCase) => this.formatCase(testCase))
          this.testCases = results
          this.totalElements = res.data.totalElements
          this.totalPages = res.data.totalPages
        })
        .finally(() => {
          setTimeout(() => {
            this.loading = false
          }, 200)
        })
    },
    formatCase(testCase) {
      if (testCase.latestRun) {
        utils.formatCreateUpdateTime(testCase.latestRun)
      }
      utils.formatCreateUpdateTime(testCase)
      return testCase
    },
    isCaseSelectable(row) {
      return !this.selectedCaseIds.includes(row.id)
    },
    finishPicking() {
      this.$emit('caseSelected', this.pickedCases)
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
      if (filters.priorities) {
        if (filters.priorities.length > 0) {
          this.filter.priorities = filters.priorities
        } else {
          this.filter.priorities = null
        }
      }

      if (filters.types) {
        if (filters.types.length > 0) {
          this.filter.types = filters.types
        } else {
          this.filter.types = null
        }
      }

      if (filters.owners) {
        if (filters.owners.length > 0) {
          this.filter.owners = filters.owners
        } else {
          this.filter.owners = null
        }
      }

      if (filters.creators) {
        if (filters.creators.length > 0) {
          this.filter.creators = filters.creators
        } else {
          this.filter.creators = null
        }
      }

      if (filters.runStatuses) {
        if (filters.runStatuses.length > 0) {
          this.filter.runStatuses = filters.runStatuses
        } else {
          this.filter.runStatuses = null
        }
      }

      this.filterChanged()
    },
    filterChanged() {
      this.filter.page = 1
      this.loadCases()
    },
    pageChanged: function (page) {
      this.filter.page = page
      this.loadCases()
    },
    pageSizeChanged(size) {
      this.filter.pageSize = size
      this.$store.set('testCaseListPageSize', this.filter.pageSize)
      this.filterChanged()
    },
    newCase() {
      this.$router.push({ name: 'TestCaseEdit', params: { testCaseId: 'new' } })
    },
    showCaseDetails(row) {
      this.$router.push({ name: 'TestCaseDetails', params: { testCaseId: row.id } })
    },
    handleTestRunSaved(run) {
      this.loadCases() // Reload cases to update latest run status
    },
    editCase(row) {
      this.$router.push({
        name: 'TestCaseEdit',
        params: { testCaseId: row.id }
      })
    },
    cloneCase(index, row) {
      testCaseApi.clone(row.id).then((res) => {
        ElMessage.success({
          message: this.$t('test.case.list.msg.caseCopied')
        })
        // insert the cloned case right after the original case
        const clonedCase = res.data
        this.testCases.splice(index, 0, this.formatCase(clonedCase))
        this.totalElements++
      })
    },
    caseClicked(row) {
      if (this.pickerMode) {
        this.$refs.testCaseList.toggleRowSelection(row)
      } else {
        this.showCaseDetails(row)
        // this.$router.push({ name: 'TestCaseDetails', params: { testCaseId: row.id } })
      }
    },
    deleteCase(index, row) {
      ElMessageBox.confirm(
        this.$t('test.case.edit.msg.delConfirmMsg', { caseName: row.details.name }),
        this.$t('test.case.edit.msg.delConfirmTitle'),
        {
          type: 'warning',
          dangerouslyUseHTMLString: true,
          draggable: true
        }
      )
        .then(() => {
          testCaseApi.delete(row.id).then((response) => {
            this.testCases.splice(index, 1)
            this.totalElements--
            ElMessage.success(this.$t('test.case.edit.msg.delSuccess'))
          })
        })
        .catch(() => {
          // Cancelled, do nothing
        })
    },
    runCase(index, row) {
      this.editingCaseId = row.id
    },
    hideTestRun() {
      this.editingCaseId = null
    }
  }
}
</script>

<style lang="less">
.test-case-list-page {
  .owner-column,
  .creator-column {
    .cell {
      line-height: 1;
    }
  }
}
</style>
