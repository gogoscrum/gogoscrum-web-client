<template>
  <div class="user-info">
    <el-dialog
      :title="$t('userInfo.title')"
      v-model="dialogVisible"
      width="580px"
      :fullscreen="isInMobile"
      :draggable="true"
      @close="$emit('userInfoClosed')">
      <div class="user-info-container">
        <el-tabs :tab-position="isInMobile ? 'top' : 'left'">
          <el-tab-pane :label="$t('userInfo.profile.title')">
            <el-form ref="userInfoForm" :model="userInfo" label-width="120px" :rules="rules">
              <el-form-item :label="$t('userInfo.profile.username')" prop="username">
                <el-input v-model="userInfo.username" :disabled="true"></el-input>
              </el-form-item>
              <el-form-item :label="$t('userInfo.profile.nickname')" prop="nickname">
                <el-input v-model="userInfo.nickname"></el-input>
              </el-form-item>
              <el-form-item :label="$t('userInfo.profile.avatar')">
                <div class="avatar-row">
                  <div class="avatar-wrapper">
                    <avatar v-if="oldNickname" :name="oldNickname" :src="userInfo.avatar?.url" :size="30"></avatar>
                    <el-icon
                      v-if="userInfo.avatar"
                      class="img-action-icon delete-img-icon"
                      :title="$t('common.delete')"
                      @click="deleteAvatar">
                      <Delete />
                    </el-icon>
                  </div>
                  <el-upload
                    :action="uploadParams.uploadActionUrl"
                    :before-upload="initUploadParams"
                    :data="uploadParams"
                    :on-success="avaterUploaded"
                    :show-file-list="false"
                    accept="image/*">
                    <el-button :loading="avatarUploading" text bg type="primary">{{
                      userInfo.avatar ? $t('common.edit') : $t('common.upload')
                    }}</el-button>
                  </el-upload>
                </div>
              </el-form-item>
            </el-form>
            <div class="button-row">
              <el-button size="default" class="no-border" @click="dialogVisible = false">{{
                $t('common.cancel')
              }}</el-button>
              <el-button :loading="saving" type="primary" size="default" @click="saveUser('userInfoForm')">{{
                $t('common.save')
              }}</el-button>
            </div>
          </el-tab-pane>
          <el-tab-pane :label="$t('userInfo.password.title')">
            <el-form ref="passwordForm" :model="formData" label-width="120px" :rules="rules">
              <el-form-item :label="$t('userInfo.password.oldPwd')" prop="oldPassword">
                <div class="flex items-center w-full">
                  <el-input v-model="formData.oldPassword" type="password" size="default">
                    <template v-if="oldPwdVerified" #suffix>
                      <el-icon class="ml-2 text-xl text-green-600"><SuccessFilled /></el-icon>
                    </template>
                  </el-input>
                </div>
              </el-form-item>
              <el-form-item :label="$t('userInfo.password.newPwd')" prop="newPassword">
                <el-input v-model="formData.newPassword" type="password" size="default"></el-input>
              </el-form-item>
              <el-form-item :label="$t('userInfo.password.repeat')" prop="repeatNewPassword">
                <el-input v-model="formData.repeatNewPassword" type="password" size="default"></el-input>
              </el-form-item>
            </el-form>
            <div class="button-row">
              <el-button size="default" class="no-border" @click="dialogVisible = false">{{
                $t('common.cancel')
              }}</el-button>
              <el-button :loading="saving" type="primary" size="default" @click="savePassword">{{
                $t('common.save')
              }}</el-button>
            </div>
          </el-tab-pane>
          <el-tab-pane v-if="oauthProviders.length" :label="$t('userInfo.oauth.title')">
            <OauthBindings v-if="userInfo.id" :user="userInfo" :providers="oauthProviders" />
          </el-tab-pane>
        </el-tabs>
      </div>
    </el-dialog>
  </div>
</template>

<script>
import { userApi } from '@/api/user.js'
import uploader from '@/utils/uploader.js'
import utils from '@/utils/util.js'
import Avatar from '@/components/common/Avatar.vue'
import OauthBindings from '@/components/user/OauthBindings.vue'
import { ElMessage, ElMessageBox } from 'element-plus'

export default {
  components: {
    Avatar,
    OauthBindings
  },
  name: 'UserEdit',
  emits: ['userInfoUpdated', 'userInfoClosed'],
  data() {
    const checkRepeatNewPassword = (rule, value, callback) => {
      if (value === this.formData.newPassword) {
        callback()
      } else {
        callback(new Error(this.$t('userInfo.msg.pwdNotSame')))
      }
    }

    return {
      isInMobile: utils.isInMobile(),
      lang: localStorage['locale'] || utils.getLang(),
      userId: null,
      userInfo: {},
      oauthProviders: [],
      oldNickname: '',
      uploadParams: {},
      avatarUploading: false,
      saving: false,
      rules: {
        nickname: [
          {
            required: true,
            message: this.$t('userInfo.msg.missingNickname'),
            trigger: 'blur'
          },
          {
            pattern: /^[a-zA-Z0-9_\u00-\uffff]{1,16}$/,
            message: this.$t('userInfo.msg.invalidNickname'),
            trigger: 'blur'
          }
        ],
        oldPassword: [
          {
            required: true,
            message: this.$t('userInfo.msg.missingOldPwd'),
            trigger: 'blur'
          }
        ],
        newPassword: [
          {
            required: true,
            message: this.$t('userInfo.msg.missingNewPwd'),
            trigger: 'blur'
          },
          {
            pattern: /^(?=.*[a-zA-Z])(?=.*\d)[^]{8,20}$/,
            message: this.$t('userInfo.msg.invalidPwd'),
            trigger: 'blur'
          }
        ],
        repeatNewPassword: [
          {
            required: true,
            message: this.$t('userInfo.msg.repeatPwd'),
            trigger: 'blur'
          },
          { validator: checkRepeatNewPassword, trigger: 'blur' }
        ]
      },
      formData: {
        oldPassword: '',
        newPassword: '',
        repeatNewPassword: ''
      },
      oldPwdVerified: false,
      dialogVisible: true
    }
  },
  created() {
    this.userId = this.$store.get('user').id

    userApi.getUserInfo(this.userId).then((res) => {
      this.userInfo = res.data
      this.oldNickname = this.userInfo.nickname
    })

    this.loadOauthProviders()
  },
  methods: {
    loadOauthProviders() {
      userApi.getOauthProviders().then((res) => {
        const allProviders = res.data

        // filter out providers which do not support current language
        if (allProviders?.length) {
          this.oauthProviders = allProviders.filter(
            (provider) => !provider.languages?.length || provider.languages.includes(this.lang)
          )
        }
      })
    },
    initUploadParams(file) {
      const tooLarge = file.size / 1024 / 1024 > 1
      if (tooLarge) {
        ElMessage.warning({
          message: this.$t('userInfo.msg.avatarTooLarge')
        })
        return false
      } else {
        this.avatarUploading = true

        return uploader
          .initUploadParams(file, null, 'USER_AVATAR')
          .then((params) => {
            this.uploadParams = params
          })
          .catch((err) => {
            console.error('Error initializing upload params:', err)
            this.avatarUploading = false
            return false
          })
      }
    },
    avaterUploaded(uploadRes, file) {
      const avatarFileDto = {
        name: file.name,
        fullPath: uploadRes || this.uploadParams.targetFileUrl,
        type: uploader.getFileType(file.raw.type),
        size: file.size,
        targetType: 'USER_AVATAR',
        storageProvider: this.uploadParams.provider,
        urlPrefix: this.uploadParams.urlPrefix
      }

      userApi
        .updateAvatar(avatarFileDto)
        .then((res) => {
          ElMessage.success({
            message: this.$t('userInfo.msg.avatarUpdated')
          })
          this.userInfo.avatar = res.data.avatar
          this.$emit('userInfoUpdated', res.data)
        })
        .finally(() => {
          this.avatarUploading = false
        })
    },
    deleteAvatar() {
      ElMessageBox.confirm(this.$t('userInfo.msg.delAvatarConfirmMsg'), this.$t('userInfo.msg.delAvatarConfirmTitle'), {
        type: 'warning',
        dangerouslyUseHTMLString: true,
        draggable: true
      }).then(() => {
        userApi.deleteAvatar().then((res) => {
          this.userInfo.avatar = null
          ElMessage.success({
            message: this.$t('userInfo.msg.delAvatarSuccess')
          })
          this.$emit('userInfoUpdated', this.userInfo)
        })
      })
    },
    saveUser(userInfoForm) {
      this.$refs[userInfoForm].validate((valid) => {
        if (valid) {
          this.saving = true

          let newUserInfo = {
            id: this.userInfo.id,
            nickname: this.userInfo.nickname
          }

          userApi
            .updateBasics(newUserInfo)
            .then((res) => {
              this.userInfo = res.data
              this.oldNickname = this.userInfo.nickname
              ElMessage.success({
                message: this.$t('userInfo.msg.profileUpdated')
              })
              this.$emit('userInfoUpdated', res.data)
              this.dialogVisible = false
            })
            .finally(() => {
              this.saving = false
            })
        } else {
          ElMessage.error({
            message: this.$t('common.msg.formValidationFail')
          })
        }
      })
    },
    savePassword() {
      this.$refs['passwordForm'].validate((valid) => {
        if (valid) {
          this.saving = true
          userApi
            .updatePassword(this.formData)
            .then((res) => {
              this.$store.remove('user')
              ElMessage.success({
                message: this.$t('userInfo.msg.pwdUpdated')
              })
              this.$router.push({ name: 'Login' })
            })
            .finally(() => {
              this.saving = false
            })
        } else {
          ElMessage.error({
            message: this.$t('common.msg.formValidationFail')
          })
          return
        }
      })
    }
  }
}
</script>

<style lang="less" scoped>
.user-info {
  .button-row {
    display: flex;
    justify-content: flex-end;
    margin-top: 32px;
  }

  .avatar-row {
    width: 100%;
    display: flex;
    justify-content: space-between;
  }
}

.user-info-container {
  min-height: 220px;
}
</style>
