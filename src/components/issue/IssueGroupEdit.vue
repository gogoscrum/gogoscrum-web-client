<template>
  <div class="issue-group-edit-container">
    <el-dialog
      :title="issueGroup.id ? $t('issueGroupEdit.titleEdit') : $t('issueGroupEdit.titleNew')"
      v-model="issueGroupDialogVisible"
      width="480px"
      :fullscreen="isInMobile"
      :draggable="true"
      @close="$emit('issueGroupEditClosed')">
      <el-form ref="issueGroupForm" :model="issueGroup" :rules="rules" label-width="68px" @submit.native.prevent>
        <el-form-item :label="$t('issueGroupEdit.name')" prop="label">
          <el-input v-model="issueGroup.label" maxlength="15" show-word-limit clearable></el-input>
        </el-form-item>
      </el-form>
      <template #footer>
        <el-button
          type="danger"
          class="delete-group-button"
          plain
          size="default"
          @click="deleteIssueGroup"
          v-if="issueGroup.id && issueGroup.deletable"
          >{{ $t('common.delete') }}</el-button
        >
        <el-button size="default" @click="issueGroupDialogVisible = false">{{ $t('common.cancel') }}</el-button>
        <el-button size="default" type="primary" @click="saveIssueGroup">{{ $t('common.create') }}</el-button>
      </template>
    </el-dialog>
  </div>
</template>

<script>
import { issueGroupApi } from '@/api/issueGroup.js'
import utils from '@/utils/util.js'
import { ElMessage, ElMessageBox } from 'element-plus'
export default {
  name: 'IssueGroupCreator',
  props: {
    originalIssueGroup: {
      type: Object,
      default() {
        return {}
      }
    },
    originalProject: {
      type: Object,
      default() {
        return {}
      }
    },
    issuesList: {
      type: Array,
      default() {
        return []
      }
    }
  },
  data() {
    return {
      isInMobile: utils.isInMobile(),
      issueGroup: JSON.parse(JSON.stringify(this.originalIssueGroup)),
      issueGroupDialogVisible: true,
      // issues: [],
      rules: {
        label: [
          {
            required: true,
            message: this.$t('issueGroupEdit.msg.nameMissing'),
            trigger: 'blur'
          },
          {
            min: 1,
            max: 40,
            message: this.$t('issueGroupEdit.msg.nameInvalid'),
            trigger: 'blur'
          }
        ]
      }
    }
  },
  mounted() {},
  methods: {
    deleteIssueGroup() {
      ElMessageBox.confirm(this.$t('issueGroupEdit.msg.delConfirmMsg'), this.$t('issueGroupEdit.msg.delConfirmTitle'), {
        type: 'warning',
        draggable: true
      }).then(() => {
        issueGroupApi.delete(this.issueGroup.id).then(() => {
          this.$emit('issueGroupDeleted', this.issueGroup)
          this.issueGroupDialogVisible = false
        })
      })
    },
    saveIssueGroup() {
      this.$refs['issueGroupForm'].validate((valid) => {
        if (!valid) {
          ElMessage.error({
            message: this.$t('common.msg.formValidationFail')
          })
          return false
        } else {
          if (this.issueGroup.id) {
            issueGroupApi.update(this.issueGroup.id, this.issueGroup).then((res) => {
              ElMessage.success({
                message: this.$t('issueGroupEdit.msg.editSuccess')
              })
              this.$emit('issueGroupSaved', res.data)
              this.issueGroupDialogVisible = false
            })
          } else {
            this.issueGroup.project = this.originalProject
            this.issueGroup.seq = this.originalProject.issueGroups.length
            issueGroupApi.create(this.issueGroup).then((res) => {
              ElMessage.success({
                message: this.$t('issueGroupEdit.msg.createSuccess')
              })
              this.$emit('issueGroupSaved', res.data)
              this.issueGroupDialogVisible = false
            })
          }
        }
      })
    }
  }
}
</script>

<style lang="less">
.issue-group-edit-container {
  .el-select {
    width: 100%;
  }

  .delete-group-button {
    float: left;
  }
}
</style>
