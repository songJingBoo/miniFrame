<template>
  <div class="login">
    <el-form :model="loginForm" :rules="rules" ref="loginForm" class="form-container">

      <div class="title-container">
        <h2 class="title">登 录</h2>
      </div>

      <el-form-item prop="username">
        <el-input
          v-model="loginForm.username"
          autocomplete="off"
          prefix-icon="el-icon-s-custom"
          placeholder="Username">
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
      <el-form-item>
        <el-button type="primary" style="width:100%;margin-bottom:30px;" @click.native.prevent="submitForm">Login</el-button>
      </el-form-item>
    </el-form>
  </div>
</template>

<script>

export default {
  name: 'login',
  data () {
    return {
      loginForm: {
        username: 'admin',
        password: '000000'
      },
      rules: {
        username: [
          { required: true, message: '请输入用户名', trigger: 'blur' },
          { min: 3, max: 8, message: '长度在 3 到 8 个字符', trigger: 'blur' }
        ],
        password: [
          { required: true, message: '请输入密码', trigger: 'blur' },
          { min: 6, max: 8, message: '长度在 6 到 8 个字符', trigger: 'blur' }
        ]
      },
      showPwd: false,
      loading: false,
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
    togglePwd () {
      this.showPwd = !this.showPwd
      // 否则焦点在最前面
      this.$nextTick(() => {
        this.$refs.password.focus()
      })
    },
    submitForm () {
      this.$refs.loginForm.validate(valid => {
        if (valid) {
          this.loading = true
          this.$store.dispatch('login', this.loginForm)
            .then(() => {
              this.$router.push({ path: this.redirect || '/home', query: this.otherQuery })
              this.loading = false
            })
            .catch(() => {
              this.loading = false
            })
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

</style>
