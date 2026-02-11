<template>
  <div class="editor2d-header">
    <!-- 头部菜单工具栏 -->
    <t-head-menu expand-type="popup" v-model="activateMenuKey" :default-value="menuConfig.key">
      <template #logo>
        <img height="28" src="../../../assets/logo/logo.png" alt="logo"/>
      </template>

      <!-- 应用菜单 -->
      <template v-for="menu in appMenuList" :key="menu.key">
        <t-submenu v-if="(menu.show !== undefined ? menu.show : true) && menu.children && menu.children.length"
                   :value="menu.key" :disabled="menu.disabled">
          <template v-if="isDisplayIcon(displayMenuIcon, menu.title, menu.icon)" #icon>
            <div v-if="menu?.icon?.indexOf('iconfont') !== -1" :class="menu.icon" style="font-size: 14px"></div>
            <t-icon v-else :name="menu.icon"/>
          </template>
          <template v-if="isDisplayTitle(displayMenuTitle, menu.title, menu.icon)" #title>
            <span>{{ menu.title }}</span>
          </template>
          <template v-for="item in menu.children">
            <t-menu-item v-if="item.show !== undefined ? item.show : true" :value="item.key" :disabled="item.disabled"
                         @click="menuDispatchFunc('app', item, menu, $event)">
              <template v-if="!isFunction(item.title) && isDisplayIcon(displayMenuIcon, item.title, item.icon)"
                        #icon>
                <div v-if="item?.icon?.indexOf('iconfont') !== -1" :class="item.icon" style="font-size: 14px"></div>
                <t-icon v-else :name="item.icon"/>
              </template>
              <span v-if="!isFunction(item.title) && isDisplayTitle(displayMenuTitle, item.title, item.icon)">
              {{ item.title }}
            </span>
              <template v-if="isFunction(item.title)">
                <component :is="item.title as Function"/>
              </template>
            </t-menu-item>
          </template>
        </t-submenu>
        <t-menu-item v-else-if="menu.show !== undefined ? menu.show : true" :value="menu.key" :disabled="menu.disabled"
                     @click="menuDispatchFunc('app', menu, null, $event)">
          <template v-if="!isFunction(menu.title) && isDisplayIcon(displayMenuIcon, menu.title, menu.icon)" #icon>
            <div v-if="menu?.icon?.indexOf('iconfont') !== -1" :class="menu.icon" style="font-size: 14px"></div>
            <t-icon v-else :name="menu.icon"/>
          </template>
          <span v-if="!isFunction(menu.title) && isDisplayTitle(displayMenuTitle, menu.title, menu.icon)">
              {{ menu.title }}
          </span>
          <template v-if="isFunction(menu.title)">
            <component :is="menu.title as Function"/>
          </template>
        </t-menu-item>
      </template>

      <!-- 画布功能菜单 -->
      <template v-for="menu in editorMenuList" :key="menu.key">
        <t-submenu v-if="(menu.show !== undefined ? menu.show : true) && menu.children && menu.children.length"
                   :value="menu.key" :disabled="menu.disabled">
          <template #icon>
            <div class="title">
              <div v-if="menu.icon?.indexOf('iconfont') !== -1" :class="menu.icon" style="font-size: 14px"></div>
              <svg v-else class="l-icon" style="width: 1em; height: 1em" aria-hidden="true">
                <use :xlink:href="'#' + menu.icon"></use>
              </svg>
            </div>
          </template>
          <template v-if="isDisplayTitle(displayMenuTitle, menu.title, menu.icon)" #title>
            <span>{{ menu.title }}</span>
          </template>
          <template v-for="item in menu.children">
            <t-menu-item v-if="item.show !== undefined ? item.show : true" :value="item.key" :disabled="item.disabled"
                         @click="menuDispatchFunc('canvas', item, menu, $event)">
              <template v-if="!isFunction(item.title) && item.icon" #icon>
                <div v-if="item.icon.indexOf('iconfont') !== -1" :class="item.icon" style="font-size: 14px"></div>
                <svg v-else class="l-icon" aria-hidden="true">
                  <use :xlink:href="'#' + item.icon"></use>
                </svg>
              </template>
              <span v-if="!isFunction(item.title) && isDisplayTitle(displayMenuTitle, item.title, item.icon)">
              {{ item.title }}
            </span>
              <template v-if="isFunction(item.title)">
                <component :is="item.title as Function"/>
              </template>
            </t-menu-item>
          </template>
        </t-submenu>
        <t-menu-item v-else-if="menu.show !== undefined ? menu.show : true" :value="menu.key" :disabled="menu.disabled"
                     @click="menuDispatchFunc('canvas', menu, null, $event)">
          <template v-if="!isFunction(menu.title) && isDisplayIcon(displayMenuIcon, menu.title, menu.icon)" #icon>
            <div v-if="menu?.icon?.indexOf('iconfont') !== -1" :class="menu.icon" style="font-size: 14px"></div>
            <t-icon v-else :name="menu.icon"/>
          </template>
          <span v-if="!isFunction(menu.title) && isDisplayTitle(displayMenuTitle, menu.title, menu.icon)">
              {{ menu.title }}
          </span>
          <template v-if="isFunction(menu.title)">
            <component :is="menu.title as Function"/>
          </template>
        </t-menu-item>
      </template>

      <!-- 扩展菜单 -->
      <template #operations>
        <template v-for="menu in extendMenuList" :key="menu.key">
          <t-submenu
              v-if="(menu.show !== undefined ? menu.show : true) && menu.children && menu.children.length"
              :value="menu.key" :disabled="menu.disabled">
            <template v-if="isDisplayIcon(displayMenuIcon, menu.title, menu.icon)" #icon>
              <div v-if="menu?.icon?.indexOf('iconfont') !== -1" :class="menu.icon" style="font-size: 14px"></div>
              <t-icon v-else :name="menu.icon"/>
            </template>
            <template v-if="isDisplayTitle(displayMenuTitle, menu.title, menu.icon)" #title>
              <span>{{ menu.title }}</span>
            </template>
            <template v-for="item in menu.children">
              <t-menu-item v-if="item.show !== undefined ? item.show : true" :value="item.key" :disabled="item.disabled"
                           @click="menuDispatchFunc('extend', item, menu, $event)">
                <template v-if="!isFunction(item.title) && isDisplayIcon(displayMenuIcon, item.title, item.icon)"
                          #icon>
                  <div v-if="item?.icon?.indexOf('iconfont') !== -1" :class="item.icon" style="font-size: 14px"></div>
                  <t-icon v-else :name="item.icon"/>
                </template>
                <span v-if="!isFunction(item.title) && isDisplayTitle(displayMenuTitle, item.title, item.icon)">
                {{ item.title }}
              </span>
                <template v-if="isFunction(item.title)">
                  <component :is="item.title as Function"/>
                </template>
              </t-menu-item>
            </template>
          </t-submenu>
          <t-menu-item v-else-if="menu.show !== undefined ? menu.show : true" :value="menu.key"
                       :disabled="menu.disabled"
                       @click="menuDispatchFunc('extend', menu, null, $event)">
            <template v-if="!isFunction(menu.title) && isDisplayIcon(displayMenuIcon, menu.title, menu.icon)" #icon>
              <div v-if="menu?.icon?.indexOf('iconfont') !== -1" :class="menu.icon" style="font-size: 14px"></div>
              <t-icon v-else :name="menu.icon"/>
            </template>
            <span v-if="!isFunction(menu.title) && isDisplayTitle(displayMenuTitle, menu.title, menu.icon)">
              {{ menu.title }}
            </span>
            <template v-if="isFunction(menu.title)">
              <component :is="menu.title as Function"/>
            </template>
          </t-menu-item>
        </template>
        <t-menu-item value="runPreview" @click="runPreview">
          <template #icon>
            <t-icon name="browse"/>
          </template>
        </t-menu-item>
        <header-extend-modal :visible="extendVisible" @close="closeGraphicsManage"/>
      </template>
    </t-head-menu>
  </div>
</template>
<script setup lang="ts">
import {ref} from "vue";
import {RouteRecordRaw, useRouter} from "vue-router";
import {isDisplayIcon, isDisplayTitle, isFunction} from "../core/editor2d-communal";
import {
  ACTIVATE_MENU_KEY as activateMenuKey,
  dispatchFunc,
  EXTEND_VISIBLE as extendVisible,
  FUNC_MENU_CONFIG as funcMenuConfig,
  FUNC_MENUS as funcMenus
} from "../header/header";
import HeaderExtendModal from "../header/header-extend-modal.vue";
import {Editor2DCache} from "../core/editor2d-local-storage";
import {Editor2DConfig, Editor2DPropsMenu} from "../core/editor2d-global-type.ts";

// 路由
let router = useRouter();
// 菜单配置
let menuConfig = ref<Editor2DConfig>(funcMenuConfig).value;
let menus = funcMenus ? funcMenus : {appMenu: [], editorMenu: [], extendMenu: []};
// 应用菜单列表
let appMenuList = ref<Array<Editor2DPropsMenu>>(menus.appMenu);
// 编辑器画布菜单列表
let editorMenuList = ref<Array<Editor2DPropsMenu>>(menus.editorMenu);
// 扩展菜单列表
let extendMenuList = ref<Array<Editor2DPropsMenu>>(menus.extendMenu);
// 显示菜单图标
let displayMenuIcon = menuConfig.displayMenuIcon ?? true;
// 显示菜单标题
let displayMenuTitle = menuConfig.displayMenuTitle ?? true;

/**
 * 菜单功能调度函数
 * @param menuType 菜单类型
 * @param activeItem 激活菜单项
 * @param parentItem 父级菜单
 * @param e 事件
 */
function menuDispatchFunc(menuType: string, activeItem: Editor2DPropsMenu, parentItem: Editor2DPropsMenu | null, e: DragEvent | MouseEvent) {
  if (parentItem != null && menuType === 'canvas') {
    // 修改选中功能图标
    editorMenuList.value.forEach(item => {
      if (item.key === parentItem.key) {
        if (activeItem.icon) {
          item.icon = activeItem.icon;
        } else {
          item.title = activeItem.title;
        }
      }
    })
  }

  dispatchFunc(activeItem as any, e);
}

/**
 * 关闭扩展页面
 */
function closeGraphicsManage() {
  extendVisible.value = !extendVisible.value;
  if (!extendVisible.value) {
    activateMenuKey.value = '';
  }
}

/**
 * 运行预览
 */
function runPreview() {
  activateMenuKey.value = '';
  // 预览之前先将画布内容存入缓存
  new Editor2DCache().saveCanvas()
  addDetailRoute('/preview', () => import('../Preview.vue'));
}

/**
 * 动态创建路由
 * @param path 地址
 * @param component 组件
 */
function addDetailRoute(path: string, component: () => Promise<any>) {
  // 先停止动画,避免数据波动
  meta2d.stopAnimate();
  
  // 检查路由是否已存在,防止重复添加
  const existingRoute = router.getRoutes().find(route => route.path === path);
  if (!existingRoute) {
    const detailRoute: RouteRecordRaw = {
      path,
      component,
    };
    router.addRoute(detailRoute);
  }
  
  // 如果需要立即跳转到这个新添加的路由
  router.push({
    path: path,
    query: {
      r: Date.now() + "",
      id: meta2d.store.data._id,
    },
  }).then(r => {
    console.log(r);
  });
}

</script>

<style scoped lang="less">

.editor2d-header {

  :deep(.t-head-menu .t-menu__logo:not(:empty)) {
    margin-right: var(--td-comp-margin-s);
  }

  :deep(.t-menu__logo > *) {
    margin-left: var(--td-comp-margin-s);
  }

  :deep(.t-head-menu .t-menu__item) {
    padding: 0 var(--td-comp-paddingLR-xs);
  }

  :deep(.t-menu__item > .t-fake-arrow) {
    margin-left: var(--td-comp-margin-xxs);
  }

}

.title {
  display: flex;
  justify-content: center;
  align-items: center;
  flex-direction: column;
  margin-right: 2px;
}

.l-icon {
  width: 2em;
  height: 2em;
  vertical-align: -0.15em;
  fill: currentColor;
  overflow: hidden;
}
</style>
