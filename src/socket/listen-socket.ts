import socket from './index'
import { formatTime } from '@/utils/formatTime'
import router from '@/router'
// pinia
import { useUserInfoStore } from '@/store/modules/user'
import { useContactStore } from "@/store/modules/contact"
import { useMessageStore } from '@/store/modules/message'
import type { MessageType } from '@/store/modules/interface/messageType'
import $bus from '@/utils/eventBus'
import { ipcRenderer } from 'electron'
const userInfoStore = useUserInfoStore()
const contactStore = useContactStore()
const messageStore = useMessageStore()
const $route = router.currentRoute

socket.on('login', () => {
    // 获取初始化申请消息
    socket.emit('init_apply_notice', userInfoStore.userInfo._id)
    console.log('用户socket连接成功')
})

// 联系人页面申请消息数量的ts类型
type ContactNum = {
    friendNoticeNum: number;
    groupNoticeNum: number;
}

// 初始化申请消息
socket.on('init_apply_notice', (val: ContactNum) => {
    contactStore.SOCKET_ContactNum(val.friendNoticeNum, val.groupNoticeNum)
})

// 发送好友/群申请，接受放获取消息数量
socket.on('apply_notice', (val: ContactNum) => {
    contactStore.SOCKET_ContactNum(val.friendNoticeNum, val.groupNoticeNum)
})

// 接收同意申请信息
socket.on('agree_apply', (id) => {
    // id 好友id/群id 只有群聊才需要  好友申请id为空
    $bus.emit('apply')
    if (!id) return
    socket.emit('agree_apply_join_group', id)
})

// 监听私聊消息
socket.on('private_chat', (val: MessageType) => {
    val.time = formatTime(new Date(val.time))
    let urlId = $route.value.query.id
    let currentIndex = messageStore.messageList.findIndex((item) => val.userId._id === item._id)
    if (currentIndex === -1) {
        // 消息列表中还未与该好友发过消息
        let data = {
            imgUrl: val.userId.imgUrl,
            lastMsg: {
                time: val.time,
            },
            nick: val.userId.nick,
            type: 'friendChat',
            unreadMsgCount: 0,
            _id: (val.fromId) as string,
        }
        messageStore.messageList.unshift(data)
    } else {
        // 将列表排到第一
        messageStore.messageList.map((item, index) => {
            if (index === currentIndex) messageStore.messageList.unshift(messageStore.messageList.splice(index , 1)[0])
        })
    }
    // 改变消息列表中, 最近一次消息的时间
    messageStore.messageList[0].lastMsg!.time = new Date()
    if (urlId === val.fromId) {
        // 只有id相同的才添加到消息记录列表中
        messageStore.messageChatList.push(val)
    }
    messageStore.messageList.forEach(item => {
        if (item._id === urlId) {
            item.userStatus = true
        }
    })
})

// 监听群聊消息
socket.on('group_chat', (val: MessageType) => {
    val.time = formatTime(new Date(val.time))
    let urlId = $route.value.query.id
    let currentIndex = messageStore.messageList.findIndex((item) => val.toId === item._id)
    if (currentIndex === -1) {
        // 消息列表中还未有该群发过消息的记录
        let data = {
            imgUrl: (val.groupInfo!.imgUrl) as string,
            lastMsg: {
                time: val.time,
            },
            groupName: val.groupInfo?.groupName,
            type: 'groupChat',
            unreadMsgCount: 0,
            _id: (val.groupInfo!._id) as string,
        }
        messageStore.messageList.unshift(data)
    } else {
        // 将列表排到第一
        messageStore.messageList.map((item, index) => {
            if (index === currentIndex) messageStore.messageList.unshift(messageStore.messageList.splice(index , 1)[0])
        })
    }
    // 改变消息列表中, 最近一次消息的时间
    messageStore.messageList[0].lastMsg!.time = new Date()
    if (urlId === val.toId) {
        messageStore.messageChatList.push(val)
    }
    messageStore.messageList.forEach(item => {
        if (item._id === urlId) {
            item.userStatus = true
        }
    })
})

// 监听未读消息
socket.on('unread_message', (val: string) => {
    console.log(val, 'userId')
    // val: id(friendId, groupId)
    if ($route.value.query.id === val) {
        // 已经在该群聊中, 将收到的消息设置为已读
        messageStore.triggerMessageRead()
        return
    }
    messageStore.messageTotal++
    messageStore.messageList.forEach(item => {
        if (item._id === val) {
            item.unreadMsgCount++
        }
    })
})

// 用户a删除用户b后, 告知用户b已被删除
socket.on('del_friend', (id: string) => {
    let currentIndex = messageStore.messageList.findIndex(item => item._id === id)
    messageStore.messageList[currentIndex].userStatus = false
})

// 解散群聊
socket.on('del_group', (gId: string) => {
    let currentIndex = messageStore.messageList.findIndex(item => item._id === gId)
    messageStore.messageList[currentIndex].userStatus = false
})

// 被踢出群聊
socket.on('notice_out_group', (gId: string) => {
    socket.emit('leave_group', gId)
})

// 离开群聊
socket.on('leave_group', (gId: string) => {
    let currentIndex = messageStore.messageList.findIndex(item => item._id === gId)
    if (currentIndex === -1) return
    messageStore.messageList[currentIndex].userStatus = false
})


type NoticeTelephoneData = {
  fId: string; // 用户id
  toId: string; // urlid（好友id/群id）
  chatType: string; // 聊天类型(群聊group/私聊friend)
  type: string; // 通话类型
};

// 视频、语音通话消息提示
socket.on("notice_telephone", (data: NoticeTelephoneData) => {
  if (data.fId === userInfoStore.userInfo._id) return;
  $bus.emit("telephone", data);
});

// 通话发起方
type AcceptData = {
  acceptId: string;
  chatType: string;
  fId: string;
  toId: string;
  type: string;
};
socket.on("accept_telephone", (data: AcceptData) => {
  // 消息在主窗口, 将消息交给通话窗口
  ipcRenderer.send("send_acceptData", data);
});

// 同意方监听接收方传来的offer
socket.on("send_offer", (params) => {
  // 消息在主窗口, 将消息交给通话窗口
  ipcRenderer.send("send_offer", params);
});

// 发起方监听同意方传来的answer
socket.on("send_answer", (params) => {
  // 消息在主窗口, 将消息交给通话窗口
  ipcRenderer.send("send_answer", params);
});

// 接收方收到发起方的candidate信息
socket.on("send_candidate", (candidateData) => {
  // 通知发起方子窗口
  ipcRenderer.send("send_candidate", candidateData);
});