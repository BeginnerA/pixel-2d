/*
 * @description: 2D编辑器本地缓存
 * @author: MC.Yang
 */

import {Meta2dData} from "@meta2d/core/src/store";

// 2D编辑器本地画布缓存 key
const CANVAS_CACHE_KEY: string = 'meta2d-canvas-cache';
// 最大存储大小 (5MB)
const MAX_STORAGE_SIZE: number = 5 * 1024 * 1024;

/**
 * 简单的数据混淆(非加密,仅防止明文暴露)
 * 生产环境建议使用 crypto-js 等专业加密库
 */
function obfuscateData(data: string): string {
    try {
        return btoa(encodeURIComponent(data));
    } catch (e) {
        console.warn('数据混淆失败:', e);
        return data;
    }
}

/**
 * 数据反混淆
 */
function deobfuscateData(data: string): string {
    try {
        return decodeURIComponent(atob(data));
    } catch (e) {
        console.warn('数据反混淆失败,尝试返回原始数据:', e);
        return data;
    }
}

/**
 * 检查存储容量
 */
function checkStorageSize(data: string): boolean {
    const size = new Blob([data]).size;
    if (size > MAX_STORAGE_SIZE) {
        console.error(`数据大小 ${(size / 1024 / 1024).toFixed(2)}MB 超过限制 ${MAX_STORAGE_SIZE / 1024 / 1024}MB`);
        return false;
    }
    return true;
}


/**
 * 抽象的2D编辑器缓存功能
 */
abstract class Editor2DCacheFunc {

    /**
     * 加入到缓存
     * @param key 键
     * @param value 缓存对象
     */
    put(key: string, value: string): boolean {
        try {
            if (!checkStorageSize(value)) {
                return false;
            }
            const obfuscated = obfuscateData(value);
            localStorage.setItem(key, obfuscated);
            return true;
        } catch (e) {
            console.error('存储数据失败:', e);
            return false;
        }
    }

    /**
     * 从缓存中获得内容
     * @param key 键
     */
    get(key: string): string | null {
        try {
            const data = localStorage.getItem(key);
            if (!data) return null;
            return deobfuscateData(data);
        } catch (e) {
            console.error('读取数据失败:', e);
            return null;
        }
    }

    /**
     * 移除缓存内容
     * @param key 键
     */
    remove(key: string): void {
        localStorage.removeItem(key);
    }

    /**
     * 存在键
     * @param key 键
     */
    containsKey(key: string): boolean {
        return localStorage.getItem(key) !== null;
    }

}


/**
 * 2D编辑器缓存功能
 */
export class Editor2DCache extends Editor2DCacheFunc {

    /**
     * 保存画布
     * @param key 键
     * @param data 画布
     */
    saveCanvas(key?: string, data?: Meta2dData): boolean {
        try {
            if (!data) {
                data = meta2d.data();
            }
            const jsonStr = JSON.stringify(data);
            return this.put(key ? key : CANVAS_CACHE_KEY, jsonStr);
        } catch (e) {
            console.error('保存画布失败:', e);
            return false;
        }
    }

    /**
     * 获取画布内容
     * @param key 键
     */
    getCanvas(key?: string): Meta2dData | null {
        try {
            const data = this.get(key ? key : CANVAS_CACHE_KEY);
            if (!data) return null;
            return JSON.parse(data) as Meta2dData;
        } catch (e) {
            console.error('解析画布数据失败:', e);
            return null;
        }
    }
}
