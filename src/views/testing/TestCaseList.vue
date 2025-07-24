<template>
  <div class="test-case-list-page page">
    <div class="filter-row">
      <div class="left-part">
        <el-button
          :disabled="!project.isDeveloper"
          text
          type="primary"
          @click="newCase"
          icon="CirclePlusFilled"
          class="text-icon-btn"
          >{{ $t('test.case.list.filter.new') }}</el-button
        >
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
            @input="keywordChanged"></el-input>
        </el-form-item>
      </div>
    </div>
    <div class="main">
      <el-table
        :data="testCases"
        v-loading="loading"
        row-class-name="test-case-row clickable"
        :show-header="true"
        @row-click="caseClicked"
        @sort-change="sortChange">
        <el-table-column
          :label="$t('test.case.list.header.code')"
          prop="code"
          sortable="custom"
          width="85"
          align="center">
          <template #default="scope">
            <span class="case-name" v-html="scope.row.codeHighlightLabel || scope.row.code" />
          </template>
        </el-table-column>
        <el-table-column :label="$t('test.case.list.header.name')" min-width="120">
          <template #default="scope">
            <span class="case-name" v-html="scope.row['details.nameHighlightLabel'] || scope.row.details.name" />
          </template>
        </el-table-column>
        <el-table-column :label="$t('test.case.list.header.priority')" prop="priority" sortable="custom" min-width="30">
          <template #default="scope">
            <div v-if="scope.row.details.priority" class="flex">
              <PriorityIcon :priority="scope.row.details.priority" />
              <span class="ml-2">{{ $t(`issuePriorities.${scope.row.details.priority}`) }}</span>
            </div>
          </template>
        </el-table-column>
        <el-table-column v-if="!isInMobile" :label="$t('test.case.list.header.creator')" min-width="50" align="center">
          <template #default="scope">
            <el-tooltip
              v-if="scope.row.createdBy"
              :content="
                $t('test.case.list.table.creatorTip', {
                  nickname: scope.row.createdBy.nickname,
                  createdTime: scope.row.createdTimeFormatted
                })
              "
              placement="left">
              <avatar
                :name="scope.row.createdBy.nickname"
                :size="22"
                :src="scope.row.createdBy.avatarUrl"
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
                  <el-dropdown-item icon="Edit" @click.native="editCase(scope.row)">{{
                    $t('common.edit')
                  }}</el-dropdown-item>
                  <el-dropdown-item icon="DocumentCopy" @click.native="cloneCase(scope.$index, scope.row)">{{
                    $t('common.copy')
                  }}</el-dropdown-item>
                  <el-dropdown-item icon="Delete" @click.native="deleteCase(scope.$index, scope.row)">{{
                    $t('common.delete')
                  }}</el-dropdown-item>
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
</template>

<script>
import Avatar from '@/components/common/Avatar.vue'
import { testCaseApi } from '@/api/testCase.js'
import highlight from '@/utils/highlight.js'
import utils from '@/utils/util.js'
import dict from '@/locales/zh-cn/dict.json'
import { ElMessage, ElMessageBox } from 'element-plus'
import PriorityIcon from '@/components/common/PriorityIcon.vue'

export default {
  name: 'TestCaseList',
  components: {
    Avatar,
    PriorityIcon
  },
  data() {
    return {
      dict: dict,
      isInMobile: utils.isInMobile(),
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
      loading: false
    }
  },
  created() {
    this.project = this.$store.get('project')
  },
  mounted() {
    this.loadCases()
  },
  methods: {
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
      return utils.formatCreateUpdateTime(testCase)
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
      this.loadCases()
    },
    keywordChanged() {
      this.filter.page = 1
      this.loadCases()
    },
    pageChanged: function (page) {
      this.filter.page = page
      this.loadCases()
    },
    pageSizeChanged(size) {
      this.filter.pageSize = size
      this.filter.page = 1
      this.$store.set('testCaseListPageSize', this.filter.pageSize)
      this.loadCases()
    },
    newCase() {
      this.$router.push({ name: 'TestCaseEdit', params: { testCaseId: 'new' } })
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
          message: this.$t('test.case.list.msg.issueCopied')
        })
        // insert the cloned case right after the original case
        const clonedCase = res.data
        this.testCases.splice(index + 1, 0, this.formatCase(clonedCase))
        this.totalElements++
      })
    },
    caseClicked(row) {
      this.$router.push({ name: 'TestCaseEdit', params: { testCaseId: row.id } })
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
    }
  }
}
</script>

<style lang="less" scoped>
.test-case-list-page {
}
</style>
