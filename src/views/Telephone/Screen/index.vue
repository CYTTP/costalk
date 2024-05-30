<template>
  <!-- 通话窗口组件 -->
  <TelephoneWin>
    <div class="video-content">
      <div class="right">
        <!-- 主屏幕位置 -->
        <video
          ref="mainScreen"
          id="main-screen"
          src=""
          width="100%"
          height="100%"
        ></video>
        <div class="main-screen-nick">
          {{ userInfo?.nick }}
        </div>
      </div>
      <div class="left">
        <!-- 右侧弹幕列表 -->
        <div class="list" ref="listContent">
          <div
            class="tips"
            style="
              font-size: 12px;
              color: #989696;
              padding: 3px;
              line-height: 18px;
            "
          >
            温馨提示:
            1、请自行调节音量至合适的状态。2、直播界面显示屏幕共享发起者的屏幕内容,
            通话中的用户发言可以在讨论区或以弹幕形式查看。3、请勿发送负面、低俗的信息。
          </div>
          <div class="item" v-for="(item, index) in messageList" :key="index">
            <el-tag
              v-if="$route.query.fId === item.userId"
              style="margin-right: 5px"
              type="warning"
              round
              size="small"
              effect="plain"
              >发起人</el-tag
            >
            <span class="user-nick">{{ item.nick }}<i>: </i></span>
            <span class="message-content">{{ item.message }}</span>
          </div>
        </div>
        <!-- 输入框 -->
        <div class="msg-input">
          <input
            type="text"
            placeholder="请输入发送的消息..."
            v-model="message"
          />
          <el-button
            @click="sendMessage"
            type="primary"
            :icon="Position"
            circle
          />
        </div>
      </div>
    </div>
    <template #footer>
      <div class="logout" @click="logout">
        <div class="btn">
          <svg
            t="1702130450974"
            class="icon"
            viewBox="0 0 1024 1024"
            version="1.1"
            xmlns="http://www.w3.org/2000/svg"
            p-id="35754"
            width="23"
            height="23"
          >
            <path
              d="M512.420571 321.92c-185.563429 0-359.990857 39.003429-446.994285 126.006857C26.422857 487.350857 6.290286 534.930286 8.868571 592.365714c1.700571 34.706286 12.434286 65.554286 32.548572 85.705143 15.451429 15.433143 36.022857 24.009143 60.434286 20.150857l159.012571-27.008c23.990857-3.84 40.704-11.154286 51.419429-22.290285 14.153143-13.714286 18.432-34.285714 18.432-61.275429l0.438857-43.282286c0-6.857143 2.980571-12.013714 6.857143-16.292571 4.278857-5.138286 10.697143-7.296 15.414857-8.576 29.147429-6.857143 88.722286-13.275429 158.994285-13.275429 70.729143 0 129.865143 5.12 159.012572 13.714286 4.278857 1.28 10.276571 3.84 14.994286 8.137143 4.278857 4.278857 6.857143 8.996571 6.857142 15.853714l0.438858 43.702857c0.420571 27.008 4.699429 47.579429 18.413714 61.293715 11.154286 11.154286 27.867429 18.432 51.858286 22.290285l156.854857 26.569143c25.289143 4.297143 46.72-4.717714 63.451428-20.992 20.114286-19.712 31.268571-50.139429 32.128-84.845714 1.28-57.874286-20.571429-105.453714-59.136-144.018286-87.424-87.003429-259.291429-125.988571-444.854857-125.988571z"
              p-id="35755"
              data-spm-anchor-id="a313x.search_index.0.i29.55893a81fQKlCG"
              class="selected"
              fill="#ffffff"
            ></path>
          </svg>
        </div>
        <div class="text">
          {{
            userInfoStore.userInfo._id === $route.query.fId
              ? "结束通话"
              : "退出通话"
          }}
        </div>
      </div>
    </template>
  </TelephoneWin>
</template>

<script setup lang="ts">
import TelephoneWin from "@/components/TelephoneWin/index.vue";
import { ref, onMounted, getCurrentInstance, watch, nextTick } from "vue";
import { Position } from "@element-plus/icons-vue";
import { reqGetUserInfo } from "@/api/user/index";
import type { GetUserInfoResponseData } from "@/api/user/type";
import { getLocalScreenStream } from "@/utils/getLocalStream";
// Toast 轻提示组件
import Toast from "@/plugins/Toast";
import { useRoute } from "vue-router";
import { useUserInfoStore } from "@/store/modules/user";
import { ipcRenderer } from "electron";
const $route = useRoute();
const userInfoStore = useUserInfoStore();
const { proxy } = getCurrentInstance() as any;

onMounted(() => {
  const { fId, id, chatType } = $route.query;
  let userId = userInfoStore.userInfo._id;
  getUserInfo();
  if (fId === userId) {
    // 发起方 获取屏幕信息
    getScreen();
  } else {
    // socket通知发起方可以交换SDP信息
    let sendData = {
      acceptId: userId, // 当前用户的id(同意方id)
      fId,
      toId: id, // 好友id/群id 也可以理解为房间id
      chatType, // 聊天类型
      type: "screen",
    };
    proxy.socket.emit("accept_telephone", sendData);
  }
  proxy.socket.emit("join_telephone_room", id);
});

type UserInfo = {
  _id: string;
  nick: string;
  imgUrl: string;
};
// 发起方用户信息
let userInfo = ref<UserInfo>();

// 获取发起方用户信息
const getUserInfo = async () => {
  const { fId } = $route.query;
  let res: GetUserInfoResponseData = await reqGetUserInfo(fId as string);
  if (res.status === 200) {
    userInfo.value = res.data as UserInfo;
  }
};

// 本地音视频流
let localStream = ref<MediaStream>();
// video元素
let mainScreen = ref<HTMLVideoElement>();

// 获取屏幕信息
const getScreen = async () => {
  let sourceId = $route.query.sourceId as string;
  let stream = await getLocalScreenStream(sourceId);
  localStream.value = stream;

  mainScreen.value!.srcObject = stream;
  mainScreen.value!.play();
};

// peer信息 RTCPeerConnection
let peer = ref<RTCPeerConnection>();

type AcceptData = {
  acceptId: string;
  chatType: string;
  fId: string;
  toId: string;
  type: string;
};
// 同意方同意通话请求, 发起方开始交换SDP和candidate信息
ipcRenderer.on("send_acceptData", async (e: any, data: AcceptData) => {
  // 发起方创建RTCPeerConnection
  peer.value = new RTCPeerConnection();
  // 获取媒体轨道, 添加本地音视频流
  for (const track of localStream.value!.getTracks()) {
    peer.value.addTrack(track);
  }

  // 发起方监听candidate信息, 双方交换了SDP信息才开始监听
  peer.value.onicecandidate = (e: RTCPeerConnectionIceEvent) => {
    if (e.candidate) {
      // 发起方交换candidate信息
      let candidateData = {
        fId: data.fId, // 发起方id
        acceptId: data.acceptId, // 同意方id
        type: "screen",
        chatType: $route.query.chatType,
        candidate: e.candidate,
        userType: data.fId, // 用作身份判断(发送方)
      };
      proxy.socket.emit("send_candidate", candidateData);
    }
  };

  try {
    // 生成offer
    const offer = await peer.value.createOffer();
    //设置offer未本地描述
    await peer.value.setLocalDescription(offer);
    // 发送offer
    let offerParams = {
      offer,
      fId: data.fId, // 发起方id
      acceptId: data.acceptId, // 同意方id
      type: "screen",
      chatType: $route.query.chatType,
    };
    proxy.socket.emit("send_offer", offerParams);
  } catch (error) {}
});

type OfferParams = {
  acceptId: string;
  chatType: string;
  fId: string;
  type: string;
  offer: any; // 发起方创建的offer信息
};
// 同意方收到发起方的offer，开始交换SDP
ipcRenderer.on("send_offer", async (e: any, params: OfferParams) => {
  // 同意方创建RTCPeerConnection
  peer.value = new RTCPeerConnection();

  // 同意方监听candidate信息, 双方交换了SDP信息才开始监听
  peer.value.onicecandidate = (e: RTCPeerConnectionIceEvent) => {
    if (e.candidate) {
      // 发起方交换candidate信息
      let candidateData = {
        fId: params.fId, // 发起方id
        acceptId: params.acceptId, // 同意方id
        type: "screen",
        chatType: $route.query.chatType,
        candidate: e.candidate,
        userType: params.acceptId, // 用作身份判断(同意方)
      };
      proxy.socket.emit("send_candidate", candidateData);
    }
  };

  // 监听onaddstream来获取对方的音视频流
  peer.value.ontrack = (e: RTCTrackEvent) => {
    let mediaStream = new MediaStream();
    mediaStream.addTrack(e.track);
    mainScreen.value!.srcObject = mediaStream;
    mainScreen.value!.play();
  };

  try {
    // 设置远端描述信息(也就是设置发起方发送来的offer, offer就是发起方的SDP信息)
    await peer.value.setRemoteDescription(params.offer);
    // 生成answer
    let answer = await peer.value.createAnswer();
    // 在本地设置answer信息
    await peer.value.setLocalDescription(answer);
    // 发送answer
    let answerParams = {
      answer,
      fId: params.fId, // 发起方id
      acceptId: params.acceptId, // 同意方id
      type: "screen",
      chatType: $route.query.chatType,
    };
    proxy.socket.emit("send_answer", answerParams);
  } catch (error) {}
});

type AnswerParams = {
  acceptId: string;
  chatType: string;
  fId: string;
  type: string;
  answer: any; // 发起方创建的offer信息
};
// 发起方接收answer
ipcRenderer.on("send_answer", async (e: any, parmas: AnswerParams) => {
  try {
    await peer.value!.setRemoteDescription(parmas.answer);
  } catch (error) {}
});

// 收到candidate信息(双方互相发送过信息)
type candidateData = {
  fId: string; // 发起方id
  acceptId: string; // 同意方id
  type: string;
  chatType: string;
  candidate: any;
  userType: string; // 用作身份判断(同意方)
};
ipcRenderer.on(
  "send_candidate",
  async (e: any, candidateData: candidateData) => {
    // 同意方设置
    if (candidateData.userType !== candidateData.acceptId) return;
    try {
      // 互相交换candidate信息
      await peer.value!.addIceCandidate(
        new RTCIceCandidate(candidateData.candidate)
      );
    } catch (error) {}
  }
);

// 发送的消息
let message = ref<string>("");
// 消息列表
type MessageItemType = {
  userId: string;
  nick: string;
  message: string;
};
let messageList = ref<MessageItemType[]>([]);

// 按钮的回调
const sendMessage = () => {
  if (!message.value) return Toast.show({ content: "消息不能为空" });
  let msgData = {
    userId: userInfoStore.userInfo._id,
    nick: userInfoStore.userInfo.nick,
    message: message.value,
  };
  messageList.value.push(msgData);
  const { id, chatType } = $route.query;
  let otherData = {
    toId: id,
    chatType,
  };
  proxy.socket.emit("telephone_message", msgData, otherData);
  message.value = "";
};

// 监听会议消息
proxy.socket.on("telephone_message", (data: MessageItemType) => {
  if (data.userId === userInfoStore.userInfo._id) return;
  messageList.value.push(data);
});

// 消息容器DOM
let listContent = ref();

// 消息滚动到底部
watch(messageList.value, () => {
  nextTick(() => {
    listContent.value.scrollTo({
      top: listContent.value.scrollHeight,
      behavior: "smooth",
    });
  });
});

// 退出通话
const logout = () => {
  if (userInfoStore.userInfo._id === $route.query.fId) {
    localStream.value!.getTracks().forEach((track) => track.stop());
  }
  ipcRenderer.send("close-screen");
};
</script>

<style scoped lang="scss">
.video-content {
  width: 100%;
  height: 100%;
  display: flex;

  .right {
    flex: 1;
    height: 100%;
    background-color: #292929;
    border: 2px solid #2c2c2c;
    border-radius: 5px;
    box-sizing: border-box;
    overflow: hidden;
    position: relative;

    .main-screen-nick {
      position: absolute;
      bottom: 5px;
      left: 5px;
      color: #fff;
      font-size: 12px;
      text-shadow: 2px 2px 2px rgba(0, 0, 0, 0.5);
    }
  }

  .left {
    width: 215px;
    height: 100%;
    margin-left: 10px;
    overflow: hidden;
    background-color: #292929;
    border: 2px solid #2c2c2c;
    border-radius: 5px;
    position: relative;

    .list {
      width: 100%;
      height: 100%;
      padding-bottom: 40px;
      overflow: auto;

      &::-webkit-scrollbar {
        display: none;
      }

      .item {
        width: 100%;
        padding: 5px 5px 0 5px;
        line-height: 25px;

        .user-nick {
          font-size: 15px;
          color: #3a98f7;
        }

        .message-content {
          font-size: 13.5px;
          color: #d8d3d3;
          word-break: break-all;
        }
      }
    }

    .msg-input {
      position: absolute;
      bottom: 0;
      left: 0;
      width: 100%;
      height: 40px;
      background-color: #fff;
      border-radius: 5px 5px 0 0;
      display: flex;
      align-items: center;
      padding: 0 5px;

      input {
        flex: 1;
        border: none;
        font-size: 12px;
      }
    }
  }
}

.logout {
  width: 70px;
  height: 100%;
  display: flex;
  flex-direction: column;
  justify-content: center;
  align-items: center;
  font-size: 12px;

  .btn {
    width: 45px;
    height: 45px;
    background-color: #ff0040;
    cursor: pointer;
    display: flex;
    justify-content: center;
    align-items: center;
    border-radius: 20%;
    &:hover {
      background-color: #e55555;
    }
  }

  .text {
    color: #fff;
    margin-top: 10px;
  }
}
</style>
