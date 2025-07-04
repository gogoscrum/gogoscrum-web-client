<template>
  <div class="project-edit-container">
    <el-dialog
      :title="currentProject.id ? $t('editProject.titleEdit') : $t('editProject.titleNew')"
      v-model="dialogVisible"
      width="480px"
      :fullscreen="isInMobile"
      :draggable="true"
      @close="$emit('projectFormClosed')">
      <el-form ref="projectForm" :model="currentProject" :rules="rules" label-width="68px">
        <el-form-item :label="$t('editProject.name')" prop="name">
          <el-input v-model="currentProject.name" maxlength="40" show-word-limit clearable></el-input>
        </el-form-item>
        <el-form-item :label="$t('editProject.code')" prop="code">
          <el-input
            v-model="currentProject.code"
            maxlength="6"
            show-word-limit
            clearable
            @input="projectCodeChanged"></el-input>
          <div class="form-field-tip">
            {{ $t('editProject.codeTips') }}
          </div>
        </el-form-item>
      </el-form>
      <template #footer>
        <el-button
          v-if="currentProject.id && currentProject.owner.id === currentUser.id"
          type="danger"
          icon="Delete"
          class="delete-project-button no-border"
          plain
          size="default"
          @click="deleteProject"
          >{{ $t('common.delete') }}</el-button
        >
        <el-button size="default" class="no-border" @click="dialogVisible = false">{{ $t('common.cancel') }}</el-button>
        <el-button :loading="saving" size="default" type="primary" class="no-border" @click="savedProject">{{
          $t('common.save')
        }}</el-button>
      </template>
    </el-dialog>
  </div>
</template>
<script>
import { projectApi } from '@/api/project.js'
import utils from '@/utils/util.js'
import { ElMessage, ElMessageBox } from 'element-plus'

export default {
  data() {
    return {
      isInMobile: utils.isInMobile(),
      currentUser: null,
      currentProject: JSON.parse(JSON.stringify(this.originalProject)),
      dialogVisible: true,
      saving: false,
      rules: {
        name: [
          {
            required: true,
            message: this.$t('editProject.msg.nameMissing'),
            trigger: 'blur'
          },
          {
            min: 1,
            max: 40,
            message: this.$t('editProject.msg.nameInvalid'),
            trigger: 'blur'
          }
        ],
        code: [
          {
            required: true,
            message: this.$t('editProject.msg.codeMissing'),
            trigger: 'blur'
          },
          {
            min: 3,
            max: 6,
            message: this.$t('editProject.msg.codeInvalid'),
            trigger: 'blur'
          }
        ]
      }
    }
  },
  name: 'ProjectEdit',
  props: {
    originalProject: {
      type: Object,
      default() {
        return {}
      }
    }
  },
  created() {
    this.currentUser = this.$store.get('user')
  },
  mounted() {},
  methods: {
    projectCodeChanged() {
      if (this.currentProject.code) {
        this.currentProject.code = this.currentProject.code.toUpperCase()
      }
    },
    deleteProject() {
      ElMessageBox.confirm(
        this.$t('editProject.msg.delConfirmMsg', {
          projectName: this.currentProject.name
        }),
        this.$t('editProject.msg.delConfirmTitle'),
        {
          type: 'warning',
          dangerouslyUseHTMLString: true,
          draggable: true
        }
      ).then(() => {
        projectApi.delete(this.currentProject.id).then(() => {
          ElMessage.success({
            message: this.$t('editProject.msg.delSuccess')
          })
          this.$emit('projectDeleted', this.currentProject)
          this.dialogVisible = false
        })
      })
    },
    savedProject() {
      this.$refs['projectForm'].validate((valid) => {
        if (!valid) {
          ElMessage.error({
            message: this.$t('common.msg.formValidationFail')
          })
          return
        } else {
          this.saving = true

          projectApi.create(this.currentProject).then((res) => {
            const project = res.data
            project.isNew = true

            ElMessage.success({
              message: this.$t('editProject.msg.createSuccess')
            })

            // Delay a little bit to improve user experience
            setTimeout(() => {
              this.saving = false
              this.$emit('projectSaved', project)
              this.dialogVisible = false
            }, 300)
          })
        }
      })
    }
  }
}
</script>

<style lang="less" scoped>
.project-edit-container {
  .el-select {
    width: 100%;
  }
  .delete-project-button {
    float: left;
  }
}
</style>
