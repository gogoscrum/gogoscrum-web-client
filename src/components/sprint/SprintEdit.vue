<template>
  <div class="edit-sprint-container">
    <el-dialog
      :title="sprintForm.id ? $t('editSprint.titleEdit') : $t('editSprint.titleNew')"
      v-model="dialogVisible"
      :fullscreen="isInMobile"
      :draggable="true"
      @close="$emit('sprintFormClosed')"
      width="520px">
      <el-form :model="sprintForm" :rules="rules" size="default" ref="sprintForm" label-width="88px">
        <el-form-item :label="$t('editSprint.name')" prop="name">
          <el-input v-model="sprintForm.name" maxlength="100" show-word-limit clearable></el-input>
        </el-form-item>
        <el-form-item v-if="!sprintForm.backlog" :label="$t('editSprint.timeRange')">
          <el-date-picker
            v-model="sprintDate"
            type="daterange"
            range-separator="to"
            :start-placeholder="$t('editSprint.startTime')"
            :end-placeholder="$t('editSprint.endTime')"
            value-format="YYYY-MM-DD"
            :teleported="false"
            class="sprint-date-range-input"
            :popper-class="`date-range-popper ${isInMobile ? 'vertical' : ''}`"
            @change="dateChanged()">
          </el-date-picker>
          <div class="form-field-tip">
            {{ $t('editSprint.timeRangeTips') }}
          </div>
        </el-form-item>
        <el-form-item v-if="!sprintForm.backlog" :label="$t('editSprint.goal')">
          <el-input
            v-model="sprintForm.goal"
            maxlength="200"
            type="textarea"
            :autosize="{ minRows: 3 }"
            resize="none"
            show-word-limit></el-input>
        </el-form-item>
      </el-form>
      <template #footer>
        <el-button
          v-if="
            sprintForm.id &&
            !sprintForm.backlog &&
            (sprintForm.project.owner.id === currentUser.id || sprintForm.createdBy.id === currentUser.id)
          "
          :loading="deleting"
          type="danger"
          icon="Delete"
          size="default"
          plain
          class="btn-delete-sprint no-border"
          @click="deleteSprint"
          >{{ $t('common.delete') }}</el-button
        >
        <el-button size="default" class="no-border" @click="dialogVisible = false">{{ $t('common.cancel') }}</el-button>
        <el-button
          :loading="saving"
          size="default"
          type="primary"
          class="no-border"
          @click="submitForm('sprintForm')"
          >{{ $t('common.save') }}</el-button
        >
      </template>
    </el-dialog>
  </div>
</template>
<script>
import { sprintApi } from '@/api/sprint.js'
import utils from '@/utils/util.js'
import { ElMessage, ElMessageBox } from 'element-plus'
export default {
  name: 'SprintEdit',
  data() {
    return {
      isInMobile: utils.isInMobile(),
      currentUser: null,
      dialogVisible: true,
      sprintForm: {},
      sprintDate: [],
      saving: false,
      deleting: false,
      rules: {
        name: [
          {
            required: true,
            message: this.$t('editSprint.msg.nameMissing'),
            trigger: 'blur'
          },
          {
            min: 1,
            max: 100,
            message: this.$t('editSprint.msg.nameInvalid'),
            trigger: 'blur'
          }
        ]
      }
    }
  },
  props: {
    project: {
      type: Object,
      default: () => {
        return {}
      }
    },
    sprintId: {
      type: String,
      default: null
    }
  },
  created() {
    this.currentUser = this.$store.get('user')
    if (this.sprintId) {
      this.loadSprint()
    } else {
      this.sprintForm.project = this.project
    }
  },
  mounted() {},
  methods: {
    loadSprint() {
      sprintApi.getById(this.sprintId).then((res) => {
        this.sprintForm = res.data

        if (this.sprintForm.startDate && this.sprintForm.endDate) {
          this.sprintDate.push(this.sprintForm.startDate)
          this.sprintDate.push(this.sprintForm.endDate)
        }
      })
    },
    dateChanged() {
      let startDate = null
      let endDate = null
      if (this.sprintDate) {
        startDate = this.sprintDate[0]
        endDate = this.sprintDate[1]
      }
      this.sprintForm.startDate = startDate
      this.sprintForm.endDate = endDate
    },
    submitForm(formName) {
      this.$refs[formName].validate((valid) => {
        if (valid) {
          this.saving = true
          this.sprintForm.project = this.project
          if (this.sprintForm.id) {
            sprintApi
              .update(this.sprintForm.id, this.sprintForm)
              .then((res) => {
                ElMessage.success({
                  message: this.$t('editSprint.msg.editSuccess')
                })
                this.$emit('sprintSaved', res.data)
                this.dialogVisible = false
              })
              .finally(() => {
                this.saving = false
              })
          } else {
            sprintApi
              .create(this.sprintForm)
              .then((res) => {
                ElMessage.success({
                  message: this.$t('editSprint.msg.createSuccess')
                })
                this.$emit('sprintSaved', res.data)
                this.dialogVisible = false
              })
              .finally(() => {
                this.saving = false
              })
          }
        } else {
          ElMessage.error({
            message: this.$t('common.msg.formValidationFail')
          })
          return false
        }
      })
    },
    deleteSprint() {
      ElMessageBox.confirm(
        this.$t('editSprint.msg.delConfirmMsg', { sprintName: this.sprintForm.name }),
        this.$t('editSprint.msg.delConfirmTitle'),
        {
          type: 'warning',
          dangerouslyUseHTMLString: true,
          draggable: true
        }
      )
        .then(() => {
          this.deleting = true
          sprintApi
            .delete(this.sprintForm.id)
            .then((res) => {
              ElMessage.success({
                message: this.$t('editSprint.msg.delSuccess')
              })
              this.$emit('sprintDeleted', this.sprintForm)
              this.dialogVisible = false
            })
            .finally(() => {
              this.deleting = false
            })
        })
        .catch((err) => {
          // Cancelled, do nothing
        })
    }
  }
}
</script>

<style lang="less" scoped>
.edit-sprint-container {
  .sprint-date-range-input {
    width: 100%;
  }

  .btn-delete-sprint {
    float: left;
  }
}
</style>

<style lang="less">
.sprint-date-range-input {
  .el-range-separator {
    white-space: nowrap;
  }
}

.date-range-popper {
  &.vertical {
    .el-date-range-picker {
      width: 360px;
      .el-picker-panel__body {
        display: flex;
        flex-direction: column;
        min-width: 100%;

        .el-date-range-picker__content {
          width: 100%;
        }
      }
    }
  }
}
</style>
