import { defineStore } from "pinia";
// 引入用户信息的ts类型
import type { TelephoneStoreType } from "./interface/telephoneType";

export const useTelephoneStore = defineStore("telephoneStore", {
  state: (): TelephoneStoreType => {
    return {
      fId: "", // 发起方id
      toId: "", // 接听方id(聊天类型为私聊: toId为好友id; 为群聊: toId为群id)
      chatType: "", // 聊天类型(群聊group/私聊friend)
      type: "", // 通话类型
    };
  },
  actions: {
    // 设置将正在通话的房间信息
    setTelephoneInfo(data: TelephoneStoreType) {
      const { fId, toId, chatType, type } = data;
      this.fId = fId;
      this.toId = toId;
      this.chatType = chatType;
      this.type = type;
    },
  },
});
