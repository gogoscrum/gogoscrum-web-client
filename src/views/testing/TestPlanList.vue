<template>
  <div class="test-plan-list-page page">
    <div class="filter-row">
      <div class="left-part">
        <el-button
          :disabled="!project.isDeveloper"
          text
          type="primary"
          @click="newPlan"
          icon="CirclePlusFilled"
          class="text-icon-btn"
          >{{ $t('test.plan.list.filter.new') }}</el-button
        >
      </div>
      <div class="right-part">
        <div class="summary-info">
          <el-icon v-if="loading" class="is-loading refresh-btn">
            <Loading />
          </el-icon>
          <el-icon v-else @click="loadPlans" class="refresh-btn">
            <Refresh />
          </el-icon>
          <span class="item-count">{{
            filter.keyword
              ? $t('test.plan.list.filter.matchedResults', { count: totalElements })
              : $t('test.plan.list.filter.totalElements', { count: totalElements })
          }}</span>
        </div>
        <el-form-item class="mb-0!">
          <el-input
            class="search-input"
            v-model="filter.keyword"
            clearable
            prefix-icon="Search"
            :placeholder="$t('test.plan.list.filter.search')"
            @input="filterChanged"></el-input>
        </el-form-item>
      </div>
    </div>
    <div class="main">
      <el-table
        :data="testPlans"
        v-loading="loading"
        row-class-name="test-plan-row clickable"
        :show-header="true"
        @row-click="planClicked"
        @sort-change="sortChange"
        @filterChange="filterChange">
        <el-table-column :label="$t('test.plan.list.header.name')" prop="name" sortable="custom" min-width="120">
          <template #default="scope">
            <span class="plan-name" v-html="scope.row.nameHighlightLabel || scope.row.name" />
          </template>
        </el-table-column>
        <el-table-column
          :label="$t('test.plan.list.header.type')"
          prop="type"
          sortable="custom"
          column-key="types"
          :filters="testTypeFilters"
          :filter-multiple="true"
          min-width="40">
          <template #filter-icon>
            <el-icon class="table-header-filter-icon" :class="{ active: filter.types?.length }"><Filter /></el-icon>
          </template>
          <template #default="scope">
            <span v-if="scope.row.type">
              {{ $t(`testTypes.${scope.row.type}`) }}
            </span>
          </template>
        </el-table-column>
        <el-table-column
          v-if="!isInMobile"
          prop="startDate"
          sortable="custom"
          :label="$t('test.plan.list.header.startDate')"
          min-width="40">
          <template #default="scope">
            <span>{{ scope.row.startDateFormatted }}</span>
          </template>
        </el-table-column>
        <el-table-column
          v-if="!isInMobile"
          prop="endDate"
          sortable="custom"
          :label="$t('test.plan.list.header.endDate')"
          min-width="40">
          <template #default="scope">
            <span>{{ scope.row.endDateFormatted }}</span>
          </template>
        </el-table-column>
        <el-table-column
          v-if="!isInMobile"
          :label="$t('test.plan.list.header.owner')"
          prop="owner.nickname"
          sortable="custom"
          column-key="owners"
          :filters="userFilters"
          :filter-multiple="true"
          min-width="40"
          class-name="owner-column"
          align="center">
          <template #filter-icon>
            <el-icon class="table-header-filter-icon" :class="{ active: filter.owners?.length }"><Filter /></el-icon>
          </template>
          <template #default="scope">
            <el-tooltip v-if="scope.row.owner" :content="scope.row.owner.nickname" placement="left">
              <Avatar :name="scope.row.owner.nickname" :size="22" :src="scope.row.owner.avatarUrl" inline />
            </el-tooltip>
          </template>
        </el-table-column>
        <el-table-column
          v-if="!isInMobile"
          :label="$t('test.plan.list.header.creator')"
          prop="createdBy.nickname"
          sortable="custom"
          column-key="creators"
          :filters="userFilters"
          :filter-multiple="true"
          min-width="40"
          class-name="creator-column"
          align="center">
          <template #filter-icon>
            <el-icon class="table-header-filter-icon" :class="{ active: filter.creators?.length }"><Filter /></el-icon>
          </template>
          <template #default="scope">
            <el-tooltip
              v-if="scope.row.createdBy"
              :content="
                $t('test.plan.list.table.creatorTip', {
                  nickname: scope.row.createdBy.nickname,
                  createdTime: scope.row.createdTimeFormatted
                })
              "
              placement="left">
              <Avatar :name="scope.row.createdBy.nickname" :size="22" :src="scope.row.createdBy.avatarUrl" inline />
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
                  <el-dropdown-item icon="ZoomIn" @click.native="planClicked(scope.row)">{{
                    $t('common.details')
                  }}</el-dropdown-item>
                  <el-dropdown-item icon="Edit" @click.native="editPlan(scope.row)">{{
                    $t('common.edit')
                  }}</el-dropdown-item>
                  <el-dropdown-item icon="DocumentCopy" @click.native="clonePlan(scope.$index, scope.row)">{{
                    $t('common.copy')
                  }}</el-dropdown-item>
                  <el-dropdown-item icon="Delete" @click.native="deletePlan(scope.$index, scope.row)">{{
                    $t('common.delete')
                  }}</el-dropdown-item>
                </el-dropdown-menu>
              </template>
            </el-dropdown>
          </template>
        </el-table-column>
        <template v-slot:empty>
          <el-empty :image-size="100" :description="$t('test.plan.list.table.emptyMsg')">
            <el-button type="primary" icon="Plus" size="default" @click="newPlan">{{
              $t('test.plan.list.filter.new')
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
  <TestPlanEdit
    v-if="editingTestPlan"
    :testPlanId="editingTestPlan.id"
    :project="project"
    @testPlanClosed="testPlanClosed"
    @testPlanSaved="testPlanSaved"
    @testPlanDeleted="testPlanDeleted" />
</template>

<script>
import Avatar from '@/components/common/Avatar.vue'
import { testPlanApi } from '@/api/testing.js'
import highlight from '@/utils/highlight.js'
import utils from '@/utils/util.js'
import dict from '@/locales/zh-cn/dict.json'
import dayjs from 'dayjs'
import { ElMessage, ElMessageBox } from 'element-plus'
import TestPlanEdit from './TestPlanEdit.vue'

export default {
  name: 'TestPlanList',
  components: {
    Avatar,
    TestPlanEdit
  },
  data() {
    return {
      dict: dict,
      isInMobile: utils.isInMobile(),
      projectId: this.$route.params.projectId,
      project: {},
      testPlans: [],
      filter: {
        projectId: this.$route.params.projectId,
        keyword: null,
        orders: [],
        page: 1,
        pageSize: this.$store.get('testPlanListPageSize') || 10
      },
      totalElements: 0,
      totalPages: 0,
      loading: false,
      editingTestPlan: null,
      testTypeFilters: [],
      userFilters: []
    }
  },
  created() {
    this.project = this.$store.get('project')
    this.initColumnFilters()
  },
  mounted() {
    this.loadPlans()
  },
  methods: {
    initColumnFilters() {
      this.testTypeFilters = Object.keys(dict.testTypes).map((key) => ({
        text: this.$t(`testTypes.${key}`),
        value: key
      }))

      this.userFilters = this.project.projectMembers.map((member) => ({
        text: member.user.nickname,
        value: member.user.id
      }))
    },
    loadPlans() {
      this.loading = true
      testPlanApi
        .search(this.filter)
        .then((res) => {
          let results = highlight.highlight(res.data.results, this.filter.keyword, 'name')
          results.forEach((testPlan) => this.formatPlan(testPlan))
          this.testPlans = results
          this.totalElements = res.data.totalElements
          this.totalPages = res.data.totalPages
        })
        .finally(() => {
          setTimeout(() => {
            this.loading = false
          }, 200)
        })
    },
    formatPlan(testPlan) {
      if (testPlan.startDate) {
        testPlan.startDateFormatted = dayjs(testPlan.startDate).format('YYYY-MM-DD')
      }
      if (testPlan.endDate) {
        testPlan.endDateFormatted = dayjs(testPlan.endDate).format('YYYY-MM-DD')
      }
      return utils.formatCreateUpdateTime(testPlan)
    },
    sortChange(event) {
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

      this.filterChanged()
    },
    filterChanged() {
      this.filter.page = 1
      this.loadPlans()
    },
    pageChanged: function (page) {
      this.filter.page = page
      this.loadPlans()
    },
    pageSizeChanged(size) {
      this.filter.pageSize = size
      this.$store.set('testPlanListPageSize', this.filter.pageSize)
      this.filterChanged()
    },
    newPlan() {
      this.editingTestPlan = { id: null, projectId: this.projectId }
    },
    editPlan(row) {
      this.editingTestPlan = row
    },
    clonePlan(index, row) {
      testPlanApi.clone(row.id).then((res) => {
        ElMessage.success({
          message: this.$t('test.plan.edit.msg.cloneSuccess')
        })
        // insert the cloned plan right after the original plan
        const clonedPlan = res.data
        this.testPlans.splice(index, 0, this.formatPlan(clonedPlan))
        this.totalElements++
      })
    },
    testPlanClosed() {
      this.editingTestPlan = null
    },
    testPlanSaved(testPlan) {
      this.formatPlan(testPlan)
      let index = utils.indexInArray(this.testPlans, testPlan.id)
      if (index >= 0) {
        this.testPlans.splice(index, 1, testPlan)
      } else {
        this.testPlans.unshift(testPlan)
        this.totalElements++
      }
    },
    testPlanDeleted(testPlan) {
      let index = utils.indexInArray(this.testPlans, testPlan.id)
      if (index >= 0) {
        this.testPlans.splice(index, 1)
        this.totalElements--
      }
    },
    planClicked(row) {
      this.$router.push({ name: 'TestPlanDetails', params: { testPlanId: row.id } })
    },
    deletePlan(index, row) {
      ElMessageBox.confirm(
        this.$t('test.plan.edit.msg.delConfirmMsg', { planName: row.name }),
        this.$t('test.plan.edit.msg.delConfirmTitle'),
        {
          type: 'warning',
          dangerouslyUseHTMLString: true,
          draggable: true
        }
      )
        .then(() => {
          testPlanApi.delete(row.id).then((response) => {
            this.testPlans.splice(index, 1)
            this.totalElements--
            ElMessage.success(this.$t('test.plan.edit.msg.delSuccess'))
          })
        })
        .catch(() => {
          // Cancelled, do nothing
        })
    }
  }
}
</script>

<style lang="less" scoped>
.test-plan-list-page {
}
</style>

<style lang="less">
.test-plan-list-page {
  .owner-column,
  .creator-column {
    .cell {
      line-height: 1;
    }
  }
}
</style>
