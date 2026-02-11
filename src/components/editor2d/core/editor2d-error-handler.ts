/*
 * @description: 2D编辑器错误处理工具
 * @author: MC.Yang
 */

/**
 * 错误级别
 */
export enum ErrorLevel {
    INFO = 'info',
    WARN = 'warn',
    ERROR = 'error',
    FATAL = 'fatal'
}

/**
 * 错误处理器
 */
export class Editor2DErrorHandler {
    /**
     * 处理错误
     * @param error 错误对象
     * @param level 错误级别
     * @param context 错误上下文
     */
    static handleError(error: Error | unknown, level: ErrorLevel = ErrorLevel.ERROR, context?: string): void {
        const errorMessage = error instanceof Error ? error.message : String(error);
        const fullMessage = context ? `[${context}] ${errorMessage}` : errorMessage;

        switch (level) {
            case ErrorLevel.INFO:
                console.info(fullMessage, error);
                break;
            case ErrorLevel.WARN:
                console.warn(fullMessage, error);
                break;
            case ErrorLevel.ERROR:
                console.error(fullMessage, error);
                break;
            case ErrorLevel.FATAL:
                console.error('致命错误:', fullMessage, error);
                // 可以在这里添加错误上报逻辑
                this.reportError(error, context);
                break;
        }
    }

    /**
     * 错误上报(可扩展对接第三方监控服务)
     * @param error 错误
     * @param context 上下文
     */
    private static reportError(error: unknown, context?: string): void {
        // TODO: 对接 Sentry, 阿里云 ARMS 等监控服务
        // 示例: Sentry.captureException(error, { tags: { context } });
        console.log('错误已记录:', { error, context, timestamp: new Date().toISOString() });
    }

    /**
     * 安全执行函数(捕获异常)
     * @param fn 要执行的函数
     * @param fallback 失败时的回退值
     * @param context 上下文
     */
    static safeExecute<T>(
        fn: () => T,
        fallback: T,
        context?: string
    ): T {
        try {
            return fn();
        } catch (error) {
            this.handleError(error, ErrorLevel.ERROR, context);
            return fallback;
        }
    }

    /**
     * 异步安全执行
     * @param fn 异步函数
     * @param fallback 失败时的回退值
     * @param context 上下文
     */
    static async safeExecuteAsync<T>(
        fn: () => Promise<T>,
        fallback: T,
        context?: string
    ): Promise<T> {
        try {
            return await fn();
        } catch (error) {
            this.handleError(error, ErrorLevel.ERROR, context);
            return fallback;
        }
    }
}
