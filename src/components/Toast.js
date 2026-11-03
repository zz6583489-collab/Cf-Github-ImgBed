import { t } from '../utils/i18n.js';

export function showToast(message, type = 'info', duration = 3000) {
  createLocalToast(message, type, duration);
}

export function showLoading(message = '') {
  const msg = message || t('common.loading');
  return createLocalToast(msg, 'info', 0);
}

function createLocalToast(message, type, duration) {
  let container = document.getElementById('local-toasts');
  if (!container) {
    container = document.createElement('div');
    container.id = 'local-toasts';
    container.style.cssText = 'position:fixed;top:20px;left:50%;transform:translateX(-50%);z-index:4000;display:grid;gap:8px;max-width:min(90vw,520px)';
    document.body.appendChild(container);
  }
  const item = document.createElement('div');
  item.textContent = String(message);
  const colors = { success: '#16834a', error: '#c0392b', warning: '#b26b00', info: '#2563eb' };
  item.style.cssText = `background:${colors[type] || colors.info};color:white;padding:10px 16px;border-radius:8px;box-shadow:0 4px 16px #0003;line-height:1.5;overflow-wrap:anywhere`;
  container.appendChild(item);
  const close = () => item.remove();
  if (duration > 0) setTimeout(close, duration);
  return close;
}

let loadingInstance = null;
let loadingContainer = null;

export function showLoadingWithUpdate(initialText) {
  // 如果已经存在 loading 实例，先关闭
  if (loadingInstance && loadingInstance.close) {
    loadingInstance.close();
  }

  // 获取或创建容器
  if (!loadingContainer || !document.body.contains(loadingContainer)) {
    loadingContainer = document.createElement('div');
    loadingContainer.className = 'toast-container';
    document.body.appendChild(loadingContainer);
  }

  // 创建 loading 元素
  const loadingDiv = document.createElement('div');
  loadingDiv.className = 'toast-message toast-loading';

  // 检测主题：检查 html 元素的 class 中是否有 'dark'
  const isDark = document.documentElement.classList.contains('dark');
  if (isDark) {
    loadingDiv.classList.add('dark');
  }

  // loading 动画 SVG
  const loadingSvg = `
    <div class="toast-loading-icon">
      <svg class="toast-circular" viewBox="25 25 50 50">
        <circle class="toast-path" cx="50" cy="50" r="20" fill="none" stroke-width="4" stroke-miterlimit="10"/>
      </svg>
    </div>
  `;

  loadingDiv.innerHTML = `
    ${loadingSvg}
    <div class="toast-content"></div>
  `;
  loadingDiv.querySelector('.toast-content').textContent = initialText || '加载中...';

  // 添加样式（如果还没有）
  if (!document.getElementById('toast-styles')) {
    const style = document.createElement('style');
    style.id = 'toast-styles';
    style.textContent = `
      .toast-container {
        position: fixed;
        top: 20px;
        left: 50%;
        transform: translateX(-50%);
        z-index: 3000;
      }
      .toast-message {
        padding: 10px 16px;
        border-radius: 7px;
        background: rgba(255, 255, 255, 0.95);
        color: rgba(44, 44, 44, 0.9);
        box-shadow: 0 4px 16px rgba(15, 15, 15, 0.15);
        display: flex;
        align-items: center;
        gap: 10px;
        margin-bottom: 8px;
        animation: toastFadeIn 0.22s ease-out;
      }
      .toast-message.dark {
        background: rgba(36, 36, 36, 0.95);
        color: rgba(255, 255, 255, 0.9);
      }
      .toast-loading-icon {
        width: 20px;
        height: 20px;
        flex-shrink: 0;
      }
      .toast-circular {
        animation: toastRotate 2s linear infinite both;
        transform-origin: center center;
        width: 100%;
        height: 100%;
      }
      .toast-path {
        stroke-dasharray: 1, 200;
        stroke-dashoffset: 0;
        stroke: #3491fa;
        animation: toastDash 1.5s ease-in-out infinite;
        stroke-linecap: round;
      }
      .dark .toast-path {
        stroke: #1d4dd2;
      }
      .toast-content {
        font-size: 14px;
        line-height: 1.57143;
      }
      @keyframes toastFadeIn {
        from {
          opacity: 0;
          transform: translateY(-20px);
        }
        to {
          opacity: 1;
          transform: translateY(0);
        }
      }
      @keyframes toastRotate {
        100% {
          transform: rotate(360deg);
        }
      }
      @keyframes toastDash {
        0% {
          stroke-dasharray: 1, 200;
          stroke-dashoffset: 0;
        }
        50% {
          stroke-dasharray: 89, 200;
          stroke-dashoffset: -35px;
        }
        100% {
          stroke-dasharray: 89, 200;
          stroke-dashoffset: -124px;
        }
      }
    `;
    document.head.appendChild(style);
  }

  loadingContainer.appendChild(loadingDiv);

  // 创建实例对象
  const instance = {
    dom: loadingDiv,
    close: function () {
      if (this.dom && this.dom.parentNode) {
        this.dom.style.animation = 'toastFadeIn 0.22s ease-out reverse';
        setTimeout(() => {
          if (this.dom && this.dom.parentNode) {
            this.dom.parentNode.removeChild(this.dom);
          }
          if (loadingInstance === this) {
            loadingInstance = null;
          }
        }, 220);
      }
    },
    update: function (text) {
      if (this.dom) {
        const contentDiv = this.dom.querySelector('.toast-content');
        if (contentDiv) {
          contentDiv.textContent = text;
        }
      }
    },
  };

  // 自动关闭定时器
  let timeoutId = null;
  instance.setDuration = function (duration) {
    if (timeoutId) clearTimeout(timeoutId);
    if (duration > 0) {
      timeoutId = setTimeout(() => {
        instance.close();
      }, duration);
    }
  };

  loadingInstance = instance;
  return instance;
}
