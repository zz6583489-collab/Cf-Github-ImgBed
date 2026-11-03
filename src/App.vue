<template>
  <div class="app-container">
    <!-- 密码锁屏 -->
    <div
      class="lock-screen"
      v-if="!isAuthenticated"
    >
      <div class="lock-card">
        <div class="lock-icon">
          <svg
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            stroke-width="2"
          >
            <rect
              x="3"
              y="11"
              width="18"
              height="11"
              rx="2"
              ry="2"
            />
            <path d="M7 11V7a5 5 0 0 1 10 0v4" />
          </svg>
        </div>
        <h1 class="lock-title">{{ settings.siteTitle || t('lock.title') }}</h1>
        <p class="lock-version">{{ t('lock.version') }}</p>

        <!-- 步骤1: 输入密码 -->
        <template v-if="authStep === 'password'">
          <p class="lock-desc">{{ t('lock.desc') }}</p>
          <div class="lock-input-group">
            <input
              type="password"
              v-model="authPassword"
              :placeholder="t('lock.placeholder')"
              class="lock-input"
              @keyup.enter="handlePasswordSubmit"
              :disabled="authLoading"
              ref="passwordInput"
            />
            <button
              class="lock-btn"
              @click="handlePasswordSubmit"
              :disabled="authLoading"
            >
              <span v-if="!authLoading">{{ t('lock.verify') }}</span>
              <span
                v-else
                class="loading-spinner"
              ></span>
            </button>
          </div>
        </template>

        <!-- 步骤2: 输入TOTP验证码 -->
        <template v-if="authStep === 'totp'">
          <p class="lock-desc">{{ t('lock.totpDesc') }}</p>
          <div class="lock-input-group">
            <input
              type="text"
              v-model="totpCode"
              :placeholder="t('lock.totpPlaceholder')"
              class="lock-input totp-input"
              maxlength="6"
              @keyup.enter="handleTotpSubmit"
              :disabled="authLoading"
              ref="totpInput"
              inputmode="numeric"
              pattern="[0-9]*"
            />
            <button
              class="lock-btn"
              @click="handleTotpSubmit"
              :disabled="authLoading"
            >
              <span v-if="!authLoading">{{ t('lock.verify') }}</span>
              <span
                v-else
                class="loading-spinner"
              ></span>
            </button>
          </div>
          <button
            class="back-btn"
            @click="goBackToPassword"
          >
            <svg
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              stroke-width="2"
              width="16"
              height="16"
            >
              <polyline points="15,18 9,12 15,6" />
            </svg>
            {{ getLang() === 'zh-CN' ? '返回' : 'Back' }}
          </button>
        </template>

        <p
          class="lock-error"
          v-if="authError"
        >
          {{ authError }}
        </p>
      </div>
    </div>

    <!-- 主应用（认证后可见） -->
    <template v-if="isAuthenticated">
      <!-- 导航栏 -->
      <nav class="navbar">
        <div class="nav-content">
          <div class="logo">
            <svg
              class="logo-icon"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              stroke-width="2"
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
            <span class="logo-text"
              >{{ settings.siteTitle || 'Cf-Github-ImgBed' }} <small>{{ t('lock.version') }}</small></span
            >
          </div>
          <div class="nav-actions">
            <button
              class="icon-btn theme-btn"
              @click="toggleTheme"
              :title="theme === 'light' ? t('nav.darkMode') : t('nav.lightMode')"
            >
              <svg
                v-if="theme === 'light'"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                stroke-width="2"
                width="20"
                height="20"
              >
                <path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z" />
              </svg>
              <svg
                v-else
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                stroke-width="2"
                width="20"
                height="20"
              >
                <circle
                  cx="12"
                  cy="12"
                  r="5"
                />
                <line
                  x1="12"
                  y1="1"
                  x2="12"
                  y2="3"
                />
                <line
                  x1="12"
                  y1="21"
                  x2="12"
                  y2="23"
                />
                <line
                  x1="4.22"
                  y1="4.22"
                  x2="5.64"
                  y2="5.64"
                />
                <line
                  x1="18.36"
                  y1="18.36"
                  x2="19.78"
                  y2="19.78"
                />
                <line
                  x1="1"
                  y1="12"
                  x2="3"
                  y2="12"
                />
                <line
                  x1="21"
                  y1="12"
                  x2="23"
                  y2="12"
                />
                <line
                  x1="4.22"
                  y1="19.78"
                  x2="5.64"
                  y2="18.36"
                />
                <line
                  x1="18.36"
                  y1="5.64"
                  x2="19.78"
                  y2="4.22"
                />
              </svg>
            </button>
            <button
              class="icon-btn settings-btn"
              @click="openSettings"
              :title="t('app.settings')"
            >
              <svg
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                stroke-width="2"
                width="20"
                height="20"
              >
                <circle
                  cx="12"
                  cy="12"
                  r="3"
                />
                <path
                  d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1 0 2.83 2 2 0 0 1-2.83 0l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-2 2 2 2 0 0 1-2-2v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 0 1-2.83 0 2 2 0 0 1 0-2.83l.06-.06A1.65 1.65 0 0 0 4.68 15a1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1-2-2 2 2 0 0 1 2-2h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 0 1 0-2.83 2 2 0 0 1 2.83 0l.06.06A1.65 1.65 0 0 0 9 4.68a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 2-2 2 2 0 0 1 2 2v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 0 1 2.83 0 2 2 0 0 1 0 2.83l-.06.06a1.65 1.65 0 0 0-.33 1.82V9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 2 2 2 2 0 0 1-2 2h-.09a1.65 1.65 0 0 0-1.51 1z"
                />
              </svg>
            </button>
            <button
              class="auth-btn logout-btn"
              @click="logout"
            >
              <svg
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                stroke-width="2"
                width="18"
                height="18"
              >
                <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4" />
                <polyline points="16,17 21,12 16,7" />
                <line
                  x1="21"
                  y1="12"
                  x2="9"
                  y2="12"
                />
              </svg>
              {{ t('nav.logout') }}
            </button>
          </div>
        </div>
      </nav>

      <!-- 主内容 -->
      <main class="main-content">
        <!-- 上传区域 -->
        <section class="upload-section">
          <div class="upload-card">
            <div
              class="upload-area"
              @click="openUploadManager"
            >
              <svg
                class="upload-icon"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                stroke-width="2"
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
              <p class="upload-text">{{ t('upload.dropHint') }}</p>
              <p class="upload-hint">{{ t('upload.formatHint') }}</p>
            </div>
          </div>
        </section>

        <!-- 随机图片展示 -->
        <section
          class="random-section"
          v-if="allowRandom"
        >
          <div class="section-header">
            <h2>{{ t('random.title') }}</h2>
            <div class="random-controls">
              <!-- 仓库选择 -->
              <select
                v-model="randomRepoFilter"
                class="random-repo-select"
                v-if="allRepos.length > 0"
              >
                <option value="all">{{ t('gallery.allRepos') }}</option>
                <option
                  v-for="repo in allRepos"
                  :key="repo.id"
                  :value="repo.id"
                >
                  {{ repo.name }}
                </option>
              </select>
              <button
                class="btn btn-primary btn-sm"
                @click="loadRandomImage"
              >
                <svg
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  stroke-width="2"
                  width="16"
                  height="16"
                >
                  <polyline points="23,4 23,10 17,10" />
                  <path d="M20.49 15a9 9 0 1 1-2.12-9.36L23 10" />
                </svg>
                {{ t('random.refresh') }}
              </button>
            </div>
          </div>
          <div
            class="random-image-container"
            v-if="randomImage"
          >
            <img
              :src="randomImage.url"
              :alt="randomImage.name"
              @click="copyToClipboard(randomImage.url)"
            />
            <div class="image-overlay">
              <span>{{ t('common.copy') }}</span>
            </div>
          </div>
          <div
            class="random-placeholder"
            v-else
          >
            <p>{{ t('random.placeholder') }}</p>
          </div>
        </section>

        <!-- 图片列表 -->
        <section class="gallery-section">
          <div class="section-header">
            <h2>{{ t('gallery.title') }}</h2>
            <div class="section-header-right">
              <select
                v-model="repoFilter"
                @change="onRepoFilterChange"
                class="repo-filter-select"
                v-if="(settings.repositories && settings.repositories.length > 1) || allRepos.length > 1"
              >
                <option value="all">{{ t('gallery.allRepos') }}</option>
                <option
                  v-for="repo in allRepos"
                  :key="repo.id"
                  :value="repo.id"
                >
                  {{ repo.name }}
                </option>
              </select>
              <button
                class="btn btn-secondary btn-sm"
                @click="openExport"
                v-if="images.length && hasRepositories"
              >
                <svg
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  stroke-width="2"
                  width="16"
                  height="16"
                >
                  <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
                  <polyline points="7,10 12,15 17,10" />
                  <line
                    x1="12"
                    y1="15"
                    x2="12"
                    y2="3"
                  />
                </svg>
                <span>{{ t('export.title') }}</span>
              </button>
              <span
                class="image-count"
                v-if="images.length && hasRepositories"
                >{{ t('gallery.count', { count: totalImages }) }}</span
              >
            </div>
          </div>

          <!-- 加载动画 -->
          <div
            class="gallery-loading"
            v-if="imagesLoading && !imagesLoaded"
          >
            <div class="loading-spinner-large"></div>
            <p>{{ t('gallery.loading') }}</p>
          </div>

          <div
            class="gallery-placeholder"
            v-else-if="!hasRepositories && isAuthenticated"
          >
            <div class="no-repo-icon">
              <svg
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                stroke-width="2"
                width="48"
                height="48"
              >
                <circle
                  cx="12"
                  cy="12"
                  r="3"
                />
                <path
                  d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1 0 2.83 2 2 0 0 1-2.83 0l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-2 2 2 2 0 0 1-2-2v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 0 1-2.83 0 2 2 0 0 1 0-2.83l.06-.06A1.65 1.65 0 0 0 4.68 15a1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1-2-2 2 2 0 0 1 2-2h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 0 1 0-2.83 2 2 0 0 1 2.83 0l.06.06A1.65 1.65 0 0 0 9 4.68a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 2-2 2 2 0 0 1 2 2v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 0 1 2.83 0 2 2 0 0 1 0 2.83l-.06.06a1.65 1.65 0 0 0-.33 1.82V9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 2 2 2 2 0 0 1-2 2h-.09a1.65 1.65 0 0 0-1.51 1z"
                />
              </svg>
            </div>
            <p>{{ t('settings.repoEmpty') }}</p>
            <p class="no-repo-hint">{{ t('settings.repoEmptyHint') }}</p>
            <button
              class="btn btn-primary btn-sm"
              style="margin-top: 10px"
              @click="openSettings"
            >
              {{ getLang() == 'zh-CN' ? '前往设置' : 'Go to Settings' }}
            </button>
          </div>

          <template v-if="images.length > 0">
            <SearchBar
              @search="onSearch"
              @sort="onSort"
              v-if="searchQuery"
            />

            <div
              class="gallery-grid"
              v-bind="images.length > 0"
            >
              <div
                class="gallery-item"
                v-for="image in images"
                :key="image.name"
                :class="{ selected: isSelected(image) }"
                @click="handleImageClick(image, $event)"
              >
                <span
                  class="repo-badge-mini"
                  v-if="image.repoName && allRepos.length > 1"
                >
                  {{ image.repoName }}
                </span>
                <img
                  :src="image.url"
                  :alt="image.name"
                  loading="lazy"
                />

                <!-- 选择框 -->
                <div
                  class="select-checkbox"
                  @click.stop="toggleSelect(image)"
                >
                  <svg
                    v-if="isSelected(image)"
                    viewBox="0 0 24 24"
                    fill="currentColor"
                    stroke="none"
                    width="20"
                    height="20"
                  >
                    <path
                      d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-2 15l-5-5 1.41-1.41L10 14.17l7.59-7.59L19 8l-9 9z"
                    />
                  </svg>
                  <svg
                    v-else
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    stroke-width="2"
                    width="20"
                    height="20"
                  >
                    <circle
                      cx="12"
                      cy="12"
                      r="10"
                    />
                  </svg>
                </div>

                <!-- 公开/私密标签 -->
                <span
                  class="privacy-badge"
                  :class="image.public ? 'public' : 'private'"
                >
                  {{ image.public ? t('gallery.public') : t('gallery.private') }}
                </span>

                <div class="item-overlay">
                  <button
                    class="overlay-btn"
                    @click.stop="copyToClipboard(image.url)"
                    :title="t('gallery.copyLink')"
                  >
                    <svg
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="currentColor"
                      stroke-width="2"
                      width="16"
                      height="16"
                    >
                      <rect
                        x="9"
                        y="9"
                        width="13"
                        height="13"
                        rx="2"
                        ry="2"
                      />
                      <path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1" />
                    </svg>
                  </button>
                  <button
                    class="overlay-btn"
                    @click.stop="previewImage(image)"
                    :title="t('gallery.preview')"
                  >
                    <svg
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="currentColor"
                      stroke-width="2"
                      width="16"
                      height="16"
                    >
                      <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z" />
                      <circle
                        cx="12"
                        cy="12"
                        r="3"
                      />
                    </svg>
                  </button>
                  <button
                    class="overlay-btn delete-btn"
                    @click.stop="confirmDelete(image)"
                    :title="t('gallery.delete')"
                  >
                    <svg
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="currentColor"
                      stroke-width="2"
                      width="16"
                      height="16"
                    >
                      <polyline points="3,6 5,6 21,6" />
                      <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2" />
                    </svg>
                  </button>
                </div>
              </div>
            </div>
          </template>

          <div
            class="gallery-placeholder"
            v-else-if="hasRepositories && imagesLoaded && images.length === 0"
          >
            <p>{{ t('gallery.noImages') }}</p>
          </div>

          <div
            class="pagination"
            v-if="totalPages > 1 && hasRepositories"
          >
            <button
              class="btn btn-secondary btn-sm"
              @click="changePage(currentPage - 1)"
              :disabled="currentPage <= 1 || pageLoading"
            >
              {{ pageLoading ? t('gallery.loading') : t('gallery.pagePrev') }}
            </button>
            <span class="page-info">{{ t('gallery.pageInfo', { current: currentPage, total: totalPages }) }}</span>
            <button
              class="btn btn-secondary btn-sm"
              @click="changePage(currentPage + 1)"
              :disabled="currentPage >= totalPages || pageLoading"
            >
              {{ pageLoading ? t('gallery.loading') : t('gallery.pageNext') }}
            </button>
          </div>
        </section>
      </main>

      <!-- 图片预览模态框 -->
      <div
        class="modal"
        v-if="previewVisible"
        @click="previewVisible = false"
      >
        <div
          class="modal-content"
          @click.stop
        >
          <img
            :src="previewData.url"
            :alt="previewData.name"
          />
          <div class="modal-actions">
            <a
              :href="previewData.url"
              target="_blank"
              class="btn btn-primary btn-sm"
              >{{ t('gallery.openNew') }}</a
            >
            <button
              class="btn btn-secondary btn-sm"
              @click="copyToClipboard(previewData.url)"
            >
              {{ t('gallery.copyLink') }}
            </button>
            <button
              class="btn btn-secondary btn-sm"
              @click="previewVisible = false"
            >
              {{ t('common.close') }}
            </button>
          </div>
        </div>
      </div>

      <!-- 页脚 -->
      <footer class="footer">
        <p>Cf-Github-ImgBed v2.0 | Powered by Cloudflare Pages & GitHub API</p>
      </footer>
    </template>
  </div>

  <ConfirmDialog ref="confirmDialog" />
  <SettingsPanel
    ref="settingsPanel"
    :authToken="authToken"
    @saved="onSettingsSaved"
  />
  <BatchManager
    v-if="selectedImages.length > 0"
    :selectedCount="selectedImages.length"
    @selectAll="selectAll"
    @deselectAll="deselectAll"
    @setPublic="batchSetPublic"
    @setPrivate="batchSetPrivate"
    @copyLinks="batchCopyLinks"
    @delete="batchDelete"
  />
  <UploadManager
    ref="uploadManager"
    :authToken="authToken"
    :repositories="settings.repositories || []"
    :activeRepository="settings.activeRepository || 'default'"
    :max-retries="settings.maxRetries"
    @upload-complete="onUploadComplete"
    @edit-image="onEditImage"
  />
  <ImageEditor
    ref="imageEditor"
    @processed="onImageProcessed"
    @close="onEditorClose"
  />
  <ExportDialog ref="exportDialog" />
</template>

<script setup>
  import { ref, computed, onMounted, onBeforeUnmount, nextTick } from 'vue';
  import { showToast, showLoading, showLoadingWithUpdate } from './components/Toast.js';
  import {
    fetchImages,
    deleteImage,
    fetchPublicKey,
    verifyAuth,
    verifyLogin,
    logoutSession,
    batchSetVisibility,
    fetchRandom,
  } from './core/api.js';
  import { encryptPassword } from './utils/crypto.js';
  import { getSettings, getCachedSettings, getImageUrl } from './core/settings.js';
  import UploadManager from './components/UploadManager.vue';
  import ConfirmDialog from './components/ConfirmDialog.vue';
  import SettingsPanel from './components/SettingsPanel.vue';
  import { getDefaultSettings } from './utils/defaults.js';
  import SearchBar from './components/SearchBar.vue';
  import BatchManager from './components/BatchManager.vue';
  import ImageEditor from './components/ImageEditor.vue';
  import ExportDialog from './components/ExportDialog.vue';
  import { readImageFromClipboard } from './utils/clipboard.js';
  import { t, getLang } from './utils/i18n.js';
  import { applyTheme } from './utils/theme.js';

  // TODO: 配合API返回的Error类型，展示错误信息

  // ==========================================
  // 响应式数据
  // ==========================================

  // 主题
  const theme = ref('light');

  // 图片列表相关
  const imagesLoading = ref(false);
  const imagesLoaded = ref(false);

  // 设置
  const settings = ref(getDefaultSettings());
  const activeRepoId = ref('default');
  const repoFilter = ref('all');

  // 认证状态
  const isAuthenticated = ref(false);
  const randomRepoFilter = ref('all');
  const authToken = ref(null);
  const authPassword = ref('');
  const authLoading = ref(false);
  const authError = ref('');
  const publicKey = ref(null);

  const authStep = ref('password');
  const totpCode = ref('');
  const tempEncryptedPassword = ref('');

  // 随机图片 API 开关
  const allowRandom = ref(false);

  // 随机图片
  const randomImage = ref(null);

  // 图片列表
  const images = ref([]);
  const currentPage = ref(1);
  const totalPages = ref(1);
  const totalImages = ref(0);

  const uploadVisible = ref(false);

  // 预览
  const previewVisible = ref(false);
  const previewData = ref(null);

  const pageLoading = ref(false);

  const allImages = ref([]);
  const searchQuery = ref('');
  const sortBy = ref('date');
  const sortOrder = ref('desc');
  const selectedImages = ref([]);

  // refs
  const passwordInput = ref(null);
  const totpInput = ref(null);
  const confirmDialog = ref(null);
  const settingsPanel = ref(null);
  const uploadManager = ref(null);
  const imageEditor = ref(null);
  const exportDialog = ref(null);

  // ==========================================
  // 计算属性
  // ==========================================

  const allRepos = computed(() => {
    return settings.value.repositories || [];
  });

  const hasRepositories = computed(() => {
    const repos = settings.value.repositories || [];
    return repos.some((r) => r.owner && r.repo);
  });

  // ==========================================
  // 方法 - 认证相关
  // ==========================================

  const checkLoginStatus = async () => {
    const token = sessionStorage.getItem('authToken');
    if (!token) return false;

    const authResult = await verifyLogin(token);
    if (authResult.valid) {
      isAuthenticated.value = true;
      authToken.value = token;
      return true;
    } else {
      sessionStorage.removeItem('authToken');
      isAuthenticated.value = false;
      authToken.value = '';

      showToast(t('common.unauthorized'), 'warning');
      return false;
    }
  };

  const handlePasswordSubmit = async () => {
    if (!authPassword.value) {
      authError.value = t('lock.passwordError');
      return;
    }
    authLoading.value = true;
    authError.value = '';

    try {
      if (!publicKey.value) await loadPublicKey();
      if (!publicKey.value) throw new Error(t('lock.missingKey'));

      const encrypted = await encryptPassword(authPassword.value, publicKey.value);
      const res = await verifyAuth(encrypted);

      if (res.valid) {
        if (res.totpRequired) {
          tempEncryptedPassword.value = encrypted;
          authStep.value = 'totp';
          authPassword.value = '';
          authError.value = '';
          nextTick(() => totpInput.value?.focus());
        } else {
          await completeAuth(res.token);
        }
      } else {
        authError.value = res.error ? t(`api.${res.error}`) : t('lock.passwordError');
        showToast(authError.value, 'error');
      }
    } catch (err) {
      authError.value = t('lock.authFailed') + ': ' + t(`api.${err.message}`);
      showToast(t('lock.authFailed'), 'error');
    } finally {
      authLoading.value = false;
    }
  };

  const handleTotpSubmit = async () => {
    if (!totpCode.value || totpCode.value.length !== 6) {
      authError.value = t('lock.totpError');
      return;
    }
    authLoading.value = true;
    authError.value = '';

    try {
      const res = await verifyAuth(tempEncryptedPassword.value, totpCode.value);
      if (res.valid && res.token) {
        tempEncryptedPassword.value = '';
        await completeAuth(res.token);
      } else {
        authError.value = t('lock.totpError');
        showToast(t('lock.totpError'), 'error');
      }
    } catch (err) {
      authError.value = t('lock.authFailed') + ': ' + t(`api.${err.message}`);
      showToast(t('lock.authFailed'), 'error');
    } finally {
      authLoading.value = false;
    }
  };

  const completeAuth = async (token) => {
    authToken.value = token;
    isAuthenticated.value = true;
    authPassword.value = '';
    totpCode.value = '';
    tempEncryptedPassword.value = '';
    authStep.value = 'password';
    authError.value = '';

    sessionStorage.setItem('authToken', token);
    showToast(t('lock.welcome'), 'success');

    await loadSettings();
    await loadAllImages();
    loadImages(1);
  };

  const goBackToPassword = () => {
    authStep.value = 'password';
    authPassword.value = '';
    totpCode.value = '';
    tempEncryptedPassword.value = '';
    authError.value = '';
  };

  const loadPublicKey = async () => {
    try {
      const data = await fetchPublicKey();
      publicKey.value = data.publicKey;
      allowRandom.value = data.allowRandom !== undefined ? data.allowRandom : false;
    } catch (err) {
      console.error('获取公钥失败', err);
      showToast(t('lock.missingKey'), 'error');
    }
  };

  const logout = () => {
    logoutSession().catch((error) => console.error('清除预览会话失败:', error));
    isAuthenticated.value = false;
    authToken.value = null;
    sessionStorage.removeItem('authToken');
    localStorage.removeItem('authToken');
    images.value = [];
    randomImage.value = null;
    selectedImages.value = [];
    showToast(t('nav.logout'), 'info');
  };

  // ==========================================
  // 方法 - 设置相关
  // ==========================================

  const loadSettings = async () => {
    try {
      settings.value = { ...settings.value, ...(await getSettings(authToken.value)) };
    } catch (err) {
      console.error('加载设置失败，使用缓存或默认设置:', err);
      const cached = getCachedSettings();
      settings.value = {
        ...settings.value,
        ...cached,
        repositories: Array.isArray(cached.repositories) ? cached.repositories : [],
      };
    }
  };

  const openSettings = () => {
    settingsPanel.value.open();
  };

  const onSettingsSaved = async (newSettings) => {
    settings.value = {
      ...settings.value,
      ...newSettings,
      repositories: Array.isArray(newSettings.repositories)
        ? newSettings.repositories
        : settings.value.repositories || [],
    };
    document.title = `${settings.value.siteTitle} - ${settings.value.siteSubtitle}` || 'Cf-Github-ImgBed';


    if (newSettings.activeRepository) {
      activeRepoId.value = newSettings.activeRepository;
    }

    allowRandom.value = newSettings.allowRandom;

    await refreshImages();

    if (isAuthenticated.value) {
      allImages.value = allImages.value.map((img) => ({
        ...img,
        url: getImageUrl(settings.value, img.name, img.repoId || 'default', img.public),
      }));
      loadImages(currentPage.value);
    }
  };

  // ==========================================
  // 方法 - 主题相关
  // ==========================================

  const detectTheme = () => {
    const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
    const savedTheme = localStorage.getItem('theme');
    theme.value = savedTheme || (prefersDark ? 'dark' : 'light');
    applyThemeToDOM();

    window.matchMedia('(prefers-color-scheme: dark)').addEventListener('change', (e) => {
      if (!localStorage.getItem('theme')) {
        theme.value = e.matches ? 'dark' : 'light';
        applyThemeToDOM();
      }
    });
  };

  const toggleTheme = () => {
    theme.value = theme.value === 'light' ? 'dark' : 'light';
    localStorage.setItem('theme', theme.value);
    applyThemeToDOM();
  };

  const applyThemeToDOM = () => {
    document.documentElement.className = theme.value;
    document.documentElement.setAttribute('data-theme', theme.value);
  };

  // ==========================================
  // 方法 - 图片列表相关
  // ==========================================

  const onRepoFilterChange = () => {
    currentPage.value = 1;

    if (repoFilter.value !== 'all') {
      const hasRepoImages = allImages.value.some((img) => (img.repoId || 'default') === repoFilter.value);

      if (!hasRepoImages) {
        const closeLoading = showLoading(t('common.loading'));
        (async () => {
          try {
            await loadAllImages();
          } finally {
            closeLoading();
          }
        })();
      }
    }

    loadImages(1);
  };

  const onSearch = (query) => {
    searchQuery.value = query;
    loadImages(1);
  };

  const onSort = ({ by, order }) => {
    sortBy.value = by;
    sortOrder.value = order;
    loadImages(1);
  };

  const loadRandomImage = async () => {
    try {
      let parameter = '';
      if (randomRepoFilter.value && randomRepoFilter.value !== 'all') {
        parameter = `?repoId=${randomRepoFilter.value}`;
      }

      const data = await fetchRandom(parameter);

      if (data && data.name) {
        randomImage.value = { url: getImageUrl(settings.value, data.name, data.repoId, true) };
      }
    } catch (err) {
      showToast(`${t('random.fetchFailed')}: ${t(`api.${err.message}`)}`, 'error');
    }
  };

  const loadImages = (page = 1) => {
    const filteredImages = getFilteredAndSortedImages();
    const pageSize = settings.value.pageSize || 20;

    totalImages.value = filteredImages.length;
    totalPages.value = Math.ceil(totalImages.value / pageSize) || 1;

    const validPage = Math.max(1, Math.min(page, totalPages.value));
    currentPage.value = validPage;

    const start = (validPage - 1) * pageSize;
    images.value = filteredImages.slice(start, start + pageSize);
  };

  const loadAllImages = async () => {
    try {
      imagesLoading.value = true;
      imagesLoaded.value = false;
      const data = await fetchImages(authToken.value);

      allImages.value = (data.images || []).map((img) => {
        const repoId = img.repoId || 'default';
        const repoName = img.repoName || '';

        return {
          ...img,
          repoId: repoId,
          repoName: repoName,
          url: getImageUrl(settings.value, img.name, repoId, img.public),
          rawUrl: img.url,
        };
      });

      totalImages.value = allImages.value.length;
      imagesLoading.value = false;
      imagesLoaded.value = true;
    } catch (err) {
      console.error('加载图片列表失败:', err);
      showToast(`${t('gallery.loadFailed')}: ${t(`api.${err.message}`)}`, 'error');
      allImages.value = [];
    }
  };

  const refreshImages = async () => {
    imagesLoading.value = true;
    imagesLoaded.value = false;
    const closeLoading = showLoading(t('gallery.refreshing'));
    try {
      await loadAllImages();
      loadImages(currentPage.value);
      imagesLoading.value = false;
      imagesLoaded.value = true;
    } finally {
      closeLoading();
    }
  };

  const getFilteredAndSortedImages = () => {
    let filtered = [...allImages.value];

    if (repoFilter.value && repoFilter.value !== 'all') {
      filtered = filtered.filter((img) => {
        const imgRepoId = img.repoId || 'default';
        return imgRepoId === repoFilter.value;
      });
    }

    if (searchQuery.value) {
      const query = searchQuery.value.toLowerCase();
      filtered = filtered.filter((img) => img.name.toLowerCase().includes(query));
    }

    filtered.sort((a, b) => {
      let comparison = 0;
      switch (sortBy.value) {
        case 'name':
          comparison = a.name.localeCompare(b.name);
          break;
        case 'size':
          comparison = (a.size || 0) - (b.size || 0);
          break;
        case 'date':
        default:
          const getTimestamp = (name) => {
            const match = name.match(/^(\d+)-/);
            return match ? parseInt(match[1]) : 0;
          };
          comparison = getTimestamp(a.name) - getTimestamp(b.name);
          break;
      }
      return sortOrder.value === 'asc' ? comparison : -comparison;
    });

    return filtered;
  };

  const changePage = async (page) => {
    if (page < 1 || page > totalPages.value || pageLoading.value) return;

    pageLoading.value = true;
    const closeLoading = showLoading(t('gallery.loading'));

    try {
      loadImages(page);
    } finally {
      closeLoading();
      pageLoading.value = false;
    }

    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  // ==========================================
  // 方法 - 批量选择相关
  // ==========================================

  const isSelected = (image) => {
    return selectedImages.value.some((s) => s.name === image.name);
  };

  const toggleSelect = (image) => {
    const index = selectedImages.value.findIndex((s) => s.name === image.name);
    if (index >= 0) {
      selectedImages.value.splice(index, 1);
    } else {
      selectedImages.value.push(image);
    }
  };

  const handleImageClick = (image, event) => {
    if (event.target.closest('button') || event.target.closest('.select-checkbox')) {
      return;
    }
    if (event.ctrlKey || event.metaKey || selectedImages.value.length > 0) {
      toggleSelect(image);
    } else {
      previewImage(image);
    }
  };

  const selectAll = () => {
    selectedImages.value = [...images.value];
  };

  const deselectAll = () => {
    selectedImages.value = [];
  };

  const batchSetPublic = async () => {
    await batchChangeVisibility(true);
  };

  const batchSetPrivate = async () => {
    await batchChangeVisibility(false);
  };

  const batchChangeVisibility = async (isPublic) => {
    const count = selectedImages.value.length;
    const actionText = isPublic ? t('batch.setPublic') : t('batch.setPrivate');

    try {
      const confirmed = await showConfirm({
        title: t('batch.visibilityTitle', { action: actionText }),
        message: t('batch.visibilityMessage', {
          count,
          action: actionText,
        }),
        type: 'info',
        confirmText: t('common.confirm'),
        cancelText: t('common.cancel'),
      });

      if (!confirmed) return;

      const closeLoading = showLoading(t('common.inTheProgress', { action: actionText }));

      try {
        const filesList = [
          ...selectedImages.value.map((img) => {
            return {
              name: img.name,
              repoId: img.repoId,
            };
          }),
        ];
        const result = await batchSetVisibility(filesList, isPublic, authToken.value);

        closeLoading();

        const successCount = result.results?.success?.length || 0;
        const failedCount = result.results?.failed?.length || 0;

        if (successCount > 0 && failedCount === 0) {
          showToast(
            t('batch.visibilitySuccess', {
              count: successCount,
              action: actionText,
            }),
            'success',
          );
        } else if (successCount > 0) {
          showToast(
            t('batch.visibilityPartial', {
              action: actionText,
              success: successCount,
              fail: failedCount,
            }),
            'warning',
          );
        } else {
          showToast(t('batch.visibilityFailed', { action: actionText }), 'error');
        }

        const filenames = filesList.map((f) => f.name);

        allImages.value = allImages.value.map((img) => {
          if (filenames.includes(img.name)) {
            return { ...img, public: isPublic };
          }
          return img;
        });

        images.value = images.value.map((img) => {
          if (filenames.includes(img.name)) {
            return { ...img, public: isPublic };
          }
          return img;
        });

        selectedImages.value = selectedImages.value.map((img) => ({
          ...img,
          public: isPublic,
        }));
      } catch (err) {
        closeLoading();
        showToast(`${t('batch.visibilityFailed', { action: actionText })}: ${err.message}`, 'error');
      }
    } catch (err) {
      showToast(t('common.operationCanceled'), 'info');
    }
  };

  const batchCopyLinks = () => {
    const links = selectedImages.value.map((img) => img.url).join('\n');
    navigator.clipboard
      .writeText(links)
      .then(() => {
        showToast(t('common.copied'), 'success');
      })
      .catch(() => {
        showToast(t('common.copyFailed'), 'error');
      });
  };

  const batchDelete = async () => {
    const count = ref(selectedImages.value.length);
    try {
      const confirmed = await showConfirm({
        title: t('delete.batchTitle'),
        message: t('delete.batchMessage', { count: count.value }),
        type: 'danger',
        confirmText: t('delete.confirm'),
        cancelText: t('delete.cancel'),
      });

      if (confirmed) {
        const deletedCount = ref(0);
        const loading = showLoadingWithUpdate(`${t('delete.deleting')} - ${deletedCount.value}/${count.value}`);

        for (const image of selectedImages.value) {
          try {
            await deleteImage(image.name, image.repoId, authToken.value);
            deletedCount.value++;
            loading.update(`${t('delete.deleting')} - ${deletedCount.value}/${count.value}`);
          } catch (err) {
            console.error('删除失败:', image.name, err);
          }
        }
        showToast(t('batch.deleteSuccess', { count: deletedCount.value }), 'success');
        loading.close();

        const deletedNames = selectedImages.value.map((img) => img.name);
        allImages.value = allImages.value.filter((img) => !deletedNames.includes(img.name));
        selectedImages.value = [];
        loadImages(currentPage.value);
      }
    } catch (err) {
      showToast(`${t('common.error')}: ${t(`api.${err.message}`)}`, 'error');
    }
  };

  // ==========================================
  // 方法 - 预览和操作
  // ==========================================

  const previewImage = (image) => {
    previewData.value = {
      ...image,
      url: image.url || getImageUrl(settings.value, image.name, image.repoId, image.public),
    };
    previewVisible.value = true;
  };

  const confirmDelete = async (image) => {
    try {
      const confirmed = await showConfirm({
        title: t('delete.title'),
        message: t('delete.message', { name: image.name }),
        type: 'danger',
        confirmText: t('delete.confirm'),
        cancelText: t('delete.cancel'),
      });

      if (confirmed) {
        const closeLoading = showLoading(t('delete.deleting'));
        try {
          await deleteImage(image.name, image.repoId, authToken.value);
          closeLoading();
          showToast(t('delete.success'), 'success');

          allImages.value = allImages.value.filter((img) => img.name !== image.name);
          loadImages(currentPage.value);

          if (images.value.length === 0 && currentPage.value > 1) {
            loadImages(currentPage.value - 1);
          }
        } catch (err) {
          closeLoading();
          showToast(err.message || t('delete.failed'), 'error');
        }
      }
    } catch (err) {
      showToast(`${t('common.error')}: ${t(`api.${err.message}`)}`, 'error');
    }
  };

  const copyToClipboard = (text) => {
    const url = text.startsWith('/') ? window.location.origin + text : text;

    navigator.clipboard
      .writeText(url)
      .then(() => {
        showToast(t('common.copied'), 'success');
      })
      .catch(() => {
        const textarea = document.createElement('textarea');
        textarea.value = url;
        textarea.style.position = 'fixed';
        textarea.style.opacity = '0';
        document.body.appendChild(textarea);
        textarea.select();
        try {
          document.execCommand('copy');
          showToast(t('common.copied'), 'success');
        } catch (e) {
          showToast(t('common.copyFailed'), 'error');
        }
        document.body.removeChild(textarea);
      });
  };

  // ==========================================
  // 方法 - 上传管理器相关
  // ==========================================

  const openUploadManager = () => {
    if (!isAuthenticated.value) {
      showToast(t('common.loginFirst'), 'warning');
      return;
    }
    if (!hasRepositories.value) {
      showToast(t('settings.repoEmpty'), 'warning');
      openSettings();
      return;
    }
    uploadManager.value.open();
  };

  const onUploadComplete = async () => {
    await refreshImages();
    loadImages(currentPage.value);
  };

  const onEditImage = (file) => {
    if (uploadManager.value) {
      uploadVisible.value = uploadManager.value.showModal;
      uploadManager.value.showModal = false;
      uploadManager.value.showMinimized = false;
    }
    if (imageEditor.value) {
      imageEditor.value.open(file);
    }
  };

  const onEditorClose = () => {
    if (uploadManager.value && uploadVisible.value) {
      uploadManager.value.showModal = true;
    }
  };

  const onImageProcessed = (processedFile) => {
    if (uploadManager.value) {
      uploadManager.value.showModal = true;
      uploadManager.value.addFiles([processedFile]);
    }
  };

  // ==========================================
  // 方法 - 其他
  // ==========================================

  const showConfirm = async (options) => {
    try {
      const confirmed = await confirmDialog.value.show(options);
      return confirmed;
    } catch (err) {
      return false;
    }
  };

  const onPaste = async (e) => {
    const image = await readImageFromClipboard();
    if (image && uploadManager.value) {
      uploadManager.value.open();
      uploadManager.value.addFiles([image]);
    }
  };

  const openExport = () => {
    exportDialog.value.open(images.value);
  };

  // ==========================================
  // 生命周期
  // ==========================================

  onMounted(async () => {
    localStorage.removeItem('authToken');
    localStorage.removeItem('totpSecret');
    localStorage.removeItem('totpEnabled');
    detectTheme();
    applyThemeToDOM();
    applyTheme();

    if (!settings.value.repositories) {
      settings.value.repositories = [];
    }

    activeRepoId.value = settings.value.activeRepository || 'default';
    repoFilter.value = 'all';

    await loadPublicKey();
    const loginStatus = await checkLoginStatus();

    if (!loginStatus) return;

    await loadSettings();
    await loadAllImages();
    loadImages(1);

    document.title = `${settings.value.siteTitle} - ${settings.value.siteSubtitle}` || 'Cf-Github-ImgBed';
    document.addEventListener('paste', onPaste);
  });

  onBeforeUnmount(() => {
    document.removeEventListener('paste', onPaste);
  });
</script>

<style scoped>
  /* ==========================================
     PART 1: 全局动画 & 基础工具类
     ========================================== */
  @keyframes fadeIn {
    from {
      opacity: 0;
    }
    to {
      opacity: 1;
    }
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

  @keyframes spin {
    to {
      transform: rotate(360deg);
    }
  }

  .loading-spinner {
    display: inline-block;
    width: 20px;
    height: 20px;
    border: 2px solid rgba(255, 255, 255, 0.3);
    border-top-color: white;
    border-radius: 50%;
    animation: spin 0.6s linear infinite;
  }

  .loading-spinner-large {
    width: 48px;
    height: 48px;
    border: 4px solid var(--border-color);
    border-top-color: var(--blue-500);
    border-radius: 50%;
    animation: spin 0.8s linear infinite;
  }

  /* ==========================================
     PART 2: 布局结构 (App Container, Navbar, Main, Footer)
     ========================================== */
  .app-container {
    min-height: 100vh;
    display: flex;
    flex-direction: column;
    background: var(--bg-secondary);
    transition: background-color var(--transition);
  }

  .main-content {
    max-width: 1200px;
    width: 100%;
    margin: 0 auto;
    padding: 2rem 1.5rem;
    flex: 1;
  }

  .footer {
    text-align: center;
    padding: 1.5rem;
    color: var(--text-tertiary);
    font-size: 0.875rem;
    border-top: 1px solid var(--border-color);
    background: var(--bg-primary);
  }

  /* ==========================================
     PART 3: 导航栏 (Navbar)
     ========================================== */
  .navbar {
    background: var(--bg-primary);
    border-bottom: 1px solid var(--border-color);
    position: sticky;
    top: 0;
    z-index: 100;
    backdrop-filter: blur(10px);
    box-shadow: var(--shadow-sm);
  }

  .nav-content {
    max-width: 1200px;
    margin: 0 auto;
    padding: 0.75rem 1.5rem;
    display: flex;
    justify-content: space-between;
    align-items: center;
  }

  .logo {
    display: flex;
    align-items: center;
    gap: 0.5rem;
  }

  .logo-icon {
    width: 28px;
    height: 28px;
    color: var(--blue-500);
  }

  .logo-text {
    font-size: 1.25rem;
    font-weight: 700;
    color: var(--text-primary);
    letter-spacing: -0.025em;
  }

  .logo-text small {
    font-size: 0.75rem;
    color: var(--blue-500);
    font-weight: 500;
  }

  .nav-actions {
    display: flex;
    gap: 0.75rem;
    align-items: center;
  }

  /* ==========================================
     PART 4: 按钮系统 (Button System)
     ========================================== */
  .btn {
    padding: 0.625rem 1.25rem;
    border-radius: var(--radius-md);
    font-size: 0.875rem;
    font-weight: 500;
    cursor: pointer;
    border: none;
    transition: all var(--transition);
    display: inline-flex;
    align-items: center;
    gap: 0.375rem;
  }

  .btn:disabled {
    opacity: 0.6;
    cursor: not-allowed;
  }

  .btn-sm {
    padding: 0.375rem 0.75rem;
    font-size: 0.8125rem;
  }

  .btn-primary {
    background: var(--blue-500);
    color: white;
  }

  .btn-primary:hover:not(:disabled) {
    background: var(--blue-600);
    transform: translateY(-1px);
    box-shadow: var(--shadow-md);
  }

  .btn-secondary {
    background: var(--bg-tertiary);
    color: var(--text-secondary);
    border: 1px solid var(--border-color);
  }

  .btn-secondary:hover:not(:disabled) {
    background: var(--bg-secondary);
    border-color: var(--blue-300);
    color: var(--blue-600);
  }

  .icon-btn,
  .theme-btn {
    background: var(--bg-tertiary);
    border: 1px solid var(--border-color);
    border-radius: var(--radius-md);
    padding: 0.5rem;
    cursor: pointer;
    color: var(--text-secondary);
    transition: all var(--transition);
    display: flex;
    align-items: center;
  }

  .icon-btn:hover,
  .theme-btn:hover {
    background: var(--blue-100);
    color: var(--blue-600);
    border-color: var(--blue-300);
  }

  [data-theme='dark'] .icon-btn:hover {
    background: rgba(59, 130, 246, 0.15);
  }

  .auth-btn {
    padding: 0.5rem 1rem;
    border-radius: var(--radius-md);
    font-size: 0.875rem;
    font-weight: 500;
    cursor: pointer;
    border: none;
    display: flex;
    align-items: center;
    gap: 0.5rem;
  }

  .logout-btn {
    background: var(--bg-tertiary);
    color: var(--text-secondary);
    border: 1px solid var(--border-color);
  }

  .logout-btn:hover {
    background: #fee2e2;
    color: #dc2626;
    border-color: #fca5a5;
  }

  /* ==========================================
     PART 5: 密码锁屏模块 (Lock Screen)
     ========================================== */
  .lock-screen {
    position: fixed;
    top: 0;
    left: 0;
    right: 0;
    bottom: 0;
    background: var(--bg-secondary);
    display: flex;
    align-items: center;
    justify-content: center;
    z-index: 999;
    animation: fadeIn 0.5s ease;
  }

  .lock-card {
    background: var(--bg-primary);
    border-radius: var(--radius-xl);
    padding: 3rem 2rem;
    text-align: center;
    box-shadow: var(--shadow-lg);
    border: 1px solid var(--border-color);
    max-width: 400px;
    width: 90%;
    animation: slideUp 0.5s ease;
  }

  .lock-icon {
    width: 64px;
    height: 64px;
    margin: 0 auto 1.5rem;
    color: var(--blue-500);
  }

  .lock-icon svg {
    width: 100%;
    height: 100%;
  }

  .lock-title {
    font-size: 1.5rem;
    font-weight: 700;
    color: var(--text-primary);
    margin-bottom: 0.25rem;
  }

  .lock-version {
    font-size: 0.875rem;
    color: var(--blue-500);
    font-weight: 500;
    margin-bottom: 1.5rem;
  }

  .lock-desc {
    font-size: 0.9375rem;
    color: var(--text-secondary);
    margin-bottom: 1.5rem;
  }

  .lock-input-group {
    display: flex;
    gap: 0.5rem;
    margin-bottom: 1rem;
  }

  .lock-input {
    flex: 1;
    padding: 0.75rem 1rem;
    border: 2px solid var(--border-color);
    border-radius: var(--radius-md);
    font-size: 1rem;
    background: var(--bg-secondary);
    color: var(--text-primary);
    outline: none;
    transition: border-color var(--transition);
  }

  .lock-input:focus {
    border-color: var(--blue-400);
  }

  .lock-input:disabled {
    opacity: 0.6;
  }

  .lock-btn {
    padding: 0.75rem 1.5rem;
    background: var(--blue-500);
    color: white;
    border: none;
    border-radius: var(--radius-md);
    font-weight: 500;
    cursor: pointer;
    min-width: 80px;
    display: flex;
    align-items: center;
    justify-content: center;
  }

  .lock-btn:hover:not(:disabled) {
    background: var(--blue-600);
  }

  .lock-btn:disabled {
    opacity: 0.7;
    cursor: not-allowed;
  }

  .back-btn {
    display: inline-flex;
    align-items: center;
    gap: 0.25rem;
    background: none;
    border: 1px solid var(--border-color);
    border-radius: var(--radius-md);
    color: var(--text-secondary);
    cursor: pointer;
    font-size: 0.8125rem;
    padding: 0.375rem 0.75rem;
    margin-top: 0.75rem;
  }

  .back-btn:hover {
    background: var(--bg-tertiary);
    color: var(--text-primary);
    border-color: var(--text-tertiary);
  }

  .lock-error {
    color: #dc2626;
    font-size: 0.875rem;
    margin-bottom: 0.5rem;
  }

  /* ==========================================
     PART 6: 上传区域 (Upload Section)
     ========================================== */
  .upload-section {
    margin-bottom: 2rem;
  }

  .upload-card {
    background: var(--bg-primary);
    border-radius: var(--radius-xl);
    padding: 2rem;
    box-shadow: var(--shadow-md);
    border: 1px solid var(--border-color);
    transition: all var(--transition);
  }

  .upload-area {
    border: 2px dashed var(--border-color);
    border-radius: var(--radius-lg);
    padding: 3rem 2rem;
    text-align: center;
    cursor: pointer;
    transition: all var(--transition);
  }

  .upload-area:hover {
    border-color: var(--blue-400);
    background: var(--blue-50);
  }

  [data-theme='dark'] .upload-area:hover {
    background: rgba(59, 130, 246, 0.1);
  }

  .upload-icon {
    width: 48px;
    height: 48px;
    color: var(--blue-400);
    margin-bottom: 1rem;
  }

  .upload-text {
    font-size: 1.125rem;
    font-weight: 500;
    color: var(--text-primary);
    margin-bottom: 0.5rem;
  }

  .upload-hint {
    font-size: 0.875rem;
    color: var(--text-tertiary);
  }

  /* ==========================================
     PART 7: 随机图片展示 (Random Image)
     ========================================== */
  .random-section {
    margin-bottom: 2rem;
  }

  .random-controls {
    display: flex;
    align-items: center;
    gap: 0.5rem;
  }

  .random-repo-select {
    padding: 0.375rem 0.75rem;
    border: 2px solid var(--border-color);
    border-radius: var(--radius-md);
    font-size: 0.8125rem;
    background: var(--bg-primary);
    color: var(--text-primary);
    outline: none;
    cursor: pointer;
  }

  .random-repo-select:focus {
    border-color: var(--blue-400);
  }

  .random-image-container {
    position: relative;
    border-radius: var(--radius-xl);
    overflow: hidden;
    background: var(--bg-primary);
    box-shadow: var(--shadow-md);
    cursor: pointer;
    border: 1px solid var(--border-color);
  }

  .random-image-container img {
    width: 100%;
    max-height: 400px;
    object-fit: contain;
    display: block;
  }

  .random-image-container:hover .image-overlay {
    opacity: 1;
  }

  .image-overlay {
    position: absolute;
    bottom: 0;
    left: 0;
    right: 0;
    background: linear-gradient(transparent, rgba(0, 0, 0, 0.7));
    color: white;
    padding: 1.5rem 1rem 0.75rem;
    text-align: center;
    font-size: 0.875rem;
    opacity: 0;
    transition: opacity var(--transition);
  }

  .random-placeholder {
    background: var(--bg-primary);
    border-radius: var(--radius-xl);
    padding: 3rem;
    text-align: center;
    color: var(--text-tertiary);
    border: 1px solid var(--border-color);
  }

  /* ==========================================
     PART 8: 图片画廊 (Gallery)
     ========================================== */
  .gallery-section {
    margin-bottom: 2rem;
  }

  .section-header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    margin-bottom: 1rem;
  }

  .section-header h2 {
    color: var(--text-primary);
    font-size: 1.25rem;
    font-weight: 600;
  }

  .section-header-right {
    display: flex;
    align-items: center;
    gap: 0.75rem;
  }

  .repo-filter-select {
    padding: 0.375rem 0.75rem;
    border: 2px solid var(--border-color);
    border-radius: var(--radius-md);
    font-size: 0.8125rem;
    background: var(--bg-primary);
    color: var(--text-primary);
    outline: none;
    cursor: pointer;
  }

  .repo-filter-select:focus {
    border-color: var(--blue-400);
  }

  .image-count {
    font-size: 0.875rem;
    color: var(--text-tertiary);
  }

  .gallery-loading {
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    padding: 4rem 2rem;
    gap: 1rem;
  }

  .gallery-loading p {
    font-size: 0.9375rem;
    color: var(--text-secondary);
  }

  .gallery-grid {
    display: grid;
    grid-template-columns: repeat(auto-fill, minmax(200px, 1fr));
    gap: 1rem;
  }

  .gallery-item {
    position: relative;
    border-radius: var(--radius-lg);
    overflow: hidden;
    background: var(--bg-primary);
    aspect-ratio: 1;
    cursor: pointer;
    border: 1px solid var(--border-color);
    box-shadow: var(--shadow-sm);
    transition: all var(--transition);
  }

  .gallery-item:hover {
    transform: translateY(-4px);
    box-shadow: var(--shadow-lg);
    border-color: var(--blue-300);
  }

  .gallery-item img {
    width: 100%;
    height: 100%;
    object-fit: cover;
    transition: transform var(--transition);
  }

  .gallery-item:hover img {
    transform: scale(1.05);
  }

  .gallery-item.selected {
    border-color: var(--blue-500) !important;
    box-shadow:
      0 0 0 3px rgba(59, 130, 246, 0.3),
      var(--shadow-md);
    transform: translateY(-2px);
  }

  .gallery-item.selected::after {
    content: '';
    position: absolute;
    top: 0;
    left: 0;
    right: 0;
    bottom: 0;
    background: rgba(59, 130, 246, 0.08);
    border-radius: var(--radius-lg);
    pointer-events: none;
    z-index: 1;
  }

  .gallery-placeholder {
    background: var(--bg-primary);
    border-radius: var(--radius-xl);
    padding: 3rem;
    text-align: center;
    color: var(--text-tertiary);
    border: 1px solid var(--border-color);
  }

  .no-repo-icon {
    width: 64px;
    height: 64px;
    margin: 0 auto 1rem;
    color: var(--text-tertiary);
  }

  .no-repo-hint {
    font-size: 0.8125rem;
    margin-top: 0.5rem;
  }

  .pagination {
    display: flex;
    justify-content: center;
    align-items: center;
    gap: 1rem;
    margin-top: 1.5rem;
  }

  .page-info {
    font-size: 0.875rem;
    color: var(--text-secondary);
  }

  /* ==========================================
     PART 9: 图片项目内的徽章、覆盖层、选择框
     ========================================== */
  .repo-badge-mini {
    position: absolute;
    top: 0.5rem;
    right: 0.5rem;
    z-index: 2;
    font-size: 0.6rem;
    padding: 0.125rem 0.4rem;
    background: rgba(99, 102, 241, 0.8);
    color: white;
    border-radius: 999px;
    font-weight: 500;
    backdrop-filter: blur(4px);
  }

  .privacy-badge {
    position: absolute;
    bottom: 0.5rem;
    left: 0.5rem;
    padding: 0.25rem 0.5rem;
    border-radius: var(--radius-sm);
    font-size: 0.75rem;
    font-weight: 500;
    backdrop-filter: blur(4px);
    z-index: 2;
  }

  .privacy-badge.public {
    background: rgba(34, 197, 94, 0.8);
    color: white;
  }

  .privacy-badge.private {
    background: rgba(100, 116, 139, 0.8);
    color: white;
  }

  .item-overlay {
    position: absolute;
    top: 0.5rem;
    right: 0.5rem;
    display: flex;
    gap: 0.375rem;
    opacity: 0;
    transition: opacity var(--transition);
    z-index: 3;
  }

  .gallery-item:hover .item-overlay {
    opacity: 1;
  }

  .overlay-btn {
    width: 32px;
    height: 32px;
    border-radius: var(--radius-sm);
    background: rgba(0, 0, 0, 0.6);
    border: none;
    color: white;
    cursor: pointer;
    display: flex;
    align-items: center;
    justify-content: center;
    backdrop-filter: blur(4px);
  }

  .overlay-btn:hover {
    background: rgba(0, 0, 0, 0.8);
    transform: scale(1.1);
  }

  .delete-btn:hover {
    background: rgba(220, 38, 38, 0.8);
  }

  .select-checkbox {
    position: absolute;
    top: 0.5rem;
    left: 0.5rem;
    z-index: 5;
    width: 28px;
    height: 28px;
    display: flex;
    align-items: center;
    justify-content: center;
    cursor: pointer;
    opacity: 0;
    transition: opacity 0.2s ease;
    background: rgba(0, 0, 0, 0.4);
    border-radius: 50%;
    backdrop-filter: blur(4px);
  }

  .gallery-item:hover .select-checkbox,
  .gallery-item.selected .select-checkbox {
    opacity: 1;
  }

  .select-checkbox svg {
    color: white;
    filter: drop-shadow(0 1px 2px rgba(0, 0, 0, 0.3));
  }

  .gallery-item.selected .select-checkbox {
    opacity: 1;
    background: var(--blue-500);
  }

  /* ==========================================
     PART 10: 模态框 (Modal)
     ========================================== */
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
    z-index: 200;
    backdrop-filter: blur(4px);
    animation: fadeIn 0.2s ease;
  }

  .modal-content {
    background: var(--bg-primary);
    border-radius: var(--radius-xl);
    padding: 1.5rem;
    max-width: 90vw;
    max-height: 90vh;
    overflow: auto;
    box-shadow: var(--shadow-lg);
    border: 1px solid var(--border-color);
    animation: slideUp 0.3s ease;
  }

  .modal-content img {
    max-width: 100%;
    max-height: 70vh;
    border-radius: var(--radius-md);
    display: block;
    margin-bottom: 1rem;
  }

  .modal-actions {
    display: flex;
    gap: 0.75rem;
    justify-content: center;
    flex-wrap: wrap;
  }

  /* ==========================================
     PART 11: 响应式布局 (Responsive Design)
     ========================================== */
  @media (max-width: 1024px) {
    .main-content {
      padding: 1.5rem 1rem;
    }

    .gallery-grid {
      grid-template-columns: repeat(auto-fill, minmax(180px, 1fr));
      gap: 0.75rem;
    }
  }

  @media (max-width: 768px) {
    .main-content {
      padding: 1rem 0.75rem;
    }

    .gallery-grid {
      grid-template-columns: repeat(auto-fill, minmax(140px, 1fr));
      gap: 0.5rem;
    }

    .upload-card {
      padding: 1rem;
    }

    .upload-area {
      padding: 1.5rem 1rem;
    }

    .nav-content {
      padding: 0.5rem 0.75rem;
    }

    .logo-text {
      font-size: 1rem;
    }

    .modal-content {
      max-width: 95vw;
      max-height: 90vh;
      padding: 1rem;
    }

    .pagination {
      flex-wrap: wrap;
      gap: 0.5rem;
    }
  }

  @media (max-width: 480px) {
    .gallery-grid {
      grid-template-columns: repeat(2, 1fr);
      gap: 0.5rem;
    }

    .nav-actions {
      gap: 0.375rem;
    }

    .icon-btn {
      padding: 0.375rem;
    }

    .lock-card {
      padding: 1.5rem 1rem;
    }

    .lock-title {
      font-size: 1.25rem;
    }
  }

  @media (hover: none) and (pointer: coarse) {
    .gallery-item .item-overlay,
    .gallery-item .select-checkbox {
      opacity: 1;
    }

    .overlay-btn {
      width: 36px;
      height: 36px;
    }

    .btn,
    .batch-btn {
      min-height: 44px;
    }
  }
</style>
