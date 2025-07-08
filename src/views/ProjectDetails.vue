<template>
  <div class="project-details-page page">
    <div class="title">{{ $t('editProject.titleDetails') }}</div>
    <el-form
      ref="projectForm"
      :model="project"
      :disabled="!isOwner"
      :rules="rules"
      label-width="100px"
      :label-position="isInMobile ? 'top' : 'right'">
      <div :class="isInMobile ? '100%' : 'w-480px'">
        <el-form-item :label="$t('editProject.name')" prop="name">
          <el-input v-model="project.name" maxlength="40" show-word-limit clearable></el-input>
        </el-form-item>
        <el-form-item :label="$t('editProject.code')" prop="code">
          <el-input
            v-model="project.code"
            maxlength="6"
            show-word-limit
            clearable
            @input="projectCodeChanged"></el-input>
          <div class="form-field-tip">
            {{ $t('editProject.codeTips') }}
          </div>
        </el-form-item>

        <el-form-item :label="$t('editProject.avatar')" class="flex">
          <div class="avatar-wrapper">
            <Avatar
              v-if="oldProjectName"
              :name="oldProjectName"
              :size="36"
              :src="project.avatar?.url"
              :rounded="false"></Avatar>
            <el-icon
              v-if="project.avatar"
              class="img-action-icon delete-img-icon"
              :title="$t('common.delete')"
              @click="deleteAvatar">
              <Delete />
            </el-icon>
          </div>
          <div v-if="isOwner" class="ml-auto">
            <el-upload
              :action="uploadParams.uploadActionUrl"
              :before-upload="initUploadParams"
              :data="uploadParams"
              :on-success="avaterUploaded"
              :show-file-list="false"
              accept="image/*">
              <el-button :loading="avatarUploading" text bg type="primary">{{
                project.avatar ? $t('editProject.changeAvatar') : $t('editProject.uploadAvatar')
              }}</el-button>
            </el-upload>
          </div>
        </el-form-item>
        <el-form-item :label="$t('editProject.description')" prop="description">
          <el-input
            v-model="project.description"
            :rows="5"
            type="textarea"
            maxlength="2000"
            show-word-limit
            clearable></el-input>
        </el-form-item>
        <el-form-item :label="$t('editProject.duration')" prop="startDate" class="date-range">
          <el-date-picker
            v-model="project.startDate"
            type="date"
            :placeholder="$t('editSprint.startTime')"
            value-format="YYYY-MM-DD"
            class="date-input">
          </el-date-picker>
          <span>{{ $t('editProject.to') }}</span>
          <el-date-picker
            v-model="project.endDate"
            type="date"
            :placeholder="$t('editSprint.endTime')"
            value-format="YYYY-MM-DD"
            class="date-input">
          </el-date-picker>
        </el-form-item>

        <el-form-item :label="$t('editProject.timeTracking')" class="w-full flex">
          <div class="form-field-tip !mt-0 mr-auto">{{ $t('editProject.timeTrackingDesc') }}</div>
          <el-switch
            v-model="project.timeTrackingEnabled"
            inline-prompt
            active-icon="Check"
            inactive-icon="Close"></el-switch>
        </el-form-item>

        <el-form-item :label="$t('editProject.owner')" class="flex">
          <Avatar
            v-if="project.owner"
            :name="project.owner.nickname"
            :size="24"
            :src="project.owner.avatarUrl"></Avatar>
          <span class="ml-2">{{ project.owner?.nickname }}</span>
          <el-button v-if="isOwner" text bg type="primary" class="ml-auto" @click="transferProject">{{
            $t('projectList.list.transfer')
          }}</el-button>
        </el-form-item>
        <el-form-item :label="$t('editProject.status')" class="flex">
          <el-tag v-if="project.archived" type="warning" effect="plain" size="small">
            {{ $t('projectList.list.archived') }}
          </el-tag>
          <span v-else>{{ $t('editProject.active') }}</span>
          <el-button v-if="isOwner" text bg type="primary" class="ml-auto" @click="toggleArchive">{{
            project.archived ? $t('projectList.list.unarchive') : $t('projectList.list.archive')
          }}</el-button>
        </el-form-item>
      </div>
    </el-form>
    <div :class="isInMobile ? '100%' : 'w-480px'">
      <div class="mt-50px w-full flex">
        <el-button
          v-if="isOwner"
          type="danger"
          icon="Delete"
          class="delete-project-button no-border"
          plain
          size="default"
          @click="deleteProject"
          >{{ $t('common.delete') }}</el-button
        >
        <div class="flex ml-auto">
          <el-button size="default" class="no-border" @click="$router.go(-1)">{{ $t('common.cancel') }}</el-button>
          <el-button
            :disabled="!isOwner"
            :loading="saving"
            size="default"
            type="primary"
            class="no-border"
            @click="savedProject"
            >{{ $t('common.save') }}</el-button
          >
        </div>
      </div>
    </div>
    <transfer-project-dialog
      v-if="transferDialogVisible"
      :projectId="projectId"
      @transferDialogClosed="transferDialogClosed"
      @projectSaved="projectSaved"
      @projectQuit="projectQuit" />
  </div>
</template>

<script>
import { projectApi } from '@/api/project.js'
import uploader from '@/utils/uploader.js'
import utils from '@/utils/util.js'
import TransferProjectDialog from '@/components/project/TransferProject.vue'
import Avatar from '@/components/common/Avatar.vue'
import { ElMessage, ElMessageBox } from 'element-plus'
import MemberSelector from '@/components/common/MemberSelector.vue'

export default {
  name: 'ProjectDetails',
  components: {
    TransferProjectDialog,
    Avatar,
    MemberSelector
  },
  props: {},
  data() {
    return {
      isInMobile: utils.isInMobile(),
      projectId: this.$route.params.projectId,
      project: {},
      oldProjectName: '',
      transferDialogVisible: false,
      uploadParams: {},
      avatarUploading: false,
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
  computed: {
    isOwner() {
      let currentUser = this.$store.get('user')
      return this.project.owner?.id === currentUser.id
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
        this.oldProjectName = this.project.name
      })
    },
    projectCodeChanged() {
      if (this.project.code) {
        this.project.code = this.project.code.toUpperCase()
      }
    },
    initUploadParams(file) {
      const tooLarge = file.size / 1024 / 1024 > 1
      if (tooLarge) {
        ElMessage.warning({
          message: this.$t('editProject.msg.avatarTooLarge')
        })
        return false
      } else {
        this.avatarUploading = true

        return uploader.initUploadParams(file, this.projectId, 'PROJECT_AVATAR').then((params) => {
          this.uploadParams = params
        })
      }
    },
    avaterUploaded(uploadRes, file) {
      const avatarFileDto = {
        name: file.name,
        fullPath: uploadRes,
        type: uploader.getFileType(file.raw.type),
        size: file.size,
        projectId: this.projectId,
        targetType: 'PROJECT_AVATAR',
        storageProvider: this.uploadParams.provider,
        urlPrefix: this.uploadParams.urlPrefix
      }

      projectApi
        .updateAvatar(this.projectId, avatarFileDto)
        .then((res) => {
          ElMessage.success({
            message: this.$t('editProject.msg.avatarUpdated')
          })
          this.avatarUploading = false
          this.project.avatar = res.data.avatar // Only updated the avatar image, keep the form data as it is (in case of other fields being modified)
          this.$bus.$emit('projectUpdated', res.data)
        })
        .finally(() => {
          this.avatarUploading = false
        })
    },
    deleteAvatar() {
      ElMessageBox.confirm(
        this.$t('editProject.msg.delAvatarConfirmMsg'),
        this.$t('editProject.msg.delAvatarConfirmTitle'),
        {
          type: 'warning',
          dangerouslyUseHTMLString: true,
          draggable: true
        }
      ).then(() => {
        projectApi.deleteAvatar(this.project.id).then((res) => {
          this.project.avatar = null
          ElMessage.success({
            message: this.$t('editProject.msg.delAvatarSuccess')
          })
          this.$bus.$emit('projectUpdated', this.project)
        })
      })
    },
    transferProject() {
      this.transferDialogVisible = true
    },
    transferDialogClosed() {
      this.transferDialogVisible = false
    },
    toggleArchive() {
      if (this.project.archived) {
        this.unarchiveProject()
      } else {
        this.archiveProject()
      }
    },
    archiveProject() {
      projectApi.archive(this.projectId).then((res) => {
        this.project = res.data

        ElMessage.success({
          message: this.$t('projectList.msg.archiveSuccess', {
            projectName: res.data.name
          })
        })
      })
    },
    unarchiveProject() {
      projectApi.unarchive(this.projectId).then((res) => {
        this.project = res.data

        ElMessage.success({
          message: this.$t('projectList.msg.unarchiveSuccess', {
            projectName: res.data.name
          })
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
          projectApi.update(this.project.id, this.project).then((res) => {
            this.project = res.data
            this.oldProjectName = this.project.name
            this.$bus.$emit('projectUpdated', res.data)
            // Delay a little bit to improve user experience
            setTimeout(() => {
              ElMessage.success({
                message: this.$t('editProject.msg.editSuccess')
              })
              this.saving = false
            }, 200)
          })
        }
      })
    },
    projectSaved(project) {
      this.project = project
    },
    projectQuit(project) {
      this.$router.push({
        name: 'MyProjects'
      })
    },
    deleteProject() {
      ElMessageBox.confirm(
        this.$t('projectList.msg.delConfirmMsg', { projectName: this.project.name }),
        this.$t('projectList.msg.delConfirmTitle'),
        {
          type: 'warning',
          dangerouslyUseHTMLString: true,
          draggable: true
        }
      )
        .then(() => {
          projectApi.delete(this.projectId).then((res) => {
            ElMessage.success({
              message: this.$t('projectList.msg.delSuccess', {
                projectName: this.project.name
              })
            })
            this.$bus.$emit('projectDeleted', this.project)
            this.$router.push({
              name: 'MyProjects'
            })
          })
        })
        .catch((err) => {
          // Cancelled, do nothing
        })
    }
  }
}
</script>

<style lang="less">
.project-details-page {
  .date-range {
    .el-form-item__content {
      justify-content: space-between;
    }

    .date-input {
      width: 45%;
    }
  }
}
</style>
