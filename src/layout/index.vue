<template>
  <el-container style="height: 100%;">
    <!-- 导航菜单 -->
    <el-menu
      :default-active="activeRouter"
      unique-opened
      class="el-menu-vertical"
      background-color="#1e282c"
      active-text-color="#ffd04b"
      router
      text-color="#fff"
      :collapse="isCollapse"
    >
      <div v-for="(menu, index) in $store.state.menuList" :key="index">
        <el-menu-item v-if="!menu.children" :index="menu.path">
          <i class="el-icon-menu"></i>
          <span slot="title">{{ menu.title }}</span>
        </el-menu-item>

        <el-submenu v-else :index="menu.path">
          <template slot="title">
            <i class="el-icon-location"></i>
            <span>{{ menu.title }}</span>
          </template>
          <el-menu-item v-for="(child, cIndex) in menu.children" :key="'c' + cIndex" :index="child.path">
            <i class="el-icon-s-flag"></i>
            <span slot="title">{{ child.title }}</span>
          </el-menu-item>
        </el-submenu>
      </div>
    </el-menu>

    <el-container>
      <el-header class="header-box">
        <!-- 折叠图标 -->
        <i
          class="header-box__collapseIcon "
          :class="isCollapse ? 'el-icon-s-unfold' : 'el-icon-s-fold'"
          @click="isCollapse = !isCollapse">
        </i>
        <!-- 用户头像+下拉 -->
        <el-dropdown>
          <div class="header-box__userBox">
            <i class="header-box__avatar el-icon-user-solid"></i>
            {{ $store.getters.username }}
          </div>
          <el-dropdown-menu slot="dropdown">
            <el-dropdown-item>退出登录</el-dropdown-item>
          </el-dropdown-menu>
        </el-dropdown>
      </el-header>

      <!-- 页面内容 -->
      <el-main>
        <router-view/>
      </el-main>
    </el-container>
  </el-container>
</template>

<script>
import ResizeMixin from './mixin/ResizeHandler'

export default {
  name: 'Layout',
  mixins: [ResizeMixin],
  data () {
    return {
      isCollapse: false,
      menuList: [],
      activeRouter: ''
    }
  },
  watch: {
    '$route.path' (val) {
      this.activeRouter = val
    }
  },
  created () {
    this.activeRouter = this.$route.path
  }
}
</script>

<style lang="scss" scoped>
.el-header {
  background-color: #b3c0d1;
  color: #333;
  line-height: 60px;
}

.header-box {
  display:flex;
  align-items: center;
  justify-content: space-between;

  &__collapseIcon {
    font-size: 30px !important;
    cursor: pointer;
  }

  &__userBox {
    display: flex;
    align-items: center;
    cursor: pointer;
  }

  &__avatar {
    font-size: 20px !important;
    margin-right: 10px;
  }
}

.el-aside {
  color: #333;
  padding: 0 !important;
}

.el-menu-vertical:not(.el-menu--collapse) {
  width: 200px !important;
  min-height: 400px;
}
</style>
