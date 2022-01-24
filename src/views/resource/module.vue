<template>
  <BasePage>
    <div class='module-tree-wrap'>
      <h3>模块配置</h3>
      <ModuleTree :showCheckBox="false"></ModuleTree>
    </div>
  </BasePage>
</template>

<script>
import ModuleTree from '@/components/ModuleTree'
export default {
  components: {
    ModuleTree
  },
  data () {
    return {
    }
  },
  methods: {
  },
  created () {
  }
}
</script>

<style lang="scss">
.module-tree-wrap {
  width: 540px;
  box-shadow: #ccc 0px 2px 8px;
  padding: 20px 0;

  h3 {
    padding: 0 40px;
  }
}
</style>
