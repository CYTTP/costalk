<template>
  <div class="layout-content" id="MESSAGE">
    <!-- 左侧边栏 -->
    <aside class="left-aside drag">
      <!-- 头像 -->
      <el-popover
        placement="right-end"
        :width="300"
        trigger="click"
        :show-arrow="false"
      >
        <template #reference>
          <div class="user-pic no-drag">
            <img :src="proxy.$baseUrl + userInfoStore.userInfo.imgUrl" alt="" />
          </div>
        </template>
        <div class="user-pic-pop">
          <div class="user-bg"></div>
          <div class="user-info-opacity"></div>
          <div class="user-info-content">
            <!-- 顶部 -->
            <div class="user-info-header">
              <div class="user-info-pic">
                <img
                  :src="proxy.$baseUrl + userInfoStore.userInfo.imgUrl"
                  alt=""
                />
              </div>
              <div class="user-info-main">
                <div class="user-nick">
                  {{ userInfoStore.userInfo.nick }}
                </div>
                <div class="user-phone">
                  手机号 {{ userInfoStore.userInfo.phone }}
                </div>
                <div class="user-phone">
                  {{ Boolean(userInfoStore.userInfo.online) ? "[在线]" : "" }}
                </div>
              </div>
            </div>
            <!-- 其他信息 -->
            <div class="user-other-info-content">
              <el-row class="user-other-info-item">
                <el-col :span="6" class="info-title">性别</el-col>
                <el-col :span="18">{{ userInfoStore.userInfo.sex }}</el-col>
              </el-row>
              <el-row
                class="user-other-info-item"
                v-if="userInfoStore.userInfo.birthday"
              >
                <el-col :span="6" class="info-title">生日</el-col>
                <el-col :span="18"
                  >{{ userInfoStore.userInfo.birthday }}
                  {{ userInfoStore.userInfo.start }}</el-col
                >
              </el-row>
              <el-row class="user-other-info-item">
                <el-col :span="6" class="info-title">个性签名</el-col>
                <el-col :span="18">{{ userInfoStore.userInfo.sign }}</el-col>
              </el-row>
            </div>
            <el-divider />
            <!-- 编辑按钮 -->
            <div class="user-edit-content" @click="editUserInfo">
              <div class="edit-btn">
                <el-icon size="20" color="#333">
                  <EditPen />
                </el-icon>
              </div>
            </div>
            <!-- dialog -->
            <el-dialog
              v-model="editDialogVisible"
              width="45%"
              :show-close="false"
              style="background-color: #f2f2f2"
            >
              <template #header>
                <div style="width: 100%; text-align: center">编辑资料</div>
              </template>
              <div class="edit-content">
                <!-- 上传头像 -->
                <el-upload
                  :action="proxy.$baseUrl + reqUploaduploadUserPic"
                  :limit="1"
                  :show-file-list="false"
                  :on-error="handleUploadError"
                  :on-success="handleUploadSuccess"
                >
                  <div class="user-pic">
                    <img :src="proxy.$baseUrl + ruleForm.imgUrl" alt="" />
                    <div class="pic-pop">
                      <el-icon color="#fff" size="20">
                        <Camera />
                      </el-icon>
                    </div>
                  </div>
                </el-upload>
                <div class="form-content">
                  <el-form :model="ruleForm" label-width="auto" :rules="rules">
                    <el-form-item label="昵称" prop="nick">
                      <el-input
                        v-model="ruleForm.nick"
                        maxlength="15"
                        show-word-limit
                        placeholder="请填写你的昵称"
                      />
                    </el-form-item>
                    <el-form-item label="性别" prop="sex">
                      <el-select
                        v-model="ruleForm.sex"
                        placeholder="请选择你的性别"
                        style="width: 100%"
                        :teleported="false"
                      >
                        <el-option label="未知" value="未知" />
                        <el-option label="男" value="男" />
                        <el-option label="女" value="女" />
                      </el-select>
                    </el-form-item>
                    <el-form-item label="生日" prop="birthday">
                      <el-date-picker
                        v-model="ruleForm.birthday"
                        type="date"
                        placeholder="请选择你的生日"
                        style="width: 100%"
                        :teleported="false"
                        format="YYYY/MM/DD"
                        value-format="YYYY-MM-DD"
                      />
                    </el-form-item>
                    <el-form-item label="个签" prop="sign">
                      <el-input
                        v-model="ruleForm.sign"
                        maxlength="80"
                        show-word-limit
                        placeholder="请填写你的个性签名"
                      />
                    </el-form-item>
                  </el-form>
                </div>
              </div>
              <template #footer>
                <span class="dialog-footer">
                  <el-button @click="handleCancel">取消</el-button>
                  <el-button type="primary" @click="onSubmit"> 保存 </el-button>
                </span>
              </template>
            </el-dialog>
          </div>
        </div>
      </el-popover>
      <!-- 菜单 -->
      <ul class="menu-content">
        <li
          class="menu-item no-drag"
          v-for="(item, index) in menuList"
          :key="index"
          @click="changeMenu(item.path)"
        >
          <img
            v-if="$route.path === item.path"
            :src="item.active_icon"
            :alt="item.title"
          />
          <img v-else :src="item.icon" :alt="item.title" />
          <template
            v-if="item.path === '/message' && messageStore.messageTotal > 0"
          >
            <div class="dot" v-if="item.isDot">
              {{ messageStore.messageTotal }}
            </div>
          </template>
          <template
            v-if="
              item.path === '/contact' &&
              contactStore.friendContactNum + contactStore.groupContactNum > 0
            "
          >
            <div class="dot" v-if="item.isDot">
              {{
                contactStore.friendContactNum + contactStore.groupContactNum >
                99
                  ? "99+"
                  : contactStore.friendContactNum + contactStore.groupContactNum
              }}
            </div>
          </template>
        </li>
      </ul>
      <!-- 设置按钮 -->
      <SetupBtn />
    </aside>
    <!-- 路由 -->
    <RouterView />
    <!-- <WindowsBtn v-if="!proxy.isMac && $route.path !== '/notes'" :color="'#4F4F4F'" /> -->
  </div>
  <!-- 电话消息提示信息 -->
  <div class="telephone-notice-content" v-if="isShowTelephoneNotice">
    <div class="telephone-notice-info">
      <div class="telephone-notice-pic">
        <img :src="proxy.$baseUrl + telephoneNoticeUserInfo.imgUrl" alt="" />
      </div>
      <div class="telephone-notice-text">
        {{ telephoneNoticeUserInfo.name }} 邀请你加入{{
          telephoneNoticeTypeText
        }}
      </div>
    </div>
    <div class="telephone-notice-btn">
      <el-button style="flex: 1" type="primary" text bg @click="joinTelephone"
        >加入</el-button
      >
      <el-button style="flex: 1" type="danger" plain @click="refuseTelephone"
        >拒绝</el-button
      >
    </div>
  </div>
</template>

<script setup lang="ts">
import { reactive, getCurrentInstance, ref, onMounted, computed } from "vue";
import { ElMessage } from "element-plus";
import { EditPen, Camera } from "@element-plus/icons-vue";
import type { FormInstance, FormRules, UploadProps } from "element-plus";
import SetupBtn from "@/components/SetupBtn/index.vue";
// api
import { reqUploaduploadUserPic, reqUpdateUserInfo } from "@/api/user/index";

// 全局事件总线
import $bus from "@/utils/eventBus";
// ts类型
import type {
  UploadPicResponseData,
  UpdateUserData,
  UpdateUserResponseData,
} from "@/api/user/type";
// router
import { useRoute, useRouter } from "vue-router";
// pinia
import { useUserInfoStore } from "@/store/modules/user";
import { useMessageStore } from "@/store/modules/message";
import { useContactStore } from "@/store/modules/contact";
import { useTelephoneStore } from "@/store/modules/telephone";
//electron
import { ipcRenderer } from "electron";
// router
const $route = useRoute();
const $router = useRouter();
// pinia
const userInfoStore = useUserInfoStore();
const messageStore = useMessageStore();
const contactStore = useContactStore();
const telephoneStore = useTelephoneStore();
// baseUrl
const { proxy } = getCurrentInstance() as any;

// 连接socket
proxy.socket.io.connect();
proxy.socket.emit("login", userInfoStore.userInfo._id);

// 菜单列表
const menuList = reactive([
  {
    title: "消息",
    icon: "./svg/message.svg",
    active_icon: "./svg/message_active.svg",
    path: "/message",
    isDot: true,
  },
  {
    title: "好友",
    icon: "./svg/contact.svg",
    active_icon: "./svg/contact_active.svg",
    path: "/contact",
    isDot: true,
  },
  {
    title: "空间",
    icon: "./svg/space.svg",
    active_icon: "./svg/space_active.svg",
    path: "/space",
    isDot: false,
  },
  {
    title: "留言板",
    icon: "./svg/notes.svg",
    active_icon: "./svg/notes_active.svg",
    path: "/notes",
    isDot: false,
  },
]);

// 切换菜单回调
const changeMenu = (path: string) => {
  $router.push(path);
};

// // 设置按钮回调
// const setupBtn = async () => {
//   // 清空历史emoji
//   await reqLogOut(userInfoStore.userInfo.phone).then((res) => {
//     // 断开socket
//     proxy.socket.emit("logout", userInfoStore.userInfo._id);
//     // 清空pinia
//     userInfoStore.logout();
//     // 清空本地存储
//     localStorage.removeItem("userInfo");
//     localStorage.removeItem("emojiHistory");
//     // 退出登陆, 关闭所有子窗口
//     ipcRenderer.send("logout");
//     $router.push("/login");
//   });
// };

// 控制dialog的显示隐藏
let editDialogVisible = ref<boolean>(false);

// 更新用户信息按钮
const editUserInfo = () => {
  editDialogVisible.value = true;
  ruleForm.sign = userInfoStore.userInfo.sign;
};

const ruleForm = reactive({
  imgUrl: userInfoStore.userInfo.imgUrl,
  nick: userInfoStore.userInfo.nick,
  sex: userInfoStore.userInfo.sex,
  birthday: userInfoStore.userInfo.birthday,
  sign: userInfoStore.userInfo.sign,
});

const ruleFormRef = ref<FormInstance>();

// @ts-ignore
const validateNick = (rule: any, value: any, callback: any) => {
  if (value === "") {
    callback(new Error("昵称不能为空"));
  } else {
    if (ruleForm.nick !== "") {
      if (!ruleFormRef.value) return;
      ruleFormRef.value.validateField("checkPass", () => null);
    }
    callback();
  }
};

const rules = reactive<FormRules<typeof ruleForm>>({
  nick: [{ validator: validateNick, trigger: "blur" }],
});

// 头像上传成功回调
const handleUploadSuccess: UploadProps["onSuccess"] = (
  response: UploadPicResponseData
) => {
  if (response.res_code === 0) {
    ElMessage({
      type: "success",
      message: "头像更新成功",
    });
    ruleForm.imgUrl = response.url as string;
  } else {
    ElMessage.error(response.msg);
  }
};

// 头像上传失败回调
const handleUploadError: UploadProps["onError"] = () => {
  ElMessage.error("上传失败");
};

// 取消按钮回调
const handleCancel = () => {
  editDialogVisible.value = false;
};

// 确定按钮回调
const onSubmit = async () => {
  const { nick, sex, birthday, sign, imgUrl } = ruleForm;
  let data: UpdateUserData = {
    _id: userInfoStore.userInfo._id,
    nick,
    sex,
    birthday: birthday ? birthday : "",
    sign: sign ? sign : "这个人很高冷, 暂时没有留下什么",
    imgUrl,
  };
  let res: UpdateUserResponseData = await reqUpdateUserInfo(data);
  if (res.status === 200) {
    Object.assign(data, { start: res.start });
    // 更新pinia
    userInfoStore.updateInfo(data);
    // 更新本地存储
    localStorage.setItem("userInfo", JSON.stringify(userInfoStore.userInfo));
    ElMessage({
      type: "success",
      message: res.msg,
    });
    // 关闭弹窗
    handleCancel();
  } else {
    ElMessage.error(res.msg);
  }
};

onMounted(() => {
  // 用户上线信息
  // ElNotification({
  //   title: userInfoStore.userInfo.nick + "已上线",
  //   type: "success",
  // });
  // 获取加入的所有群聊信息
  messageStore.getAllGroup();
  if ($route.path !== "/message") {
    messageStore.getMessageList();
  }
});

// 控制弹窗显示隐藏
let isShowTelephoneNotice = ref<boolean>(false);
// 弹窗信息
type NoticeInfo = {
  name?: string;
  imgUrl?: string;
};
let telephoneNoticeUserInfo = ref<NoticeInfo>({});
// 通话类型
let telephoneNoticeType = ref<string>("");

type NoticeTelephoneData = {
  fId: string; // 用户id
  toId: string; // urlid（好友id/群id）
  chatType: string; // 聊天类型(群聊group/私聊friend)
  type: string; // 通话类型
};

// 在 listen_socket.ts中监听到telephone事件后，会调用此函数
$bus.on("telephone", (data) => {
  console.log("telephone", data);
  isShowTelephoneNotice.value = true;
  telephoneNoticeType.value = (data as NoticeTelephoneData).type;
  telephoneStore.setTelephoneInfo(data as NoticeTelephoneData);
  // 弹框用户/群信息
  let currentIndex = messageStore.messageList.findIndex((item) => {
    let id =
      (data as NoticeTelephoneData).chatType === "friend"
        ? (data as NoticeTelephoneData).fId
        : (data as NoticeTelephoneData).toId;
    return item._id === id;
  });
  let itemInfo = messageStore.messageList[currentIndex];
  let info = {
    imgUrl: itemInfo.imgUrl,
  };
  if ((data as NoticeTelephoneData).chatType === "friend") {
    Object.assign(info, { name: itemInfo.nick });
  } else {
    Object.assign(info, { name: itemInfo.groupName });
  }
  telephoneNoticeUserInfo.value = info;
});

// 通话消息提示的文字
const telephoneNoticeTypeText = computed(() => {
  let type = telephoneNoticeType.value;
  console.log("通话消息提示的文字", type);
  if (type === "screen") {
    return "屏幕共享";
  } else if (type === "audio") {
    return "语音通话";
  } else if (type === "video") {
    return "视频通话";
  }
});

// 同意加入通话
const joinTelephone = () => {
  // 接收方
  const { chatType, type, toId, fId } = telephoneStore;
  ipcRenderer.send("open-screen-share", {
    type,
    url: `/telephone/${type}?chatType=${chatType}&fId=${fId}&id=${toId}`,
  });
  isShowTelephoneNotice.value = false;
};

// 拒绝加入通话
const refuseTelephone = () => {
  isShowTelephoneNotice.value = false;
};
</script>

<style scoped lang="scss">
.layout-content {
  width: 100vw;
  height: 100vh;
  display: flex;

  .left-aside {
    width: 70px;
    height: 100%;
    background-color: var(--aside-bg-color);
    box-sizing: border-box;
    padding: 50px 0 30px;
    display: flex;
    flex-direction: column;
    align-items: center;

    .user-pic {
      width: 40px;
      height: 40px;
      border-radius: 50%;
      overflow: hidden;
      margin-bottom: 30px;
      position: relative;
      cursor: pointer;

      img {
        width: 100%;
        height: 100%;
      }
    }

    .menu-content {
      flex: 1;

      .menu-item {
        width: 30px;
        height: 30px;
        margin: 30px;
        display: flex;
        justify-content: center;
        align-items: center;
        position: relative;

        .dot {
          position: absolute;
          left: 20px;
          top: -5px;
          height: 18px;
          padding: 0 6px;
          background-color: #f56c6c;
          font-size: 12px;
          border-radius: 10px;
          color: #fff;
          display: flex;
          justify-content: center;
          align-items: center;
          z-index: 99;
        }
      }
    }
  }
}

.user-pic-pop {
  width: 100%;
  overflow: hidden;
  background-color: var(--aside-pop-content-bg-color);
  border-radius: var(--el-popover-border-radius);
  position: relative;

  .user-bg {
    width: 100%;
    height: 100px;
    background-image: url(@/assets/images/user-bg1.jpeg);
    background-size: 100% 100%;
    background-position: center;
    background-repeat: no-repeat;
  }

  .user-info-opacity {
    position: absolute;
    top: 50px;
    width: 100%;
    height: 50px;
    /* background: linear-gradient(to bottom, rgba(255, 255, 255, 0), #fff); */
    background: var(--aside-pop-opacity-bg-color);
  }

  .user-info-content {
    padding: 0 15px;
    margin-bottom: 20px;
    box-sizing: border-box;

    .user-info-header {
      width: 100%;
      position: absolute;
      top: 60px;
      display: flex;
      align-items: center;

      .user-info-pic {
        width: 60px;
        height: 60px;
        border-radius: 50%;
        overflow: hidden;
        margin-right: 10px;

        img {
          width: 100%;
          height: 100%;
        }
      }

      .user-info-main {
        .user-nick {
          font-size: 16px;
          font-weight: 700;
          margin-bottom: 2px;
          color: var(--aside-user-nick-color);
        }

        .user-phone {
          font-size: 12px;
          color: var(--aside-user-phone-color);
        }
      }
    }

    .user-other-info-content {
      padding: 40px 0 0;

      .user-other-info-item {
        font-size: 13px;
        color: var(--aside-user-other-info-color);
        width: 100%;
        height: 35px;
        display: flex;
        align-items: center;

        .info-title {
          color: var(--aside-user-other-info--title-color);
        }
      }
    }

    .user-edit-content {
      width: 100%;
      display: flex;
      justify-content: flex-end;

      .edit-btn {
        width: 40px;
        height: 40px;
        border: 1px solid #dddddd;
        border-radius: 50%;
        display: flex;
        justify-content: center;
        align-items: center;
        cursor: pointer;
        color: var(--aside-edit-btn-color);
      }
    }
  }
}

:deep(.el-divider--horizontal) {
  margin: 15px 0;
}

.edit-content {
  width: 100%;
  display: flex;
  flex-direction: column;
  justify-content: center;
  align-items: center;
  padding: 0 20px;
  box-sizing: border-box;

  .user-pic {
    width: 80px;
    height: 80px;
    border-radius: 50%;
    overflow: hidden;
    border: 5px solid var(--aside-edit-user-pic-border);
    cursor: pointer;
    position: relative;

    img {
      width: 100%;
      height: 100%;
    }

    .pic-pop {
      width: 100%;
      height: 100%;
      position: absolute;
      top: 0;
      left: 0;
      background-color: rgba(0, 0, 0, 0.5);
      display: flex;
      justify-content: center;
      align-items: center;
    }
  }

  .form-content {
    width: 100%;
    margin-top: 15px;
  }
}

:deep(.el-dialog__body) {
  padding: 0;
}

:deep(.el-dialog__header) {
  margin: 0;
}

.telephone-notice-content {
  width: 260px;
  background-color: var(--telephone-notice-content-bg-color);
  position: fixed;
  right: 10px;
  top: 10px;
  z-index: 100000;
  border: 1px solid #ebeef5;
  border-radius: 8px;
  box-shadow: 0px 0px 12px rgba(0, 0, 0, 0.12);
  padding: 10px;
  box-sizing: border-box;

  .telephone-notice-info {
    width: 100%;
    display: flex;
    align-items: center;

    .telephone-notice-pic {
      width: 40px;
      height: 40px;
      border-radius: 5px;
      overflow: hidden;

      img {
        width: 100%;
        height: 100%;
      }
    }

    .telephone-notice-text {
      flex: 1;
      margin-left: 10px;
      font-size: 13px;
      line-height: 20px;
      display: -webkit-box;
      -webkit-line-clamp: 2;
      -webkit-box-orient: vertical;
      overflow: hidden;
      text-overflow: ellipsis;
    }
  }

  .telephone-notice-btn {
    margin-top: 10px;
    display: flex;
  }
}
</style>
<style>
.el-popper.is-light {
  padding: 0;
}

.el-select-dropdown {
  position: absolute !important;
  left: 0px !important;
  top: 0px !important;
  background-color: var(--el-select-dropdown-bg-color);
}

.el-picker__popper {
  width: 100%;
  position: absolute !important;
  left: 200px !important;
  top: -100px !important;
  background-color: var(--el-picker-popper-bg-color);
}

.el-popper__arrow {
  display: none !important;
}
</style>
