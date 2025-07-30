<template>
  <el-dialog
    :title="testPlanId ? $t('test.plan.edit.title.edit') : $t('test.plan.edit.title.new')"
    v-model="dialogVisible"
    :fullscreen="isInMobile"
    :draggable="true"
    class="test-plan-edit-dialog"
    @closed="$emit('testPlanClosed')"
    width="600px">
    <el-form
      ref="testPlanForm"
      :model="testPlan"
      :rules="rules"
      label-width="88px"
      class="test-plan-form"
      :label-position="isInMobile ? 'top' : 'right'">
      <el-form-item :label="$t('test.plan.edit.name')" prop="name">
        <el-input v-model="testPlan.name" maxlength="200" show-word-limit clearable></el-input>
      </el-form-item>
      <el-row>
        <el-col :xs="24" :sm="12">
          <el-form-item :label="$t('test.plan.edit.type')">
            <el-select v-model="testPlan.type" :placeholder="$t('test.plan.edit.typePlaceholder')" clearable>
              <el-option
                v-for="caseType in Object.keys(dict.testCaseTypes)"
                :key="caseType"
                :label="$t(`testCaseTypes.${caseType}`)"
                :value="caseType">
              </el-option>
            </el-select>
          </el-form-item>
        </el-col>
        <el-col :xs="24" :sm="12">
          <el-form-item :label="$t('test.plan.edit.owner')">
            <member-selector
              v-model="testPlan.owner"
              :placeholder="$t('test.plan.edit.ownerPlaceholder')"
              :members="project.projectMembers"
              :clearable="true"></member-selector>
          </el-form-item>
        </el-col>
      </el-row>
      <el-row>
        <el-col :xs="24" :sm="12">
          <el-form-item :label="$t('test.plan.edit.startDate')">
            <el-date-picker
              v-model="testPlan.startDate"
              type="date"
              value-format="YYYY-MM-DD"
              :placeholder="$t('test.plan.edit.startDate')"
              :teleported="false"
              :disabled-date="disabledStartDate"
              class="w-full">
            </el-date-picker>
          </el-form-item>
        </el-col>
        <el-col :xs="24" :sm="12">
          <el-form-item :label="$t('test.plan.edit.endDate')">
            <el-date-picker
              v-model="testPlan.endDate"
              type="date"
              value-format="YYYY-MM-DD"
              :placeholder="$t('test.plan.edit.endDate')"
              :teleported="false"
              :disabled-date="disabledEndDate"
              class="w-full">
            </el-date-picker>
          </el-form-item>
        </el-col>
      </el-row>
    </el-form>
    <template #footer>
      <div class="dialog-footer-btn-row">
        <el-button
          v-if="testPlan.id"
          :loading="deleting"
          type="danger"
          icon="Delete"
          plain
          size="default"
          class="no-border"
          @click="deleteTestPlan"
          >{{ $t('common.delete') }}</el-button
        >
        <div class="ml-auto">
          <el-button size="default" class="no-border" @click="dialogVisible = false">{{
            $t('common.cancel')
          }}</el-button>
          <el-button :loading="saving" size="default" type="primary" class="no-border" @click="saveTestPlan">{{
            $t('common.save')
          }}</el-button>
        </div>
      </div>
    </template>
  </el-dialog>
</template>
<script>
import { testPlanApi } from '@/api/testing.js'
import utils from '@/utils/util.js'
import dayjs from 'dayjs'
import dict from '@/locales/zh-cn/dict.json'
import { ElMessage, ElMessageBox } from 'element-plus'
import MemberSelector from '@/components/common/MemberSelector.vue'

export default {
  name: 'TestPlanEdit',
  components: {
    MemberSelector
  },
  emits: ['testPlanSaved', 'testPlanDeleted', 'testPlanClosed'],
  props: {
    project: {
      type: Object,
      default: null
    },
    testPlanId: {
      type: String,
      default: null
    }
  },
  data() {
    return {
      dict: dict,
      isInMobile: utils.isInMobile(),
      dialogVisible: true,
      testPlan: {},
      saving: false,
      deleting: false,
      rules: {
        name: [
          {
            required: true,
            message: this.$t('test.plan.edit.msg.nameMissing'),
            trigger: 'blur'
          }
        ]
      }
    }
  },
  created() {
    if (this.testPlanId) {
      this.loadPlan()
    } else {
      this.testPlan.projectId = this.project.id
    }
  },
  mounted() {},
  methods: {
    loadPlan() {
      testPlanApi.get(this.testPlanId).then((response) => {
        this.testPlan = response.data
      })
    },
    disabledStartDate(date) {
      if (!this.testPlan.endDate) return false
      return dayjs(date).isAfter(dayjs(this.testPlan.endDate))
    },
    disabledEndDate(date) {
      if (!this.testPlan.startDate) return false
      return dayjs(date).isBefore(dayjs(this.testPlan.startDate))
    },
    saveTestPlan() {
      this.$refs.testPlanForm.validate((valid) => {
        if (valid) {
          this.saving = true
          const apiCall = this.testPlan.id
            ? testPlanApi.update(this.testPlan.id, this.testPlan)
            : testPlanApi.create(this.testPlan)

          apiCall
            .then((response) => {
              const savedPlan = response.data

              // Ensure the owner avatar can be displayed correctly
              if (savedPlan.owner?.id === this.testPlan.owner?.id) {
                savedPlan.owner = this.testPlan.owner
              }

              this.saving = false
              ElMessage.success(
                this.testPlan.id
                  ? this.$t('test.plan.edit.msg.updateSuccess')
                  : this.$t('test.plan.edit.msg.createSuccess')
              )
              // Close the dialog and emit the saved event
              this.dialogVisible = false
              this.$emit('testPlanSaved', savedPlan)
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
    deleteTestPlan() {
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
            this.$emit('testPlanDeleted', this.testPlan)
            this.dialogVisible = false
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
.test-plan-edit-dialog {
  .dialog-footer-btn-row {
    display: flex;
    justify-content: space-between;
    align-items: center;
  }
}
</style>
