<template>
  <el-drawer
    :title="testRun.id ? $t('test.run.titleEdit') : $t('test.run.titleNew')"
    v-model="drawerVisible"
    class="test-run-drawer"
    @closed="$emit('testRunClosed')"
    size="960">
    <TestCaseBasics :testCase="testCase" />
    <el-form
      ref="testRunForm"
      :model="testRun"
      :rules="rules"
      label-position="top"
      label-width="auto"
      class="test-run-form"
      :label-position="isInMobile ? 'top' : 'top'">
      <el-form-item :label="$t('test.case.edit.steps.label')" label-position="top" class="!my-10">
        <el-table
          :data="testRun.stepResults"
          :empty-text="$t('test.case.edit.steps.empty')"
          :border="true"
          class="test-case-steps-table">
          <el-table-column label="#" width="45" align="center">
            <template #default="scope">
              <div class="seq-badge">{{ scope.$index + 1 }}</div>
            </template>
          </el-table-column>
          <el-table-column :label="$t('test.case.edit.steps.description')" prop="description"> </el-table-column>
          <el-table-column :label="$t('test.case.edit.steps.expectation')" prop="expectation"> </el-table-column>
          <el-table-column :label="$t('test.run.steps.status')" width="125">
            <template #default="scope">
              <TestRunStatusSelector v-model="scope.row.status" @change="stepStatusChaned" />
            </template>
          </el-table-column>

          <el-table-column :label="$t('test.run.steps.result')">
            <template #default="scope">
              <el-input
                v-model="scope.row.result"
                :rows="1"
                :autosize="true"
                :placeholder="$t('test.run.steps.resultPlaceholder')"
                resize="none"
                maxlength="500"
                type="textarea"></el-input>
            </template>
          </el-table-column>
        </el-table>
      </el-form-item>
      <el-form-item :label="$t('test.run.status')" prop="status" class="!mt-10">
        <TestRunStatusSelector v-model="testRun.status" class="!w-150px" />
        <span v-if="testRun.updatedTimeFormatted" class="ml-30px desc"
          >{{
            testRun.createdTime === testRun.updatedTime
              ? $t('test.run.createdTime', { timestamp: testRun.createdTimeFormatted })
              : $t('test.run.updatedTime', { timestamp: testRun.updatedTimeFormatted })
          }}
        </span>
      </el-form-item>
      <el-form-item :label="$t('test.run.result')">
        <el-input
          v-model="testRun.result"
          :autosize="{ minRows: 3 }"
          :placeholder="$t('test.run.resultPlaceholder')"
          resize="vertical"
          maxlength="500"
          type="textarea"></el-input>
      </el-form-item>

      <el-form-item :label="$t('test.run.files')">
        <FileUploader
          :files="testRun.files"
          :projectId="project.id"
          targetType="TEST_RUN_ATTACHMENT"
          @fileUploaded="handleFileUploaded"
          @fileDeleted="handleFileDeleted" />
      </el-form-item>
    </el-form>
    <template #footer>
      <div class="footer">
        <el-button
          v-if="testCase.id && project.isDeveloper"
          type="danger"
          icon="Delete"
          class="delete-case-button no-border"
          plain
          size="default"
          @click="deleteTestRun"
          >{{ $t('common.delete') }}</el-button
        >
        <div class="flex items-center">
          <el-button size="default" class="no-border" @click="toggleDrawer">{{ $t('common.cancel') }}</el-button>
          <el-button
            :disabled="!project.isDeveloper"
            :loading="saving"
            size="default"
            type="primary"
            class="no-border"
            @click="saveTestRun"
            >{{ $t('common.save') }}</el-button
          >
        </div>
      </div>
    </template>
  </el-drawer>
</template>
<script>
import { testCaseApi, testRunApi } from '@/api/testing.js'
import PriorityIcon from '@/components/common/PriorityIcon.vue'
import TestRunStatusSelector from '@/components/common/TestRunStatusSelector.vue'
import Avatar from '@/components/common/Avatar.vue'
import dict from '@/locales/zh-cn/dict.json'
import utils from '@/utils/util.js'
import { ElMessage } from 'element-plus'
import TestCaseBasics from './TestCaseBasics.vue'
import FileUploader from '@/components/common/FileUploader.vue'

export default {
  name: 'TestRunEdit',
  components: {
    PriorityIcon,
    TestCaseBasics,
    Avatar,
    TestRunStatusSelector,
    FileUploader
  },
  emits: ['testRunSaved', 'deleteTestRun', 'testRunClosed'],
  props: {
    testCaseId: {
      type: String,
      required: true
    },
    testRunId: {
      type: String,
      default: 'new'
    }
  },
  data() {
    return {
      isInMobile: utils.isInMobile(),
      dict: dict,
      drawerVisible: true,
      project: this.$store.get('project'),
      testCase: {
        details: {}
      },
      testRun: {
        stepResults: [],
        status: ''
      },
      saving: false,
      rules: {
        status: [{ required: true, message: this.$t('test.run.msg.statusRequired'), trigger: 'change' }]
      }
    }
  },
  created() {
    this.loadCase()
  },
  mounted() {},
  methods: {
    loadCase() {
      testCaseApi.get(this.testCaseId).then((response) => {
        this.testCase = response.data

        this.testRun.testCaseId = this.testCase.id
        this.testRun.projectId = this.project.id
        this.testRun.testCaseDetailsId = this.testCase.details.id
        this.testRun.testCaseVersion = this.testCase.details.version

        if (this.testRunId !== 'new') {
          this.loadTestRun()
        } else {
          this.initStepResults()
        }
      })
    },
    loadTestRun() {
      testRunApi.get(this.testRunId).then((response) => {
        this.testRun = response.data
        utils.formatCreateUpdateTime(this.testRun)

        if (!this.testRun.files) {
          this.testRun.files = []
        }

        if (this.testRun.stepResults?.length) {
          for (const i in this.testRun.stepResults) {
            this.testRun.stepResults[i].description = this.testCase.details.steps[i]?.description || ''
            this.testRun.stepResults[i].expectation = this.testCase.details.steps[i]?.expectation || ''
          }
        }
      })
    },
    initStepResults() {
      if (this.testCase.details?.steps?.length) {
        this.testRun.stepResults = this.testCase.details.steps.map((step) => ({
          ...step,
          status: '',
          result: ''
        }))
      }
    },
    stepStatusChaned(status) {
      if (this.testRun.stepResults.every((step) => step.status === 'SUCCESS')) {
        this.testRun.status = 'SUCCESS'
      } else if (this.testRun.stepResults.some((step) => step.status === 'FAILED')) {
        this.testRun.status = 'FAILED'
      } else if (this.testRun.stepResults.some((step) => step.status === 'BLOCKED')) {
        this.testRun.status = 'BLOCKED'
      } else if (this.testRun.stepResults.some((step) => step.status === 'SKIPPED')) {
        this.testRun.status = 'SKIPPED'
      } else {
        this.testRun.status = ''
      }
    },
    handleFileUploaded(file) {
      this.testRun.files.push(file)
    },
    handleFileDeleted(file) {
      const index = this.testRun.files.findIndex((f) => f.id === file.id)
      if (index !== -1) {
        this.testRun.files.splice(index, 1)
      }
    },
    saveTestRun() {
      if (!this.validate()) {
        return
      }

      // Convert the empty values to null to avoid backend validation errors
      this.testRun.stepResults.forEach((step) => {
        step.status = step.status || null
        step.result = step.result || null
      })

      this.saving = true
      const apiCall = this.testRun.id
        ? testRunApi.update(this.testRun.id, this.testRun)
        : testRunApi.create(this.testRun)
      apiCall
        .then((res) => {
          ElMessage.success(
            this.testRun.id ? this.$t('test.run.msg.updatedSuccess') : this.$t('test.run.msg.createdSuccess')
          )
          this.$emit('testRunSaved', res.data)
        })
        .finally(() => {
          setTimeout(() => {
            this.saving = false
            this.toggleDrawer()
          }, 200)
        })
    },
    validate() {
      if (!this.testRun.status) {
        ElMessage.warning(this.$t('test.run.msg.statusRequired'))
        return false
      }

      return true
    },
    deleteTestRun() {
      this.$emit('deleteTestRun', this.testRun.id)
    },
    toggleDrawer() {
      this.drawerVisible = !this.drawerVisible
    }
  }
}
</script>

<style lang="less" scoped>
.test-run-drawer {
  .footer {
    width: 100%;
    display: flex;
    justify-content: space-between;
  }
}
</style>

<style lang="less">
.test-run-drawer {
  .el-drawer__header {
    margin-bottom: 10px;
  }

  .test-case-steps-table {
    thead {
      .el-table__cell {
        background-color: unset !important;
      }
    }

    .el-table__cell {
      background-color: unset !important;
      padding: 4px 0 !important;
    }

    textarea,
    .el-select__wrapper {
      box-shadow: none !important;
      padding: 5px 0;
      background-color: unset !important;
    }

    .el-table__empty-block {
      min-height: unset;
      .el-table__empty-text {
        line-height: 40px;
      }
    }
  }
}
</style>
