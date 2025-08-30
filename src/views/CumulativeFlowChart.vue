<template>
  <div class="cumulative-chart-page page">
    <div class="header">
      <el-radio-group v-model="chartType" @change="chartTypeChanged">
        <el-radio value="ISSUE">{{ $t('burndown.chartByIssue') }}</el-radio>
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
      <div class="chart-title">{{ $t('cumulativeFlowChart.title') }}</div>
      <e-charts v-if="option" class="chart-body" :option="option" />
      <el-popover
        :placement="isInMobile ? 'bottom-start' : 'right-end'"
        :title="$t('cumulativeFlowChart.title')"
        :width="isInMobile ? 300 : 400"
        trigger="hover"
        :content="$t('cumulativeFlowChart.cumulativeExplained')">
        <template #reference>
          <el-button slot="reference" size="small" icon="QuestionFilled">
            {{ $t('cumulativeFlowChart.whatIsCumulative') }}
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
      project: null,
      sprintId: null,
      sprint: {},
      sprints: [],
      sprintDateLabels: [],
      linesData: {},
      series: [],
      chartType: 'ISSUE',
      option: {
        tooltip: {
          trigger: 'axis',
          order: 'seriesDesc'
        },
        legend: {
          top: 10,
          data: [],
          textStyle: {
            color: this.$store.get('darkMode') ? '#ccc' : '#333'
          }
        },
        toolbox: {
          feature: {
            saveAsImage: {}
          }
        },
        grid: {
          left: '3%',
          right: '4%',
          bottom: '3%',
          containLabel: true
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
          type: 'value'
        },
        series: []
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
        this.project = res.data

        this.generateIssueGroupLables()

        this.sprints = res.data.sprints.filter((sprint) => !sprint.backlog)
        let backlog = res.data.sprints.find((sprint) => sprint.backlog)
        let firstSprint = this.sprints[0]

        if ((this.sprintId == 'default' || backlog.id == this.sprintId) && firstSprint) {
          this.sprintId = firstSprint.id
          this.sprint = firstSprint
        }

        if (this.sprintId != 'default' && this.sprintId) {
          this.loadSprintById()
        } else {
          this.sprintId = null
        }
      })
    },
    loadSprintById() {
      sprintApi.getById(this.sprintId).then((res) => {
        this.sprint = res.data
        if (this.sprint.startDate) {
          this.sprintDateLabels = this.getDatesBetweenDates(new Date(res.data.startDate), new Date(res.data.endDate))
          this.option.xAxis.data = this.sprintDateLabels

          // Rotate the xAxis label if there're too many dates
          if (this.sprintDateLabels.length >= 8) {
            this.option.xAxis.axisLabel.rotate = 30
          }
        }

        this.loadCumulativeFlowDiagram()
      })
    },
    loadCumulativeFlowDiagram() {
      sprintApi.getSprintCumulativeFlowDiagram(this.sprintId).then((res) => {
        let cumulativeChart = res.data

        if (cumulativeChart && cumulativeChart.groupLines) {
          Object.keys(cumulativeChart.groupLines).forEach((groupId) => {
            let groupLine = cumulativeChart.groupLines[groupId]
            let dailyCounts = groupLine.dailyCounts

            this.linesData[groupId] = { isseCounts: [], totalStoryPoints: [] }
            this.sprintDateLabels.forEach((dateLabel) => {
              if (dailyCounts[dateLabel]) {
                this.linesData[groupId].isseCounts.push(dailyCounts[dateLabel]['issueCount'])
                this.linesData[groupId].totalStoryPoints.push(dailyCounts[dateLabel]['totalStoryPoints'])
              } else {
                this.linesData[groupId].isseCounts.push(null)
                this.linesData[groupId].totalStoryPoints.push(null)
              }
            })
          })
        }

        this.chartTypeChanged()
      })
    },
    generateIssueGroupLables() {
      this.issueGroupLabels = []

      if (this.project && this.project.issueGroups) {
        this.project.issueGroups.forEach((group) => {
          this.issueGroupLabels.push(group.label)

          this.series[group.id] = {
            name: group.label,
            type: 'line',
            stack: 'Total',
            areaStyle: {},
            data: []
          }
        })
      }
    },
    sprintChanged() {
      this.resetOption()
      this.generateIssueGroupLables()
      this.loadSprintById()
    },
    resetOption() {
      this.option.xAxis.data = []
      this.option.yAxis.data = []
      this.series = {}
      this.option.series.forEach((series) => {
        series.data = []
      })
      this.sprintDateLabels = []
    },
    getDatesBetweenDates(startDate, endDate) {
      let dates = []
      let start = dayjs(startDate)
      let end = dayjs(endDate)

      // Start from the ending of previous day
      start = start.add(-1, 'day')

      while (!start.isAfter(end)) {
        dates.push(start.format('YYYY-MM-DD'))
        start = start.add(1, 'day')
      }
      return dates
    },
    chartTypeChanged() {
      Object.keys(this.linesData).forEach((groupId) => {
        this.series[groupId].data =
          this.chartType === 'ISSUE' ? this.linesData[groupId].isseCounts : this.linesData[groupId].totalStoryPoints
      })
      this.option.series = Object.values(this.series).reverse()
      this.option.legend.data = this.issueGroupLabels
    }
  }
}
</script>

<style lang="less" scoped>
.cumulative-chart-page {
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
