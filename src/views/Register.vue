<template>
  <div class="register-form-container">
    <el-form
      :model="registerForm"
      :rules="rules"
      size="large"
      ref="registerForm"
      class="register-form"
      @keyup.enter.native="register()">
      <div class="title">
        <router-link :to="{ name: 'Homepage' }">
          <div class="logo-container">
            <img src="../assets/images/logo-black.png" class="logo" />
          </div>
        </router-link>
        <span>{{ $t('signup.title') }}</span>
      </div>
      <el-form-item prop="username">
        <el-input v-model="registerForm.username" :placeholder="$t('signup.username')" clearable></el-input>
      </el-form-item>
      <el-form-item prop="password">
        <el-input
          type="password"
          v-model="registerForm.password"
          :placeholder="$t('signup.password')"
          clearable></el-input>
      </el-form-item>
      <el-form-item prop="repeatPassword">
        <el-input
          type="password"
          v-model="registerForm.repeatPassword"
          :placeholder="$t('signup.repeat')"
          clearable></el-input>
      </el-form-item>
      <el-form-item>
        <el-button class="register-button" type="primary" size="large" :loading="submitting" @click="register()">{{
          $t('signup.btn')
        }}</el-button>
      </el-form-item>
      <el-form-item class="higher-row">
        <div class="terms-and-login small-text w-full">
          <div class="terms">
            <span>{{ $t('signup.agreeTerms') }}</span>
            <a @click="termsOfServiceDialogVisible = true" class="ml-1">{{ $t('signup.termsOfService') }}</a>
          </div>
          <div class="flex justify-between">
            <span>{{ $t('signup.alreadyHasAccount') }}</span>
            <a class="signin-link" @click="goLogin">{{ $t('signup.signin') }}</a>
          </div>
        </div>
      </el-form-item>
    </el-form>
    <el-dialog v-model="termsOfServiceDialogVisible" width="860px" top="3vh">
      <div class="terms-of-service-popup">
        <div class="title">{{ $t('signup.termsDialogTitle') }}</div>
        <vue-markdown :source="termsOfServiceDocMap[lang]" />
      </div>
    </el-dialog>
  </div>
</template>

<script>
import { userApi } from '@/api/user.js'
import utils from '@/utils/util.js'
import { ElMessage } from 'element-plus'
import VueMarkdown from 'vue-markdown-render'
import cnTermsOfServiceDoc from '@/locales/zh-cn/terms-of-service.md?raw'
import enTermsOfServiceDoc from '@/locales/en/terms-of-service.md?raw'

export default {
  name: 'Register',
  components: { VueMarkdown },
  data() {
    let validaterepeatPassword = (rule, value, callback) => {
      if (value === '') {
        callback(new Error(this.$t('signup.repeat')))
      } else if (value !== this.registerForm.password) {
        callback(new Error(this.$t('signup.msg.pwdNotTheSame')))
      } else {
        callback()
      }
    }

    return {
      lang: localStorage['locale'] || utils.getLang(),
      registerForm: {
        username: '',
        password: '',
        repeatPassword: ''
      },
      termsOfServiceDialogVisible: false,
      rules: {
        username: [
          {
            required: true,
            message: this.$t('signup.msg.missingUsername'),
            trigger: 'blur'
          },
          {
            pattern: /^[a-zA-Z0-9_]{4,16}$/,
            message: this.$t('signup.msg.invalidUsername'),
            trigger: 'blur'
          }
        ],
        password: [
          {
            required: true,
            message: this.$t('signup.msg.missingPassword'),
            trigger: 'blur'
          },
          {
            pattern: /^(?=.*[a-zA-Z])(?=.*\d)[^]{8,20}$/,
            message: this.$t('signup.msg.invalidPassword'),
            trigger: 'blur'
          }
        ],
        repeatPassword: [
          {
            required: true,
            validator: validaterepeatPassword,
            trigger: 'blur'
          }
        ]
      },
      submitting: false,
      termsOfServiceDocMap: {
        cn: cnTermsOfServiceDoc,
        en: enTermsOfServiceDoc
      }
    }
  },
  mounted() {},
  methods: {
    goLogin() {
      this.$router.push({ name: 'Login' })
    },
    register() {
      this.$refs['registerForm'].validate((valid) => {
        if (valid) {
          this.submitting = true
          userApi
            .register(this.registerForm)
            .then((res) => {
              ElMessage.success({
                message: this.$t('signup.msg.success')
              })
              this.goLogin()
            })
            .catch((error) => {
              this.submitting = false
            })
        } else {
          ElMessage.error({
            message: this.$t('common.msg.formValidationFail')
          })
          return false
        }
      })
    }
  }
}
</script>

<style lang="less" scoped>
.register-form-container {
  background-size: cover;
  padding: 1px 0;
  margin: 0;
  height: 100vh;
  min-height: 600px;
  display: flex;

  .logo-container {
    margin-bottom: 10px;
  }

  .logo {
    height: 40px;
  }

  .title {
    text-align: center;
    font-size: 24px;
    font-weight: 500;
    color: #27272d;
    margin-bottom: 30px;
  }

  .register-form {
    width: 304px;
    margin: auto;
    padding: 20px 48px 10px 48px;
    background-color: #ffffff;
    display: flex;
    flex-direction: column;
    border-radius: 4px;

    h3 {
      text-align: center;
    }

    .register-button {
      width: 100%;
    }

    .higher-row {
      margin-bottom: 30px;
    }

    .terms-and-login {
      width: 100%;

      .terms {
        line-height: 1.5;
        margin-bottom: 10px;
        display: flex;
        justify-content: space-between;
      }

      .signin-link {
        margin-left: 5px;
        font-weight: bold;
      }
    }
  }

  .terms-of-service-popup {
    padding: 20px 30px;

    .title {
      font-size: 24px;
      text-align: center;
    }

    .content {
      white-space: pre-wrap;
    }
  }
}
</style>
