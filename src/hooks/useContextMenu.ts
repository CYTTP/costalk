import { h, render } from 'vue'

import Menu from '@/components/RightKeyMenu/index.vue'

export function useContextMenus() {
  let isShowMenu = false
  let scope: HTMLElement | null // 拿到桌面元素
  let containerEl: HTMLDivElement // 创建一个容器元素，给 render 先用着

  // window.oncontextmenu = function (e: MouseEvent) {
  //   e.preventDefault()
  //   if (isShow) closeMenu()
  //   openMenu(e)
  // }

  //tips: open the menu
  function openMenu(e: MouseEvent) {
    scope = document.getElementById('MESSAGE')
    containerEl = document.createElement('div')
    const vnode = h(Menu)
    render(vnode, containerEl) //将 vnode 传递给 render 函数
    containerEl.style.position = 'absolute'

    scope?.appendChild(containerEl) // 1. 为了拿到 offsetWidth，因为只有出现在浏览器才会产生 offsetWidth 属性值，我们需要先渲染出真实 dom

    const { offsetWidth } = containerEl //2 .取出 containerEl 的真实宽度
    const { clientWidth } = scope! //3. 获取父元素的 clientWidth 准备进行计算
    const { clientX, clientY } = e //4. 取出 click 时鼠标的坐标

    // const _X = clientWidth - clientX > offsetWidth ? 'left' : 'right' //调整方向
    // const _X_offset = clientWidth - clientX // 如果是需要显示在左边，则需要获取当前的差值

    // containerEl.style.top = `${clientY}px`
    // containerEl.style[_X] = _X === 'left' ? `${clientX}px` : `${_X_offset}px`
    containerEl.style.top = `${clientY}px`
    containerEl.style.left = `${clientX}px`

    isShowMenu = true
  }

  //tips: close the menu
  function closeMenu() {
    if (isShowMenu) {
      render(null, containerEl)
      scope?.removeChild(containerEl)
      isShowMenu = false
    }
  }
  return {
    isShowMenu,
    openMenu,
    closeMenu
  }
}
