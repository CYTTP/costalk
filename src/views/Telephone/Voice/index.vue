<template>
  <TelephoneWin>
    <div class="content">
      <ul class="list" :class="userList.length > 9 ? 'list-n' : ''">
        <li
          class="item"
          :class="userList.length > 9 ? 'user-item-n' : `user-item-${userList.length}`"
          v-for="(item, index) in userList"
          :key="index"
        >
          <!-- 开启视频 -->
          <div class="card" v-if="item.isOpen">
            <video src="" :uid="item.uId"></video>
            <div class="video-nick">{{ item.nick }}</div>
          </div>
          <!-- 未开启视频(只有麦克风或者都没开) -->
          <div class="card" v-else>
            <div class="info">
              <div class="user-pic">
                <img :src="proxy.$baseUrl + item.imgUrl" alt="" />
              </div>
              <div class="nick">{{ item.nick }}</div>
            </div>
          </div>
        </li>
      </ul>
    </div>
    <template #footer>
      <!-- 麦克风 -->
      <div class="microphone">
        <div class="btn">
          <svg
            t="1702130018050"
            class="icon"
            viewBox="0 0 1024 1024"
            version="1.1"
            xmlns="http://www.w3.org/2000/svg"
            p-id="29193"
            width="23"
            height="23"
          >
            <path d="M0 0h1024v1024H0z" fill="#333333" fill-opacity="0" p-id="29194"></path>
            <path
              d="M512 672A202.922667 202.922667 0 0 0 714.666667 469.333333V298.666667a202.666667 202.666667 0 1 0-405.333334 0v170.666666A202.922667 202.922667 0 0 0 512 672zM373.333333 298.666667a138.666667 138.666667 0 0 1 277.333334 0v170.666666a138.666667 138.666667 0 0 1-277.333334 0V298.666667z m170.666667 499.712v65.621333H682.666667a32 32 0 1 1 0 64H341.333333a32 32 0 1 1 0-64h138.666667v-65.621333a331.093333 331.093333 0 0 1-298.666667-329.045334 32 32 0 1 1 64 0 266.666667 266.666667 0 1 0 533.333334 0 32 32 0 1 1 64 0 331.093333 331.093333 0 0 1-298.666667 329.045334z"
              fill="#333333"
              p-id="29195"
            ></path>
          </svg>
        </div>
        <div class="text">关闭麦克风</div>
      </div>
      <!-- 退出通话 -->
      <div class="logout">
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
        <div class="text">退出通话</div>
      </div>
    </template>
  </TelephoneWin>
</template>

<script setup lang="ts">
import TelephoneWin from '@/components/TelephoneWin/index.vue'
import { getCurrentInstance, onMounted, ref, nextTick } from 'vue'
import { getLocalStream } from '@/utils/getLocalStream'
import { useRoute } from 'vue-router'
import { useUserInfoStore } from '@/store/modules/user'
import { ipcRenderer } from 'electron'
const $route = useRoute()
const userInfoStore = useUserInfoStore()
const { proxy } = getCurrentInstance() as any

onMounted(() => {
  const { fId, id, chatType } = $route.query
  let userId = userInfoStore.userInfo._id
  if (fId === userId) {
    // 通话发起人
    initLocalStream()
  } else {
    // 通话接收人 socket通知发起方可以交换SDP信息
    let sendData = {
      acceptId: userId, // 当前用户的id(同意方id)
      fId,
      toId: id, // 好友id/群id 也可以理解为房间id
      chatType, // 聊天类型
      type: $route.path === '/telephone/voice' ? 'voice' : 'video'
    }
    proxy.socket.emit('accept_telephone', sendData)
  }
})

type UserItemType = {
  uId: string
  nick: string
  imgUrl: string
  isOpen: boolean
  stream: MediaStream
}
// 用户列表
const userList = ref<UserItemType[]>([])

// 本地音视频流
let localStream = ref<MediaStream>()

// 初始化本地音视频流
const initLocalStream = async () => {
  const { _id, nick, imgUrl } = userInfoStore.userInfo
  let stream = await getLocalStream({ audio: true, video: true })
  localStream.value = stream
  // 添加自己本地视频到video上
  userList.value.push({
    uId: _id,
    nick: nick,
    imgUrl: imgUrl,
    isOpen: true,
    stream
  })
  nextTick(() => {
    document.querySelectorAll('video').forEach((video) => {
      // video 元素绑定的自定义属性 uid
      let video_uid = video.getAttribute('uid')
      if (video_uid === _id) {
        video.srcObject = stream
        video.play()
      }
    })
  })
}

// peer信息 RTCPeerConnection
let peer = ref<RTCPeerConnection>()

type AcceptData = {
  acceptId: string
  chatType: string
  fId: string
  toId: string
  type: string
}
// 同意方同意通话请求, 发起方开始交换SDP和candidate信息
ipcRenderer.on('send_acceptData', async (e: any, data: AcceptData) => {
  // 发起方创建RTCPeerConnection
  peer.value = new RTCPeerConnection()
  // 获取媒体轨道, 添加本地音视频流
  for (const track of localStream.value!.getTracks()) {
    peer.value.addTrack(track)
  }

  try {
    // 生成offer
    const offer = await peer.value.createOffer()
    //设置offer未本地描述
    await peer.value.setLocalDescription(offer)
    // 发送offer
    let offerParams = {
      offer,
      fId: data.fId, // 发起方id
      acceptId: data.acceptId, // 同意方id
      type: $route.path === '/telephone/voice' ? 'voice' : 'video',
      chatType: $route.query.chatType
    }
    proxy.socket.emit('send_offer', offerParams)
  } catch (error) {}
})

type OfferParams = {
  acceptId: string
  chatType: string
  fId: string
  type: string
  offer: any // 发起方创建的offer信息
}
// 同意方收到发起方的offer，开始交换SDP
ipcRenderer.on('send_offer', async (e: any, params: OfferParams) => {
  // 同意方创建RTCPeerConnection
  peer.value = new RTCPeerConnection()
  // 初始化本地音视频流
  initLocalStream()

  try {
    // 设置远端描述信息(也就是设置发起方发送来的offer, offer就是发起方的SDP信息)
    await peer.value.setRemoteDescription(params.offer)
    // 生成answer
    let answer = await peer.value.createAnswer()
    // 在本地设置answer信息
    await peer.value.setLocalDescription(answer)
    // 发送answer
    let answerParams = {
      answer,
      fId: params.fId, // 发起方id
      acceptId: params.acceptId, // 同意方id
      // type: 'screen',
      chatType: $route.query.chatType
    }
    proxy.socket.emit('send_answer', answerParams)
  } catch (error) {}
})
</script>

<style scoped lang="scss">
.content {
  width: 100%;
  height: 100%;
  overflow: auto;

  &::-webkit-scrollbar {
    display: none;
  }

  ul {
    width: 100%;
    height: 100%;
    display: flex;
    justify-content: center;
    flex-wrap: wrap;

    .item {
      padding: 5px;

      .card {
        width: 100%;
        height: 100%;
        background-color: #292929;
        border: 2px solid #2c2c2c;
        border-radius: 5px;
        position: relative;

        video {
          width: 100%;
          height: 100%;
        }

        .video-nick {
          position: absolute;
          left: 5px;
          bottom: 5px;
          color: #cdcdcd;
          font-size: 13px;
          text-shadow: 2px 2px 2px rgba(0, 0, 0, 0.5);
        }

        .info {
          width: 100%;
          height: 100%;
          display: flex;
          padding: 10% 0;
          flex-direction: column;
          justify-content: space-around;
          align-items: center;

          .user-pic {
            width: 45px;
            height: 45px;
            border-radius: 50%;
            overflow: hidden;

            img {
              width: 100%;
              height: 100%;
            }
          }

          .nick {
            color: #cdcdcd;
            font-size: 15px;
          }
        }
      }
    }

    .user-item-1 {
      width: 100%;
      height: 100%;
    }

    .user-item-2 {
      width: 50%;
      height: 100%;
    }

    .user-item-3,
    .user-item-4 {
      width: 50%;
      height: 50%;
    }

    .user-item-5,
    .user-item-6 {
      width: 33.33333%;
      height: 50%;
    }

    .user-item-7,
    .user-item-8,
    .user-item-9 {
      width: 33.33333%;
      height: 33.33333%;
    }

    .user-item-n {
      width: 33.33333%;
      height: 33.33333%;
    }
  }

  .list-n {
    justify-content: flex-start;
  }
}

.microphone,
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
    cursor: pointer;
    display: flex;
    justify-content: center;
    align-items: center;
    border-radius: 20%;
  }

  .text {
    color: #fff;
    margin-top: 10px;
  }
}

.microphone {
  .btn {
    background-color: #ffffff;

    &:hover {
      background-color: #efefef;
    }
  }
}

.logout {
  .btn {
    background-color: #ff0040;

    &:hover {
      background-color: #e55555;
    }
  }
}
</style>
