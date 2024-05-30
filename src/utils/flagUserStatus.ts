// 判断用户是否可以成功发送消息(是否与该好友是好友/是否还在群聊中)
// 如果不是好友/不在群内则不发送给对方, 只是自己消息列表中暂存
import { useMessageStore } from '@/store/modules/message'
import router from '@/router'
const messageStore = useMessageStore()
const $route = router.currentRoute

// 需要接收id, 对方id或群id
export function flagUserStatus(): boolean {
    let id = $route.value.query.id
    // console.log(id);
    let currentIndex = messageStore.messageList.findIndex(item => item._id === id)
    // console.log(currentIndex);
    if (currentIndex === -1) {
        return false
    }
    return (messageStore.messageList[currentIndex].userStatus) as boolean
}