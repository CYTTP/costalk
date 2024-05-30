<template>
  <div class="default-content">
    <WindowsBtn
      v-if="!proxy.isMac && $route.path !== '/notes'"
      :color="'#909399'"
    />
  </div>
</template>

<script setup lang="ts">
import { getCurrentInstance } from 'vue';

const { proxy } = getCurrentInstance() as any;

</script>

<style scoped lang="scss">
@font-face {
  font-family: "DefaultTitle";
  font-weight: 400;
  src: url("@/assets/iconfont/default_content.woff2") format("woff2"),
    url("@/assets/iconfont/default_content.woff") format("woff");
  font-display: swap;
}
.default-content {
  width: 100%;
  height: 100%;
  display: flex;
  justify-content: center;
  align-items: center;
  background-color: var(--chat-content-default-bg-color);
}

/* .title {
  font-family: "DefaultTitle";
  font-size: 100px;
  color: var(--light_WaiF);
} */
</style>
