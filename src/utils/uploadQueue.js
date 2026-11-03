/**
 * 上传队列管理器
 * - Promise 并发池
 * - AbortController 取消
 * - 自动重试（默认3次）
 * - 进度回调
 */

export class UploadQueue {
  constructor(options = {}) {
    this.maxConcurrent = options.maxConcurrent || 2; // 最大并发数
    this.maxRetries = options.maxRetries ?? 3; // 最大重试次数
    this.retryDelay = options.retryDelay || 1000; // 重试间隔（毫秒）

    this.queue = []; // 等待队列
    this.active = new Map(); // 活跃任务 Map<id, { controller, xhr, retries }>
    this.completed = []; // 已完成
    this.failed = []; // 失败

    this.running = false;
    this._nextId = 0;
    this._processingPromise = null; // 添加处理中标志
  }

  /**
   * 添加文件到队列
   * @param {File} file - 文件对象
   * @param {Object} options - 上传选项
   * @param {string} options.token - 认证 token
   * @param {boolean} options.isPublic - 是否公开
   * @param {string} options.repoId - 目标仓库 ID
   * @param {Function} options.onProgress - 进度回调 (id, percent)
   * @param {Function} options.onComplete - 完成回调 (id, result)
   * @param {Function} options.onError - 错误回调 (id, error)
   * @returns {number} 任务 ID
   */
  add(file, options = {}) {
    const id = ++this._nextId;
    const task = {
      id,
      file,
      token: options.token || '',
      isPublic: options.isPublic || false,
      repoId: options.repoId || 'default',
      onProgress: options.onProgress || (() => {}),
      onComplete: options.onComplete || (() => {}),
      onError: options.onError || (() => {}),
      retries: 0,
      status: 'pending', // pending | uploading | completed | failed | cancelled
    };
    this.queue.push(task);

    // 启动处理
    this._startProcessing();

    // 关键修复：立即尝试填充活跃任务
    this._tryFillActive();

    return id;
  }

  /**
   * 取消指定任务
   */
  cancel(id) {
    // 如果在队列中
    const queueIndex = this.queue.findIndex((t) => t.id === id);
    if (queueIndex >= 0) {
      const task = this.queue[queueIndex];
      task.status = 'cancelled';
      this.queue.splice(queueIndex, 1);
      task.onError(id, new Error('已取消'));
      return true;
    }

    // 如果在活跃中
    if (this.active.has(id)) {
      const active = this.active.get(id);
      if (active.controller) {
        active.controller.abort();
      }
      if (active.xhr) {
        active.xhr.abort();
      }
      active.task.status = 'cancelled';
      this.active.delete(id);
      active.task.onError(id, new Error('已取消'));
      this._tryFillActive();
      return true;
    }

    return false;
  }

  /**
   * 取消所有任务
   */
  cancelAll() {
    // 清空队列
    for (const task of this.queue) {
      task.status = 'cancelled';
      task.onError(task.id, new Error('已取消'));
    }
    this.queue = [];

    // 取消活跃任务
    for (const [id, active] of this.active) {
      if (active.controller) active.controller.abort();
      if (active.xhr) active.xhr.abort();
      active.task.status = 'cancelled';
      active.task.onError(id, new Error('已取消'));
    }
    this.active.clear();
  }

  /**
   * 获取队列状态
   */
  getStatus() {
    const queued = this.queue.length;
    const active = this.active.size;
    const completed = this.completed.length;
    const failed = this.failed.length;

    const total = queued + active + completed + failed;
    const done = completed + failed;

    return {
      queued,
      active,
      completed,
      failed,
      total,
      done,
      progress: total > 0 ? done / total : 0,
      isAllDone: done === total && total > 0,
    };
  }

  /**
   * 尝试填充活跃任务（立即执行）
   */
  _tryFillActive() {
    while (this.queue.length > 0 && this.active.size < this.maxConcurrent) {
      const task = this.queue.shift();
      if (task.status === 'cancelled') continue;

      console.log(`启动任务 ${task.id}, 当前活跃数: ${this.active.size + 1}/${this.maxConcurrent}`);
      this._startTask(task);
    }
  }

  /**
   * 启动处理
   */
  _startProcessing() {
    if (this._processingPromise) return;
    this._processingPromise = this._processQueue().finally(() => {
      this._processingPromise = null;
    });
  }

  /**
   * 处理队列
   */
  async _processQueue() {
    while (this.queue.length > 0 || this.active.size > 0) {
      // 填充到最大并发数
      this._tryFillActive();

      // 如果没有活跃任务，退出
      if (this.active.size === 0) {
        break;
      }

      // 等待任意一个活跃任务完成
      await Promise.race(Array.from(this.active.values()).map((a) => a.promise)).catch(() => {});
    }
  }

  /**
   * 开始单个任务
   */
  _startTask(task) {
    const controller = new AbortController();

    const promise = this._uploadWithRetry(task, controller)
      .then((result) => {
        if (this.active.has(task.id)) {
          this.active.delete(task.id);
          task.status = 'completed';
          this.completed.push(task);
          task.onComplete(task.id, result);
          console.log(`任务 ${task.id} 完成, 剩余活跃: ${this.active.size}`);
          // 任务完成后，尝试启动新任务
          this._tryFillActive();
        }
      })
      .catch((error) => {
        if (this.active.has(task.id)) {
          this.active.delete(task.id);
          if (task.status !== 'cancelled') {
            task.status = 'failed';
            this.failed.push(task);
            task.onError(task.id, error);
          }
          console.log(`任务 ${task.id} 失败, 剩余活跃: ${this.active.size}`);
          // 任务失败后，尝试启动新任务
          this._tryFillActive();
        }
      });

    this.active.set(task.id, {
      task,
      controller,
      promise,
      xhr: null,
    });
  }

  /**
   * 带重试的上传
   */
  async _uploadWithRetry(task, controller) {
    let lastError = null;

    for (let attempt = 0; attempt < this.maxRetries; attempt++) {
      if (controller.signal.aborted) {
        throw new Error('已取消');
      }

      try {
        task.status = 'uploading';
        const result = await this._doUpload(task, controller);
        return result;
      } catch (error) {
        lastError = error;

        // 如果是取消，不重试
        if (error.message === '已取消' || controller.signal.aborted) {
          throw error;
        }

        // 如果标记为不可重试，直接抛出错误
        if (error.noRetry) {
          throw error;
        }

        // 最后一次尝试失败
        if (attempt + 1 >= this.maxRetries) {
          throw new Error(`上传失败（已重试${this.maxRetries}次）: ${error.message}`);
        }

        // 等待后重试
        task.retries = attempt + 1;
        task.onProgress(task.id, 0); // 重置进度
        await this._sleep(this.retryDelay * (attempt + 1));
      }
    }

    throw lastError;
  }

  /**
   * 实际执行上传（使用 XMLHttpRequest）
   */
  _doUpload(task, controller) {
    return new Promise((resolve, reject) => {
      const xhr = new XMLHttpRequest();
      const formData = new FormData();
      formData.append('image', task.file);
      formData.append('public', task.isPublic ? 'true' : 'false');
      formData.append('repoId', task.repoId || 'default');

      const active = this.active.get(task.id);
      if (active) {
        active.xhr = xhr;
      }

      controller.signal.addEventListener('abort', () => {
        xhr.abort();
        reject(new Error('已取消'));
      });

      let lastPercent = 0;
      xhr.upload.onprogress = (e) => {
        if (e.lengthComputable && e.total > 0) {
          const percent = Math.min(Math.round((e.loaded / e.total) * 100), 99);
          if (percent > lastPercent) {
            lastPercent = percent;
            console.log(`上传进度: ${percent}%`);
            task.onProgress(task.id, percent);
          }
        }
      };

      xhr.onreadystatechange = () => {
        if (xhr.readyState === XMLHttpRequest.DONE) {
          if (xhr.status >= 200 && xhr.status < 300) {
            task.onProgress(task.id, 100);
            try {
              const response = JSON.parse(xhr.responseText);
              resolve(response);
            } catch (e) {
              reject(new Error('解析响应失败'));
            }
          } else if (xhr.status === 400) {
            // 400 错误：客户端错误（文件类型、大小等），不重试
            let message = '请求错误';
            try {
              const err = JSON.parse(xhr.responseText);
              message = err.error || message;
            } catch {}
            const error = new Error(message);
            error.noRetry = true;
            reject(error);
          } else if (xhr.status === 401) {
            // 认证错误，不重试
            const error = new Error('认证失败，请重新登录');
            error.noRetry = true;
            reject(error);
          } else if (xhr.status === 403) {
            // 权限错误，不重试
            const error = new Error('权限不足');
            error.noRetry = true;
            reject(error);
          } else if (xhr.status === 404) {
            // 未找到，不重试
            const error = new Error('资源未找到');
            error.noRetry = true;
            reject(error);
          } else if (xhr.status === 0) {
            reject(new Error('已取消'));
          } else {
            // 500 等服务器错误，可以重试
            try {
              const err = JSON.parse(xhr.responseText);
              reject(new Error(err.error || `上传失败 (${xhr.status})`));
            } catch (e) {
              reject(new Error(`上传失败 (${xhr.status})`));
            }
          }
        }
      };

      xhr.upload.onerror = () => {
        reject(new Error('网络错误'));
      };

      xhr.upload.ontimeout = () => {
        reject(new Error('上传超时'));
      };

      xhr.open('POST', '/api/upload');
      xhr.setRequestHeader('Authorization', `Bearer ${task.token}`);
      xhr.timeout = 120000;
      xhr.send(formData);
    });
  }

  _sleep(ms) {
    return new Promise((resolve) => setTimeout(resolve, ms));
  }
}

// 格式化文件大小
export function formatFileSize(bytes) {
  if (bytes === 0) return '0 B';
  const units = ['B', 'KB', 'MB', 'GB'];
  const i = Math.floor(Math.log(bytes) / Math.log(1024));
  return (bytes / Math.pow(1024, i)).toFixed(2) + ' ' + units[i];
}

// 截断文件名
export function truncateFileName(name, maxLen = 25) {
  if (name.length <= maxLen) return name;
  const ext = name.lastIndexOf('.');
  if (ext >= 0) {
    const extStr = name.substring(ext);
    const baseName = name.substring(0, ext);
    const available = maxLen - extStr.length - 3;
    if (available > 0) {
      return baseName.substring(0, available) + '...' + extStr;
    }
  }
  return name.substring(0, maxLen - 3) + '...';
}
