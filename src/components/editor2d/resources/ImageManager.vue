<template>
  <div class="image-manager" @dragover.prevent="onDragOver" @drop.prevent="onDrop" @dragleave="onDragLeave">
    <!-- 工具栏 -->
    <div class="image-manager-toolbar">
      <div class="toolbar-left">
        <t-upload
          v-model="uploadFiles"
          :auto-upload="false"
          :multiple="true"
          accept="image/*"
          :size-limit="{ size: 20, unit: 'MB' }"
          @change="onUploadChange"
        >
          <t-button theme="primary" size="small">
            <template #icon><add-icon /></template>
            上传图片
          </t-button>
        </t-upload>
        <t-select
          v-model="selectedCategory"
          size="small"
          :style="{ width: '120px' }"
          placeholder="全部分类"
          clearable
          @change="onCategoryFilterChange"
        >
          <t-option v-for="cat in categories" :key="cat.id" :value="cat.name" :label="cat.name" />
        </t-select>
      </div>
      <div class="toolbar-right">
        <t-button variant="text" size="small" @click="showCategoryDialog = true">
          <template #icon><folder-icon /></template>
          管理分类
        </t-button>
        <t-button variant="text" size="small" @click="toggleView">
          <template #icon>
            <view-list-icon v-if="viewMode === 'grid'" />
            <view-module-icon v-else />
          </template>
          {{ viewMode === 'grid' ? '列表' : '网格' }}
        </t-button>
      </div>
    </div>

    <!-- 拖拽提示遮罩 -->
    <div v-if="isDragOver" class="drag-overlay">
      <div class="drag-overlay-content">
        <upload-icon size="48px" />
        <p>释放以添加图片</p>
      </div>
    </div>

    <!-- 图片列表 -->
    <div v-if="filteredImages.length > 0" class="image-manager-content">
      <!-- 网格视图 -->
      <div v-if="viewMode === 'grid'" class="image-grid">
        <div
          v-for="img in filteredImages"
          :key="img.id"
          class="image-grid-item"
          :class="{ selected: selectedIds.includes(img.id) }"
          draggable="true"
          @dragstart="onImageDragStart($event, img)"
          @click="onImageClick(img)"
          @contextmenu.prevent="onContextMenu($event, img)"
        >
          <div class="image-grid-thumb">
            <img v-if="img.thumbnail" :src="img.thumbnail" :alt="img.name" />
            <img v-else :src="getImageSrc(img.id)" :alt="img.name" />
          </div>
          <div class="image-grid-name" :title="img.name">{{ img.name }}</div>
        </div>
      </div>

      <!-- 列表视图 -->
      <div v-else class="image-list">
        <div
          v-for="img in filteredImages"
          :key="img.id"
          class="image-list-item"
          :class="{ selected: selectedIds.includes(img.id) }"
          draggable="true"
          @dragstart="onImageDragStart($event, img)"
          @click="onImageClick(img)"
          @contextmenu.prevent="onContextMenu($event, img)"
        >
          <div class="image-list-thumb">
            <img v-if="img.thumbnail" :src="img.thumbnail" :alt="img.name" />
            <img v-else :src="getImageSrc(img.id)" :alt="img.name" />
          </div>
          <div class="image-list-info">
            <div class="image-list-name" :title="img.name">{{ img.name }}</div>
            <div class="image-list-meta">
              {{ img.width }}x{{ img.height }} · {{ formatSize(img.size) }} · {{ img.category }}
            </div>
          </div>
          <div class="image-list-time">{{ formatDate(img.uploadedAt) }}</div>
        </div>
      </div>
    </div>

    <!-- 空状态 -->
    <div v-else class="image-manager-empty">
      <image-icon size="48px" style="color: #bbb" />
      <p>暂无图片，点击上传或拖拽图片到此处</p>
    </div>

    <!-- 右键菜单 -->
    <t-popup
      v-model:visible="contextMenuVisible"
      :trigger="({} as any)"
      :placement="bottom-left"
      :attach="'body'"
      :overlay-style="{ position: 'fixed', left: contextMenuPos.x + 'px', top: contextMenuPos.y + 'px' }"
    >
      <div class="context-menu">
        <div class="context-menu-item" @click="onPreviewImage">
          <browse-icon /> 预览
        </div>
        <div class="context-menu-item" @click="onRenameImage">
          <edit-icon /> 重命名
        </div>
        <div class="context-menu-item" @click="onChangeImageCategory">
          <folder-icon /> 修改分类
        </div>
        <div class="context-menu-item" @click="onCompressImage">
          <compress-icon /> 压缩
        </div>
        <div class="context-menu-item" @click="onCropImage">
          <crop-icon /> 裁剪
        </div>
        <div class="context-menu-divider"></div>
        <div class="context-menu-item danger" @click="onDeleteImage">
          <delete-icon /> 删除
        </div>
      </div>
    </t-popup>

    <!-- 图片预览 -->
    <t-dialog v-model:visible="previewVisible" header="图片预览" :footer="false" :width="800">
      <div class="image-preview">
        <img v-if="previewSrc" :src="previewSrc" alt="预览" style="max-width: 100%; max-height: 70vh" />
      </div>
    </t-dialog>

    <!-- 重命名对话框 -->
    <t-dialog v-model:visible="renameVisible" header="重命名" :confirm-on-enter="true" @confirm="onRenameConfirm">
      <t-input v-model="renameValue" placeholder="请输入新名称" />
    </t-dialog>

    <!-- 修改分类对话框 -->
    <t-dialog v-model:visible="changeCategoryVisible" header="修改分类" @confirm="onChangeCategoryConfirm">
      <t-select v-model="changeCategoryValue" placeholder="选择分类">
        <t-option v-for="cat in categories" :key="cat.id" :value="cat.name" :label="cat.name" />
      </t-select>
    </t-dialog>

    <!-- 分类管理对话框 -->
    <t-dialog v-model:visible="showCategoryDialog" header="分类管理" :footer="false" :width="420">
      <div class="category-manager">
        <div class="category-add">
          <t-input v-model="newCategoryName" placeholder="新分类名称" @enter="onAddCategory" />
          <t-button theme="primary" size="small" @click="onAddCategory">添加</t-button>
        </div>
        <div class="category-list">
          <div v-for="cat in categories" :key="cat.id" class="category-list-item">
            <span>{{ cat.name }}</span>
            <t-button v-if="cat.id !== 'default'" variant="text" size="small" @click="onDeleteCategory(cat.id)">
              <template #icon><delete-icon /></template>
            </t-button>
          </div>
        </div>
      </div>
    </t-dialog>

    <!-- 图片裁剪 -->
    <ImageCropper
      :visible="cropperVisible"
      :image-src="cropImageSrc"
      @update:visible="(val: boolean) => (cropperVisible = val)"
      @confirm="onCropConfirm"
    />
  </div>
</template>

<script setup lang="ts">
import { ref, computed, inject, onMounted } from 'vue'
import {
  AddIcon,
  BrowseIcon,
  CompressIcon,
  CropIcon,
  DeleteIcon,
  EditIcon,
  FolderIcon,
  ImageIcon,
  UploadIcon,
  ViewListIcon,
  ViewModuleIcon,
} from 'tdesign-icons-vue-next'
import { MessagePlugin } from 'tdesign-vue-next'
import { ImageResourceService, type ImageMeta, type CropOptions } from './image-resource-service'
import ImageCropper from './ImageCropper.vue'

// 注入编辑器实例（用于拖拽到画布创建图元）
const editor = inject<any>('editorCore')

const service = ImageResourceService.getInstance()

// ==================== 状态 ====================

const uploadFiles = ref<any[]>([])
const selectedCategory = ref<string | undefined>(undefined)
const viewMode = ref<'grid' | 'list'>('grid')
const isDragOver = ref(false)
const selectedIds = ref<string[]>([])

// 右键菜单
const contextMenuVisible = ref(false)
const contextMenuPos = ref({ x: 0, y: 0 })
const contextMenuTarget = ref<ImageMeta | null>(null)

// 预览
const previewVisible = ref(false)
const previewSrc = ref('')

// 重命名
const renameVisible = ref(false)
const renameValue = ref('')

// 修改分类
const changeCategoryVisible = ref(false)
const changeCategoryValue = ref('')

// 分类管理
const showCategoryDialog = ref(false)
const newCategoryName = ref('')

// 裁剪
const cropperVisible = ref(false)
const cropImageSrc = ref('')

// 图片列表
const imageList = ref<ImageMeta[]>([])

// 分类列表
const categories = ref(service.getCategories())

// 图片URL缓存（用于显示）
const imageUrlCache = ref<Map<string, string>>(new Map())

// 过滤后的图片
const filteredImages = computed(() => {
  if (!selectedCategory.value) return imageList.value
  return imageList.value.filter((img) => img.category === selectedCategory.value)
})

// ==================== 生命周期 ====================

onMounted(() => {
  refreshList()
})

function refreshList() {
  imageList.value = service.getAll()
  categories.value = service.getCategories()
  // 预加载缩略图
  preloadImageUrls()
}

async function preloadImageUrls() {
  for (const img of imageList.value) {
    if (!img.thumbnail) {
      const url = await service.getImageUrl(img.id)
      if (url) {
        imageUrlCache.value.set(img.id, url)
      }
    }
  }
}

function getImageSrc(id: string): string {
  return imageUrlCache.value.get(id) || ''
}

// ==================== 上传 ====================

async function onUploadChange(files: any[]) {
  const validFiles = files
    .filter((f: any) => f.raw instanceof File)
    .map((f: any) => f.raw as File)

  if (validFiles.length === 0) return

  try {
    await service.uploadBatch(validFiles, selectedCategory.value || '默认')
    MessagePlugin.success(`成功上传 ${validFiles.length} 张图片`)
    refreshList()
  } catch (err) {
    MessagePlugin.error('上传失败: ' + (err as Error).message)
  }

  uploadFiles.value = []
}

// ==================== 拖拽上传 ====================

function onDragOver() {
  isDragOver.value = true
}

function onDragLeave() {
  isDragOver.value = false
}

async function onDrop(e: DragEvent) {
  isDragOver.value = false
  const files = e.dataTransfer?.files
  if (!files || files.length === 0) return

  const imageFiles = Array.from(files).filter((f) => f.type.startsWith('image/'))
  if (imageFiles.length === 0) {
    MessagePlugin.warning('请拖入图片文件')
    return
  }

  try {
    await service.uploadBatch(imageFiles, selectedCategory.value || '默认')
    MessagePlugin.success(`成功上传 ${imageFiles.length} 张图片`)
    refreshList()
  } catch (err) {
    MessagePlugin.error('上传失败: ' + (err as Error).message)
  }
}

// ==================== 拖拽到画布 ====================

async function onImageDragStart(e: DragEvent, img: ImageMeta) {
  const penData = await service.toPenData(img.id)
  if (penData) {
    e.dataTransfer?.setData('Meta2d', JSON.stringify(penData))
    // 通知编辑器事件系统
    const editorCore = editor?.value
    if (editorCore) {
      const eventBus = editorCore.getEventBus()
      eventBus.emitSync('graphics:drag-start', {
        element: { data: penData },
        data: penData,
        event: e,
      })
    }
  }
}

// ==================== 点击 & 右键菜单 ====================

function onImageClick(img: ImageMeta) {
  const idx = selectedIds.value.indexOf(img.id)
  if (idx === -1) {
    selectedIds.value = [img.id]
  } else {
    selectedIds.value = []
  }
}

function onContextMenu(e: MouseEvent, img: ImageMeta) {
  contextMenuTarget.value = img
  contextMenuPos.value = { x: e.clientX, y: e.clientY }
  contextMenuVisible.value = true
  selectedIds.value = [img.id]
}

// ==================== 预览 ====================

async function onPreviewImage() {
  contextMenuVisible.value = false
  if (!contextMenuTarget.value) return

  const url = await service.getImageUrl(contextMenuTarget.value.id)
  if (url) {
    previewSrc.value = url
    previewVisible.value = true
  }
}

// ==================== 重命名 ====================

function onRenameImage() {
  contextMenuVisible.value = false
  if (!contextMenuTarget.value) return
  renameValue.value = contextMenuTarget.value.name
  renameVisible.value = true
}

function onRenameConfirm() {
  if (!contextMenuTarget.value || !renameValue.value.trim()) return
  service.renameImage(contextMenuTarget.value.id, renameValue.value.trim())
  renameVisible.value = false
  refreshList()
}

// ==================== 修改分类 ====================

function onChangeImageCategory() {
  contextMenuVisible.value = false
  if (!contextMenuTarget.value) return
  changeCategoryValue.value = contextMenuTarget.value.category
  changeCategoryVisible.value = true
}

function onChangeCategoryConfirm() {
  if (!contextMenuTarget.value || !changeCategoryValue.value) return
  service.changeCategory(contextMenuTarget.value.id, changeCategoryValue.value)
  changeCategoryVisible.value = false
  refreshList()
}

// ==================== 删除 ====================

async function onDeleteImage() {
  contextMenuVisible.value = false
  if (!contextMenuTarget.value) return

  try {
    await service.delete(contextMenuTarget.value.id)
    MessagePlugin.success('已删除')
    refreshList()
    selectedIds.value = selectedIds.value.filter((id) => id !== contextMenuTarget.value!.id)
  } catch (err) {
    MessagePlugin.error('删除失败')
  }
}

// ==================== 压缩 ====================

async function onCompressImage() {
  contextMenuVisible.value = false
  if (!contextMenuTarget.value) return

  try {
    MessagePlugin.info('正在压缩...')
    const result = await service.compress(contextMenuTarget.value.id, {
      quality: 0.8,
      maxSize: 1920,
    })
    // 将压缩结果作为新图片添加
    const response = await fetch(result)
    const blob = await response.blob()
    const file = new File([blob], contextMenuTarget.value.name.replace(/(\.[^.]+)$/, '_compressed$1'), {
      type: blob.type,
    })
    await service.upload(file, contextMenuTarget.value.category)
    MessagePlugin.success('压缩完成')
    refreshList()
  } catch (err) {
    MessagePlugin.error('压缩失败: ' + (err as Error).message)
  }
}

// ==================== 裁剪 ====================

async function onCropImage() {
  contextMenuVisible.value = false
  if (!contextMenuTarget.value) return

  const url = await service.getImageUrl(contextMenuTarget.value.id)
  if (url) {
    cropImageSrc.value = url
    cropperVisible.value = true
  }
}

async function onCropConfirm(cropOptions: CropOptions) {
  if (!contextMenuTarget.value) return

  try {
    const result = await service.crop(contextMenuTarget.value.id, cropOptions)
    // 将裁剪结果作为新图片添加
    const response = await fetch(result)
    const blob = await response.blob()
    const file = new File([blob], contextMenuTarget.value.name.replace(/(\.[^.]+)$/, '_cropped$1'), {
      type: 'image/png',
    })
    await service.upload(file, contextMenuTarget.value.category)
    MessagePlugin.success('裁剪完成')
    refreshList()
  } catch (err) {
    MessagePlugin.error('裁剪失败: ' + (err as Error).message)
  }
}

// ==================== 分类管理 ====================

function onAddCategory() {
  const name = newCategoryName.value.trim()
  if (!name) return

  // 检查重名
  if (categories.value.some((c) => c.name === name)) {
    MessagePlugin.warning('分类已存在')
    return
  }

  service.addCategory(name)
  categories.value = service.getCategories()
  newCategoryName.value = ''
}

function onDeleteCategory(id: string) {
  service.deleteCategory(id)
  categories.value = service.getCategories()
}

function onCategoryFilterChange(val: string | undefined) {
  selectedCategory.value = val || undefined
}

// ==================== 视图切换 ====================

function toggleView() {
  viewMode.value = viewMode.value === 'grid' ? 'list' : 'grid'
}

// ==================== 工具函数 ====================

function formatSize(bytes: number): string {
  if (bytes < 1024) return bytes + 'B'
  if (bytes < 1024 * 1024) return (bytes / 1024).toFixed(1) + 'KB'
  return (bytes / (1024 * 1024)).toFixed(1) + 'MB'
}

function formatDate(ts: number): string {
  const d = new Date(ts)
  const month = (d.getMonth() + 1).toString().padStart(2, '0')
  const day = d.getDate().toString().padStart(2, '0')
  const hours = d.getHours().toString().padStart(2, '0')
  const minutes = d.getMinutes().toString().padStart(2, '0')
  return `${month}-${day} ${hours}:${minutes}`
}
</script>

<style scoped lang="less">
.image-manager {
  display: flex;
  flex-direction: column;
  height: 100%;
  position: relative;
}

.image-manager-toolbar {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 8px 12px;
  border-bottom: 1px solid var(--td-border-level-1-color);
  flex-shrink: 0;

  .toolbar-left,
  .toolbar-right {
    display: flex;
    align-items: center;
    gap: 8px;
  }
}

.drag-overlay {
  position: absolute;
  inset: 0;
  background: rgba(0, 82, 217, 0.08);
  border: 2px dashed #0052d9;
  border-radius: 6px;
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 10;

  .drag-overlay-content {
    text-align: center;
    color: #0052d9;

    p {
      margin-top: 8px;
      font-size: 14px;
    }
  }
}

.image-manager-content {
  flex: 1;
  overflow-y: auto;
  padding: 8px 12px;
}

// 网格视图
.image-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(80px, 1fr));
  gap: 8px;
}

.image-grid-item {
  display: flex;
  flex-direction: column;
  align-items: center;
  padding: 6px;
  border-radius: 6px;
  cursor: pointer;
  border: 2px solid transparent;
  transition: border-color 0.2s, background-color 0.2s;

  &:hover {
    background-color: var(--td-bg-color-container-hover);
  }

  &.selected {
    border-color: #0052d9;
    background-color: rgba(0, 82, 217, 0.04);
  }
}

.image-grid-thumb {
  width: 60px;
  height: 60px;
  display: flex;
  align-items: center;
  justify-content: center;
  overflow: hidden;
  border-radius: 4px;
  background: #f5f5f5;

  img {
    max-width: 100%;
    max-height: 100%;
    object-fit: contain;
  }
}

.image-grid-name {
  margin-top: 4px;
  font-size: 11px;
  color: var(--td-text-color-secondary);
  text-align: center;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
  max-width: 100%;
}

// 列表视图
.image-list {
  display: flex;
  flex-direction: column;
  gap: 4px;
}

.image-list-item {
  display: flex;
  align-items: center;
  gap: 10px;
  padding: 6px 10px;
  border-radius: 6px;
  cursor: pointer;
  border: 1px solid transparent;
  transition: border-color 0.2s, background-color 0.2s;

  &:hover {
    background-color: var(--td-bg-color-container-hover);
  }

  &.selected {
    border-color: #0052d9;
    background-color: rgba(0, 82, 217, 0.04);
  }
}

.image-list-thumb {
  width: 36px;
  height: 36px;
  display: flex;
  align-items: center;
  justify-content: center;
  overflow: hidden;
  border-radius: 4px;
  background: #f5f5f5;
  flex-shrink: 0;

  img {
    max-width: 100%;
    max-height: 100%;
    object-fit: contain;
  }
}

.image-list-info {
  flex: 1;
  min-width: 0;
}

.image-list-name {
  font-size: 13px;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.image-list-meta {
  font-size: 11px;
  color: var(--td-text-color-placeholder);
  margin-top: 2px;
}

.image-list-time {
  font-size: 11px;
  color: var(--td-text-color-placeholder);
  flex-shrink: 0;
}

// 空状态
.image-manager-empty {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  flex: 1;
  padding: 40px 20px;
  color: var(--td-text-color-placeholder);

  p {
    margin-top: 12px;
    font-size: 13px;
  }
}

// 右键菜单
.context-menu {
  min-width: 140px;
  padding: 4px 0;
  background: var(--td-bg-color-container);
  border-radius: 6px;
  box-shadow: 0 3px 14px rgba(0, 0, 0, 0.12);
}

.context-menu-item {
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 8px 16px;
  font-size: 13px;
  cursor: pointer;
  transition: background-color 0.15s;

  &:hover {
    background-color: var(--td-bg-color-container-hover);
  }

  &.danger {
    color: var(--td-error-color);
  }
}

.context-menu-divider {
  height: 1px;
  background: var(--td-border-level-1-color);
  margin: 4px 0;
}

// 图片预览
.image-preview {
  display: flex;
  align-items: center;
  justify-content: center;
}

// 分类管理
.category-manager {
  display: flex;
  flex-direction: column;
  gap: 12px;
}

.category-add {
  display: flex;
  gap: 8px;
}

.category-list {
  max-height: 240px;
  overflow-y: auto;
}

.category-list-item {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 8px 0;
  border-bottom: 1px solid var(--td-border-level-1-color);

  &:last-child {
    border-bottom: none;
  }

  span {
    font-size: 13px;
  }
}

// 滚动条
::-webkit-scrollbar {
  width: 3px;
  height: 6px;
  background: transparent;
}

::-webkit-scrollbar-thumb {
  background-color: var(--color-scrollbar) !important;
  border-radius: 4px;
}

::-webkit-scrollbar-thumb:hover {
  background-color: var(--color-scrollbar-hover);
}

::-webkit-scrollbar-track {
  background-color: transparent !important;
}
</style>
