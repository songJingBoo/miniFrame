<template>
  <div class="login">
    <el-form :model="loginForm" :rules="rules" ref="loginForm" class="form-container">

      <div class="title-container">
        <h2 class="title">注 册</h2>
      </div>

      <el-form-item prop="email">
        <el-input
          v-model="loginForm.email"
          autocomplete="off"
          type="email"
          prefix-icon="el-icon-s-custom"
          placeholder="Email">
        </el-input>
      </el-form-item>

      <el-form-item prop="nickname">
        <el-input
          v-model="loginForm.nickname"
          autocomplete="off"
          prefix-icon="el-icon-s-custom"
          placeholder="nickname">
        </el-input>
      </el-form-item>

      <el-form-item prop="password" class="password-box">
        <el-input
          ref="password"
          v-model="loginForm.password"
          autocomplete="off"
          :type="showPwd ? 'text' : 'password'"
          prefix-icon="el-icon-lock"
          placeholder="请设置密码">
        </el-input>
        <span class="password-icon" @click="togglePwd()">
          <svg-icon :icon-class="showPwd ? 'open' : 'close'"></svg-icon>
        </span>
      </el-form-item>

      <el-form-item prop="rePassword" class="password-box">
        <el-input
          ref="rePassword"
          v-model="loginForm.rePassword"
          autocomplete="off"
          :type="showPwd ? 'text' : 'password'"
          prefix-icon="el-icon-lock"
          placeholder="再次输入密码">
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

      <el-form-item>
        <el-button type="primary" style="width:100%;margin-bottom:30px;" @click.native.prevent="submitForm">注 册</el-button>
      </el-form-item>
    </el-form>
  </div>
</template>

<script>
import md5 from 'md5'
import { register } from '@/api/login'

export default {
  name: 'login',
  data () {
    return {
      loginForm: {
        email: '123@qq.com',
        nickname: 'test-user',
        password: 'zsxdc153',
        rePassword: 'zsxdc153',
        captcha: ''
      },
      rules: {
        email: [
          { required: true, message: '请输入邮箱' },
          { type: 'email', message: '请输入正确的邮箱格式' }
        ],
        nickname: [
          { required: true, message: '请输入用户名' }
        ],
        password: [
          { required: true, pattern: /^[\w_-]{6,12}$/g, message: '请输入6~12位密码' }
        ],
        rePassword: [
          { required: true, message: '请再次输入密码' },
          {
            validator: (rule, value, callback) => {
              if (value !== this.loginForm.password) {
                callback(new Error('两次密码不一致'))
              }
              callback()
            }
          }
        ],
        captcha: [
          { required: true, message: '请输入验证码' }
        ]
      },
      captchaUrl: '/dev-api/captcha',
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
    updateCaptcha () {
      this.captchaUrl = '/dev-api/captcha?v=' + new Date().getTime()
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
            nickname: this.loginForm.nickname,
            password: md5(this.loginForm.password),
            captcha: this.loginForm.captcha
          }
          const res = await register(param)
          if (res.code === 200) {
            this.$alert('注册成功!', '成功', {
              confirmButtonText: '去登录',
              callback: () => {
                this.$router.push('/login')
              }
            })
          } else {
            this.$message.error(res.message)
          }
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

</style>
