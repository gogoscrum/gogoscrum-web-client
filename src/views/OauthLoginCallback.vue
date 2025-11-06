<template>
  <div class="login-callback-landing-page" v-loading="loading" :element-loading-text="loadingText">
    <el-dialog
      :title="$t('loginRedirect.title')"
      :close-on-click-modal="false"
      :close-on-press-escape="false"
      :showClose="false"
      :draggable="true"
      v-model="bindingDialogVisible"
      width="440px"
      top="15vh">
      <el-form :model="userForm" ref="userForm" :rules="rules">
        <el-form-item prop="username">
          <el-input v-model="userForm.username" :placeholder="$t('loginRedirect.username')" clearable></el-input>
        </el-form-item>
        <el-form-item prop="password">
          <el-input
            v-model="userForm.password"
            type="password"
            :placeholder="$t('loginRedirect.password')"
            show-password
            clearable></el-input>
        </el-form-item>
      </el-form>
      <template #footer>
        <el-button size="default" class="no-border" @click="cancelBinding">{{ $t('common.cancel') }}</el-button>
        <el-button size="default" type="primary" class="no-border" :loading="submitting" @click="submitBinding">{{
          $t('loginRedirect.bind')
        }}</el-button>
      </template>
    </el-dialog>
  </div>
</template>

<script>
import { userApi } from '@/api/user.js'
import { ElLoading as Loading, ElMessageBox, vLoading } from 'element-plus'
import { ElMessage } from 'element-plus'
import utils from '@/utils/util.js'

export default {
  name: 'OauthLoginCallback',
  data() {
    return {
      user: {},
      oauthParms: {
        provider: null,
        code: null,
        state: null
      },
      bindingDialogVisible: false,
      userForm: {
        username: '',
        password: ''
      },
      rules: {
        username: [
          {
            required: true,
            message: this.$t('loginRedirect.missingUsername'),
            tigger: 'blur'
          }
        ],
        password: [
          {
            required: true,
            message: this.$t('loginRedirect.missingPassword'),
            tigger: 'blur'
          }
        ]
      },
      user: null,
      loading: false,
      loadingText: this.$t('loginRedirect.signingIn'),
      submitting: false
    }
  },
  created() {
    const provider = this.$route.params.provider
    const { code, state } = this.$route.query

    if (provider && code && state) {
      this.oauthParms.provider = provider
      this.oauthParms.code = code
      this.oauthParms.state = state
      this.oauthLogin()
    } else {
      console.error('OAuth login failed: missing provider, code or state', this.$route)
      ElMessage.error({
        message: this.$t('loginRedirect.signinFailed')
      })
      setTimeout(() => {
        this.$router.push({ name: 'Login' })
      }, 3000)
    }
  },
  mounted() {},
  methods: {
    oauthLogin() {
      this.loading = true
      const rememberMe = this.$store.get('loginPageRememberMeFlag') || false

      userApi
        .oauthLogin(this.oauthParms, rememberMe)
        .then((res) => {
          this.user = res.data

          if (this.user?.id) {
            utils.afterLogin(this.user)
          } else {
            this.askToBind()
          }
        })
        .finally(() => {
          this.loading = false
        })
    },
    askToBind() {
      ElMessageBox.confirm(this.$t('loginRedirect.bindConfirmMsg'), this.$t('loginRedirect.bindConfirmTitle'), {
        confirmButtonText: this.$t('loginRedirect.goToBind'),
        cancelButtonText: this.$t('loginRedirect.bindConfirmCancle'),
        closeOnClickModal: false,
        closeOnPressEscape: false,
        showClose: false,
        type: 'info',
        draggable: true
      })
        .then(() => {
          this.bindingDialogVisible = true
        })
        .catch(() => {
          this.createOrBind()
        })
    },
    cancelBinding() {
      this.bindingDialogVisible = false
      this.user.bindToExistingUser = false
      this.createOrBind()
    },
    submitBinding() {
      this.$refs['userForm'].validate((valid) => {
        if (valid) {
          this.user.username = this.userForm.username
          this.user.password = this.userForm.password
          this.user.bindToExistingUser = true
          this.createOrBind()
        } else {
          ElMessage.error({
            message: this.$t('common.msg.formValidationFail')
          })
        }
      })
    },
    createOrBind() {
      if (this.bindingDialogVisible) {
        this.submitting = true
      } else {
        this.loading = true
        this.loadingText = this.$t('loginRedirect.creatingAccount')
      }

      const rememberMe = this.$store.get('loginPageRememberMeFlag') || false
      const isBinding = this.user.bindToExistingUser === true
      userApi
        .oauthRegister(this.user, rememberMe)
        .then((res) => {
          this.user = res.data
          ElMessage.success({
            message: isBinding ? this.$t('loginRedirect.bindSuccess') : this.$t('loginRedirect.createSuccess'),
            center: true
          })
          utils.afterLogin(this.user)
        })
        .finally(() => {
          this.loading = false
          this.submitting = false
        })
    }
  }
}
</script>

<style lang="less" scoped>
.login-callback-landing-page {
  height: 400px;
}
</style>
