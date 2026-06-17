/**
 * 性能优化模块统一导出
 * @description 导出性能监控和内存管理相关的所有类和类型
 */

export { PerformanceMonitor } from './PerformanceMonitor'
export type {
  PerformanceMetric,
  FpsMetrics,
  RenderMetrics,
  MemoryMetrics,
  OperationMetrics,
  PerformanceReport,
  PerformanceAlert,
  PerformanceMonitorOptions,
} from './PerformanceMonitor'

export { MemoryManager, ObjectPool, WeakRefCache } from './MemoryManager'
export type {
  ObjectFactory,
  ListenerRecord,
  ViewportChunkOptions,
  MemoryManagerOptions,
} from './MemoryManager'
