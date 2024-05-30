<template>
  <div class="bg">
    <div
      v-for="(item, i) in menuItemsGroup"
      :key="i"
      @click="item.action"
      class="cont"
      :class="[3, 5, 6].includes(i) ? 'action' : 'static'"
    >
      <div>{{ item.name }}</div>
    </div>
  </div>
</template>
<script lang="ts" setup>
import { ref } from 'vue'

const menuItemsGroup = [
  {
    name: '撤回',
    arrow: true,
    action: () => {
      console.log('撤回')
    }
  },
  {
    name: '复制',
    arrow: false,
    action: () => {
      console.log('复制')
    }
  }
]
</script>

<style scoped lang="scss">
.bg {
  width: 80px;
  /* height: 50px; */
  display: flex;
  flex-direction: column;
  background-color: var(--menu-key-color);
  padding: 0 10px;
  z-index: 999;
  .cont {
    margin-top: 5px;
    height: 20px;
    width: 100%;
    color: var(--menu-key-font-color);
    border-bottom: 1px solid #999898;
    font-size: 14px;
    cursor: pointer;
  }
  :hover .cont {
    background-color: rgb(204, 61, 61);
  }
  .action {
    border-bottom: 1px solid;
    background-color: gray;
  }
  .static {
    position: static;
  }
}
</style>
