<template>
  <div class="page page-login">
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
            <el-checkbox v-model="loginForm.rememberMe" class="remember-me">{{ $t('signin.rememberme') }}</el-checkbox>
            <div class="register">
              <router-link :to="{ name: 'Register' }">{{ $t('signin.signup') }}</router-link>
            </div>
          </div>
        </el-form-item>
      </el-form>
    </div>
  </div>
</template>

<script>
import qs from 'qs'
import utils from '@/utils/util.js'
import { userApi } from '@/api/user'
import store from '@/modules/store.js'

export default {
  name: 'Login',
  data() {
    return {
      lang: localStorage['locale'] || utils.getLang(),
      msg: '',
      loginForm: {
        username: '',
        password: '',
        rememberMe: true
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
    submitForm() {
      this.$refs['loginForm'].validate((valid) => {
        if (valid) {
          this.submitting = true
          if (this.loginForm.rememberMe == true) {
            store.setx('remember_me', true, 60 * 60 * 24 * 10)
          } else {
            store.remove('remember_me')
          }
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
                console.log('login success', res)

                this.cacheCurrentUser(res.data.user)
              }
            })
            .catch((error) => {
              this.submitting = false
            })
        } else {
          return false
        }
      })
    },
    cacheCurrentUser(user) {
      store.set('user', user)
      this.$bus.$emit('login')
      let lastUrl = localStorage.getItem('lastUrl')
      if (lastUrl && lastUrl.indexOf('login') === -1 && lastUrl.indexOf('register') === -1) {
        console.log('redirecting to lastUrl', lastUrl)
        localStorage.removeItem('lastUrl')
        window.location.href = lastUrl
      } else {
        let lastBoard = this.$store.get('lastBoard-' + user.id)

        if (lastBoard) {
          console.log('redirecting to previous board', lastBoard)

          const { projectId, sprintId } = lastBoard
          this.$router.push({
            name: 'Board',
            params: { projectId, sprintId }
          })
        } else {
          console.log('redirecting to project list')

          this.$router.push({ name: 'MyProjects' })
        }
      }
    }
  }
}
</script>

<style lang="less">
.page-login {
  .remember-me {
    .el-checkbox__label {
      font-size: 13px;
      color: #9797a6;
    }
  }
}
</style>

<style lang="less" scoped>
.page-login {
  min-height: 600px;
  height: 100vh;
  display: flex;

  .login-panel {
    width: 400px;
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
      margin: 0 48px;
      padding-bottom: 10px;
      .btn-login {
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
