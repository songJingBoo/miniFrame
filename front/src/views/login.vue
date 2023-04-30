<template>
  <div class="login">
    <el-form :model="loginForm" :rules="rules" ref="loginForm" class="form-container">

      <div class="title-container">
        <h2 class="title">登 录</h2>
      </div>

      <el-form-item prop="email">
        <el-input
          v-model="loginForm.email"
          type="email"
          autocomplete="off"
          prefix-icon="el-icon-s-custom"
          placeholder="Email">
        </el-input>
      </el-form-item>

      <el-form-item prop="password" class="password-box">
        <el-input
          ref="password"
          v-model="loginForm.password"
          autocomplete="off"
          :type="showPwd ? 'text' : 'password'"
          prefix-icon="el-icon-lock"
          placeholder="Password">
        </el-input>
        <span class="password-icon" @click="togglePwd()">
          <svg-icon :icon-class="showPwd ? 'open' : 'close'"></svg-icon>
        </span>
      </el-form-item>

      <el-form-item prop="captcha">
        <el-input
          class="captch-input"
          v-model="loginForm.captcha"
          autocomplete="off"
          prefix-icon="el-icon-lock"
          placeholder="验证码">
        </el-input>
        <img class="captch-input__img" @click="updateCaptcha" :src="captchaUrl" alt="">
      </el-form-item>

      <el-form-item prop="emailcode">
        <el-input
          class="emailcode-input"
          v-model="loginForm.emailcode"
          autocomplete="off"
          prefix-icon="el-icon-lock"
          placeholder="邮箱验证码">
        </el-input>
        <el-button class="emailcode-input__btn" type="primary" @click="sendMailCode">{{ sender.text }}</el-button>
      </el-form-item>

      <el-form-item>
        <el-button type="primary" style="width:100%;margin-bottom:30px;" @click.native.prevent="submitForm">Login</el-button>
      </el-form-item>
    </el-form>
  </div>
</template>

<script>
import { login, sendMailCode } from '@/api/login'
// import { generateMenu } from '@/config/menu'
import md5 from 'md5'

export default {
  name: 'login',
  data () {
    return {
      loginForm: {
        email: '596812485@qq.com',
        password: 'zsxdc153',
        captcha: '',
        emailcode: ''
      },
      rules: {
        email: [
          { required: true, message: '请输入邮箱' },
          { type: 'email', message: '请输入正确的邮箱格式' }
        ],
        password: [
          { required: true, message: '请输入密码', trigger: 'blur' },
          { min: 6, max: 8, message: '长度在 6 到 8 个字符', trigger: 'blur' }
        ],
        captcha: [
          { required: true, message: '请输入验证码' }
        ],
        emailcode: [
          { required: true, message: '请输入邮箱验证码' }
        ]
      },
      captchaUrl: `${process.env.VUE_APP_BASE_API}/captcha`,
      sender: {
        timer: 0,
        text: '发送'
      },
      showPwd: false,
      redirect: '', // 回源地址
      otherQuery: '' // 路径其他传值
    }
  },
  watch: {
    $route: {
      handler: function (route) {
        const query = route.query
        if (query) {
          this.redirect = query.redirect
          this.otherQuery = this.getOtherQuery(query)
        }
      },
      immediate: true
    }
  },
  methods: {
    async sendMailCode () {
      if (!this.loginForm.email) {
        this.$message.info('请输入邮箱！')
        return
      }
      await sendMailCode(this.loginForm.email)
      this.sender.timer = 10
      const timer = setInterval(() => {
        this.sender.timer -= 1
        this.sender.text = `${this.sender.timer}s后发送`
        if (this.sender.timer <= 0) {
          clearInterval(timer)
          this.sender.text = '发送'
        }
      }, 1000)
    },
    updateCaptcha () {
      this.captchaUrl = `${process.env.VUE_APP_BASE_API}/captcha?v=${new Date().getTime()}`
    },
    togglePwd () {
      this.showPwd = !this.showPwd
      // 否则焦点在最前面
      this.$nextTick(() => {
        this.$refs.password.focus()
      })
    },
    submitForm () {
      this.$refs.loginForm.validate(async valid => {
        if (valid) {
          const param = {
            email: this.loginForm.email,
            password: md5(this.loginForm.password),
            captcha: this.loginForm.captcha,
            emailcode: this.loginForm.emailcode
          }
          const res = await login(param)
          if (res.code === 200) {
            this.$store.commit('SET_TOKEN', res.data.token)
            this.$router.push({ path: this.redirect || '/project', query: this.otherQuery })
          } else {
            this.$message.error(res.message)
          }
        } else {
          return false
        }
      })
    },
    getOtherQuery (query) {
      return Object.keys(query).reduce((acc, cur) => {
        if (cur !== 'redirect') {
          acc[cur] = query[cur]
        }
        return acc
      }, {})
    }
  }
}
</script>

<style lang="scss" scoped>
.login {
  background-color: #2d3a4b;
  height: 100%;
  width: 100%;
}

.form-container {
  width: 520px;
  max-width: 100%;
  padding: 40px;
  margin: 0 auto;
  padding-top: 240px;
}
.password-box {
  position: relative;
  .password-icon {
    position: absolute;
    right: 0;
    width: 40px;
    text-align: center;
    cursor: pointer;
  }
}

.title {
  text-align: center;
  color: #fff;
}

.captch-input {
  width: calc(100% - 110px);

  &__img {
    background: #fff;
    border-radius: 4px;
    vertical-align: middle;
    margin-left: 10px;
  }
}

.emailcode-input {
  width: calc(100% - 110px);

  &__btn {
    width: 100px;
    margin-left: 10px;
  }
}

</style>
