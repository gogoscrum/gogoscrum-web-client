<template>
  <div class="burndown-chart-page page">
    <div class="header">
      <el-radio-group v-model="chartType" @change="chartTypeChanged">
        <el-radio value="STATUS">{{ $t('burndown.chartByIssue') }}</el-radio>
        <el-radio value="POINT">{{ $t('burndown.chartByPoint') }}</el-radio>
      </el-radio-group>
      <el-select
        v-model="sprintId"
        :placeholder="$t('burndown.placeholder')"
        class="sprint-select"
        @change="sprintChanged">
        <el-option v-for="sprint in sprints" :key="sprint.id" :label="sprint.name" :value="sprint.id"> </el-option>
      </el-select>
    </div>
    <div class="main">
      <div class="chart-title">{{ $t('burndown.title') }}</div>
      <e-charts v-if="option" class="chart-body" :option="option" />
      <el-popover
        :placement="isInMobile ? 'bottom-start' : 'right-end'"
        :title="$t('burndown.title')"
        :width="isInMobile ? 300 : 400"
        trigger="hover"
        :content="$t('burndown.burndownExplained')">
        <template #reference>
          <el-button size="small" icon="QuestionFilled">
            {{ $t('burndown.whatIsBurndownChart') }}
          </el-button>
        </template>
      </el-popover>
    </div>
  </div>
</template>

<script>
import ECharts from 'vue-echarts'
import dayjs from 'dayjs'
import 'echarts'
import { projectApi } from '@/api/project.js'
import { sprintApi } from '@/api/sprint.js'
import utils from '@/utils/util.js'

export default {
  components: {
    ECharts
  },
  data() {
    return {
      isInMobile: utils.isInMobile(),
      projectId: null,
      sprintId: null,
      chartType: 'STATUS',
      sprint: {},
      sprints: [],
      totalPoints: 0,
      issuesCount: 0,
      dateList: [],
      currenDatetList: [],
      actualPointList: [],
      actualIssueDoneCount: [],
      issues: [],
      option: {
        tooltip: {
          trigger: 'axis'
        },
        toolbox: {
          feature: {
            saveAsImage: {}
          },
          showTitle: true
        },
        grid: {
          left: '3%',
          right: '4%',
          bottom: '3%',
          containLabel: true
        },
        legend: {
          top: 10,
          data: [this.$t('burndown.actual'), this.$t('burndown.reference')],
          textStyle: {
            color: this.$store.get('darkMode') ? '#ccc' : '#333'
          }
        },
        xAxis: {
          type: 'category',
          boundaryGap: false,
          axisLabel: {
            rotate: 0
          },
          data: []
        },
        yAxis: {
          type: 'value',
          data: []
        },
        series: [
          {
            name: this.$t('burndown.actual'),
            type: 'line',
            data: []
          },
          {
            name: this.$t('burndown.reference'),
            type: 'line',
            data: []
          }
        ]
      }
    }
  },
  mounted() {
    this.projectId = this.$route.params.projectId
    this.sprintId = this.$route.params.sprintId

    this.loadProject()
  },
  methods: {
    loadProject() {
      projectApi.getById(this.projectId).then((res) => {
        this.sprints = res.data.sprints.filter((sprint) => !sprint.backlog)
        let backlog = res.data.sprints.find((sprint) => sprint.backlog)
        let firstSprint = this.sprints[0]

        if ((this.sprintId == 'default' || backlog.id == this.sprintId) && firstSprint) {
          this.sprintId = firstSprint.id
          this.sprint = firstSprint
        }
        this.loadSprintById()
      })
    },
    loadSprintById() {
      sprintApi.getById(this.sprintId).then((res) => {
        this.sprint = res.data
        this.issues = res.data.issues
        this.issues.forEach((issue) => {
          if (issue.completeTime) {
            issue.completeDate = dayjs(issue.completeTime).format('YYYY-MM-DD')
          }
        })

        if (this.sprint.startDate) {
          this.dateList = this.getDatesBetweenDates(new Date(res.data.startDate), new Date(res.data.endDate))
          this.currenDatetList = this.getDatesBetweenDates(new Date(res.data.startDate), new Date())
          this.option.xAxis.data = this.dateList

          // Rotate the xAxis label if there're too many dates
          if (this.dateList.length >= 8) {
            this.option.xAxis.axisLabel.rotate = 30
          }

          if (this.issues) {
            this.chartTypeChanged()
          }
        }
      })
    },
    sprintChanged() {
      this.resetOption()
      this.loadSprintById()
    },
    getTotalPotins() {
      this.totalPoints = 0
      this.issues.forEach((issue) => {
        if (issue.storyPoints != null) {
          this.totalPoints += issue.storyPoints
        }
      })
    },
    getDatesBetweenDates(startDate, endDate) {
      let dates = []
      dates.push('')
      let start = dayjs(startDate)
      let end = dayjs(endDate)

      while (!start.isAfter(end)) {
        dates.push(start.format('YYYY-MM-DD'))
        start = start.add(1, 'day')
      }
      return dates
    },
    getActualPointList(currenDatetList) {
      this.actualPointList = []
      currenDatetList.forEach((time) => {
        let point = 0
        this.issues.filter((issue) => {
          if (issue.storyPoints != null && issue.completeDate == time) {
            point += issue.storyPoints
          }
        })
        this.actualPointList.push(point)
      })
    },
    resetOption() {
      // this.option.title.text = ''
      this.option.xAxis.data = []
      this.option.yAxis.data = []
      this.option.series[0].data = []
      this.option.series[1].data = []
    },
    getDecreasePointsList(actualPointList) {
      let points = []
      let totalPoints = this.totalPoints
      actualPointList.forEach((point) => {
        totalPoints = totalPoints - point
        points.push(totalPoints)
      })
      return points
    },
    getIdeaDecreasePointsList(days) {
      let points = []
      let totalPoints = this.totalPoints
      let consume = totalPoints / (days - 1)
      while (totalPoints > 0) {
        points.push(totalPoints)
        totalPoints = totalPoints - consume
        totalPoints = totalPoints.toFixed(2)
      }
      points.push(0)
      return points
    },
    chartTypeChanged() {
      if (this.issues.length && this.dateList.length) {
        if (this.chartType == 'POINT') {
          this.chartByPoints()
        } else {
          this.chartByIssues()
        }
      }
    },
    chartByPoints() {
      this.getTotalPotins()
      this.getActualPointList(this.currenDatetList)

      this.option.series[0].data = this.getDecreasePointsList(this.actualPointList)
      this.option.series[1].data = this.getIdeaDecreasePointsList(this.dateList.length)
    },
    chartByIssues() {
      this.issuesCount = this.issues.length
      this.getActualIssueDoneCount(this.currenDatetList)

      this.option.series[0].data = this.getDecreaseIssueList(this.actualIssueDoneCount)
      this.option.series[1].data = this.getIdeaDecreaseIssueList(this.dateList.length)
    },
    getActualIssueDoneCount(currenDatetList) {
      this.actualIssueDoneCount = []
      currenDatetList.forEach((time) => {
        let count = 0
        this.issues.filter((issue) => {
          if (issue.completeDate == time) {
            count++
          }
        })
        this.actualIssueDoneCount.push(count)
      })
    },
    getDecreaseIssueList(actualIssueDoneCount) {
      let amountList = []
      let amount = this.issuesCount
      actualIssueDoneCount.forEach((count) => {
        amount = amount - count
        amountList.push(amount)
      })
      return amountList
    },
    getIdeaDecreaseIssueList(days) {
      let amountList = []
      let amount = this.issuesCount
      let consume = amount / (days - 1)
      while (amount > 0) {
        amountList.push(amount)
        amount = amount - consume
        amount = amount.toFixed(2)
      }
      amountList.push(0)
      return amountList
    }
  }
}
</script>

<style lang="less" scoped>
.burndown-chart-page {
  width: 90%;
  margin: 0 auto;

  .header {
    display: flex;
    height: 32px;
    margin: 10px 0 20px 0;
    justify-content: space-between;

    .sprint-select {
      width: 200px;
    }
  }
}
</style>
