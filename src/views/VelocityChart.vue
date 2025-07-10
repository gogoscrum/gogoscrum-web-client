<template>
  <div class="velocity-chart-page page">
    <div class="header">
      <el-radio-group v-model="chartType" @change="chartTypeChanged">
        <el-radio value="ISSUE">{{ $t('burndown.chartByIssue') }}</el-radio>
        <el-radio value="POINT">{{ $t('burndown.chartByPoint') }}</el-radio>
      </el-radio-group>
    </div>
    <div class="main">
      <div class="chart-title">{{ $t('velocityChart.title') }}</div>
      <e-charts v-if="option" class="chart-body" :option="option" />
      <el-popover
        :placement="isInMobile ? 'bottom-start' : 'right-end'"
        :title="$t('velocityChart.title')"
        :width="isInMobile ? 300 : 400"
        trigger="hover"
        :content="$t('velocityChart.velocityExplained')">
        <template #reference>
          <el-button slot="reference" size="small" icon="QuestionFilled">
            {{ $t('velocityChart.whatIsVelocityChart') }}
          </el-button>
        </template>
      </el-popover>
    </div>
  </div>
</template>
<script>
import ECharts from 'vue-echarts'
import * as echarts from 'echarts'
import { projectApi } from '@/api/project.js'
import utils from '@/utils/util.js'

export default {
  components: {
    ECharts
  },
  data() {
    return {
      isInMobile: utils.isInMobile(),
      projectId: null,
      chartType: 'ISSUE',
      sprintIssueCounts: [],
      sprintStoryPoints: [],
      option: {
        tooltip: {
          trigger: 'axis'
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
          axisLabel: {
            rotate: 0
          },
          data: []
        },
        yAxis: {
          type: 'value'
        },
        series: [
          {
            type: 'bar',
            itemStyle: {
              color: new echarts.graphic.LinearGradient(0, 0, 0, 1, [
                { offset: 0, color: '#83bff6' },
                { offset: 0.5, color: '#188df0' },
                { offset: 1, color: '#188df0' }
              ])
            },
            emphasis: {
              itemStyle: {
                color: new echarts.graphic.LinearGradient(0, 0, 0, 1, [
                  { offset: 0, color: '#2378f7' },
                  { offset: 0.7, color: '#2378f7' },
                  { offset: 1, color: '#83bff6' }
                ])
              }
            },
            data: []
          }
        ]
      }
    }
  },
  mounted() {
    this.projectId = this.$route.params.projectId
    this.loadProjectVelocity()
  },
  methods: {
    loadProjectVelocity() {
      projectApi.getProjectVelocity(this.projectId).then((res) => {
        let velocities = res.data

        if (velocities && velocities.length) {
          velocities.forEach((velocity) => {
            this.option.xAxis.data.push(velocity.sprintName)
            this.sprintIssueCounts.push(velocity.completedIssueCount || 0)
            this.sprintStoryPoints.push(velocity.completedStoryPoints || 0)
          })

          // Rotate the xAxis label if there're too many sprints
          if (velocities.length >= 8) {
            this.option.xAxis.axisLabel.rotate = 45
          }
        }

        this.chartTypeChanged()
      })
    },
    chartTypeChanged() {
      if (this.chartType === 'ISSUE') {
        this.showChartByIssueCount()
      } else {
        this.showChartByStoryPoints()
      }
    },
    showChartByIssueCount() {
      this.option.series[0].data = this.sprintIssueCounts
    },
    showChartByStoryPoints() {
      this.option.series[0].data = this.sprintStoryPoints
    }
  }
}
</script>

<style lang="less" scoped>
.velocity-chart-page {
  width: 90%;
  margin: 0 auto;

  .header {
    display: flex;
    height: 32px;
    margin: 10px 0 20px 0;
  }
}
</style>
