<template>
  <div class="container">
    <header>选择你想要共享的窗口</header>
    <div class="window-content" v-if="sourcesList.length">
      <div class="desktop">
        <div class="title">桌面</div>
        <div class="screen-list">
          <div
            class="screen-item"
            :class="sourcesList[currentIndex] === item ? 'active' : ''"
            v-for="(item, index) in sourcesList.filter(
              (item) => item.type === 'screen'
            )"
            :key="index"
            @click="changeScreen(item)"
          >
            <img :src="item.thumb" alt="" />
          </div>
        </div>
      </div>
      <div class="screen">
        <div class="title">应用</div>
        <div class="screen-list">
          <div
            class="screen-item"
            :class="sourcesList[currentIndex] === item ? 'active' : ''"
            v-for="(item, index) in sourcesList.filter(
              (item) => item.type === 'window'
            )"
            :key="index"
            @click="changeScreen(item)"
          >
            <img :src="item.thumb" alt="" />
          </div>
        </div>
      </div>
    </div>
    <div class="no-window" v-else>暂未获取到屏幕, 请重新打开</div>
    <footer>
      <el-button @click="close">取消</el-button>
      <el-button color="#0091ff" @click="confirm">确定</el-button>
    </footer>
  </div>
</template>

<script setup lang="ts">
import { onMounted, ref, getCurrentInstance } from "vue";
import { useRoute } from "vue-router";
import { useUserInfoStore } from "@/store/modules/user";
import { useTelephoneStore } from "@/store/modules/telephone";
import type { TelephoneStoreType } from "@/store/modules/interface/telephoneType";
import { ipcRenderer } from "electron";
const $route = useRoute();
const userInfoStore = useUserInfoStore();
const telephoneStore = useTelephoneStore();
const { proxy } = getCurrentInstance() as any;

onMounted(() => {
  // 通知主进程获取媒体源缩略图
  ipcRenderer.send("get-screen-img");
});

// 保存媒体缩略图列表
let sourcesList = ref<any[]>([]);
// 当前选中的窗口下标
let currentIndex = ref<number>(0);

// 接收主进程返回的缩略图信息
ipcRenderer.on("get-screen-img", async (e: any, info: any) => {
  const { source, type } = info;
  let thumb = source.thumbnail.toDataURL();
  let sourceInfo = {
    thumb,
    type,
    source,
  };
  sourcesList.value.push(sourceInfo);
});

// 切换选中的窗口
const changeScreen = (win: any) => {
  let index = sourcesList.value.findIndex((item) => item === win);
  currentIndex.value = index;
};

// 取消按钮回调
const close = () => {
  ipcRenderer.send("close-screen-choose");
};

// 确定按钮回调
const confirm = () => {
  let chooseWin = sourcesList.value[currentIndex.value];
  let sourceId = chooseWin.source.id;
  ipcRenderer.send("open-screen-share", {
    type: "screen",
    url: `/telephone/screen?chatType=${$route.query.chatType}&fId=${userInfoStore.userInfo._id}&id=${$route.query.id}`,
    sourceId,
  });
  noticeTelephone();
  close();
};

// 通知其他用户已经开启视频、语音通话
const noticeTelephone = () => {
  // 通话类型
  const { chatType, id } = $route.query;
  let data = {
    fId: userInfoStore.userInfo._id, // 用户id
    toId: id, // urlid（好友id/群id）
    chatType, // 聊天类型(群聊group/私聊friend)
    type: "screen", // 通话类型
  };
  // 发送方自己本地sotre存
  telephoneStore.setTelephoneInfo(data as TelephoneStoreType);
  proxy.socket.emit("notice_telephone", data);
};
</script>

<style scoped lang="scss">
.container {
  width: 100%;
  height: 100vh;
  padding: 0 20px;
  box-sizing: border-box;
  display: flex;
  flex-direction: column;

  header {
    width: 100%;
    margin: 15px 0;
    font-size: 18px;
    font-weight: bold;
  }

  .window-content,
  .no-window {
    width: 100%;
    flex: 1;
    overflow: auto;

    &::-webkit-scrollbar {
      display: none;
    }

    .desktop,
    .screen {
      .title {
        width: 100%;
        margin: 10px 0;
      }

      .screen-list {
        width: 100%;
        display: flex;
        flex-wrap: wrap;

        .screen-item {
          width: 130px;
          height: 75px;
          margin-right: 20px;
          margin-bottom: 15px;
          border-radius: 5px;
          box-sizing: border-box;
          overflow: hidden;
          box-shadow: 2px 2px 8px 0px #696969;

          &:nth-of-type(3n) {
            margin-right: 0;
          }

          img {
            width: 100%;
            height: 100%;
          }
        }

        .active {
          border: 4px solid #0091ff;
        }
      }
    }
  }

  .no-window {
    font-size: 13.5px;
    color: #8c8c8c;
  }

  footer {
    width: 100%;
    height: 50px;
    display: flex;
    justify-content: flex-end;
    align-items: center;
    margin-bottom: 5px;
  }
}
</style>
