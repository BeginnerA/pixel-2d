/*
 * @description: 事件收发器
 * @author: MC.Yang
 */

type EventHandler<T> = (event: T) => void;
type EventMap = { [key: string]: EventHandler<any>[] };

/**
 * 2D编辑器事件收发器
 */
export class EventEmitter {
    private events: EventMap = {};

    /**
     * 注册事件
     * @param eventName 事件名称
     * @param handler 事件处理程序
     */
    on<T>(eventName: string, handler: EventHandler<T>): void {
        if (!this.events[eventName]) {
            this.events[eventName] = [];
        }
        this.events[eventName].push(handler);
    }

    /**
     * 触发事件
     * @param eventName 事件名称
     * @param eventData 事件数据
     */
    emit<T>(eventName: string, eventData: T): void {
        if (this.events[eventName]) {
            this.events[eventName].forEach(handler => {
                handler(eventData);
            });
        }
    }

    /**
     * 注销事件
     * @param eventName 事件名称
     * @param handler 事件处理程序
     */
    off<T>(eventName: string, handler?: EventHandler<T>): void {
        if (this.events[eventName]) {
            if (handler) {
                // 如果有指定 handler，则只移除该 handler
                this.events[eventName] = this.events[eventName].filter(h => h !== handler);
            } else {
                // 如果没有指定 handler，则移除所有 handler
                delete this.events[eventName];
            }
        }
    }

}
