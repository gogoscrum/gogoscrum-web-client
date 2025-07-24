<template>
  <div class="test-case-edit-page page">
    <div class="title">
      <div class="left-part">
        <span>{{ testCase.id ? $t('test.case.edit.title.edit') : $t('test.case.edit.title.new') }}</span>
        <el-dropdown v-if="testCase.latestVersion > 1" trigger="click" class="ml-4 mt-2px">
          <el-tag type="info" size="small"
            >{{ $t('test.case.edit.version', { version: testCase.details.version }) }}
            <el-icon class="el-icon--right">
              <arrow-down />
            </el-icon>
          </el-tag>
          <template #dropdown>
            <el-dropdown-menu>
              <el-dropdown-item v-for="version in descVersions" :key="version" @click.native="loadCase(version)">{{
                $t('test.case.edit.version', { version: version })
              }}</el-dropdown-item>
            </el-dropdown-menu>
          </template>
        </el-dropdown>
      </div>
      <div class="old-version-warning" v-if="isOldVersion">
        <el-icon class="text-lg mr-1"><WarnTriangleFilled /></el-icon>
        <span>{{ $t('test.case.edit.msg.oldVersion') }}</span>
      </div>
    </div>
    <el-form
      ref="testCaseForm"
      :model="testCase"
      :disabled="!project.isDeveloper || isOldVersion"
      :rules="rules"
      label-width="100px"
      :label-position="isInMobile ? 'top' : 'right'">
      <el-form-item :label="$t('test.case.edit.name')" prop="details.name">
        <el-input v-model="testCase.details.name" maxlength="200" show-word-limit clearable></el-input>
      </el-form-item>

      <el-row>
        <el-col :xs="24" :sm="8">
          <el-form-item :label="$t('test.case.edit.type')">
            <el-select v-model="testCase.details.type">
              <el-option
                v-for="caseType in Object.keys(dict.testCaseTypes)"
                :key="caseType"
                :label="$t(`testCaseTypes.${caseType}`)"
                :value="caseType">
              </el-option>
            </el-select>
          </el-form-item>
        </el-col>
        <el-col :xs="24" :sm="8">
          <el-form-item :label="$t('test.case.edit.component')">
            <el-cascader
              v-model="testCase.details.componentId"
              :options="components"
              :props="componentProps"
              clearable
              :show-all-levels="false"
              class="w-full" />
          </el-form-item>
        </el-col>
        <el-col :xs="24" :sm="8">
          <el-form-item :label="$t('test.case.edit.priority')">
            <priority-selector v-model="testCase.details.priority"></priority-selector>
          </el-form-item>
        </el-col>
      </el-row>

      <el-form-item :label="$t('test.case.edit.preconditions')">
        <el-input
          v-model="testCase.details.preconditions"
          :autosize="{ minRows: 3 }"
          show-word-limit
          maxlength="500"
          type="textarea"
          resize="vertical"></el-input>
      </el-form-item>

      <el-form-item :label="$t('test.case.edit.steps.label')">
        <el-table
          :data="testCase.details.steps"
          :empty-text="$t('test.case.edit.steps.empty')"
          class="test-case-steps-table">
          <el-table-column type="index" width="30" align="center" />
          <el-table-column :label="$t('test.case.edit.steps.description')">
            <template #default="scope">
              <el-input
                v-model="scope.row.description"
                :ref="`stepDesc${scope.$index}`"
                :rows="1"
                :autosize="false"
                resize="none"
                maxlength="500"
                type="textarea"
                @input="syncInputHeight(scope.$index)"></el-input>
            </template>
          </el-table-column>
          <el-table-column :label="$t('test.case.edit.steps.expectation')">
            <template #default="scope">
              <el-input
                v-model="scope.row.expectation"
                :ref="`stepExp${scope.$index}`"
                :rows="1"
                :autosize="false"
                resize="none"
                maxlength="500"
                type="textarea"
                @input="syncInputHeight(scope.$index)"></el-input>
            </template>
          </el-table-column>
          <el-table-column v-if="project.isDeveloper" width="30" class-name="actions-column" align="right">
            <template #default="scope">
              <el-dropdown trigger="click" placement="bottom">
                <div class="more-action-icon" @click.stop>
                  <el-icon><MoreFilled /></el-icon>
                </div>
                <template #dropdown>
                  <el-dropdown-menu>
                    <el-dropdown-item icon="Right" @click.native="insertStep(scope.$index)">{{
                      $t('test.case.edit.steps.insert')
                    }}</el-dropdown-item>
                    <el-dropdown-item
                      icon="top"
                      :disabled="scope.$index === 0"
                      @click.native="moveUpStep(scope.$index)"
                      >{{ $t('test.case.edit.steps.moveUp') }}</el-dropdown-item
                    >
                    <el-dropdown-item
                      icon="bottom"
                      :disabled="scope.$index === testCase.details.steps.length - 1"
                      @click.native="moveDownStep(scope.$index)"
                      >{{ $t('test.case.edit.steps.moveDown') }}</el-dropdown-item
                    >
                    <el-dropdown-item
                      icon="Delete"
                      :disabled="testCase.details.steps?.length <= 1"
                      @click.native="deleteStep(scope.$index)"
                      >{{ $t('common.delete') }}</el-dropdown-item
                    >
                  </el-dropdown-menu>
                </template>
              </el-dropdown>
            </template>
          </el-table-column>
          <!-- <template v-slot:empty>
            <span class="small-text text-gray-400">{{ $t('test.case.edit.steps.empty') }}</span>
          </template> -->
        </el-table>
        <el-button class="add-step-button mt-2" type="primary" text icon="Plus" @click="addStep">
          {{ $t('test.case.edit.steps.add') }}</el-button
        >
      </el-form-item>
    </el-form>
    <div class="footer">
      <el-button
        v-if="testCase.id && project.isDeveloper"
        :disabled="isOldVersion"
        type="danger"
        icon="Delete"
        class="delete-case-button no-border"
        plain
        size="default"
        @click="deleteTestCase"
        >{{ $t('common.delete') }}</el-button
      >
      <div class="flex ml-auto">
        <el-button size="default" class="no-border" @click="$router.go(-1)">{{ $t('common.cancel') }}</el-button>
        <el-button
          :disabled="!project.isDeveloper || isOldVersion"
          :loading="saving"
          size="default"
          type="primary"
          class="no-border"
          @click="saveTestCase"
          >{{ $t('common.save') }}</el-button
        >
      </div>
    </div>
  </div>
</template>

<script>
import { componentApi } from '@/api/component.js'
import { testCaseApi } from '@/api/testCase.js'
import utils from '@/utils/util.js'
import dict from '@/locales/zh-cn/dict.json'
import { ElMessage, ElMessageBox } from 'element-plus'
import PrioritySelector from '@/components/common/PrioritySelector.vue'

export default {
  name: 'TestCaseEdit',
  components: {
    PrioritySelector
  },
  props: {},
  data() {
    return {
      dict: dict,
      isInMobile: utils.isInMobile(),
      projectId: this.$route.params.projectId,
      project: {},
      testCaseId: this.$route.params.testCaseId,
      version: this.$route.query.version,
      testCase: {
        projectId: this.$route.params.projectId,
        details: {
          priority: 'NORMAL',
          preconditions: '',
          steps: [
            {
              description: '',
              expectation: ''
            },
            {
              description: '',
              expectation: ''
            }
          ]
        }
      },
      components: [],
      componentProps: {
        label: 'name',
        value: 'id',
        multiple: false,
        emitPath: false,
        expandTrigger: 'hover',
        checkStrictly: true
      },
      saving: false,
      rules: {
        'details.name': [
          {
            required: true,
            message: this.$t('test.case.edit.msg.nameMissing'),
            trigger: 'blur'
          }
        ]
      }
    }
  },
  computed: {
    isOldVersion() {
      return this.testCase.latestVersion !== this.testCase.details.version
    },
    descVersions() {
      return Array.from({ length: this.testCase.latestVersion }, (_, i) => this.testCase.latestVersion - i)
    }
  },
  created() {
    this.project = this.$store.get('project')
    this.loadComponents()
    if (this.testCaseId !== 'new') {
      this.loadCase()
    }
  },
  mounted() {},
  methods: {
    loadComponents() {
      componentApi.getTree(this.projectId).then((response) => {
        this.components = response.data?.children || []
      })
    },
    loadCase(version = this.version) {
      testCaseApi.get(this.testCaseId, { version }).then((response) => {
        this.testCase = response.data
        this.$nextTick(() => {
          // Adjust input heights after loading the test case
          this.testCase.details?.steps?.forEach((step, index) => {
            this.syncInputHeight(index)
          })
        })
      })
    },
    syncInputHeight(index) {
      const verticalPadding = 5
      const descInput = this.$refs[`stepDesc${index}`].textarea
      const expInput = this.$refs[`stepExp${index}`].textarea
      const lineHght = parseInt(window.getComputedStyle(descInput).lineHeight)
      const descLines = utils.getTextareaLineCount(descInput)
      const expLines = utils.getTextareaLineCount(expInput)
      const maxLines = Math.max(descLines, expLines)
      const maxHeight = maxLines * lineHght + verticalPadding * 2
      descInput.style.height = `${maxHeight}px`
      expInput.style.height = `${maxHeight}px`
    },
    addStep() {
      this.testCase.details.steps.push({
        description: '',
        expectation: ''
      })
    },
    insertStep(index) {
      this.testCase.details.steps.splice(index + 1, 0, {
        description: '',
        expectation: ''
      })
    },
    moveUpStep(index) {
      if (index > 0) {
        const step = this.testCase.details.steps.splice(index, 1)[0]
        this.testCase.details.steps.splice(index - 1, 0, step)

        // Adjust the input heights after moving the step at next tick
        this.$nextTick(() => {
          this.syncInputHeight(index - 1)
          this.syncInputHeight(index)
        })
      }
    },
    moveDownStep(index) {
      if (index < this.testCase.details.steps.length - 1) {
        const step = this.testCase.details.steps.splice(index, 1)[0]
        this.testCase.details.steps.splice(index + 1, 0, step)
        // Adjust the input heights after moving the step at next tick
        this.$nextTick(() => {
          this.syncInputHeight(index)
          this.syncInputHeight(index + 1)
        })
      }
    },
    deleteStep(index) {
      this.testCase.details.steps.splice(index, 1)
    },
    saveTestCase() {
      this.$refs.testCaseForm.validate((valid) => {
        if (valid) {
          // filter out empty steps
          this.testCase.details.steps = this.testCase.details.steps.filter((step) => {
            return step.description.trim() !== '' || step.expectation.trim() !== ''
          })
          this.saving = true
          const apiCall = this.testCase.id
            ? testCaseApi.update(this.testCase.id, this.testCase)
            : testCaseApi.create(this.testCase)

          apiCall
            .then((response) => {
              this.saving = false
              ElMessage.success(
                this.testCase.id
                  ? this.$t('test.case.edit.msg.updateSuccess')
                  : this.$t('test.case.edit.msg.createSuccess')
              )
              // stay on the same page
              this.testCase = response.data
              // this.$router.push({
              //   name: 'TestCaseList',
              //   params: { projectId: this.projectId }
              // })
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
    deleteTestCase() {
      ElMessageBox.confirm(
        this.$t('test.case.edit.msg.delConfirmMsg', { caseName: this.testCase.details.name }),
        this.$t('test.case.edit.msg.delConfirmTitle'),
        {
          type: 'warning',
          dangerouslyUseHTMLString: true,
          draggable: true
        }
      )
        .then(() => {
          testCaseApi.delete(this.testCase.id).then(() => {
            ElMessage.success(this.$t('test.case.edit.msg.delSuccess'))
            this.$router.push({
              name: 'TestCaseList',
              params: { projectId: this.projectId }
            })
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
.test-case-edit-page {
  width: 760px;

  .title {
    display: flex;
    align-items: center;
    justify-content: space-between;

    .left-part {
      display: flex;
      align-items: center;
      white-space: nowrap;
    }

    .old-version-warning {
      margin-left: 10px;
      color: orange;
      display: flex;
      align-items: center;
      font-size: 13px;
      font-weight: 500;
    }
  }

  .footer {
    display: flex;
  }
}
</style>
<style lang="less">
.test-case-edit-page {
  .actions-column {
    .cell {
      padding-left: 0;
      padding-right: 4px;
    }
  }

  .test-case-steps-table {
    .el-table__cell {
      border-bottom: none !important;
    }
  }

  .el-table {
    --el-table-border-color: #unset;
  }
}
</style>
