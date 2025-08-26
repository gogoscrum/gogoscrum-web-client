<template>
  <div class="test-report-details-page page">
    <div class="title">
      <div class="left-part">
        <span>{{ report.id ? $t('test.report.details.titleEdit') : $t('test.report.details.titleNew') }}</span>
      </div>
      <div class="right-part">
        <el-button text type="primary" @click="$router.go(-1)">
          {{ $t('common.back') }}
        </el-button>
        <el-dropdown v-if="report.id" trigger="click" placement="bottom">
          <el-icon class="more-action-icon ml-5"><MoreFilled /></el-icon>
          <template #dropdown>
            <el-dropdown-menu>
              <el-dropdown-item icon="Delete" @click.native="deleteReport">{{ $t('common.delete') }}</el-dropdown-item>
            </el-dropdown-menu>
          </template>
        </el-dropdown>
      </div>
    </div>
    <el-form
      :model="report"
      label-position="left"
      require-asterisk-position="right"
      ref="testReportForm"
      :rules="rules"
      label-width="110px">
      <el-row>
        <el-col :span="12">
          <el-form-item prop="testPlan" :label="$t('test.report.details.planName')">
            <TestPlanSelector v-model="report.testPlan" :projectId="projectId" disabled></TestPlanSelector>
          </el-form-item>
        </el-col>
        <el-col :span="8" :offset="4">
          <el-form-item prop="owner" :label="$t('test.report.details.owner')">
            <MemberSelector
              v-model="report.owner"
              :placeholder="$t('test.report.details.ownerPlaceholder')"
              :members="project.projectMembers"
              :clearable="true" />
          </el-form-item>
        </el-col>
      </el-row>
      <el-form-item prop="name" :label="$t('test.report.details.reportName')">
        <el-input v-model="report.name" clearable></el-input>
      </el-form-item>
      <el-form-item :label="$t('test.report.details.description')">
        <el-input
          type="textarea"
          v-model="report.description"
          :rows="4"
          :placeholder="$t('test.report.details.descriptionPlaceholder')"></el-input>
      </el-form-item>

      <el-row>
        <el-col :span="8">
          <el-form-item :label="$t('test.report.details.startDate')">
            <el-date-picker
              v-model="report.startDate"
              type="date"
              value-format="YYYY-MM-DD"
              :placeholder="$t('test.report.details.startDate')"
              :teleported="false"
              :disabled-date="disabledStartDate"
              class="w-full">
            </el-date-picker>
          </el-form-item>
        </el-col>
        <el-col :span="8">
          <el-form-item :label="$t('test.report.details.endDate')">
            <el-date-picker
              v-model="report.endDate"
              type="date"
              value-format="YYYY-MM-DD"
              :placeholder="$t('test.report.details.endDate')"
              :teleported="false"
              :disabled-date="disabledEndDate"
              class="w-full">
            </el-date-picker>
          </el-form-item>
        </el-col>
        <el-col :span="8">
          <el-form-item v-if="report.createdTimeFormatted" :label="$t('test.report.details.createdTime')">
            {{ report.createdTimeFormatted }}
          </el-form-item>
        </el-col>
      </el-row>
    </el-form>

    <div class="section summary">
      <div class="sub-title">{{ $t('test.report.details.summary') }}</div>
      <el-row>
        <el-col :span="8">
          <div class="label">{{ $t('test.report.details.caseCount') }}</div>
          <div class="value">{{ report.caseSummary?.caseCount }}</div>
        </el-col>
        <el-col :span="8">
          <div class="label">{{ $t('test.report.details.executedCaseCount') }}</div>
          <div>{{ report.caseSummary?.executedCaseCount }}</div>
        </el-col>
        <el-col :span="8">
          <div class="label flex items-center">
            <div>{{ $t('test.report.details.testRate') }}</div>
            <el-tooltip :content="$t('test.report.details.testRateTip')">
              <el-icon class="text-base ml-1 text-gray-400"><QuestionFilled /></el-icon>
            </el-tooltip>
          </div>
          <div>{{ report.caseSummary?.caseTestRate }}%</div>
        </el-col>
      </el-row>
      <el-row>
        <el-col :span="8">
          <div class="label">{{ $t('test.report.details.bugCount') }}</div>
          <div class="value">{{ report.bugSummary?.bugCount }}</div>
        </el-col>
        <el-col :span="8">
          <div class="label">{{ $t('test.report.details.failedCaseCount') }}</div>
          <div class="value">{{ report.caseSummary?.caseByStatusSummary?.FAILED }}</div>
        </el-col>
        <el-col :span="8">
          <div class="label flex items-center">
            <div>{{ $t('test.report.details.passRate') }}</div>
            <el-tooltip :content="$t('test.report.details.passRateTip')">
              <el-icon class="text-base ml-1 text-gray-400"><QuestionFilled /></el-icon>
            </el-tooltip>
          </div>
          <div class="value">{{ report.caseSummary?.casePassRate }}%</div>
        </el-col>
      </el-row>
    </div>

    <!-- Case statistics start -->
    <div class="section">
      <div class="sub-title">{{ $t('test.report.details.caseStatisticsTitle') }}</div>
      <div class="chart-and-table">
        <div class="chart">
          <ECharts v-if="caseByStatusChartOptions" class="chart-body" :option="caseByStatusChartOptions" />
        </div>
        <div class="table">
          <el-table :data="caseByStatusSummaryTable" class="tight-table">
            <el-table-column prop="status" :label="$t('test.report.details.executionResult')" min-width="80">
              <template #default="scope">
                <div v-if="scope.row.status === 'NOT_TESTED'" class="flex items-center">
                  <el-icon class="text-lg mr-8px">
                    <Remove />
                  </el-icon>
                  <span>{{ scope.row.label }}</span>
                </div>
                <TestRunStatusIcon v-else :status="scope.row.status" showLabel />
              </template>
            </el-table-column>
            <el-table-column prop="count" :label="$t('test.report.details.count')" min-width="30" align="center" />
            <el-table-column
              prop="percentage"
              :label="$t('test.report.details.percentage')"
              min-width="30"
              align="right" />
          </el-table>
        </div>
      </div>
    </div>

    <div class="section">
      <div class="chart-and-table">
        <div class="chart">
          <ECharts v-if="caseByTypeChartOptions" class="chart-body" :option="caseByTypeChartOptions" />
        </div>
        <div class="table">
          <el-table :data="caseByTypeSummaryTable" class="tight-table">
            <el-table-column prop="type" :label="$t('test.report.details.testType')" min-width="80">
              <template #default="scope">
                <span>{{ scope.row.label }}</span>
              </template>
            </el-table-column>
            <el-table-column prop="count" :label="$t('test.report.details.count')" min-width="30" align="center" />
            <el-table-column
              prop="percentage"
              :label="$t('test.report.details.percentage')"
              min-width="30"
              align="right" />
          </el-table>
        </div>
      </div>
    </div>

    <div class="section">
      <div class="chart-and-table">
        <div class="chart">
          <ECharts v-if="caseByComponentChartOptions" class="chart-body" :option="caseByComponentChartOptions" />
        </div>
        <div class="table">
          <el-table :data="caseByComponentSummaryTable">
            <el-table-column prop="component" :label="$t('test.report.details.component')" min-width="80">
              <template #default="scope">
                <span>{{ scope.row.label }}</span>
              </template>
            </el-table-column>
            <el-table-column prop="count" :label="$t('test.report.details.count')" min-width="30" align="center" />
            <el-table-column
              prop="percentage"
              :label="$t('test.report.details.percentage')"
              min-width="30"
              align="right" />
          </el-table>
        </div>
      </div>
    </div>

    <div class="section">
      <div class="chart-and-table">
        <div class="chart">
          <ECharts v-if="caseByExecutorChartOptions" class="chart-body" :option="caseByExecutorChartOptions" />
        </div>
        <div class="table">
          <el-table :data="caseByExecutorSummaryTable">
            <el-table-column prop="executor" :label="$t('test.report.details.executor')" min-width="80">
              <template #default="scope">
                <span>
                  <Avatar
                    v-if="scope.row.user"
                    :name="scope.row.user.nickname"
                    :size="22"
                    :src="scope.row.user.avatarUrl"
                    showName></Avatar>
                </span>
              </template>
            </el-table-column>
            <el-table-column prop="count" :label="$t('test.report.details.count')" min-width="30" align="center" />
            <el-table-column
              prop="percentage"
              :label="$t('test.report.details.percentage')"
              min-width="30"
              align="right" />
          </el-table>
        </div>
      </div>
    </div>
    <!-- Case statistics end -->

    <!-- Bug statistics start -->
    <div class="section">
      <div class="sub-title">{{ $t('test.report.details.bugStatisticsTitle') }}</div>
      <div class="chart-and-table">
        <div class="chart">
          <ECharts v-if="bugByPriorityChartOptions" class="chart-body" :option="bugByPriorityChartOptions" />
        </div>
        <div class="table">
          <el-table :data="bugByPrioritySummaryTable" class="tight-table">
            <el-table-column prop="priority" :label="$t('test.report.details.priority')" min-width="80">
              <template #default="scope">
                <PriorityIcon :priority="scope.row.priority" showLabel />
              </template>
            </el-table-column>
            <el-table-column prop="count" :label="$t('test.report.details.count')" min-width="30" align="center" />
            <el-table-column
              prop="percentage"
              :label="$t('test.report.details.percentage')"
              min-width="30"
              align="right" />
          </el-table>
        </div>
      </div>
    </div>

    <div class="section">
      <div class="chart-and-table">
        <div class="chart">
          <ECharts v-if="bugByStatusChartOptions" class="chart-body" :option="bugByStatusChartOptions" />
        </div>
        <div class="table">
          <el-table :data="bugByStatusSummaryTable" class="tight-table">
            <el-table-column prop="label" :label="$t('test.report.details.bugStatus')" min-width="80">
            </el-table-column>
            <el-table-column prop="count" :label="$t('test.report.details.count')" min-width="30" align="center" />
            <el-table-column
              prop="percentage"
              :label="$t('test.report.details.percentage')"
              min-width="30"
              align="right" />
          </el-table>
        </div>
      </div>
    </div>

    <div class="section">
      <div class="chart-and-table">
        <div class="chart">
          <ECharts v-if="bugByComponentChartOptions" class="chart-body" :option="bugByComponentChartOptions" />
        </div>
        <div class="table">
          <el-table :data="bugByComponentSummaryTable" class="tight-table">
            <el-table-column prop="label" :label="$t('test.report.details.component')" min-width="80">
            </el-table-column>
            <el-table-column prop="count" :label="$t('test.report.details.count')" min-width="30" align="center" />
            <el-table-column
              prop="percentage"
              :label="$t('test.report.details.percentage')"
              min-width="30"
              align="right" />
          </el-table>
        </div>
      </div>
    </div>

    <div class="section">
      <div class="chart-and-table">
        <div class="chart">
          <ECharts v-if="bugByCreatorChartOptions" class="chart-body" :option="bugByCreatorChartOptions" />
        </div>
        <div class="table">
          <el-table :data="bugByCreatorSummaryTable" class="tight-table">
            <el-table-column prop="label" :label="$t('test.report.details.creator')" min-width="80">
              <template #default="scope">
                <span>
                  <Avatar
                    v-if="scope.row.user"
                    :name="scope.row.user.nickname"
                    :size="22"
                    :src="scope.row.user.avatarUrl"
                    showName></Avatar>
                </span>
              </template>
            </el-table-column>
            <el-table-column prop="count" :label="$t('test.report.details.count')" min-width="30" align="center" />
            <el-table-column
              prop="percentage"
              :label="$t('test.report.details.percentage')"
              min-width="30"
              align="right" />
          </el-table>
        </div>
      </div>
    </div>

    <div class="section">
      <div class="chart-and-table">
        <div class="chart">
          <ECharts v-if="bugByAssigneeChartOptions" class="chart-body" :option="bugByAssigneeChartOptions" />
        </div>
        <div class="table">
          <el-table :data="bugByAssigneeSummaryTable" class="tight-table">
            <el-table-column prop="label" :label="$t('test.report.details.assignee')" min-width="80">
              <template #default="scope">
                <span>
                  <Avatar
                    v-if="scope.row.user"
                    :name="scope.row.user.nickname"
                    :size="22"
                    :src="scope.row.user.avatarUrl"
                    showName></Avatar>
                </span>
              </template>
            </el-table-column>
            <el-table-column prop="count" :label="$t('test.report.details.count')" min-width="30" align="center" />
            <el-table-column
              prop="percentage"
              :label="$t('test.report.details.percentage')"
              min-width="30"
              align="right" />
          </el-table>
        </div>
      </div>
    </div>
    <!-- Bug statistics end -->

    <el-tabs v-model="activeTab" type="card" class="mt-10">
      <el-tab-pane :label="$t('test.report.details.caseList')" name="cases">
        <TestPlanItems
          v-if="testPlanId || report.testPlan?.id"
          :test-plan-id="testPlanId || report.testPlan?.id"
          hideFilter
          readonly />
      </el-tab-pane>
      <el-tab-pane lazy :label="$t('test.report.details.bugList')" name="bugs">
        <IssueListNew
          :project-id="projectId"
          :test-plan="report.testPlan"
          :issue-filter="issueFilter"
          hideFilter
          readonly
          :empty-text="$t('test.report.details.noBugs')" />
      </el-tab-pane>
    </el-tabs>

    <div class="footer">
      <el-button
        v-if="report.id && project.isDeveloper"
        type="danger"
        icon="Delete"
        class="delete-case-button no-border"
        plain
        size="default"
        @click="deleteReport"
        >{{ $t('common.delete') }}</el-button
      >
      <div class="flex ml-auto">
        <el-button size="default" class="no-border" @click="$router.go(-1)">{{ $t('common.cancel') }}</el-button>
        <el-button
          :disabled="!project.isDeveloper"
          :loading="saving"
          size="default"
          type="primary"
          class="no-border"
          @click="saveReport"
          >{{ report.id ? $t('common.update') : $t('common.create') }}</el-button
        >
      </div>
    </div>
  </div>
</template>

<script>
import { testReportApi } from '@/api/testing.js'
import { componentApi } from '@/api/component.js'
import dayjs from 'dayjs'
import { ElMessage, ElMessageBox } from 'element-plus'
import Avatar from '@/components/common/Avatar.vue'
import TestPlanItems from './TestPlanItems.vue'
import TestPlanEdit from './TestPlanEdit.vue'
import IssueListNew from '@/components/issue/IssueListNew.vue'
import MemberSelector from '@/components/common/MemberSelector.vue'
import TestPlanSelector from '@/components/testing/TestPlanSelector.vue'
import TestRunStatusIcon from '@/components/testing/TestRunStatusIcon.vue'
import PriorityIcon from '@/components/common/PriorityIcon.vue'
import ECharts from 'vue-echarts'
import 'echarts'

export default {
  name: 'TestPlanDetails',
  components: {
    MemberSelector,
    Avatar,
    TestPlanItems,
    TestPlanEdit,
    IssueListNew,
    TestPlanSelector,
    TestRunStatusIcon,
    PriorityIcon,
    ECharts
  },
  props: {},
  data() {
    return {
      projectId: this.$route.params.projectId,
      project: {},
      testPlanId: this.$route.params.testPlanId,
      reportId: this.$route.params.reportId,
      report: {},
      activeTab: 'cases',
      issueFilter: {
        testPlanId: null,
        types: ['BUG']
      },
      components: [],
      saving: false,
      rules: {
        testPlan: [
          {
            required: true,
            message: this.$t('test.report.details.testPlanMissing'),
            trigger: 'blur'
          }
        ],
        owner: [
          {
            required: true,
            message: this.$t('test.report.details.ownerMissing'),
            trigger: 'blur'
          }
        ],
        name: [
          {
            required: true,
            message: this.$t('test.report.details.reportNameMissing'),
            trigger: 'blur'
          }
        ]
      },
      caseByStatusSummaryTable: [],
      caseByStatusChartOptions: null,
      caseByTypeSummaryTable: [],
      caseByTypeChartOptions: null,
      caseByComponentSummaryTable: [],
      caseByComponentChartOptions: null,
      caseByExecutorSummaryTable: [],
      caseByExecutorChartOptions: null,
      bugByStatusSummaryTable: [],
      bugByStatusChartOptions: null,
      bugByPrioritySummaryTable: [],
      bugByPriorityChartOptions: null,
      bugByComponentSummaryTable: [],
      bugByComponentChartOptions: null,
      bugByCreatorSummaryTable: [],
      bugByCreatorChartOptions: null,
      bugByAssigneeSummaryTable: [],
      bugByAssigneeChartOptions: null
    }
  },
  computed: {},
  created() {
    this.project = this.$store.get('project')
    this.initProjectUsersMap()
    this.loadComponents()

    if (this.reportId) {
      this.loadReport()
    } else if (this.testPlanId) {
      this.previewReport()
    } else {
      console.error('Test report ID or test plan ID is required in route params.')
    }
  },
  mounted() {},
  methods: {
    initProjectUsersMap() {
      // put the project member users into a map with the key of user ID and value of user object
      this.projectUsersMap = new Map()
      this.project.projectMembers.forEach((member) => {
        this.projectUsersMap.set(member.user.id, member.user)
      })
    },
    loadComponents() {
      componentApi.getTree(this.projectId).then((res) => {
        this.components = res.data?.children || []
        // put all the component into an array
        this.components = this.components.flatMap((component) => this.flattenComponent(component))
      })
    },
    flattenComponent(component) {
      const flattened = [component]
      if (component.children) {
        component.children.forEach((child) => {
          flattened.push(...this.flattenComponent(child))
        })
      }
      return flattened
    },
    loadReport() {
      testReportApi.get(this.reportId).then((response) => {
        this.report = response.data
        this.formatReport(this.report)
        this.issueFilter.testPlanId = this.report.testPlan.id
      })
    },
    previewReport() {
      testReportApi.preview(this.testPlanId).then((res) => {
        this.report = res.data
        this.formatReport(this.report)
      })
      this.issueFilter.testPlanId = this.testPlanId
    },
    formatReport(report) {
      if (report.startDate) {
        report.startDateFormatted = dayjs(report.startDate).format('YYYY-MM-DD')
      }
      if (report.endDate) {
        report.endDateFormatted = dayjs(report.endDate).format('YYYY-MM-DD')
      }

      this.initCaseByStatusSummaryTable(report)
      this.initCaseByTypeSummaryTable(report)
      this.initCaseByComponentSummaryTable(report)
      this.initCaseByExecutorSummaryTable(report)

      this.initBugByPrioritySummaryTable(report)
      this.initBugByStatusSummaryTable(report)
      this.initBugByComponentSummaryTable(report)
      this.initBugByCreatorSummaryTable(report)
      this.initBugByAssigneeSummaryTable(report)

      // Set default name for new report
      if (!report.name) {
        report.name = this.$t('test.report.details.reportNameTemplate', { planName: report.testPlan.name })
      }
    },
    initCaseByStatusSummaryTable(report) {
      if (report.caseSummary?.caseByStatusSummary) {
        this.caseByStatusSummaryTable = Object.entries(report.caseSummary.caseByStatusSummary).map(
          ([status, count]) => {
            return {
              status,
              label: this.$t(`testRunStatuses.${status}`),
              count,
              percentage: ((count / report.caseSummary.caseCount) * 100).toFixed(1) + '%'
            }
          }
        )
        const notTestedCount = report.caseSummary.caseCount - report.caseSummary.executedCaseCount

        if (notTestedCount > 0) {
          this.caseByStatusSummaryTable.push({
            status: 'NOT_TESTED',
            label: this.$t('test.report.details.caseNotTested'),
            count: notTestedCount,
            percentage: ((notTestedCount / report.caseSummary.caseCount) * 100).toFixed(1) + '%'
          })
        }

        this.caseByStatusChartOptions = this.initChartOptions(
          this.$t('test.report.details.caseByStatusTitle'),
          this.$t('test.report.details.executionResult'),
          this.caseByStatusSummaryTable,
          ['#09aa04', '#ff4444', '#ff9900', '#a1a5a1', '#cccccc']
        )
      }
    },
    initCaseByTypeSummaryTable(report) {
      if (report.caseSummary?.caseByTypeSummary) {
        this.caseByTypeSummaryTable = Object.entries(report.caseSummary.caseByTypeSummary).map(([type, count]) => {
          return {
            type,
            label: type === 'NOT_SET' ? this.$t('test.report.details.caseWithoutType') : this.$t(`testTypes.${type}`),
            count,
            percentage: ((count / report.caseSummary.caseCount) * 100).toFixed(1) + '%'
          }
        })
        this.caseByTypeChartOptions = this.initChartOptions(
          this.$t('test.report.details.caseByTypeTitle'),
          this.$t('test.report.details.testType'),
          this.caseByTypeSummaryTable
        )
      }
    },
    initCaseByComponentSummaryTable(report) {
      if (report.caseSummary?.caseByComponentSummary) {
        this.caseByComponentSummaryTable = Object.entries(report.caseSummary.caseByComponentSummary).map(
          ([component, count]) => {
            return {
              componentId: component,
              label:
                this.components.find((c) => c.id === component)?.name || this.$t('test.report.details.componentNotSet'),
              count,
              percentage: ((count / report.caseSummary.caseCount) * 100).toFixed(1) + '%'
            }
          }
        )

        this.caseByComponentChartOptions = this.initChartOptions(
          this.$t('test.report.details.caseByComponentTitle'),
          this.$t('test.report.details.component'),
          this.caseByComponentSummaryTable
        )
      }
    },
    initCaseByExecutorSummaryTable(report) {
      if (report.caseSummary?.caseByExecutorSummary) {
        this.caseByExecutorSummaryTable = Object.entries(report.caseSummary.caseByExecutorSummary).map(
          ([executor, count]) => {
            return {
              user: this.projectUsersMap.get(executor),
              label: this.projectUsersMap.get(executor)?.nickname || executor,
              count,
              percentage: ((count / report.caseSummary.caseCount) * 100).toFixed(1) + '%'
            }
          }
        )

        const notTestedCount = report.caseSummary.caseCount - report.caseSummary.executedCaseCount

        if (notTestedCount > 0) {
          this.caseByExecutorSummaryTable.push({
            user: { nickname: this.$t('test.report.details.caseNotTested') },
            label: this.$t('test.report.details.caseNotTested'),
            count: notTestedCount,
            percentage: ((notTestedCount / report.caseSummary.caseCount) * 100).toFixed(1) + '%'
          })
        }

        this.caseByExecutorChartOptions = this.initChartOptions(
          this.$t('test.report.details.caseByExecutorTitle'),
          this.$t('test.report.details.executor'),
          this.caseByExecutorSummaryTable
        )
      }
    },
    initBugByPrioritySummaryTable(report) {
      if (report.bugSummary?.bugByPrioritySummary) {
        this.bugByPrioritySummaryTable = Object.entries(report.bugSummary.bugByPrioritySummary).map(
          ([priority, count]) => {
            return {
              priority,
              label: this.$t(`issuePriorities.${priority}`),
              count,
              percentage: ((count / report.bugSummary.bugCount) * 100).toFixed(1) + '%'
            }
          }
        )

        this.bugByPriorityChartOptions = this.initChartOptions(
          this.$t('test.report.details.bugByPriorityTitle'),
          this.$t('test.report.details.priority'),
          this.bugByPrioritySummaryTable
        )
      }
    },
    initBugByStatusSummaryTable(report) {
      if (report.bugSummary?.bugByStatusSummary) {
        this.bugByStatusSummaryTable = Object.entries(report.bugSummary.bugByStatusSummary).map(([status, count]) => {
          return {
            label: status,
            count,
            percentage: ((count / report.bugSummary.bugCount) * 100).toFixed(1) + '%'
          }
        })

        this.bugByStatusChartOptions = this.initChartOptions(
          this.$t('test.report.details.bugByStatusTitle'),
          this.$t('test.report.details.bugStatus'),
          this.bugByStatusSummaryTable
        )
      }
    },
    initBugByComponentSummaryTable(report) {
      if (report.bugSummary?.bugByComponentSummary) {
        let bugWithComponentCount = 0

        this.bugByComponentSummaryTable = Object.entries(report.bugSummary.bugByComponentSummary).map(
          ([component, count]) => {
            bugWithComponentCount += Number(count)
            return {
              componentId: component,
              label: this.components.find((c) => c.id === component)?.name,
              count,
              percentage: ((count / report.bugSummary.bugCount) * 100).toFixed(1) + '%'
            }
          }
        )

        const bugWithoutComponentCount = report.bugSummary.bugCount - bugWithComponentCount

        if (bugWithoutComponentCount > 0) {
          this.bugByComponentSummaryTable.push({
            componentId: 0,
            label: this.$t('test.report.details.componentNotSet'),
            count: bugWithoutComponentCount,
            percentage: ((bugWithoutComponentCount / report.bugSummary.bugCount) * 100).toFixed(1) + '%'
          })
        }

        this.bugByComponentChartOptions = this.initChartOptions(
          this.$t('test.report.details.bugByComponentTitle'),
          this.$t('test.report.details.component'),
          this.bugByComponentSummaryTable
        )
      }
    },
    initBugByCreatorSummaryTable(report) {
      if (report.bugSummary?.bugByCreatorSummary) {
        this.bugByCreatorSummaryTable = Object.entries(report.bugSummary.bugByCreatorSummary).map(
          ([creator, count]) => {
            return {
              user: this.projectUsersMap.get(creator),
              label: this.projectUsersMap.get(creator)?.nickname || creator,
              count,
              percentage: ((count / report.bugSummary.bugCount) * 100).toFixed(1) + '%'
            }
          }
        )

        this.bugByCreatorChartOptions = this.initChartOptions(
          this.$t('test.report.details.bugByCreatorTitle'),
          this.$t('test.report.details.creator'),
          this.bugByCreatorSummaryTable
        )
      }
    },
    initBugByAssigneeSummaryTable(report) {
      if (report.bugSummary?.bugByAssigneeSummary) {
        let bugWithAssigneeCount = 0
        this.bugByAssigneeSummaryTable = Object.entries(report.bugSummary.bugByAssigneeSummary).map(
          ([assignee, count]) => {
            bugWithAssigneeCount += Number(count)
            return {
              user: this.projectUsersMap.get(assignee),
              label: this.projectUsersMap.get(assignee)?.nickname || assignee,
              count,
              percentage: ((count / report.bugSummary.bugCount) * 100).toFixed(1) + '%'
            }
          }
        )

        const bugWithoutAssigneeCount = report.bugSummary.bugCount - bugWithAssigneeCount

        if (bugWithoutAssigneeCount > 0) {
          this.bugByAssigneeSummaryTable.push({
            user: { nickname: this.$t('test.report.details.assigneeNotSet') },
            label: this.$t('test.report.details.assigneeNotSet'),
            count: bugWithoutAssigneeCount,
            percentage: ((bugWithoutAssigneeCount / report.bugSummary.bugCount) * 100).toFixed(1) + '%'
          })
        }

        this.bugByAssigneeChartOptions = this.initChartOptions(
          this.$t('test.report.details.bugByAssigneeTitle'),
          this.$t('test.report.details.assignee'),
          this.bugByAssigneeSummaryTable
        )
      }
    },
    /**
     * Initialize chart options for all pie charts
     * @param chartTitle Title displayed on the chart
     * @param seriesName Series name
     * @param dataList Data list
     */
    initChartOptions(chartTitle, seriesName, dataList, colors) {
      const options = {
        title: {
          text: chartTitle,
          left: 'center'
        },
        tooltip: {
          trigger: 'item'
        },
        legend: {
          orient: 'horizontal',
          left: 'center',
          bottom: 0
        },
        series: [
          {
            name: seriesName,
            type: 'pie',
            radius: '50%',
            data: dataList.map((item) => ({
              value: item.count,
              name: item.label
            })),
            emphasis: {
              itemStyle: {
                shadowBlur: 10,
                shadowOffsetX: 0,
                shadowColor: 'rgba(0, 0, 0, 0.5)'
              }
            }
          }
        ]
      }

      if (colors && colors.length > 0) {
        options.color = colors
      }

      return options
    },
    disabledStartDate(date) {
      if (!this.report.endDate) return false
      return dayjs(date).isAfter(dayjs(this.report.endDate))
    },
    disabledEndDate(date) {
      if (!this.report.startDate) return false
      return dayjs(date).isBefore(dayjs(this.report.startDate))
    },
    saveReport() {
      this.$refs.testReportForm.validate((valid) => {
        if (valid) {
          this.saving = true
          const apiCall = this.report.id
            ? testReportApi.update(this.report.id, this.report)
            : testReportApi.create(this.report)
          apiCall
            .then((res) => {
              ElMessage.success(
                this.report.id
                  ? this.$t('test.report.details.updatedSuccess')
                  : this.$t('test.report.details.createdSuccess')
              )

              if (!this.reportId) {
                this.$router.replace({
                  name: 'TestReportDetails',
                  params: { projectId: this.projectId, reportId: res.data.id }
                })
              } else {
                this.report = res.data
              }
            })
            .finally(() => {
              this.saving = false
            })
        } else {
          ElMessage.error({
            message: this.$t('common.msg.formValidationFail')
          })
          return false
        }
      })
    },
    deleteReport() {
      ElMessageBox.confirm(
        this.$t('test.report.details.delConfirmMsg', { reportName: this.report.name }),
        this.$t('test.report.details.delConfirmTitle'),
        {
          type: 'warning',
          dangerouslyUseHTMLString: true,
          draggable: true
        }
      )
        .then(() => {
          testReportApi.delete(this.report.id).then(() => {
            ElMessage.success(this.$t('test.report.details.delSuccess'))
            this.returnToList()
          })
        })
        .catch(() => {
          // Cancelled, do nothing
        })
    },
    returnToList() {
      this.$router.push({ name: 'TestReportList', params: { projectId: this.projectId } })
    }
  }
}
</script>

<style lang="less" scoped>
.test-report-details-page {
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

  .section {
    margin-top: 80px;

    .sub-title {
      font-size: 16px;
      font-weight: 500;
      margin: 24px 0;
    }

    .chart-and-table {
      display: flex;
      align-items: center;
      margin-top: 50px;
      margin-bottom: 120px;

      .chart {
        width: 45%;
        padding-right: 5%;
        display: flex;
        place-content: center;

        .chart-body {
          height: 300px;
        }
      }

      .table {
        width: 45%;
        padding-left: 5%;
      }
    }
  }

  .summary {
    .el-row {
      margin-bottom: 16px;
      color: var(--el-text-color-regular);
      font-size: 14px;
      line-height: 1.5;

      .el-col {
        display: flex;
      }

      .label {
        width: 110px;
        font-weight: 500;
      }
    }
  }

  .footer {
    display: flex;
    margin-top: 50px;
  }
}
</style>
