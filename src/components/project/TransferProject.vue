<template>
  <div class="transfer-project-container">
    <el-dialog
      :title="$t('transferProject.dialogTitle')"
      v-model="dialogVisible"
      width="480px"
      :fullscreen="isInMobile"
      :draggable="true"
      @close="$emit('transferDialogClosed')">
      <el-form ref="projectTransferForm" :model="transferProjectForm" :rules="rules" label-width="68px">
        <el-form-item :label="$t('transferProject.owner')" prop="owner">
          <el-select
            v-model="transferProjectForm.owner"
            value-key="id"
            :placeholder="$t('transferProject.ownerPlaceholder')"
            filterable
            clearable
            :class="transferProjectForm.owner ? 'has-owner-avatar' : ''">
            <template #prefix>
              <div class="user-avatar" v-if="transferProjectForm.owner">
                <avatar
                  :name="transferProjectForm.owner.nickname"
                  :size="24"
                  :src="transferProjectForm.owner.avatarUrl"></avatar>
              </div>
            </template>

            <el-option
              v-for="member in project.projectMembers"
              :key="member.id"
              :label="member.user.nickname"
              :value="member.user"
              :disabled="member.user.id == currentUser.id">
              <div class="user-select-option">
                <div class="user-avatar">
                  <avatar :name="member.user.nickname" :size="24" inline :src="member.user.avatarUrl"></avatar>
                </div>
                <div class="username">{{ member.user.nickname }}</div>
              </div>
            </el-option>
          </el-select>
        </el-form-item>
        <el-form-item>
          <el-checkbox v-model="transferProjectForm.quit">{{ $t('transferProject.quit') }}</el-checkbox>
        </el-form-item>
      </el-form>
      <template #footer>
        <el-button size="default" class="no-border" @click="dialogVisible = false">{{ $t('common.cancel') }}</el-button>
        <el-button size="default" type="primary" class="no-border" @click="savedProject">{{
          $t('common.save')
        }}</el-button>
      </template>
    </el-dialog>
  </div>
</template>

<script>
import { projectApi } from '@/api/project.js'
import { ElMessage, ElMessageBox } from 'element-plus'
import Avatar from '@/components/common/Avatar.vue'
import utils from '@/utils/util.js'

export default {
  name: 'transferProject',
  components: {
    Avatar
  },
  props: {
    projectId: {
      type: String,
      default: null
    }
  },
  data() {
    return {
      isInMobile: utils.isInMobile(),
      project: {},
      currentUser: this.$store.get('user'),
      dialogVisible: true,
      transferProjectForm: {
        owner: null,
        quit: false
      },
      rules: {
        owner: [
          {
            required: true,
            message: this.$t('transferProject.msg.ownerMissing'),
            trigger: 'blur'
          }
        ]
      }
    }
  },
  created() {
    this.loadProject()
  },
  mounted() {},
  methods: {
    loadProject() {
      projectApi.getById(this.projectId).then((res) => {
        this.project = res.data
      })
    },
    savedProject() {
      this.$refs['projectTransferForm'].validate((valid) => {
        if (!valid) {
          ElMessage.error({
            message: this.$t('common.msg.formValidationFail')
          })
          return
        } else {
          ElMessageBox.confirm(
            this.$t('transferProject.msg.transferConfirmMsg', {
              projectName: this.project.name,
              newOwnerName: this.transferProjectForm.owner.nickname
            }),
            this.$t('transferProject.msg.transferConfirmTitle'),
            {
              type: 'warning',
              dangerouslyUseHTMLString: true,
              draggable: true
            }
          )
            .then(() => {
              projectApi
                .transferTo(this.project.id, this.transferProjectForm.owner.id, this.transferProjectForm.quit)
                .then((res) => {
                  ElMessage.success({
                    message: this.transferProjectForm.quit
                      ? this.$t('transferProject.msg.transferAndQuitSuccess')
                      : this.$t('transferProject.msg.transferSuccess')
                  })

                  if (this.transferProjectForm.quit) {
                    this.$emit('projectQuit', res.data)
                  } else {
                    this.$emit('projectSaved', res.data)
                  }

                  this.dialogVisible = false
                })
            })
            .catch((err) => {
              // Cancelled, do nothing
            })
        }
      })
    }
  }
}
</script>

<style lang="less" scoped>
.transfer-project-container {
  .el-select {
    width: 100%;
  }
}

.user-select-option {
  display: flex;

  .user-avatar {
    margin-right: 12px;
    display: flex;
    align-items: center;
  }
}
</style>
