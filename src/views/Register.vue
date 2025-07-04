<template>
  <div class="register-form-container">
    <el-form :model="registerForm" :rules="rules" size="large" ref="registerForm" class="register-form">
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
        <el-button
          class="register-button"
          type="primary"
          size="large"
          :loading="submitting"
          @click="register('registerForm')"
          >{{ $t('signup.btn') }}</el-button
        >
      </el-form-item>
      <el-form-item class="higher-row">
        <div class="terms-and-login small-text">
          <div class="terms">
            <template v-if="lang === 'cn'">
              <span>注册即表示同意</span><a @click="termsOfServiceDialogVisible = true">《用户服务条款》</a>
            </template>
          </div>
          <div>
            <span v-if="lang !== 'cn'">{{ $t('signup.alreadyHasAccount') }}</span>
            <a class="signin-link" @click="goLogin">{{ $t('signup.signin') }}</a>
          </div>
        </div>
      </el-form-item>
    </el-form>
    <el-dialog v-model="termsOfServiceDialogVisible" width="860px" top="3vh">
      <div class="terms-of-service-popup">
        <div class="title">gogoscrum 用户服务条款</div>
        <pre class="content">
  用户务必审慎阅读、充分理解本合约各条款内容，特别是免除或者限制责任的条款、争议解决和法律适用条款。用户承诺接受并遵守本合约的约定，且不应以未阅读本合约的内容或者未获得 gogoscrum 对用户问询的解答等理由，主张本合约无效，或要求撤销本合约。

  一、合约定义

  1. 本网站（本合约中指 gogoscrum.com 网站和相关应用）由杭州拾米网络科技有限公司（以下简称 “拾米”）所有和运作。

  2. 本合约是网站用户(包括个人、企业及其他组织)与网站运营企业拾米之间的法律契约。用户访问、浏览和注册本网站即代表接受本合约条款的约束，用户对本网站的访问和使用应以接受并遵守本合约所载明的条款和条件为前提。

  二、知识产权申明

  1. 本网站的包括但不限于应用程序、源代码、商标、标示图案(LOGO)、界面设计、应用程序编程接口(API)等所关联的所有知识产权均属拾米所有。用户不得复制、修改、传播或在非本网站所属的服务器上做镜像或者以其它方式进行非法使用。

  2. 用户在本网站平台所创建的独创性数据归属该用户所有，该用户有权对前述数据进行任何形式的处置，包括从平台中复制，导出和删除。

  3. 用户应当确保其公开或存储（方式包括但不限于：上传、保存、公布、发布等）于本网站及相关服务器的内容不存在任何侵犯其他第三方知识产权的情形。若存在本条所述情形，拾米有权根据具体情节针对上述内容，采取包括但不限于限制、屏蔽、删除、修改等手段，由此给网站用户造成的损失由网站用户自行承担；若拾米因网站用户存在本条所述行为而向其他第三方承担法律责任的，拾米有权向网站用户追偿全部损失。

  三、网站使用规则

  1. 用户在使用本网站服务过程中，必须遵循以下规则：

  遵守中国有关的法律法规；
  不得对本网站服务进行任何形式的对其他第三方的再授权使用、销售或转让；
  不得为设计开发竞争产品对本网站进行任何形式的反向工程、反向编译、反汇编，或在竞争产品抄袭模仿本网站的设计；
  不得滥用本网站的通信功能发送垃圾邮件和短信；
  不得对本网站的连续服务和商誉构成损害的其他行为，包括对网站服务器的攻击；
  遵守本协议中的全部约定。

  2. 如用户在使用本网站服务时违反任何上述规定，拾米有权要求用户改正或直接采取一切必要的措施（包括但不限于暂停或终止用户使用本网站服务的权利并追讨因此带来的损失）以减轻用户不当行为造成的影响。

  3. 用户在首次注册时所选择的用户名作为用户权证的唯一识别信息。当用户不再拥有或完全控制在本网站登记的用户名时，拾米有权随时删除所有的用户数据。

  4. 用户须对在 gogoscrum 的注册信息的真实性、合法性、有效性承担全部责任，用户不得冒充他人；不得利用他人的名义发布任何信息；不得恶意使用注册帐户导致其他用户误认；否则 gogoscrum 有权立即停止提供服务，收回其帐号并由用户独自承担由此而产生的一切法律责任。

  5. 用户直接或通过各类方式（如站外 API 引用等）间接使用 gogoscrum 服务和数据的行为，都将被视作已无条件接受本协议全部内容；若用户对本协议的任何条款存在异议，请停止使用 gogoscrum 所提供的全部服务。

  6. 用户承诺不得以任何方式利用 gogoscrum 直接或间接从事违反中国法律、以及社会公德的行为， gogoscrum 有权对违反上述承诺的内容予以删除。

  7. 用户不得利用 gogoscrum 服务制作、上载、复制、发布、传播或者转载如下内容：

  危害国家安全，泄露国家秘密，颠覆国家政权，破坏国家统一的；
  损害国家荣誉和利益的；
  煽动民族仇恨、民族歧视，破坏民族团结的；
  破坏国家宗教政策，宣扬邪教和封建迷信的；
  散布谣言，扰乱社会秩序，破坏社会稳定的；
  散布淫秽、色情、赌博、暴力、凶杀、恐怖或者教唆犯罪的；
  侮辱或者诽谤他人，侵害他人合法权益的；
  含有法律、行政法规禁止的其他内容的信息。

  8. gogoscrum 有权对用户使用 gogoscrum 的情况进行审查和监督，如用户在使用 gogoscrum 时违反任何上述规定， gogoscrum 或其授权的人有权要求用户改正或直接采取一切必要的措施（包括但不限于更改或删除用户张贴的内容、暂停或终止用户使用 gogoscrum 的权利）以减轻用户不当行为造成的影响。

  9. gogoscrum 有权但无义务对用户发布的内容进行审核，有权根据相关证据结合《侵权责任法》、《信息网络传播权保护条例》等法律法规及 gogoscrum 社区指导原则对侵权信息进行处理。

  10. gogoscrum 产品中提供的删除能力均代表标记删除或物理删除。

  11. gogoscrum 国内版本数据均存储于中国大陆境内。

  四、用户信息保护

  本网站将尽可能采取一切措施保护用户数据及个人信息资料安全，只根据用户在网站上的行为指示来分发用户的信息，不会向任何第三方公开或共享用户的具体数据，除非有下列情况：

  有关法律、法规规定；
  在紧急情况下，为维护用户及公众的权益；
  为维护 gogoscrum 的商标权、专利权及其他任何合法权益；
  其他依法需要公开、编辑或透露个人信息的情况。

  2. 本网站保留使用汇总统计性信息的权利，在不透露单个用户隐私资料的前提下，本网站有权对整个用户数据库进行分析并对用户数据库进行商业上的利用。

  五、免责申明

  1. 本网站将尽最大努力保障软件平台的连续可靠运行，但鉴于网络服务的特殊性，本网站对可能发生的网络服务的中断或终止所可能导致的一切损失，不承担任何法律责任及经济赔偿。

  2. 本网站将尽最大努力保障客户数据的安全备份，但无法承诺100%的数据恢复，对因数据丢失带来的任何直接或间接损失不承担任何责任。

  3. 在发生需要从备份文件中恢复数据的情形时，本网站通常需要4小时，最长48小时完成，在此时间范围内的数据恢复视作服务是连续的。

  4. 对于因不可抗力或本网站不能控制的原因造成的网络服务中断和长时间终止，本网站不承担任何责任，但将尽力减少因此而给用户造成的损失和影响。

  5. 本网站将尽可能采取一切措施保护用户数据及个人信息资料安全。但用户通过使用或安装第三方应用打开 gogoscrum 中的文件，该文件会在第三方应用中打开，由于第三方应用而造成的损失，本网站不承担任何法律责任及经济赔偿。

  6. 鉴于互联网体制及环境的特殊性，客户在服务中分享的信息及个人资料有可能会被他人复制、转载、擅改或做其它非法用途，本网站对此不承担任何责任。

  7. 客户在使用服务过程中可能存在来自任何他人的包括威胁性的、诽谤性的、令人反感的或非法的内容或行为或对他人权利的侵犯（包括知识产权）及匿名或冒名的信息的风险本网站对此不承担任何责任。

  8. 与特定网络安全事故相关免责事由。例如，在法律允许的范围内，本网站对于因受到计算机病毒、木马或其他恶意程序、黑客攻击的破坏而导致的服务中断及信息泄露不承担责任。

  六、合约变更

  1. 本网站有权随时对本合约的条款进行修订，一旦本合约的内容发生变更，本网站将会在修订生效日前一个工作日更新。

  2. 如用户继续使用网络服务，则视为用户接受本网站对合约相关条款所做的修订。

  七、违约责任

  由于用户通过服务上载、传送或分享之信息、使用本服务其他功能、违反本合约、或侵害他人任何权利因而衍生或导致任何第三人向本网站及其关联公司提出任何索赔或请求，或本网站及其关联公司因此而发生任何损失，用户同意将足额进行赔偿（包括但不限于合理的律师费）。

  八、法律适用

  1. 本合约的订立、执行和解释以及争议的解决均应适用中华人民共和国法律并受中国法院管辖。

  2. 协议双方就本合约内容或其执行发生任何争议，应首先力争友好协商解决；协商不成时，任何一方均可向拾米注册地所在的人民法院提起诉讼。

          </pre
        >
      </div>
    </el-dialog>
  </div>
</template>

<script>
import { userApi } from '@/api/user.js'
import utils from '@/utils/util.js'
import { ElMessage } from 'element-plus'
export default {
  name: 'Register',
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
      submitting: false
    }
  },
  mounted() {},
  methods: {
    goLogin() {
      this.$router.push({ name: 'Login' })
    },
    register(registerForm) {
      this.$refs[registerForm].validate((valid) => {
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
      display: flex;
      justify-content: space-between;
      width: 100%;

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
