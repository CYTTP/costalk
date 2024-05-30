<template>
  <div class="drag-wrap drag">
    <div v-if="!proxy.isMac" class="close no-drag" @click="close">
      <el-icon size="20">
        <Close />
      </el-icon>
    </div>
  </div>
  <div style="width: 100vw; height: 100vh" @contextmenu.prevent.capture>
    <VideoPlay
      ref="videoPlay"
      width="100vw"
      height="100vh"
      :src="options.src"
      autoPlay
      :controlBtns="options.controlBtns"
    />
  </div>
</template>

<script setup lang="ts">
import { Close } from "@element-plus/icons-vue";
// @ts-ignore
import VideoPlay from "vue3-video-play";
import "vue3-video-play/dist/style.css";
import { reactive, getCurrentInstance } from "vue";
import { useRoute } from "vue-router";
import { ipcRenderer } from "electron";
const $route = useRoute();
// baseUrl
const { proxy } = getCurrentInstance() as any;

//阻止用户在指定窗口内右键单击时出现默认的上下文菜单，并阻止事件进一步传播
window.addEventListener(
  "contextmenu",
  (event: Event) => {
    event.preventDefault
      ? event.preventDefault()
      : ((event as any).returnValue = false);
    event.stopPropagation
      ? event.stopPropagation()
      : ((event as any).cancelBubble = true);
  },
  true
);

const options = reactive({
  src: proxy.$baseUrl + $route.query.url, //视频源
  controlBtns: [
    "audioTrack",
    "quality",
    "speedRate",
    "volume",
    "pip",
    "fullScreen",
  ],
});

// 关闭视频
const close = () => {
  ipcRenderer.send("close-video");
};
</script>

<style scoped lang="scss">
.close {
  width: 30px;
  height: 30px;
  display: flex;
  justify-content: center;
  align-items: center;
  position: absolute;
  top: 60%;
  transform: translateY(-50%);
  right: 7.5px;
  color: #fff;
}
</style>
