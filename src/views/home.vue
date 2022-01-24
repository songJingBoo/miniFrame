<template>
  <BasePage>
    <h2>欢迎回来~ {{ $store.getters.username }}</h2>
  </BasePage>
</template>

<script>

export default {
  name: 'home',
  components: {
  }
}
</script>

<style lang="scss" scoped>
</style>
