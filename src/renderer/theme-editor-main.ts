import "../../lang/index.js";

import { createApp } from "vue";
import useTheme from "@/renderer/hooks/useTheme.js";

import ThemeEditor from "./components/settings/ThemeEditor.vue";

import "./style.less";
import "@/themes/theme-main.less";
import "@milkdown/crepe/theme/common/style.css";
import "@/assets/iconfont/iconfont.css";

const { init } = useTheme();
init();

const app = createApp(ThemeEditor);
app.mount("#theme-editor-app");
