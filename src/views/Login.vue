<template>
  <div class="page login-page">
    <div class="login-panel">
      <div class="title">
        <router-link :to="{ name: 'Homepage' }">
          <div class="logo-container">
            <img src="../assets/images/logo-black.png" class="logo" />
          </div>
        </router-link>
        <span>{{ $t('signin.title') }}</span>
      </div>
      <div class="alert-container">
        <el-alert v-if="msg" :closable="false" :title="msg" type="error" center show-icon />
      </div>
      <el-form
        class="login-form"
        ref="loginForm"
        :model="loginForm"
        :rules="rules"
        size="large"
        @keyup.enter.native="submitForm()">
        <el-form-item prop="username">
          <el-input v-model="loginForm.username" :placeholder="$t('signin.username')" clearable></el-input>
        </el-form-item>
        <el-form-item prop="password">
          <el-input
            v-model="loginForm.password"
            type="password"
            :placeholder="$t('signin.password')"
            show-password
            clearable></el-input>
        </el-form-item>
        <el-form-item>
          <el-button type="primary" class="btn-login" :loading="submitting" @click="submitForm()">{{
            $t('signin.btn')
          }}</el-button>
        </el-form-item>
        <el-form-item>
          <div class="flex justify-between w-full small-text">
            <el-checkbox v-model="loginForm.rememberMe" class="remember-me" @change="handleRememberMeChange">{{
              $t('signin.rememberme')
            }}</el-checkbox>
            <div class="register">
              <router-link :to="{ name: 'Register' }">{{ $t('signin.signup') }}</router-link>
            </div>
          </div>
        </el-form-item>
      </el-form>
      <OauthLogins />
    </div>
  </div>
</template>

<script>
import qs from 'qs'
import utils from '@/utils/util.js'
import { userApi } from '@/api/user'
import store from '@/modules/store.js'
import OauthLogins from '@/components/user/OauthLogins.vue'

export default {
  name: 'Login',
  components: {
    OauthLogins
  },
  data() {
    return {
      msg: '',
      loginForm: {
        username: '',
        password: '',
        rememberMe: this.$store.get('loginPageRememberMeFlag') || false
      },
      rules: {
        username: [
          {
            required: true,
            message: this.$t('signin.msg.missingUsername'),
            tigger: 'blur'
          }
        ],
        password: [
          {
            required: true,
            message: this.$t('signin.msg.missingPassword'),
            tigger: 'blur'
          }
        ]
      },
      submitting: false
    }
  },
  created() {},
  mounted() {},
  methods: {
    handleRememberMeChange() {
      console.log('Remember me flag changed: ', this.loginForm.rememberMe)
      this.$store.set('loginPageRememberMeFlag', this.loginForm.rememberMe)
    },
    submitForm() {
      this.$refs['loginForm'].validate((valid) => {
        if (valid) {
          this.submitting = true
          userApi
            .login(qs.stringify({ ...this.loginForm }), {
              headers: {
                accept: 'application/json',
                'accept-language': 'UTF-8',
                'content-type': 'application/x-www-form-urlencoded'
              }
            })
            .then((res) => {
              if (res.data.status === '401.1') {
                this.msg = this.$t('signin.msg.badCrendential')
                this.submitting = false
              } else {
                utils.afterLogin(res.data.user)
              }
            })
            .catch((err) => {
              console.error('login error', err)
            })
            .finally(() => {
              this.submitting = false
            })
        } else {
          return false
        }
      })
    }
  }
}
</script>

<style lang="less">
.login-page {
  .remember-me {
    .el-checkbox__label {
      font-size: 13px;
      color: #9797a6;
    }
  }
}
</style>

<style lang="less" scoped>
.login-page {
  min-height: 600px;
  display: flex;

  .login-panel {
    width: 360px;
    border-radius: 4px;
    margin: auto;

    .logo-container {
      margin-bottom: 20px;
    }

    .logo {
      height: 40px;
    }

    & > .title {
      font-size: 24px;
      font-weight: 500;
      color: #27272d;
      text-align: center;
      padding-top: 20px;
    }

    .alert-container {
      margin: 8px 48px;
      height: 30px;
      padding: 10px 0;

      .el-alert {
        padding: 5px 10px;
      }
    }

    .login-form {
      // margin: 0 48px;
      padding-bottom: 10px;
      .btn-login {
        margin-top: 10px;
        width: 100%;
      }

      .register {
        font-weight: bold;
        float: right;
        cursor: pointer;
      }
    }
  }
}
</style>
