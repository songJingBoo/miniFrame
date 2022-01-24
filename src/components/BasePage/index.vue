<template>
  <div class="common-page">
    <div v-if="$slots.searchBox" class="common-page__searchBox">
      <slot name="searchBox"></slot>
    </div>

    <slot></slot>
  </div>
</template>

<script>

export default {
  name: 'BasePage'
}
</script>

<style lang="scss" scoped>
</style>
