开发时遇到的问题

# 1、问题 ：Uncaught TypeError: path.join is not a function

解：electron这个警告是由 Vite 提供的，它告诉你在客户端代码中无法访问 Node.js 的 path 模块的特定属性 ，Vite 的预构建会将所有第三方模块构建成 Web 格式，但它无法完全使用于 Electron 渲染进程， 安装插件：vite-plugin-electron-renderer 功能，即只在构建渲染进程时工作

# 2、问题：由于vue3-video-play第三方组件作者把他自己的包名引错了的原因, 需要启动项目, 还需要在npm i后, 在node_modules中找到vue3-video-play目录, 将目录下的package.json文件中的内容进行修改, 修改结果如下

解： "main": "./dist/index.umd.js","module": "./dist/index.mjs"

# 3、问题：你是怎么打包electron的呢？

解：先打包vite然后再打包electron，是通过vite提供的一个钩子函数closeBundle(),作用是vite项目构建完成后后执行一些自定义逻辑，

# 4、vue-i18n国际化，切换语言后，跳转页面或者刷新当前页后语言又重置了

解：采用localStorage浏览器缓存

# 5、vue-i18n国际化，使用ref或者reactive设置的文字，切换语言后不更新

解：这是因为这里的数据是初始化产生的，并不能跟着local变化而响应变化，关于这一点，我是放在了computed里面解决的 ，也可以使用watch

```javascript
import { useI18n } from 'vue-i18n'
import { ref, computed } from 'vue'
const { t } = useI18n()
// 使用ref定义之后再改语言无效
//const list = ref([
//  t('c100018'),
// t('c100019'),
// t('c100020'),
// t('c100021'),
// t('c100020'),
])
// 采用computed可解决
const list = computed(() => [
  t('c100018'),
  t('c100019'),
  t('c100020'),
  t('c100021'),
  t('c100020'),
])
```

# 右键菜单点击，由于div本身不能获取焦点

解：设置tabindex

```javascript
<div tabindex="-1"@blur="isShowMenu = false" ref="fixedBoxRef"></div>
```

# JWT与传统身份验证有什么区别？

解 ： JWT（JSON Web Token）是一种基于 JSON 格式的轻量级令牌（token）协议，它被广泛应用于网络应用程序的身份验证和授权。相较于传统的 session-based 认证机制，JWT 具有更好的扩展性和互操作性，同时也更安全可靠。
jwt 优点：
1. 无状态：JWT 本身不需要存储在服务器上，因此可以实现无状态的身份验证和授权。
2. 可扩展性：JWT 的载荷可以自定义，因此可以根据需求添加任意信息。
3. 可靠性：JWT 使用数字签名来保证安全性，因此具有可靠性。
4. 跨平台性：JWT 支持多种编程语言和操作系统，因此具有跨平台性。
5. 高效性：由于 JWT 不需要查询数据库，因此具有高效性。
缺点：
1. 安全性取决于密钥管理：JWT 的安全性取决于密钥的管理，如果密钥被泄露或者被不当管理，那么 JWT 将会受到攻击。
2. 无法撤销令牌：由于 JWT 是无状态的，一旦 JWT 被签发，就无法撤销。
3. 需要传输到客户端：由于 JWT 包含了用户信息和授权信息，因此 JWT 需要传输到客户端，这意味着 JWT 有被攻击者窃取的风险。
4. 载荷大小有限制：由于 JWT 需要传输到客户端，因此载荷大小也有限制。
