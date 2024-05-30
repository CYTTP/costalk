// 切换主题
let html = document.querySelector("html");
// 默认主题
const DEFAULT_THEME = "light";
let THEME = localStorage.getItem("theme");

if (THEME) {
  html!.setAttribute("data-theme", THEME as string);
} else {
  html!.setAttribute("data-theme", DEFAULT_THEME);
}
