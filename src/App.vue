<template>
  <router-view />
</template>

<script setup lang="ts">
// App 现在是路由入口，内容由路由决定
</script>

<style lang="less">
* {
  margin: 0;
  padding: 0;
  box-sizing: border-box;
}

body {
  font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif;
  -webkit-font-smoothing: antialiased;
  -moz-osx-font-smoothing: grayscale;
}

#app {
  min-height: 100vh;
  min-width: 1350px; // 整个项目的最小宽度
}
</style>
