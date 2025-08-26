<template>
  <div class="test-plan-details-page page">
    <div class="title">
      <div class="left-part">
        <span>{{ $t('test.plan.details.title') }}</span>
      </div>
      <div class="right-part">
        <el-button text type="primary" @click="$router.go(-1)" class="mr-1">
          {{ $t('common.back') }}
        </el-button>
        <el-dropdown trigger="click" placement="bottom">
          <el-icon class="more-action-icon"><MoreFilled /></el-icon>
          <template #dropdown>
            <el-dropdown-menu>
              <el-dropdown-item icon="Edit" @click.native="togglePlanEdit">{{ $t('common.edit') }}</el-dropdown-item>
              <el-dropdown-item icon="DocumentCopy" @click.native="clonePlan">{{ $t('common.copy') }}</el-dropdown-item>
              <el-dropdown-item icon="Delete" @click.native="deletePlan">{{ $t('common.delete') }}</el-dropdown-item>
            </el-dropdown-menu>
          </template>
        </el-dropdown>
      </div>
    </div>
    <div class="basics">
      <el-row>
        <el-col :span="6" class="flex">
          <div class="label">{{ $t('test.plan.edit.name') }}</div>
          <div class="value">{{ testPlan.name }}</div>
        </el-col>
        <el-col :span="6" class="flex items-center">
          <div class="label">{{ $t('test.plan.details.caseCount') }}</div>
          <div class="value">{{ testPlan.caseCount }}</div>
        </el-col>
        <el-col :span="6" class="flex items-center">
          <div class="label">{{ $t('test.plan.details.executedCount') }}</div>
          <div class="value">{{ testPlan.executedCount }}</div>
        </el-col>
        <el-col :span="6" class="flex items-center">
          <div class="label">{{ $t('test.plan.details.progress') }}</div>
          <div class="value"><el-progress :percentage="testPlan.progress" class="max-w-130px" /></div>
        </el-col>
      </el-row>
      <el-row>
        <el-col :span="6" class="flex">
          <div class="label">{{ $t('test.plan.edit.type') }}</div>
          <div class="value">
            {{ testPlan.type ? $t(`testTypes.${testPlan.type}`) : '--' }}
          </div>
        </el-col>
        <el-col :span="6" class="flex">
          <div class="label">{{ $t('test.plan.edit.owner') }}</div>
          <div class="value flex">
            <Avatar
              v-if="testPlan.owner"
              :name="testPlan.owner.nickname"
              :size="22"
              :src="testPlan.owner.avatarUrl"
              inline />
            <span class="ml-2">{{ testPlan.owner?.nickname || '--' }}</span>
          </div>
        </el-col>
        <el-col :span="6" class="flex">
          <div class="label">{{ $t('test.plan.edit.startDate') }}</div>
          <div class="value">{{ testPlan.startDateFormatted || '--' }}</div>
        </el-col>
        <el-col :span="6" class="flex">
          <div class="label">{{ $t('test.plan.edit.endDate') }}</div>
          <div class="value">{{ testPlan.endDateFormatted || '--' }}</div>
        </el-col>
      </el-row>
    </div>
    <el-tabs v-if="testPlan.id" v-model="activeTab" type="card" class="mt-10">
      <el-tab-pane :label="$t('test.plan.details.tabCases')" name="cases">
        <TestPlanItems :test-plan-id="testPlan.id" :testPlan="testPlan" @itemChanged="loadPlan" />
      </el-tab-pane>
      <el-tab-pane lazy :label="$t('test.plan.details.tabBugs')" name="bugs">
        <IssueListNew
          :project-id="projectId"
          :test-plan="testPlan"
          :issue-filter="issueFilter"
          :show-export-btn="false"
          :empty-text="$t('test.plan.details.noBugs')" />
      </el-tab-pane>
      <el-tab-pane lazy :label="$t('test.plan.details.tabReports')" name="reports">
        <TestReportList :showEmptyIcon="false" />
      </el-tab-pane>
    </el-tabs>
  </div>
  <TestPlanEdit
    v-if="planEditVisible"
    :testPlanId="testPlanId"
    :project="project"
    @testPlanClosed="togglePlanEdit"
    @testPlanSaved="testPlanSaved"
    @testPlanDeleted="returnToList" />
</template>

<script>
import { testPlanApi } from '@/api/testing.js'
import dayjs from 'dayjs'
import { ElMessage, ElMessageBox } from 'element-plus'
import Avatar from '@/components/common/Avatar.vue'
import TestPlanItems from './TestPlanItems.vue'
import TestPlanEdit from './TestPlanEdit.vue'
import IssueListNew from '@/components/issue/IssueListNew.vue'
import TestReportList from './TestReportList.vue'

export default {
  name: 'TestPlanDetails',
  components: {
    Avatar,
    TestPlanItems,
    TestPlanEdit,
    IssueListNew,
    TestReportList
  },
  props: {},
  data() {
    return {
      projectId: this.$route.params.projectId,
      project: {},
      testPlanId: this.$route.params.testPlanId,
      testPlan: {},
      activeTab: 'cases',
      issueFilter: {
        testPlanId: this.$route.params.testPlanId,
        types: ['BUG']
      },
      planEditVisible: false
    }
  },
  computed: {},
  created() {
    this.project = this.$store.get('project')
    if (this.testPlanId) {
      this.loadPlan()
    } else {
      console.error('Test plan ID is missing in route params.')
    }
  },
  mounted() {},
  methods: {
    loadPlan() {
      testPlanApi.get(this.testPlanId).then((response) => {
        this.testPlan = response.data
        this.formatPlan(this.testPlan)
      })
    },
    formatPlan(testPlan) {
      if (testPlan.startDate) {
        testPlan.startDateFormatted = dayjs(testPlan.startDate).format('YYYY-MM-DD')
      }
      if (testPlan.endDate) {
        testPlan.endDateFormatted = dayjs(testPlan.endDate).format('YYYY-MM-DD')
      }
    },
    togglePlanEdit() {
      this.planEditVisible = !this.planEditVisible
    },
    clonePlan() {
      testPlanApi.clone(this.testPlanId).then((res) => {
        ElMessage.success({
          message: this.$t('test.plan.edit.msg.cloneSuccess')
        })
        this.$router.push({ name: 'TestPlanDetails', params: { projectId: this.projectId, testPlanId: res.data.id } })
      })
    },
    deletePlan() {
      ElMessageBox.confirm(
        this.$t('test.plan.edit.msg.delConfirmMsg', { planName: this.testPlan.name }),
        this.$t('test.plan.edit.msg.delConfirmTitle'),
        {
          type: 'warning',
          dangerouslyUseHTMLString: true,
          draggable: true
        }
      )
        .then(() => {
          testPlanApi.delete(this.testPlan.id).then(() => {
            ElMessage.success(this.$t('test.plan.edit.msg.delSuccess'))
            this.returnToList()
          })
        })
        .catch(() => {
          // Cancelled, do nothing
        })
    },
    testPlanSaved(savedPlan) {
      this.testPlan = savedPlan
      this.formatPlan(this.testPlan)
    },
    returnToList() {
      this.$router.push({ name: 'TestPlanList', params: { projectId: this.projectId } })
    }
  }
}
</script>

<style lang="less" scoped>
.test-plan-details-page {
  .title {
    display: flex;
    justify-content: space-between;

    .left-part {
      display: flex;
      align-items: center;
    }

    .right-part {
      display: flex;
      align-items: center;
      margin-left: auto;
    }
  }

  .basics {
    .el-row {
      margin-bottom: 16px;
      color: var(--el-text-color-regular);
      font-size: 14px;
      line-height: 1.5;

      .label {
        width: 80px;
        font-weight: 500;
      }

      .value {
        flex: 1;
      }
    }
  }
}
</style>

<style lang="less">
.test-plan-details-page {
  .test-reports-list-page {
    padding: unset !important;
  }
}
</style>
