<template>
  <div class="container" v-loading="loading">
    <!-- 可拖拽 -->
    <div class="drag"></div>
    <div class="left">
      <div class="title" v-html="text"></div>
    </div>
    <div class="right">
      <Input
        class="user"
        :type="'text'"
        :content="`${$t('login.phone')}`"
        :placeholder="`${$t('login.phonePlaceholder')}`"
        v-model="userInfo.phone"
      />
      <Input
        :type="'password'"
        :content="`${$t('login.password')}`"
        :placeholder="`${$t('login.passwordPlaceholder')}`"
        v-model="userInfo.password"
      />

      <div class="tips">
        <div>
          {{ $t('login.que') }}<span @click="register">{{ $t('login.gor') }}</span>
        </div>
      </div>
      <Button @click="login" :content="`${$t('login.login')}`" />
    </div>
  </div>
  <WindowsBtn v-if="!proxy.isMac && $route.path !== '/notes'" :color="'#909399'" />
</template>

<script setup lang="ts">
import { onMounted, ref, getCurrentInstance } from 'vue'
import Input from '@/components/Input/index.vue'
import Button from '@/components/Button/index.vue'
// 引入api接口
import { reqLogin } from '@/api/login_register/index'
import { ElMessage } from 'element-plus'
// 引入ts类型
import type { LoginResponse, UserInfoData } from '@/api/login_register/type'
import { useRouter } from 'vue-router'
import { useUserInfoStore } from '@/store/modules/user'
const $router = useRouter()
const userInfoStore = useUserInfoStore()
const { proxy } = getCurrentInstance() as any

onMounted(() => {
  print('Welcome\nTo CosTalk')
})

let text = ref<string>('')
// 打印机效果
const print = async (printInfo: string) => {
  let printText = printInfo
  for (let i = 0; i < printText.length; i++) {
    let str = printText.slice(i, i + 1)
    if (str === '\n') {
      text.value = text.value + '<br>'
    } else {
      await new Promise((resolve) => {
        setTimeout(() => {
          text.value = text.value + str
          resolve(null)
        }, 80)
      })
    }
  }
  text.value = text.value
}

// 用户表单信息
let userInfo = ref<UserInfoData>({
  phone: '',
  password: ''
})

const loading = ref<boolean>(false)

// 登录按钮
const login = async () => {
  const { phone, password } = userInfo.value
  const phoneNumberRegex: RegExp = /^1[3456789]\d{9}$/
  if (!phoneNumberRegex.test(phone)) {
    return ElMessage({
      type: 'warning',
      message: '请输入正确手机号'
    })
  } else if (!password) {
    return ElMessage({
      type: 'warning',
      message: '密码不能为空'
    })
  }
  loading.value = true
  let res: LoginResponse = await reqLogin(userInfo.value)
  if (res.status === 200) {
    // console.log(res)
    // 存本地
    localStorage.setItem('userInfo', JSON.stringify(res.data))
    // 存pinia
    userInfoStore.login(res.data)
    ElMessage({
      type: 'success',
      message: res.msg
    })
    $router.push('/message')
  } else {
    ElMessage({
      type: 'error',
      message: res.msg
    })
  }
  loading.value = false
}

// 注册按钮
const register = () => {
  $router.push('/register')
}
</script>

<style scoped lang="scss">
.drag {
  position: fixed;
  top: 0;
  left: 0;
  width: 100%;
  height: 30px;
  user-select: none;
  -webkit-app-region: drag;
}

@font-face {
  font-family: 'Regular';
  font-weight: 400;
  src:
    url('../../assets/iconfont/login_register.woff2') format('woff2'),
    url('../../assets/iconfont/login_register.woff') format('woff');
  font-display: swap;
}

.container {
  width: 100%;
  height: 100%;
  display: flex;
  position: absolute;
  top: 50%;
  transform: translate(-50%, -50%);
  left: 50%;
  background-color: var(--login-bg-color);

  .left {
    width: 100%;
    height: 100%;
    flex: 16;
    position: relative;
    display: flex;
    flex-direction: column;
    padding: 20% 0;
    box-sizing: border-box;

    &::before {
      content: '';
      position: absolute;
      top: 40%;
      left: 30%;
      width: 280px;
      height: 100px;
      background: linear-gradient(to right, var(--primary-color), #c471ed, #f64f59);
      filter: blur(70px);
      transition: all 0.5s;
    }

    &:has(.desc:hover) {
      &::before {
        filter: blur(55px);
      }
    }
  }

  .title {
    width: 100%;
    height: 120px;
    line-height: 60px;
    font-size: 60px;
    font-weight: bold;
    /* font-family: Regular; */
    font-family: system-ui, sans-serif;
    font-weight: bold;
    padding-left: 25%;
    box-sizing: border-box;
    color: var(--light-primary-100);
    z-index: 2;
  }

  .desc {
    font-size: 15px;
    font-weight: bold;
    padding-left: 45%;
    margin-top: 10px;
    color: #505050;
    cursor: pointer;
    z-index: 2;

    span {
      color: #5140f0;
      text-decoration: underline;
    }
  }

  .right {
    flex: 18;
    height: 100%;
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;

    .user {
      margin-bottom: 25px;

    }

    .tips {
      width: 290px;
      text-align: right;
      margin-top: 10px;
      color: #aaacb0;
      font-size: 13px;

      span {
        color: var(--light-primary-100);
        cursor: pointer;
      }
    }
  }
}
</style>
