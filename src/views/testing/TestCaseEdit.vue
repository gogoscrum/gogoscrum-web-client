<template>
  <div class="test-case-edit-page page">
    <div class="title">
      <div class="left-part">
        <span>{{ testCase.id ? $t('test.case.edit.title.edit') : $t('test.case.edit.title.new') }}</span>
        <el-tag v-if="testCase.code" type="info" class="ml-2">TC-{{ testCase.code }}</el-tag>
      </div>
      <div class="old-version-warning" v-if="isOldVersion">
        <el-icon class="text-lg mr-1"><WarnTriangleFilled /></el-icon>
        <span>{{ $t('test.case.edit.msg.oldVersion') }}</span>
      </div>
      <div class="right-part flex">
        <el-dropdown v-if="testCase.latestVersion >= 1" trigger="click" class="ml-20px mt-2px">
          <el-tag type="info" size="small"
            >{{ $t('test.case.edit.version', { version: testCase.details.version }) }}
            <el-icon class="el-icon--right">
              <arrow-down />
            </el-icon>
          </el-tag>
          <template #dropdown>
            <el-dropdown-menu>
              <el-dropdown-item v-for="version in listVersions" :key="version" @click.native="loadDetails(version)">
                <span>{{ $t('test.case.edit.version', { version: version }) }}</span>
                <el-icon v-if="version === testCase.details.version" class="ml-2"><Check /></el-icon>
              </el-dropdown-item>
            </el-dropdown-menu>
          </template>
        </el-dropdown>
      </div>
    </div>
    <el-form
      ref="testCaseForm"
      :model="testCase"
      :disabled="!project.isDeveloper || isOldVersion"
      :rules="rules"
      label-position="top"
      label-width="105px"
      class="test-case-form"
      :label-position="isInMobile ? 'top' : 'right'">
      <el-form-item :label="$t('test.case.edit.name')" prop="details.name">
        <el-input v-model="testCase.details.name" maxlength="200" show-word-limit clearable></el-input>
      </el-form-item>

      <el-row>
        <el-col :xs="24" :sm="10">
          <el-form-item :label="$t('test.case.edit.type')">
            <div class="w-full flex items-center">
              <el-select v-model="testCase.details.type" clearable>
                <el-option
                  v-for="caseType in Object.keys(dict.testTypes)"
                  :key="caseType"
                  :label="$t(`testTypes.${caseType}`)"
                  :value="caseType">
                </el-option>
              </el-select>
              <el-checkbox
                v-model="testCase.details.automated"
                :label="$t('test.case.edit.automated')"
                class="ml-12px" />
            </div>
          </el-form-item>
        </el-col>
        <el-col :xs="24" :sm="10" :offset="4">
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
      </el-row>

      <el-row>
        <el-col :xs="24" :sm="10">
          <el-form-item :label="$t('test.case.edit.priority')">
            <priority-selector v-model="testCase.details.priority"></priority-selector>
          </el-form-item>
        </el-col>

        <el-col :xs="24" :sm="10" :offset="4">
          <el-form-item :label="$t('test.case.edit.owner')">
            <member-selector
              v-model="testCase.details.owner"
              :placeholder="$t('test.case.edit.ownerPlaceholder')"
              :members="project.projectMembers"
              :clearable="true"></member-selector>
          </el-form-item>
        </el-col>
      </el-row>

      <el-form-item :label="$t('test.case.edit.description')">
        <el-input
          v-model="testCase.details.description"
          :autosize="{ minRows: 3 }"
          show-word-limit
          maxlength="1000"
          type="textarea"
          resize="vertical"></el-input>
      </el-form-item>

      <el-form-item :label="$t('test.case.edit.preconditions')">
        <el-input
          v-model="testCase.details.preconditions"
          :autosize="{ minRows: 3 }"
          show-word-limit
          maxlength="1000"
          type="textarea"
          resize="vertical"></el-input>
      </el-form-item>

      <el-form-item :label="$t('test.case.edit.steps.label')" class="mt-12">
        <el-table
          :data="testCase.details.steps"
          :empty-text="$t('test.case.edit.steps.empty')"
          :border="true"
          class="test-case-steps-table">
          <el-table-column label="#" width="45" align="center">
            <template #default="scope">
              <div class="seq-badge">{{ scope.$index + 1 }}</div>
            </template>
          </el-table-column>
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
                    <el-dropdown-item icon="Delete" @click.native="deleteStep(scope.$index)">{{
                      $t('common.delete')
                    }}</el-dropdown-item>
                  </el-dropdown-menu>
                </template>
              </el-dropdown>
            </template>
          </el-table-column>
        </el-table>
        <el-button class="add-step-button mt-2" type="primary" text icon="Plus" @click="addStep">
          {{ $t('test.case.edit.steps.add') }}</el-button
        >
      </el-form-item>
      <el-form-item :label="$t('test.case.edit.files')" class="mt-10">
        <FileUploader
          :files="testCase.files"
          :projectId="project.id"
          :readonly="!project.isDeveloper || isOldVersion"
          targetType="TEST_CASE_ATTACHMENT"
          @fileUploaded="handleFileUploaded"
          @fileDeleted="handleFileDeleted" />
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
          >{{ testCase.id ? $t('common.update') : $t('common.create') }}</el-button
        >
      </div>
    </div>
  </div>
</template>

<script>
import { componentApi } from '@/api/component.js'
import { testCaseApi } from '@/api/testing.js'
import utils from '@/utils/util.js'
import dict from '@/locales/zh-cn/dict.json'
import FileUploader from '@/components/common/FileUploader.vue'
import { ElMessage, ElMessageBox } from 'element-plus'
import PrioritySelector from '@/components/common/PrioritySelector.vue'
import MemberSelector from '@/components/common/MemberSelector.vue'
import FileIcon from '@/components/common/FileIcon.vue'
import Avatar from '@/components/common/Avatar.vue'

export default {
  name: 'TestCaseEdit',
  components: {
    PrioritySelector,
    MemberSelector,
    FileIcon,
    Avatar,
    FileUploader
  },
  props: {},
  data() {
    return {
      dict: dict,
      isInMobile: utils.isInMobile(),
      projectId: this.$route.params.projectId,
      project: {},
      testCaseId: this.$route.params.testCaseId,
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
        },
        files: []
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
    listVersions() {
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
    loadCase() {
      testCaseApi.get(this.testCaseId).then((response) => {
        this.testCase = response.data
        if (!this.testCase.files) {
          this.testCase.files = []
        }
        this.syncAllInputHeights()
      })
    },
    loadDetails(version) {
      testCaseApi.getDetails(this.testCaseId, version).then((response) => {
        this.testCase.details = response.data
        this.syncAllInputHeights()
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
    syncAllInputHeights() {
      this.$nextTick(() => {
        this.testCase.details?.steps?.forEach((_, index) => {
          this.syncInputHeight(index)
        })
      })
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
      this.syncAllInputHeights()
    },
    moveUpStep(index) {
      if (index > 0) {
        const step = this.testCase.details.steps.splice(index, 1)[0]
        this.testCase.details.steps.splice(index - 1, 0, step)
        this.syncAllInputHeights()
      }
    },
    moveDownStep(index) {
      if (index < this.testCase.details.steps.length - 1) {
        const step = this.testCase.details.steps.splice(index, 1)[0]
        this.testCase.details.steps.splice(index + 1, 0, step)
        this.syncAllInputHeights()
      }
    },
    deleteStep(index) {
      this.testCase.details.steps.splice(index, 1)
      this.syncAllInputHeights()
    },
    handleFileUploaded(file) {
      this.testCase.files.push(file)
    },
    handleFileDeleted(file) {
      const index = this.testCase.files.findIndex((f) => f.id === file.id)
      if (index !== -1) {
        this.testCase.files.splice(index, 1)
      }
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
              // stay on the edit page
              this.testCase = response.data

              // Replace the router if is creating a new test case
              if (this.testCaseId === 'new') {
                this.$router.replace({
                  name: 'TestCaseEdit',
                  params: { projectId: this.projectId, testCaseId: this.testCase.id }
                })
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
  width: 800px;
  display: flex;
  flex-direction: column;
  min-height: calc(100vh - 120px);

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

  .test-case-form {
    flex-grow: 1;
  }

  .footer {
    display: flex;
    margin-top: 50px;
  }
}
</style>
<style lang="less">
.test-case-edit-page {
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

    textarea {
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
