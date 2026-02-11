import { createApp } from 'vue'
import App from '@/App.vue'
import '@/styles/style.less'
import router from '@/router/index'
import TDesign from 'tdesign-vue-next'

// 导入 editor2d 图标库
import '@/components/editor2d/core/editor2d-index'

const app = createApp(App)

app.use(router).use(TDesign)

app.mount('#app')
