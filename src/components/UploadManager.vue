<template>
  <div>
    <!-- 上传弹窗 -->
    <div
      class="modal"
      v-if="showModal"
      @click.self="handleBackdropClick"
    >
      <div
        class="upload-modal-content"
        @click.stop
      >
        <div class="modal-header">
          <h3>{{ t('upload.modalTitle') }}</h3>
          <button
            class="close-btn"
            @click="handleClose"
            :disabled="hasActiveUploads"
          >
            ✕
          </button>
        </div>

        <!-- 添加文件区域 -->
        <div
          class="add-files-area"
          v-if="fileList.length === 0 || !allDone"
        >
          <div
            class="drop-zone"
            @click="triggerFileInput"
            @dragover.prevent="dragOver = true"
            @dragleave="dragOver = false"
            @drop.prevent="handleDrop"
            :class="{ dragging: dragOver }"
          >
            <svg
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              stroke-width="2"
              width="40"
              height="40"
            >
              <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
              <polyline points="17,8 12,3 7,8" />
              <line
                x1="12"
                y1="3"
                x2="12"
                y2="15"
              />
            </svg>
            <p>{{ t('upload.dropHint') }}</p>
            <span class="hint">{{ t('upload.formatHint') }}</span>
          </div>
          <input
            type="file"
            ref="fileInput"
            accept="image/*"
            multiple
            @change="handleFileSelect"
            style="display: none"
          />
        </div>

        <!-- 文件列表 -->
        <div
          class="file-list"
          v-if="fileList.length > 0"
        >
          <div
            class="file-item"
            v-for="item in fileList"
            :key="item.id"
          >
            <!-- 文件缩略图区域 -->
            <div class="file-thumb">
              <img
                :src="item.preview"
                :alt="item.file.name"
                v-if="item.preview"
              />
              <div
                class="thumb-placeholder"
                v-else
              >
                <svg
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  stroke-width="2"
                  width="24"
                  height="24"
                >
                  <rect
                    x="3"
                    y="3"
                    width="18"
                    height="18"
                    rx="2"
                    ry="2"
                  />
                  <circle
                    cx="8.5"
                    cy="8.5"
                    r="1.5"
                  />
                  <polyline points="21,15 16,10 5,21" />
                </svg>
              </div>

              <!-- 编辑按钮 - 始终显示，鼠标悬停时高亮 -->
              <div
                class="edit-icon-btn"
                v-if="item.status === 'pending'"
                @click.stop="openEditor(item)"
                :title="t('upload.edit')"
              >
                <svg
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  stroke-width="2"
                  width="14"
                  height="14"
                >
                  <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7" />
                  <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z" />
                </svg>
              </div>
            </div>

            <div class="file-info">
              <span
                class="file-name"
                :title="item.file.name"
                >{{ item.displayName }}</span
              >
              <span class="file-size">{{ item.displaySize }}</span>
            </div>

            <div
              class="repo-select"
              v-if="repositories.length > 1"
            >
              <label>{{ t('upload.targetRepo') }}</label>
              <select
                v-model="item.repoId"
                @change="onRepoChange(item)"
                :disabled="item.status !== 'pending' && item.status !== 'failed'"
                class="repo-select-input"
              >
                <option
                  v-for="repo in repositories"
                  :key="repo.id"
                  :value="repo.id"
                >
                  {{ repo.name }}
                </option>
              </select>
            </div>

            <div
              class="privacy-toggle"
              v-if="item.status === 'pending' || item.status === 'failed'"
            >
              <label class="toggle-switch">
                <input
                  type="checkbox"
                  v-model="item.isPublic"
                />
                <span class="toggle-slider"></span>
              </label>
              <span class="toggle-label">{{ item.isPublic ? t('upload.public') : t('upload.private') }}</span>
            </div>
            <div
              class="privacy-badge-mini"
              v-else
            >
              <span :class="item.isPublic ? 'badge-public' : 'badge-private'">
                {{ item.isPublic ? t('upload.public') : t('upload.private') }}
              </span>
            </div>

            <div class="file-status">
              <template v-if="item.status === 'pending'">
                <span class="status-text pending">{{ t('upload.pending') }}</span>
              </template>
              <template v-else-if="item.status === 'uploading'">
                <div class="progress-bar-wrap">
                  <div
                    class="progress-bar"
                    :style="{ width: item.progress + '%' }"
                  ></div>
                </div>
                <span class="status-text uploading">{{ item.progress }}%</span>
                <span
                  class="retry-badge"
                  v-if="item.retries > 0"
                  >{{ t('upload.retryCount', { count: item.retries }) }}</span
                >
              </template>
              <template v-else-if="item.status === 'completed'">
                <span class="status-text completed">{{ t('upload.completed') }}</span>
              </template>
              <template v-else-if="item.status === 'failed'">
                <span
                  class="status-text failed"
                  :title="item.error"
                  >{{ t('upload.failed') }}</span
                >
                <button
                  class="retry-btn"
                  @click="retryItem(item)"
                  v-if="!item.cancelled"
                >
                  {{ t('upload.retry') }}
                </button>
              </template>
              <template v-else-if="item.status === 'cancelled'">
                <span class="status-text cancelled">{{ t('upload.cancelled') }}</span>
              </template>
            </div>

            <button
              class="remove-btn"
              @click="removeItem(item)"
              :title="t('upload.remove')"
            >
              <svg
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                stroke-width="2"
                width="16"
                height="16"
              >
                <line
                  x1="18"
                  y1="6"
                  x2="6"
                  y2="18"
                />
                <line
                  x1="6"
                  y1="6"
                  x2="18"
                  y2="18"
                />
              </svg>
            </button>
          </div>
        </div>

        <div
          class="empty-state"
          v-if="fileList.length === 0 && !allDone"
        >
          <p>{{ t('upload.selectFiles') }}</p>
        </div>

        <div
          class="all-done"
          v-if="allDone && fileList.length > 0"
        >
          <div class="done-icon">✓</div>
          <p>{{ t('upload.allDone') }}</p>
          <p class="done-summary">
            {{ t('upload.summary', { success: completedCount, fail: failedCount, cancel: cancelledCount }) }}
          </p>
        </div>

        <div class="modal-footer">
          <div class="footer-left">
            <span
              class="queue-status"
              v-if="!allDone && fileList.length > 0"
            >
              {{ completedCount }}/{{ fileList.length }} {{ t('upload.completed') }}
            </span>
          </div>
          <div class="footer-right">
            <button
              class="btn btn-secondary btn-sm"
              @click="cancelAll"
              v-if="hasActiveUploads"
            >
              {{ t('upload.cancelAll') }}
            </button>
            <button
              class="btn btn-primary btn-sm"
              @click="startUpload"
              :disabled="!hasPendingUploads || hasActiveUploads"
              v-if="!allDone"
            >
              {{ hasActiveUploads ? t('upload.uploading') : t('upload.startUpload') }}
            </button>
            <button
              class="btn btn-primary btn-sm"
              @click="closeModal"
              v-if="allDone"
            >
              {{ t('upload.complete') }}
            </button>
          </div>
        </div>
      </div>
    </div>

    <!-- 最小化浮动按钮 -->
    <div
      class="minimized-upload-btn"
      v-if="showMinimized"
      @click="restoreModal"
      :title="t('upload.minimizedTitle', { done: completedCount, total: fileList.length })"
    >
      <svg
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        stroke-width="2"
        width="24"
        height="24"
      >
        <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
        <polyline points="17,8 12,3 7,8" />
        <line
          x1="12"
          y1="3"
          x2="12"
          y2="15"
        />
      </svg>
      <div class="mini-progress-ring">
        <svg viewBox="0 0 36 36">
          <circle
            cx="18"
            cy="18"
            r="16"
            fill="none"
            stroke="rgba(255,255,255,0.2)"
            stroke-width="3"
          />
          <circle
            cx="18"
            cy="18"
            r="16"
            fill="none"
            stroke="white"
            stroke-width="3"
            :stroke-dasharray="100"
            :stroke-dashoffset="100 - overallProgress"
            stroke-linecap="round"
          />
        </svg>
      </div>
    </div>
  </div>
</template>

<script setup>
  import { ref, computed } from 'vue';
  import { UploadQueue, formatFileSize, truncateFileName } from '../utils/uploadQueue.js';
  import { showToast } from './Toast.js';
  import { t } from '../utils/i18n.js';

  // ==========================================
  // Props & Emits
  // ==========================================

  const props = defineProps({
    authToken: { type: String, required: true },
    repositories: { type: Array, default: () => [] },
    activeRepository: { type: String, default: 'default' },
    maxRetries: { type: Number, default: 3 },
  });

  const emit = defineEmits(['upload-complete', 'edit-image']);

  // ==========================================
  // 响应式数据
  // ==========================================

  const showModal = ref(false);
  const showMinimized = ref(false);
  const dragOver = ref(false);
  const fileList = ref([]);
  const uploadQueue = ref(null);
  const nextLocalId = ref(0);

  // refs
  const fileInput = ref(null);

  // ==========================================
  // 计算属性
  // ==========================================

  const hasActiveUploads = computed(() => {
    return fileList.value.some((f) => f.status === 'uploading');
  });

  const hasPendingUploads = computed(() => {
    return fileList.value.some((f) => f.status === 'pending' || f.status === 'failed');
  });

  const allDone = computed(() => {
    return (
      fileList.value.length > 0 &&
      fileList.value.every((f) => f.status === 'completed' || f.status === 'failed' || f.status === 'cancelled') &&
      !hasActiveUploads.value
    );
  });

  const completedCount = computed(() => {
    return fileList.value.filter((f) => f.status === 'completed').length;
  });

  const failedCount = computed(() => {
    return fileList.value.filter((f) => f.status === 'failed').length;
  });

  const cancelledCount = computed(() => {
    return fileList.value.filter((f) => f.status === 'cancelled').length;
  });

  const overallProgress = computed(() => {
    if (fileList.value.length === 0) return 0;
    const total = fileList.value.reduce((sum, f) => sum + f.progress, 0);
    return Math.round(total / fileList.value.length);
  });

  // ==========================================
  // 方法 - 文件操作
  // ==========================================

  const open = () => {
    showModal.value = true;
    showMinimized.value = false;
  };

  const openEditor = (item) => {
    emit('edit-image', item.file);
  };

  const triggerFileInput = () => {
    fileInput.value?.click();
  };

  const handleFileSelect = (e) => {
    const files = Array.from(e.target.files);
    addFiles(files);
    e.target.value = '';
  };

  const handleDrop = (e) => {
    dragOver.value = false;
    const files = Array.from(e.dataTransfer.files);
    addFiles(files);
  };

  const onRepoChange = (item) => {
    item.isPublic = false;
  };

  const uploadErrorText = (error) => {
    const key = `api.${error.message}`;
    const translated = t(key);
    return translated === key ? error.message : translated;
  };

  const addFiles = (files) => {
    const initialRepo = props.repositories.find((repo) => repo.id === props.activeRepository) ||
      props.repositories[0];
    if (!initialRepo) {
      showToast(t('settings.repoEmpty'), 'warning');
      return;
    }
    const validFiles = files.filter((f) => {
      if (!f.type.startsWith('image/')) {
        showToast(`${f.name} ${t('upload.notImage')}`, 'warning');
        return false;
      }
      if (f.size > 20 * 1024 * 1024) {
        showToast(`${f.name} ${t('upload.overSize')}`, 'warning');
        return false;
      }
      return true;
    });

    for (const file of validFiles) {
      const id = ++nextLocalId.value;

      const item = {
        id,
        file,
        displayName: truncateFileName(file.name),
        displaySize: formatFileSize(file.size),
        repoId: initialRepo.id,
        preview: '',
        isPublic: false,
        status: 'pending',
        progress: 0,
        retries: 0,
        error: '',
        queueId: null,
        cancelled: false,
      };

      fileList.value.push(item);
      const index = fileList.value.length - 1;

      const reader = new FileReader();
      reader.onload = (e) => {
        if (fileList.value[index]) {
          fileList.value[index].preview = e.target.result;
        }
      };
      reader.readAsDataURL(file);
    }
  };

  // ==========================================
  // 方法 - 上传相关
  // ==========================================

  const startUpload = () => {
    if (!uploadQueue.value) {
      uploadQueue.value = new UploadQueue({ maxConcurrent: 2, maxRetries: props.maxRetries, retryDelay: 1000 });
    }

    const pendingItems = fileList.value.filter((f) => f.status === 'pending' || f.status === 'failed');
    if (pendingItems.length === 0) {
      showToast(t('upload.noPending'), 'info');
      return;
    }

    for (const item of pendingItems) {
      const allowedTypes = ['image/jpeg', 'image/png', 'image/gif', 'image/webp'];
      if (!allowedTypes.includes(item.file.type)) {
        item.status = 'failed';
        item.error = t('upload.failType', { type: item.file.type || '未知' });
        continue;
      }
      if (item.file.size > 20 * 1024 * 1024) {
        item.status = 'failed';
        item.error = t('upload.failSize');
        continue;
      }

      item.status = 'pending';
      item.progress = 0;
      item.retries = 0;
      item.error = '';
      item.cancelled = false;

      const queueId = uploadQueue.value.add(item.file, {
        token: props.authToken,
        isPublic: item.isPublic,
        repoId: item.repoId || 'default',
        onProgress: (id, percent) => {
          item.progress = percent;
          if (item.status !== 'uploading') item.status = 'uploading';
        },
        onComplete: (id, result) => {
          item.status = 'completed';
          item.progress = 100;
          checkAllDone();
        },
        onError: (id, error) => {
          if (error.message === '已取消') {
            item.status = 'cancelled';
            item.cancelled = true;
          } else {
            item.status = 'failed';
            item.error = uploadErrorText(error);
            showToast(t('upload.failUpload', { name: item.displayName, error: item.error }), 'error');
          }
          checkAllDone();
        },
      });
      item.queueId = queueId;
    }
    checkAllDone();
  };

  const retryItem = (item) => {
    if (!uploadQueue.value) {
      uploadQueue.value = new UploadQueue({ maxConcurrent: 2, maxRetries: 3, retryDelay: 1000 });
    }
    item.status = 'pending';
    item.progress = 0;
    item.retries = 0;
    item.error = '';
    item.cancelled = false;

    const queueId = uploadQueue.value.add(item.file, {
      token: props.authToken,
      isPublic: item.isPublic,
      repoId: item.repoId,
      onProgress: (id, percent) => {
        item.progress = percent;
        if (item.status !== 'uploading') item.status = 'uploading';
      },
      onComplete: (id, result) => {
        item.status = 'completed';
        item.progress = 100;
        checkAllDone();
      },
      onError: (id, error) => {
        if (error.message === '已取消') {
          item.status = 'cancelled';
          item.cancelled = true;
        } else {
          item.status = 'failed';
          item.error = uploadErrorText(error);
          showToast(t('upload.failUpload', { name: item.displayName, error: item.error }), 'error');
        }
        checkAllDone();
      },
    });
    item.queueId = queueId;
  };

  const removeItem = (item) => {
    if ((item.status === 'uploading' || item.status === 'pending') && item.queueId && uploadQueue.value) {
      uploadQueue.value.cancel(item.queueId);
      item.status = 'cancelled';
      item.cancelled = true;
    }
    const index = fileList.value.indexOf(item);
    if (index >= 0) fileList.value.splice(index, 1);
    checkAllDone();
  };

  const cancelAll = () => {
    if (uploadQueue.value) uploadQueue.value.cancelAll();
    for (const item of fileList.value) {
      if (item.status === 'uploading' || item.status === 'pending') {
        item.status = 'cancelled';
        item.cancelled = true;
      }
    }
    checkAllDone();
  };

  const checkAllDone = () => {
    if (allDone.value) {
      showMinimized.value = false;
      const s = completedCount.value;
      const f = failedCount.value;
      const c = cancelledCount.value;
      if (s > 0 && f === 0 && c === 0) {
        showToast(t('upload.successCount', { count: s }), 'success');
      } else if (s > 0 || f > 0) {
        showToast(t('upload.summary', { success: s, fail: f, cancel: c }), f > 0 ? 'warning' : 'success');
      }
      emit('upload-complete');
    }
  };

  // ==========================================
  // 方法 - 弹窗控制
  // ==========================================

  const handleClose = () => {
    if (hasActiveUploads.value) {
      showModal.value = false;
      showMinimized.value = true;
      showToast(t('upload.minimized'), 'info');
    } else {
      closeModal();
    }
  };

  const handleBackdropClick = () => {
    handleClose();
  };

  const closeModal = () => {
    showModal.value = false;
    showMinimized.value = false;
    fileList.value = fileList.value.filter((f) => f.status === 'pending' || f.status === 'uploading');
  };

  const restoreModal = () => {
    showModal.value = true;
    showMinimized.value = false;
  };

  // 暴露方法给父组件
  defineExpose({
    open,
    addFiles,
    showModal,
    showMinimized,
  });
</script>

<style scoped>
  .modal {
    position: fixed;
    top: 0;
    left: 0;
    right: 0;
    bottom: 0;
    background: rgba(0, 0, 0, 0.6);
    display: flex;
    align-items: center;
    justify-content: center;
    z-index: 300;
    backdrop-filter: blur(4px);
    animation: fadeIn 0.2s ease;
  }

  @keyframes fadeIn {
    from {
      opacity: 0;
    }
    to {
      opacity: 1;
    }
  }

  .upload-modal-content {
    background: var(--bg-primary);
    border-radius: var(--radius-xl);
    width: 640px;
    max-width: 95vw;
    max-height: 85vh;
    display: flex;
    flex-direction: column;
    box-shadow: var(--shadow-lg);
    border: 1px solid var(--border-color);
    animation: slideUp 0.3s ease;
  }

  @keyframes slideUp {
    from {
      transform: translateY(30px);
      opacity: 0;
    }
    to {
      transform: translateY(0);
      opacity: 1;
    }
  }

  .modal-header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    padding: 1.25rem 1.5rem;
    border-bottom: 1px solid var(--border-color);
    flex-shrink: 0;
  }

  .modal-header h3 {
    font-size: 1.125rem;
    font-weight: 600;
  }

  .close-btn {
    width: 32px;
    height: 32px;
    border-radius: var(--radius-sm);
    border: 1px solid var(--border-color);
    background: var(--bg-tertiary);
    color: var(--text-secondary);
    cursor: pointer;
    display: flex;
    align-items: center;
    justify-content: center;
    transition: all 0.15s ease;
    font-weight: 600;
  }

  .close-btn:hover:not(:disabled) {
    background: #fee2e2;
    color: #dc2626;
    border-color: #fca5a5;
  }

  .close-btn:disabled {
    opacity: 0.4;
    cursor: not-allowed;
  }

  .add-files-area {
    padding: 1rem 1.5rem;
    flex-shrink: 0;
  }

  .drop-zone {
    border: 2px dashed var(--border-color);
    border-radius: var(--radius-md);
    padding: 1.5rem;
    text-align: center;
    cursor: pointer;
    transition: all var(--transition);
    color: var(--text-tertiary);
  }

  .drop-zone:hover,
  .drop-zone.dragging {
    border-color: var(--blue-400);
    background: var(--blue-50);
    color: var(--blue-500);
  }

  [data-theme='dark'] .drop-zone:hover,
  [data-theme='dark'] .drop-zone.dragging {
    background: rgba(59, 130, 246, 0.1);
  }

  .drop-zone p {
    margin-top: 0.5rem;
    font-size: 0.875rem;
  }

  .drop-zone .hint {
    font-size: 0.75rem;
    opacity: 0.7;
  }

  .file-list {
    flex: 1;
    overflow-y: auto;
    padding: 0 1.5rem;
    max-height: 400px;
  }

  .file-item {
    display: flex;
    align-items: center;
    gap: 0.75rem;
    padding: 0.75rem 0;
    border-bottom: 1px solid var(--border-color);
  }

  .file-item:last-child {
    border-bottom: none;
  }

  .file-thumb {
    width: 48px;
    height: 48px;
    border-radius: var(--radius-sm);
    overflow: hidden;
    flex-shrink: 0;
    background: var(--bg-tertiary);
    position: relative;
  }

  .file-thumb img {
    width: 100%;
    height: 100%;
    object-fit: cover;
  }

  .thumb-placeholder {
    width: 100%;
    height: 100%;
    display: flex;
    align-items: center;
    justify-content: center;
    color: var(--text-tertiary);
  }

  .edit-icon-btn {
    position: absolute;
    top: 2px;
    right: 2px;
    width: 22px;
    height: 22px;
    border-radius: 50%;
    background: rgba(0, 0, 0, 0.55);
    display: flex;
    align-items: center;
    justify-content: center;
    cursor: pointer;
    color: rgba(255, 255, 255, 0.8);
    opacity: 0;
    transition: all 0.2s ease;
    z-index: 2;
  }

  .edit-icon-btn:hover {
    opacity: 1;
    background: var(--blue-500);
    color: white;
    transform: scale(1.1);
  }

  .file-item:hover .edit-icon-btn {
    opacity: 0.7;
  }

  .file-item:hover .edit-icon-btn:hover {
    opacity: 1;
  }

  .file-info {
    flex: 1;
    min-width: 0;
  }

  .file-name {
    display: block;
    font-size: 0.875rem;
    font-weight: 500;
    white-space: nowrap;
    overflow: hidden;
    text-overflow: ellipsis;
  }

  .file-size {
    display: block;
    font-size: 0.75rem;
    color: var(--text-tertiary);
    margin-top: 2px;
  }

  .privacy-toggle {
    display: flex;
    align-items: center;
    gap: 0.5rem;
    flex-shrink: 0;
  }

  .toggle-switch {
    position: relative;
    width: 40px;
    height: 22px;
    cursor: pointer;
  }

  .toggle-switch input {
    display: none;
  }

  .toggle-slider {
    position: absolute;
    top: 0;
    left: 0;
    right: 0;
    bottom: 0;
    background: var(--bg-tertiary);
    border-radius: 11px;
    transition: all var(--transition);
    border: 1px solid var(--border-color);
  }

  .toggle-slider::before {
    content: '';
    position: absolute;
    top: 2px;
    left: 2px;
    width: 16px;
    height: 16px;
    background: white;
    border-radius: 50%;
    transition: all var(--transition);
    box-shadow: 0 1px 3px rgba(0, 0, 0, 0.2);
  }

  .toggle-switch input:checked + .toggle-slider {
    background: var(--blue-500);
    border-color: var(--blue-500);
  }

  .toggle-switch input:checked + .toggle-slider::before {
    transform: translateX(18px);
  }

  .toggle-label {
    font-size: 0.75rem;
    color: var(--text-secondary);
    min-width: 28px;
  }

  .privacy-badge-mini {
    flex-shrink: 0;
  }

  .badge-public,
  .badge-private {
    font-size: 0.7rem;
    padding: 0.125rem 0.5rem;
    border-radius: 999px;
    font-weight: 500;
  }

  .badge-public {
    background: rgba(34, 197, 94, 0.15);
    color: #16a34a;
  }

  .badge-private {
    background: rgba(100, 116, 139, 0.15);
    color: #64748b;
  }

  .file-status {
    display: flex;
    align-items: center;
    gap: 0.5rem;
    flex-shrink: 0;
    min-width: 80px;
    justify-content: flex-end;
  }

  .status-text {
    font-size: 0.75rem;
    white-space: nowrap;
  }

  .status-text.pending {
    color: var(--text-tertiary);
  }

  .status-text.uploading {
    color: var(--blue-500);
    font-weight: 500;
  }

  .status-text.completed {
    color: #16a34a;
  }

  .status-text.failed {
    color: #dc2626;
    cursor: help;
  }

  .status-text.cancelled {
    color: var(--text-tertiary);
  }

  .retry-badge {
    font-size: 0.65rem;
    background: rgba(234, 179, 8, 0.2);
    color: #ca8a04;
    padding: 0.1rem 0.4rem;
    border-radius: 999px;
  }

  .retry-btn {
    font-size: 0.7rem;
    padding: 0.2rem 0.5rem;
    background: var(--blue-500);
    color: white;
    border: none;
    border-radius: var(--radius-sm);
    cursor: pointer;
  }

  .retry-btn:hover {
    background: var(--blue-600);
  }

  .progress-bar-wrap {
    width: 50px;
    height: 4px;
    background: var(--bg-tertiary);
    border-radius: 2px;
    overflow: hidden;
  }

  .progress-bar {
    height: 100%;
    background: var(--blue-500);
    border-radius: 2px;
    transition: width 0.3s ease;
  }

  .remove-btn {
    background: none;
    border: none;
    color: var(--text-tertiary);
    cursor: pointer;
    padding: 0.25rem;
    border-radius: var(--radius-sm);
    transition: all var(--transition);
    flex-shrink: 0;
  }

  .remove-btn:hover:not(:disabled) {
    color: #dc2626;
    background: rgba(220, 38, 38, 0.1);
  }

  .remove-btn:disabled {
    opacity: 0.3;
    cursor: not-allowed;
  }

  .empty-state,
  .all-done {
    padding: 3rem 1.5rem;
    text-align: center;
    color: var(--text-tertiary);
  }

  .all-done .done-icon {
    width: 56px;
    height: 56px;
    border-radius: 50%;
    background: #16a34a;
    color: white;
    font-size: 1.5rem;
    display: flex;
    align-items: center;
    justify-content: center;
    margin: 0 auto 1rem;
  }

  .all-done p {
    font-size: 1rem;
    color: var(--text-primary);
    margin-bottom: 0.25rem;
  }

  .done-summary {
    font-size: 0.875rem !important;
    color: var(--text-secondary) !important;
  }

  .modal-footer {
    display: flex;
    justify-content: space-between;
    align-items: center;
    padding: 1rem 1.5rem;
    border-top: 1px solid var(--border-color);
    flex-shrink: 0;
  }

  .queue-status {
    font-size: 0.8125rem;
    color: var(--text-tertiary);
  }

  .footer-right {
    display: flex;
    gap: 0.5rem;
  }

  .btn {
    padding: 0.5rem 1rem;
    border-radius: var(--radius-md);
    font-size: 0.875rem;
    font-weight: 500;
    cursor: pointer;
    border: none;
    transition: all var(--transition);
  }

  .btn:disabled {
    opacity: 0.5;
    cursor: not-allowed;
  }

  .btn-primary {
    background: var(--blue-500);
    color: white;
  }

  .btn-primary:hover:not(:disabled) {
    background: var(--blue-600);
  }

  .btn-secondary {
    background: var(--bg-tertiary);
    color: var(--text-secondary);
    border: 1px solid var(--border-color);
  }

  .btn-secondary:hover:not(:disabled) {
    background: var(--bg-secondary);
  }

  .btn-sm {
    padding: 0.375rem 0.75rem;
    font-size: 0.8125rem;
  }

  .minimized-upload-btn {
    position: fixed;
    bottom: 2rem;
    right: 2rem;
    width: 56px;
    height: 56px;
    background: var(--blue-500);
    border-radius: 50%;
    display: flex;
    align-items: center;
    justify-content: center;
    cursor: pointer;
    box-shadow: var(--shadow-lg);
    z-index: 250;
    animation: popIn 0.3s ease;
    transition:
      transform var(--transition),
      box-shadow var(--transition);
    color: white;
  }

  .minimized-upload-btn:hover {
    transform: scale(1.1);
    box-shadow: 0 8px 25px rgba(59, 130, 246, 0.4);
  }

  @keyframes popIn {
    from {
      transform: scale(0);
      opacity: 0;
    }
    to {
      transform: scale(1);
      opacity: 1;
    }
  }

  .mini-progress-ring {
    position: absolute;
    top: -4px;
    left: -4px;
    width: 64px;
    height: 64px;
    transform: rotate(-90deg);
    pointer-events: none;
  }

  .mini-progress-ring svg {
    width: 100%;
    height: 100%;
  }

  .repo-select {
    display: flex;
    align-items: center;
    gap: 0.5rem;
    padding: 0 0.75rem;
  }

  .repo-select label {
    font-size: 0.8125rem;
    font-weight: 600;
    color: var(--text-secondary);
    white-space: nowrap;
    flex-shrink: 0;
  }

  .repo-select-input {
    flex: 1;
    padding: 0.5rem 0.75rem;
    border: 2px solid var(--border-color);
    border-radius: var(--radius-md);
    font-size: 0.8125rem;
    background: var(--bg-primary);
    color: var(--text-primary);
    outline: none;
    cursor: pointer;
    transition: border-color 0.15s;
  }
</style>
