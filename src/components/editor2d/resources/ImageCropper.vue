<template>
  <t-dialog
    v-model:visible="dialogVisible"
    header="裁剪图片"
    :width="720"
    :footer="false"
    :destroy-on-close="true"
    @close="handleClose"
  >
    <div class="image-cropper">
      <div class="cropper-canvas-wrapper" ref="canvasWrapperRef">
        <canvas
          ref="canvasRef"
          class="cropper-canvas"
          @mousedown="onMouseDown"
          @mousemove="onMouseMove"
          @mouseup="onMouseUp"
          @mouseleave="onMouseUp"
        ></canvas>
      </div>
      <div class="cropper-info">
        <span v-if="cropRect.width > 0">
          裁剪区域: {{ Math.round(cropRect.x) }}, {{ Math.round(cropRect.y) }} -
          {{ Math.round(cropRect.width) }} x {{ Math.round(cropRect.height) }}
        </span>
        <span v-else>在图片上拖拽选择裁剪区域</span>
      </div>
      <div class="cropper-actions">
        <t-button theme="default" @click="handleClose">取消</t-button>
        <t-button theme="primary" :disabled="cropRect.width <= 0 || cropRect.height <= 0" @click="handleConfirm">
          确认裁剪
        </t-button>
      </div>
    </div>
  </t-dialog>
</template>

<script setup lang="ts">
import { ref, watch, nextTick } from 'vue'
import type { CropOptions } from './image-resource-service'

const props = defineProps<{
  visible: boolean
  imageSrc: string
}>()

const emit = defineEmits<{
  (e: 'update:visible', val: boolean): void
  (e: 'confirm', cropOptions: CropOptions): void
  (e: 'cancel'): void
}>()

const dialogVisible = ref(false)
const canvasRef = ref<HTMLCanvasElement>()
const canvasWrapperRef = ref<HTMLDivElement>()

// 裁剪区域（相对于原始图片的坐标）
const cropRect = ref<{ x: number; y: number; width: number; height: number }>({
  x: 0,
  y: 0,
  width: 0,
  height: 0,
})

// 绘制状态
let isDragging = false
let startX = 0
let startY = 0
let originalImage: HTMLImageElement | null = null
// 图片在画布上的缩放信息
let scaleRatio = 1
let offsetX = 0
let offsetY = 0

watch(
  () => props.visible,
  (val) => {
    dialogVisible.value = val
    if (val) {
      cropRect.value = { x: 0, y: 0, width: 0, height: 0 }
      nextTick(() => loadImage())
    }
  },
)

watch(dialogVisible, (val) => {
  emit('update:visible', val)
})

function loadImage() {
  if (!props.imageSrc || !canvasRef.value || !canvasWrapperRef.value) return

  const img = new Image()
  img.crossOrigin = 'anonymous'
  img.onload = () => {
    originalImage = img
    drawCanvas()
  }
  img.onerror = () => {
    console.error('[ImageCropper] 图片加载失败')
  }
  img.src = props.imageSrc
}

function drawCanvas() {
  if (!canvasRef.value || !canvasWrapperRef.value || !originalImage) return

  const wrapper = canvasWrapperRef.value
  const canvas = canvasRef.value
  const wrapperWidth = wrapper.clientWidth
  const wrapperHeight = 400

  canvas.width = wrapperWidth
  canvas.height = wrapperHeight

  const img = originalImage
  // 计算缩放比，使图片适配画布
  scaleRatio = Math.min(wrapperWidth / img.naturalWidth, wrapperHeight / img.naturalHeight, 1)
  const displayW = img.naturalWidth * scaleRatio
  const displayH = img.naturalHeight * scaleRatio
  offsetX = (wrapperWidth - displayW) / 2
  offsetY = (wrapperHeight - displayH) / 2

  const ctx = canvas.getContext('2d')!
  ctx.clearRect(0, 0, canvas.width, canvas.height)

  // 绘制半透明遮罩
  ctx.fillStyle = 'rgba(0, 0, 0, 0.5)'
  ctx.fillRect(0, 0, canvas.width, canvas.height)

  // 绘制图片
  ctx.drawImage(img, offsetX, offsetY, displayW, displayH)

  // 绘制裁剪框
  if (cropRect.value.width > 0 && cropRect.value.height > 0) {
    const rx = offsetX + cropRect.value.x * scaleRatio
    const ry = offsetY + cropRect.value.y * scaleRatio
    const rw = cropRect.value.width * scaleRatio
    const rh = cropRect.value.height * scaleRatio

    // 清除裁剪区域的遮罩，显示原图
    ctx.save()
    ctx.beginPath()
    ctx.rect(rx, ry, rw, rh)
    ctx.clip()
    ctx.drawImage(img, offsetX, offsetY, displayW, displayH)
    ctx.restore()

    // 绘制裁剪框边框
    ctx.strokeStyle = '#0052d9'
    ctx.lineWidth = 2
    ctx.setLineDash([])
    ctx.strokeRect(rx, ry, rw, rh)

    // 绘制四角把手
    const handleSize = 8
    ctx.fillStyle = '#0052d9'
    const corners = [
      [rx, ry],
      [rx + rw, ry],
      [rx, ry + rh],
      [rx + rw, ry + rh],
    ]
    for (const [cx, cy] of corners) {
      ctx.fillRect(cx - handleSize / 2, cy - handleSize / 2, handleSize, handleSize)
    }
  }
}

// 坐标转换：画布坐标 -> 图片原始坐标
function canvasToImage(canvasX: number, canvasY: number): { x: number; y: number } {
  return {
    x: (canvasX - offsetX) / scaleRatio,
    y: (canvasY - offsetY) / scaleRatio,
  }
}

function onMouseDown(e: MouseEvent) {
  if (!originalImage) return
  isDragging = true
  const rect = canvasRef.value!.getBoundingClientRect()
  startX = e.clientX - rect.left
  startY = e.clientY - rect.top

  const imgPos = canvasToImage(startX, startY)
  cropRect.value = { x: imgPos.x, y: imgPos.y, width: 0, height: 0 }
}

function onMouseMove(e: MouseEvent) {
  if (!isDragging || !originalImage) return

  const rect = canvasRef.value!.getBoundingClientRect()
  const currentX = e.clientX - rect.left
  const currentY = e.clientY - rect.top

  const startImg = canvasToImage(startX, startY)
  const currentImg = canvasToImage(currentX, currentY)

  // 限制在图片范围内
  const imgW = originalImage.naturalWidth
  const imgH = originalImage.naturalHeight

  let x = Math.max(0, Math.min(startImg.x, currentImg.x))
  let y = Math.max(0, Math.min(startImg.y, currentImg.y))
  let w = Math.abs(currentImg.x - startImg.x)
  let h = Math.abs(currentImg.y - startImg.y)

  // 确保不超出图片边界
  if (x + w > imgW) w = imgW - x
  if (y + h > imgH) h = imgH - y
  if (w < 0) w = 0
  if (h < 0) h = 0

  cropRect.value = { x, y, width: w, height: h }
  drawCanvas()
}

function onMouseUp() {
  isDragging = false
}

function handleConfirm() {
  if (cropRect.value.width <= 0 || cropRect.value.height <= 0) return

  emit('confirm', {
    x: Math.round(cropRect.value.x),
    y: Math.round(cropRect.value.y),
    width: Math.round(cropRect.value.width),
    height: Math.round(cropRect.value.height),
  })
  dialogVisible.value = false
}

function handleClose() {
  dialogVisible.value = false
  emit('cancel')
}
</script>

<style scoped lang="less">
.image-cropper {
  display: flex;
  flex-direction: column;
  gap: 12px;
}

.cropper-canvas-wrapper {
  width: 100%;
  background: #f0f0f0;
  border-radius: 6px;
  overflow: hidden;
}

.cropper-canvas {
  display: block;
  cursor: crosshair;
}

.cropper-info {
  font-size: 13px;
  color: var(--td-text-color-secondary);
  text-align: center;
}

.cropper-actions {
  display: flex;
  justify-content: flex-end;
  gap: 8px;
}
</style>
