<template>
  <div
    class="modal"
    v-if="visible"
    @click.self="close"
  >
    <div
      class="settings-modal"
      @click.stop
    >
      <div class="modal-header">
        <h3>
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
          {{ t('settings.title') }}
        </h3>
        <button
          class="close-btn"
          @click="close"
        >
          ✕
        </button>
      </div>

      <div class="settings-body">
        <!-- 网站标题 -->
        <div class="setting-group">
          <label class="setting-label">{{ t('settings.siteTitle') }}</label>
          <input
            type="text"
            class="setting-input"
            v-model="siteTitle"
            :placeholder="t('settings.siteTitlePlaceholder')"
            maxlength="30"
          />
        </div>

        <!-- 网站副标题 -->
        <div class="setting-group">
          <label class="setting-label">{{ t('settings.siteSubtitle') }}</label>
          <input
            type="text"
            class="setting-input"
            v-model="siteSubtitle"
            :placeholder="t('settings.siteSubtitlePlaceholder')"
          />
        </div>

        <!-- 主题颜色 -->
        <div class="setting-group">
          <label class="setting-label">{{ t('settings.themeColor') }}</label>
          <div class="theme-options">
            <label
              v-for="(t, key) in themeList"
              :key="key"
              class="theme-option"
              :class="{ active: themeColor === key }"
              :title="t.name"
            >
              <input
                type="radio"
                v-model="themeColor"
                :value="key"
                @change="onThemeChange(key)"
              />
              <span
                class="theme-dot"
                :style="{ background: key === 'custom' ? customColor : t.primary }"
              >
                <!-- 自定义选项显示渐变色环 -->
                <svg
                  v-if="key === 'custom'"
                  viewBox="0 0 24 24"
                  width="14"
                  height="14"
                  class="custom-icon"
                >
                  <circle
                    cx="12"
                    cy="12"
                    r="10"
                    fill="none"
                    stroke="white"
                    stroke-width="2"
                    stroke-dasharray="4 2"
                  />
                </svg>
              </span>
            </label>
          </div>

          <!-- 自定义颜色选择器 -->
          <div
            class="custom-color-section"
            v-if="themeColor === 'custom'"
          >
            <div class="color-picker-row">
              <input
                type="color"
                v-model="customColor"
                @input="onCustomColorChange"
                class="color-input-native"
              />
              <input
                type="text"
                v-model="customColor"
                @input="onCustomColorChange"
                class="color-input-text"
                placeholder="#3b82f6"
                maxlength="7"
                pattern="^#[0-9a-fA-F]{6}$"
              />
            </div>
            <div class="color-presets">
              <span
                v-for="color in colorPresets"
                :key="color"
                class="color-preset-dot"
                :style="{ background: color }"
                @click="selectPresetColor(color)"
                :class="{ active: customColor?.toLowerCase() === color.toLowerCase() }"
              ></span>
            </div>
          </div>
        </div>

        <div class="setting-group">
          <label class="setting-label">{{ t('settings.language') }}</label>
          <div class="lang-options">
            <label
              class="lang-option"
              :class="{ active: lang === 'zh-CN' }"
              @click="switchLanguage('zh-CN')"
            >
              <input
                type="radio"
                v-model="lang"
                value="zh-CN"
              />
              <span class="lang-flag">🇨🇳</span>
              <span class="lang-name">中文</span>
            </label>
            <label
              class="lang-option"
              :class="{ active: lang === 'en' }"
              @click="switchLanguage('en')"
            >
              <input
                type="radio"
                v-model="lang"
                value="en"
              />
              <span class="lang-flag">🇺🇸</span>
              <span class="lang-name">English</span>
            </label>
          </div>
        </div>

        <!-- TOTP二次验证 -->
        <div class="setting-group">
          <label class="setting-label">{{ t('lock.setupTotp') }}</label>

          <div class="totp-section">
            <div class="toggle-row">
              <label class="toggle-switch">
                <input
                  type="checkbox"
                  v-model="totpEnabled"
                  @change="onTotpToggle"
                />
                <span class="toggle-slider"></span>
              </label>
              <span class="toggle-text">
                {{ totpEnabled ? t('lock.totpEnabled') : t('lock.totpDisabled') }}
              </span>
            </div>

            <!-- TOTP设置区域 -->
            <div
              class="totp-setup"
              v-if="showTotpSetup"
            >
              <p class="totp-desc">{{ t('lock.totpSetupDesc') }}</p>
              <div
                class="totp-qr"
                ref="qrContainer"
              ></div>
              <div class="totp-secret-row">
                <span class="totp-secret-label">{{ t('lock.totpSecret') }}:</span>
                <code class="totp-secret-code">{{ totpSecret }}</code>
                <button
                  class="btn btn-sm btn-secondary"
                  @click="copySecret"
                >
                  {{ getLang() === 'zh-CN' ? '复制' : 'Copy' }}
                </button>
              </div>
              <div class="totp-verify-row">
                <input
                  type="text"
                  v-model="totpVerifyCode"
                  :placeholder="t('lock.totpPlaceholder')"
                  class="setting-input"
                  maxlength="6"
                />
                <button
                  class="btn btn-sm btn-primary"
                  @click="verifyTotp"
                  :disabled="!totpVerifyCode"
                >
                  {{ getLang() === 'zh-CN' ? '验证' : 'Verify' }}
                </button>
              </div>
            </div>
          </div>
        </div>

        <!-- 最大重试次数 -->
        <div class="setting-group">
          <label class="setting-label">
            {{ t('settings.maxRetries') }}
            <span class="setting-hint">（{{ t('settings.maxRetriesHint', { count: maxRetries }) }}）</span>
          </label>
          <div class="range-group">
            <input
              type="range"
              min="0"
              max="10"
              v-model.number="maxRetries"
              class="setting-range"
            />
            <span class="range-value">{{ maxRetries }}</span>
          </div>
        </div>

        <!-- 每页图片数量 -->
        <div class="setting-group">
          <label class="setting-label">
            {{ t('settings.pageSize') }}
            <span class="setting-hint">（{{ t('settings.pageSizeHint', { count: pageSize }) }}）</span>
          </label>
          <div class="range-group">
            <input
              type="range"
              min="4"
              max="100"
              step="4"
              v-model.number="pageSize"
              class="setting-range"
            />
            <span class="range-value">{{ pageSize }}</span>
          </div>
        </div>

        <!-- 随机图片 API -->
        <div class="setting-group">
          <label class="setting-label">{{ t('settings.allowRandom') }}</label>
          <div class="toggle-row">
            <label class="toggle-switch">
              <input
                type="checkbox"
                v-model="allowRandom"
              />
              <span class="toggle-slider"></span>
            </label>
            <span class="toggle-text">{{
              allowRandom ? t('settings.allowRandomOn') : t('settings.allowRandomOff')
            }}</span>
          </div>
          <div class="setting-desc">
            <p>{{ t('settings.allowRandomDesc') }}</p>
          </div>
        </div>

        <!-- 允许主机名 -->
        <div
          class="setting-group"
          v-if="allowRandom"
        >
          <label class="setting-label">
            {{ t('settings.randomHosts') }}
            <span class="setting-hint">（{{ t('settings.randomHostsHint') }}）</span>
          </label>
          <input
            type="text"
            class="setting-input"
            v-model="randomAllowedHosts"
            :placeholder="t('settings.randomHostsPlaceholder')"
          />
          <div class="setting-desc">
            <p>{{ t('settings.randomHostsDesc1') }}</p>
            <p>{{ t('settings.randomHostsDesc2') }}</p>
            <p>{{ t('settings.randomHostsDesc3') }}</p>
          </div>
        </div>

        <!-- 多仓库管理 -->
        <div class="setting-group">
          <label class="setting-label">{{ t('settings.repoManage') }}</label>

          <!-- 空状态 -->
          <div
            class="repo-empty"
            v-if="repos.length === 0"
          >
            <div class="repo-empty-icon">
              <svg
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                stroke-width="2"
                width="40"
                height="40"
              >
                <path d="M22 19a2 2 0 0 1-2 2H4a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h5l2 3h9a2 2 0 0 1 2 2z" />
              </svg>
            </div>
            <p class="repo-empty-text">{{ t('settings.repoEmpty') }}</p>
            <p class="repo-empty-hint">{{ t('settings.repoEmptyHint') }}</p>
            <button
              class="btn btn-primary btn-sm"
              @click="addRepo"
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
                  x1="12"
                  y1="5"
                  x2="12"
                  y2="19"
                />
                <line
                  x1="5"
                  y1="12"
                  x2="19"
                  y2="12"
                />
              </svg>
              {{ t('settings.repoAddFirstText') }}
            </button>
          </div>

          <!-- 仓库列表 -->
          <div
            class="repo-list"
            v-if="repos.length > 0"
          >
            <div
              class="repo-item"
              v-for="(repo, index) in repos"
              :key="repo.id"
            >
              <div
                class="repo-header"
                @click="toggleEdit(index)"
              >
                <div class="repo-info">
                  <span class="repo-name">{{ repo.name }}</span>
                  <span
                    class="repo-badge"
                    v-if="repo.id === activeRepo"
                    >{{ t('settings.repoCurrent') }}</span
                  >
                </div>
                <div class="repo-header-right">
                  <span
                    class="repo-summary"
                    v-if="editingIndex !== index"
                  >
                    {{ repo.owner || '?' }}/{{ repo.repo || '?' }}
                  </span>
                  <svg
                    class="repo-arrow"
                    :class="{ rotated: editingIndex === index }"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    stroke-width="2"
                    width="16"
                    height="16"
                  >
                    <polyline points="6,9 12,15 18,9" />
                  </svg>
                </div>
              </div>

              <div
                class="repo-body"
                v-if="editingIndex === index"
              >
                <div class="field">
                  <label>{{ t('settings.repoCustomName') }}</label>
                  <input
                    v-model="repo.name"
                    class="input"
                    :placeholder="`${t('settings.repo')}${t('settings.repoCustomName')}`"
                  />
                </div>
                <div class="field">
                  <label>Owner</label>
                  <input
                    v-model="repo.owner"
                    class="input"
                    placeholder="GitHub Username"
                  />
                </div>
                <div class="field">
                  <label>{{ t('settings.repoName') }}</label>
                  <input
                    v-model="repo.repo"
                    class="input"
                    placeholder="my-images"
                  />
                </div>
                <div class="field">
                  <label>{{ t('settings.repoBranch') }}</label>
                  <input
                    v-model="repo.branch"
                    class="input"
                    placeholder="main"
                  />
                </div>
                <div class="field">
                  <label>{{ t('settings.repoPath') }}</label>
                  <input
                    v-model="repo.path"
                    class="input"
                    placeholder="images"
                  />
                </div>
                <div class="field">
                  <label>{{ t('settings.repoToken') }}</label>
                  <input
                    v-model="repo.token"
                    @input="repo.clearToken = false"
                    class="input"
                    type="password"
                    :placeholder="repo.hasToken ? (getLang() === 'zh-CN' ? '已配置；留空保持不变' : 'Configured; leave blank to keep') : t('settings.repoTokenPlaceholder')"
                  />
                  <button v-if="repo.hasToken" type="button" class="btn btn-sm btn-secondary" @click="repo.clearToken = true; repo.hasToken = false; repo.token = ''">
                    {{ getLang() === 'zh-CN' ? '清除专用令牌' : 'Remove repository token' }}
                  </button>
                </div>
                <label class="checkbox">
                  <input
                    type="checkbox"
                    v-model="repo.isPublic"
                  />
                  <span>{{ t('settings.repoIsPublic') }}</span>
                </label>

                <div
                  class="field"
                  v-if="repo.isPublic"
                >
                  <label>{{ t('settings.repoCdnBase') }}</label>
                  <input
                    v-model="repo.cdnBase"
                    class="input"
                    :placeholder="t('settings.cdnBasePlaceholder')"
                  />
                  <span class="field-hint">{{ t('settings.repoCdnHint') }}</span>
                </div>

                <div class="repo-btns">
                  <button
                    class="btn btn-sm btn-primary"
                    @click="setActive(repo.id)"
                    v-if="activeRepo !== repo.id"
                  >
                    {{ t('settings.useThisRepo') }}
                  </button>
                  <button
                    class="btn btn-sm btn-secondary"
                    disabled
                    v-else
                  >
                    {{ t('settings.repoCurrentUsing') }}
                  </button>
                  <button
                    class="btn btn-sm btn-secondary"
                    @click="checkRepoStatus(index)"
                  >
                    {{ t('settings.repoStatusCheck') }}
                  </button>
                  <button
                    class="btn btn-sm btn-danger"
                    @click="removeRepo(index)"
                    v-if="repos.length > 1"
                  >
                    {{ t('settings.repoDelete') }}
                  </button>
                </div>
              </div>
            </div>
          </div>

          <button
            class="btn btn-sm btn-secondary add-repo-btn"
            @click="addRepo"
            v-if="repos.length > 0"
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
                x1="12"
                y1="5"
                x2="12"
                y2="19"
              />
              <line
                x1="5"
                y1="12"
                x2="19"
                y2="12"
              />
            </svg>
            {{ t('settings.repoAddText') }}
          </button>
        </div>

        <!-- 仓库信息 -->
        <div class="setting-group">
          <label class="setting-label">{{ t('settings.repoInfo') }}</label>
          <div class="info-grid">
            <div class="info-item">
              <span class="info-key">{{ t('settings.owner') }}</span>
              <span class="info-value">{{ githubOwner || t('settings.notSet') }}</span>
            </div>
            <div class="info-item">
              <span class="info-key">{{ t('settings.repo') }}</span>
              <span class="info-value">{{ githubRepo || t('settings.notSet') }}</span>
            </div>
            <div class="info-item">
              <span class="info-key">{{ t('settings.branch') }}</span>
              <span class="info-value">{{ githubBranch }}</span>
            </div>
            <div class="info-item">
              <span class="info-key">{{ t('settings.path') }}</span>
              <span class="info-value">{{ githubPath }}</span>
            </div>
          </div>
        </div>

        <div class="setting-group">
          <label class="setting-label">{{ t('settings.settingInfo') }}</label>
          <div class="info-grid">
            <button
              class="setting-sync-btn"
              :disabled="configStatus === 'localNewer' || configStatus === 'same'"
              @click="loadSettingFromRemote"
            >
              {{ t('settings.loadFromRemote') }}
            </button>
            <button
              class="setting-sync-btn"
              :disabled="configStatus === 'remoteNewer' || configStatus === 'same'"
              @click="updateRemoteByLocal"
            >
              {{ t('settings.uploadToRemote') }}
            </button>
          </div>
        </div>
      </div>

      <div class="modal-footer">
        <button
          class="btn btn-secondary"
          @click="resetDefaults"
        >
          {{ t('settings.reset') }}
        </button>
        <button
          class="btn btn-primary"
          @click="save"
          :disabled="saving"
        >
          {{ saving ? t('settings.saving') : t('settings.save') }}
        </button>
      </div>
    </div>
  </div>
</template>

<script setup>
  import { ref, nextTick, watchEffect } from 'vue';
  import {
    getCachedSettings,
    saveSettings,
    saveRemoteSettings,
    checkConfiguration,
    fetchRemoteSettings,
  } from '../core/settings.js';
  import { checkRepository } from '../core/api.js';
  import { getDefaultSettings } from '../utils/defaults.js';
  import { showLoading, showToast } from './Toast.js';
  import { getLang, setLang, t } from '../utils/i18n.js';
  import { setTheme, setCustomColor, getCurrentThemeName, getCustomColor } from '../utils/theme.js';
  import { totpManager } from '../utils/totp.js';
  import QRCode from 'qrcode';

  // ==========================================
  // Props & Emits
  // ==========================================

  const props = defineProps({
    authToken: { type: String, default: '' },
  });

  const emit = defineEmits(['saved']);

  // ==========================================
  // 响应式数据
  // ==========================================

  const visible = ref(false);
  const saving = ref(false);
  const editingIndex = ref(-1);

  const siteTitle = ref('Cf-Github-ImgBed');
  const siteSubtitle = ref('轻量级图床服务');
  const maxRetries = ref(3);
  const pageSize = ref(20);
  const allowRandom = ref(false);
  const randomAllowedHosts = ref('*');
  const repos = ref([]);
  const activeRepo = ref('default');

  const githubOwner = ref('');
  const githubRepo = ref('');
  const githubBranch = ref('main');
  const githubPath = ref('images');

  const themeList = ref({
    blue: { name: '默认蓝', primary: '#3b82f6' },
    green: { name: '清新绿', primary: '#10b981' },
    purple: { name: '优雅紫', primary: '#8b5cf6' },
    orange: { name: '活力橙', primary: '#f97316' },
    pink: { name: '浪漫粉', primary: '#ec4899' },
    red: { name: '中国红', primary: '#dc2626' },
    cyan: { name: '清新青', primary: '#06b6d4' },
    amber: { name: '温暖黄', primary: '#d97706' },
    custom: { name: '自定义', primary: '#6366f1' },
  });
  const colorPresets = ref([
    '#3b82f6',
    '#10b981',
    '#8b5cf6',
    '#f97316',
    '#ec4899',
    '#dc2626',
    '#06b6d4',
    '#d97706',
    '#6366f1',
    '#14b8a6',
    '#f43f5e',
    '#0ea5e9',
    '#84cc16',
    '#e11d48',
    '#7c3aed',
  ]);
  const themeColor = ref('blue');
  const customColor = ref('#3b82f6');
  const lang = ref('zh-CN');

  const totpEnabled = ref(false);
  const totpSecret = ref('');
  const totpVerifyCode = ref('');
  const showTotpSetup = ref(false);
  const totpSetupVerified = ref(false);

  const configStatus = ref('same');

  watchEffect(async () => {
    const status = await checkConfiguration();
    configStatus.value = status !== 'error' ? status : 'same';
  });

  // refs
  const qrContainer = ref(null);

  // ==========================================
  // 方法 - TOTP相关
  // ==========================================

  const onTotpToggle = () => {
    if (totpEnabled.value) {
      totpSecret.value = totpManager.generateSecret();
      totpSetupVerified.value = false;
      showTotpSetup.value = true;
      nextTick(() => {
        generateQRCode();
      });
    } else {
      showTotpSetup.value = false;
      totpSecret.value = '';
      totpSetupVerified.value = false;
    }
  };

  const generateQRCode = async () => {
    const container = qrContainer.value;
    if (!container) return;

    const uri = totpManager.getTotpUri('admin', siteTitle.value || 'Cf-Github-ImgBed');
    const img = document.createElement('img');
    img.src = await QRCode.toDataURL(uri, { width: 150, margin: 1 });
    img.alt = 'TOTP QR Code';
    img.width = 150;
    img.height = 150;
    container.replaceChildren(img);
  };

  const copySecret = () => {
    navigator.clipboard.writeText(totpSecret.value).then(() => {
      showToast(t('settings.copySecretToast'));
    });
  };

  const verifyTotp = async () => {
    totpManager.secret = totpSecret.value;
    const isValid = await totpManager.verify(totpVerifyCode.value);

    if (isValid) {
      totpSetupVerified.value = true;
      showToast(t('lock.totpVerifiedSave'), 'success');
      showTotpSetup.value = false;
      totpVerifyCode.value = '';
    } else {
      showToast(t('lock.totpError'), 'error');
    }
  };

  // ==========================================
  // 方法 - 仓库管理
  // ==========================================

  const addRepo = () => {
    const newRepo = {
      id: 'repo_' + Date.now(),
      name: t('settings.addRepoName'),
      owner: '',
      repo: '',
      branch: 'main',
      path: 'images',
      token: '',
      isPublic: false,
      cdnBase: 'https://cdn.jsdmirror.com/gh',
    };
    repos.value = [...repos.value, newRepo];
    editingIndex.value = repos.value.length - 1;
  };

  const toggleEdit = (index) => {
    editingIndex.value = editingIndex.value === index ? -1 : index;
  };

  const setActive = (id) => {
    activeRepo.value = id;
    showToast(t('settings.setActiveToast'), 'success');
  };

  const checkRepoStatus = async (index) => {
    const closeLoading = showLoading(t('settings.repoStatusChecking'));
    const repo = repos.value[index];
    const status = await checkRepository(repo.id, props.authToken);
    if (status.available) {
      closeLoading();
      showToast(t('settings.checkRepoAvailableToast'), 'success');
    } else {
      closeLoading();
      showToast(
        `${t('settings.checkRepoUnavailableToast')}: ${t('settings.checkRepoError' + status.error)}`,
        'warning',
      );
    }
  };

  const removeRepo = (index) => {
    const repo = repos.value[index];
    if (repos.value.length <= 1) {
      showToast(t('settings.removeRepoCheckToast'), 'warning');
      return;
    }

    if (activeRepo.value === repo.id) {
      const defaultRepo = repos.value.find((r) => r.isDefault && r.id !== repo.id);
      activeRepo.value = defaultRepo ? defaultRepo.id : repos.value[0].id;
    }

    repos.value.splice(index, 1);

    if (editingIndex.value === index) {
      editingIndex.value = -1;
    } else if (editingIndex.value > index) {
      editingIndex.value--;
    }

    showToast(t('settings.removeRepoToast'), 'info');
  };

  // ==========================================
  // 方法 - 设置相关
  // ==========================================

  const open = () => {
    const cached = getCachedSettings();

    siteTitle.value = cached.siteTitle || 'Cf-Github-ImgBed';
    siteSubtitle.value = cached.siteSubtitle || '轻量级图床服务';
    maxRetries.value = cached.maxRetries ?? 3;
    pageSize.value = cached.pageSize ?? 20;
    allowRandom.value = cached.allowRandom ?? false;
    randomAllowedHosts.value = cached.randomAllowedHosts || '*';

    const reposData = cached.repositories;
    if (Array.isArray(reposData) && reposData.length > 0) {
      repos.value = reposData.map((r) => ({ ...r }));
    } else {
      repos.value = [
        {
          id: 'default',
          name: t('settings.defaultRepoName'),
          owner: '',
          repo: '',
          branch: 'main',
          path: 'images',
          token: '',
          isPublic: false,
          cdnBase: 'https://cdn.jsdmirror.com/gh',
        },
      ];
    }

    let activeRepository = cached.repositories.find((r) => r.id === cached.activeRepository);

    if (!activeRepository && repos.value.length > 0) {
      activeRepository = repos.value[0];
    }

    githubOwner.value = activeRepository.owner || '';
    githubRepo.value = activeRepository.repo || '';
    githubBranch.value = activeRepository.branch || 'main';
    githubPath.value = activeRepository.path || 'images';

    activeRepo.value = cached.activeRepository || repos.value[0]?.id || 'default';
    themeColor.value = getCurrentThemeName();
    customColor.value = getCustomColor();
    lang.value = getLang();
    totpEnabled.value = cached.totp?.enable === true;
    totpSecret.value = '';
    totpSetupVerified.value = false;
    localStorage.removeItem('totpSecret');
    localStorage.removeItem('totpEnabled');
    editingIndex.value = -1;
    visible.value = true;
  };

  const close = () => {
    visible.value = false;
  };

  const save = async () => {
    if (saving.value) return;
    saving.value = true;

    try {
      if (totpEnabled.value && totpSecret.value && !totpSetupVerified.value) {
        showToast(t('lock.totpError'), 'error');
        return;
      }
      const settings = {
        siteTitle: siteTitle.value,
        siteSubtitle: siteSubtitle.value,
        maxRetries: maxRetries.value,
        pageSize: pageSize.value,
        allowRandom: allowRandom.value,
        randomAllowedHosts: randomAllowedHosts.value,
        repositories: JSON.parse(JSON.stringify(repos.value)),
        githubOwner: githubOwner.value,
        githubRepo: githubRepo.value,
        githubBranch: githubBranch.value,
        githubPath: githubPath.value,
        activeRepository: activeRepo.value,
        totp: {
          enable: totpEnabled.value,
          secret: totpSecret.value,
        },
      };

      const currentTime = Date.now();

      await saveRemoteSettings(props.authToken, settings, currentTime);
      saveSettings(settings, currentTime);
      totpSecret.value = '';
      totpManager.secret = null;
      showToast(t('settings.synced'), 'success');
      emit('saved', getCachedSettings());
      close();
    } catch (err) {
      showToast(t('settings.saveError', { error: t(`api.${err.message}`) }), 'error');
    } finally {
      saving.value = false;
    }
  };

  const loadSettingFromRemote = async () => {
    const closeLoading = showLoading(t('settings.syncingFromRemote'));
    try {
      const remoteSettings = await fetchRemoteSettings(props.authToken);

      saveSettings(remoteSettings);
      emit('saved', remoteSettings);
      closeLoading();
      showToast(t('settings.syncFromRemote'), 'success');
    } catch (err) {
      closeLoading();
      showToast(t('settings.syncFromRemoteFailed', { error: t(`api.${err.message}`) }), 'error');
    }
  };

  const updateRemoteByLocal = async () => {
    const closeLoading = showLoading(t('settings.syncingToRemote'));
    try {
      await save();
      closeLoading();
    } catch (err) {
      closeLoading();
      showToast(t('settings.syncToRemoteFailed', { error: t(`api.${err.message}`) }), 'error');
    }
  };

  const resetDefaults = () => {
    const defaults = getDefaultSettings();
    siteTitle.value = defaults.siteTitle;
    siteSubtitle.value = defaults.siteSubtitle;
    maxRetries.value = defaults.maxRetries;
    pageSize.value = defaults.pageSize;
    allowRandom.value = defaults.allowRandom;
    randomAllowedHosts.value = defaults.randomAllowedHosts;
    showToast(t('settings.resetDone'), 'info');
  };

  const switchLanguage = (lang) => {
    setLang(lang);
  };

  const onThemeChange = (key) => {
    if (key === 'custom') {
      setTheme('custom');
      setCustomColor(customColor.value);
    } else {
      setTheme(key);
    }
  };

  const onCustomColorChange = () => {
    if (/^#[0-9a-fA-F]{6}$/.test(customColor.value)) {
      setCustomColor(customColor.value);
    }
  };

  const selectPresetColor = (color) => {
    customColor.value = color;
    setCustomColor(color);
  };

  // 暴露方法给父组件
  defineExpose({
    open,
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
    z-index: 350;
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

  .settings-modal {
    background: var(--bg-primary);
    border-radius: var(--radius-xl);
    width: 540px;
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
    display: flex;
    align-items: center;
    gap: 0.5rem;
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

  .close-btn:hover {
    background: #fee2e2;
    color: #dc2626;
    border-color: #fca5a5;
  }

  .settings-body {
    flex: 1;
    overflow-y: auto;
    padding: 1.5rem;
  }

  .setting-group {
    margin-bottom: 1.5rem;
  }

  .setting-label {
    display: block;
    font-size: 0.875rem;
    font-weight: 600;
    color: var(--text-primary);
    margin-bottom: 0.5rem;
  }

  .setting-hint {
    font-weight: 400;
    color: var(--text-tertiary);
    font-size: 0.75rem;
  }

  .setting-input {
    width: 100%;
    padding: 0.625rem 0.875rem;
    border: 2px solid var(--border-color);
    border-radius: var(--radius-md);
    font-size: 0.875rem;
    background: var(--bg-secondary);
    color: var(--text-primary);
    outline: none;
    transition: border-color var(--transition);
  }

  .setting-input:focus {
    border-color: var(--blue-400);
  }

  .range-group {
    display: flex;
    align-items: center;
    gap: 1rem;
  }

  .setting-range {
    flex: 1;
    -webkit-appearance: none;
    height: 6px;
    background: var(--bg-tertiary);
    border-radius: 3px;
    outline: none;
    cursor: pointer;
  }

  .setting-range::-webkit-slider-thumb {
    -webkit-appearance: none;
    width: 18px;
    height: 18px;
    background: var(--blue-500);
    border-radius: 50%;
    cursor: pointer;
    box-shadow: 0 1px 3px rgba(0, 0, 0, 0.2);
  }

  .range-value {
    font-size: 1rem;
    font-weight: 600;
    color: var(--blue-500);
    min-width: 24px;
    text-align: center;
  }

  .toggle-row {
    display: flex;
    align-items: center;
    gap: 0.75rem;
  }

  .toggle-switch {
    position: relative;
    width: 44px;
    height: 24px;
    cursor: pointer;
    flex-shrink: 0;
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
    border-radius: 12px;
    transition: all var(--transition);
    border: 1px solid var(--border-color);
  }

  .toggle-slider::before {
    content: '';
    position: absolute;
    top: 2px;
    left: 2px;
    width: 18px;
    height: 18px;
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
    transform: translateX(20px);
  }

  .toggle-text {
    font-size: 0.8125rem;
    color: var(--text-secondary);
  }

  .setting-desc {
    margin-top: 0.5rem;
    padding: 0.75rem;
    background: var(--bg-secondary);
    border-radius: var(--radius-md);
  }

  .setting-desc p {
    font-size: 0.75rem;
    color: var(--text-tertiary);
    margin-bottom: 0.25rem;
  }

  .info-grid {
    display: grid;
    grid-template-columns: 1fr 1fr;
    gap: 0.5rem;
  }

  .info-item {
    display: flex;
    justify-content: space-between;
    align-items: center;
    padding: 0.5rem 0.75rem;
    background: var(--bg-secondary);
    border-radius: var(--radius-sm);
  }

  .info-key {
    font-size: 0.75rem;
    color: var(--text-tertiary);
    font-weight: 500;
  }

  .info-value {
    font-size: 0.8125rem;
    color: var(--text-primary);
    font-weight: 500;
  }

  .modal-footer {
    display: flex;
    justify-content: flex-end;
    gap: 0.75rem;
    padding: 1rem 1.5rem;
    border-top: 1px solid var(--border-color);
    flex-shrink: 0;
  }

  .btn {
    padding: 0.5rem 1.25rem;
    border-radius: var(--radius-md);
    font-size: 0.875rem;
    font-weight: 500;
    cursor: pointer;
    border: none;
    transition: all var(--transition);
  }

  .btn-primary {
    background: var(--blue-500);
    color: white;
  }

  .btn-primary:hover {
    background: var(--blue-600);
  }

  .btn-secondary {
    background: var(--bg-tertiary);
    color: var(--text-secondary);
    border: 1px solid var(--border-color);
  }

  .btn-secondary:hover {
    background: var(--bg-secondary);
  }

  .lang-options {
    display: flex;
    gap: 0.75rem;
  }

  .lang-option {
    flex: 1;
    display: flex;
    align-items: center;
    gap: 0.5rem;
    padding: 0.75rem 1rem;
    border: 2px solid var(--border-color);
    border-radius: var(--radius-md);
    cursor: pointer;
    transition: all 0.2s ease;
  }

  .lang-option:hover {
    border-color: var(--blue-300);
  }

  .lang-option.active {
    border-color: var(--blue-500);
    background: rgba(59, 130, 246, 0.05);
  }

  .lang-option input {
    display: none;
  }

  .lang-flag {
    font-size: 1.25rem;
  }

  .lang-name {
    font-weight: 500;
    font-size: 0.9375rem;
  }

  .theme-options {
    display: flex;
    gap: 0.75rem;
    flex-wrap: wrap;
  }

  .theme-option {
    position: relative;
    cursor: pointer;
  }

  .theme-option input {
    display: none;
  }

  .theme-dot {
    width: 36px;
    height: 36px;
    border-radius: 50%;
    display: flex;
    align-items: center;
    justify-content: center;
    border: 3px solid transparent;
    transition: all 0.25s cubic-bezier(0.4, 0, 0.2, 1);
    box-shadow: 0 2px 8px rgba(0, 0, 0, 0.15);
    position: relative;
  }

  .theme-option.active .theme-dot {
    border-color: var(--text-primary);
    transform: scale(1.15);
    box-shadow: 0 4px 16px rgba(0, 0, 0, 0.25);
  }

  .theme-option:hover .theme-dot {
    transform: scale(1.1);
    box-shadow: 0 4px 12px rgba(0, 0, 0, 0.2);
  }

  .custom-icon {
    opacity: 0.8;
  }

  .custom-color-section {
    margin-top: 1rem;
    padding: 1rem;
    background: var(--bg-secondary);
    border-radius: var(--radius-lg);
    border: 1px solid var(--border-color);
    animation: slideDown 0.3s cubic-bezier(0.4, 0, 0.2, 1);
  }

  @keyframes slideDown {
    from {
      opacity: 0;
      transform: translateY(-8px);
    }
    to {
      opacity: 1;
      transform: translateY(0);
    }
  }

  .color-picker-row {
    display: flex;
    gap: 0.5rem;
    align-items: center;
    margin-bottom: 0.75rem;
  }

  .color-input-native {
    width: 42px;
    height: 38px;
    border: 2px solid var(--border-color);
    border-radius: var(--radius-sm);
    cursor: pointer;
    padding: 2px;
    background: var(--bg-primary);
    flex-shrink: 0;
    transition: border-color 0.15s;
  }

  .color-input-native:hover {
    border-color: var(--text-tertiary);
  }

  .color-input-native::-webkit-color-swatch-wrapper {
    padding: 0;
  }

  .color-input-native::-webkit-color-swatch {
    border: none;
    border-radius: 3px;
  }

  .color-input-text {
    flex: 1;
    padding: 0.5rem 0.75rem;
    border: 2px solid var(--border-color);
    border-radius: var(--radius-sm);
    font-size: 0.875rem;
    font-family: 'SF Mono', 'Cascadia Code', monospace;
    background: var(--bg-primary);
    color: var(--text-primary);
    outline: none;
    transition: border-color 0.15s;
  }

  .color-input-text:focus {
    border-color: var(--blue-400);
  }

  .color-presets {
    display: flex;
    flex-wrap: wrap;
    gap: 0.5rem;
  }

  .color-preset-dot {
    width: 26px;
    height: 26px;
    border-radius: 50%;
    cursor: pointer;
    border: 2px solid transparent;
    transition: all 0.2s cubic-bezier(0.4, 0, 0.2, 1);
    box-shadow: 0 1px 4px rgba(0, 0, 0, 0.12);
  }

  .color-preset-dot:hover {
    transform: scale(1.25);
    box-shadow: 0 3px 10px rgba(0, 0, 0, 0.2);
  }

  .color-preset-dot.active {
    border-color: var(--text-primary);
    transform: scale(1.2);
    box-shadow: 0 3px 12px rgba(0, 0, 0, 0.25);
  }

  .totp-section {
    background: var(--bg-secondary);
    border-radius: var(--radius-md);
    padding: 1rem;
  }

  .totp-setup {
    margin-top: 1rem;
    display: flex;
    flex-direction: column;
    align-items: center;
    gap: 0.75rem;
  }

  .totp-desc {
    font-size: 0.8125rem;
    color: var(--text-secondary);
    text-align: center;
  }

  .totp-qr {
    padding: 0.5rem;
    background: white;
    border-radius: var(--radius-md);
  }

  .totp-secret-row {
    display: flex;
    align-items: center;
    gap: 0.5rem;
    font-size: 0.8125rem;
  }

  .totp-secret-code {
    padding: 0.25rem 0.5rem;
    background: var(--bg-tertiary);
    border-radius: var(--radius-sm);
    font-family: monospace;
  }

  .totp-verify-row {
    display: flex;
    gap: 0.5rem;
    width: 100%;
  }

  .totp-verify-row .setting-input {
    flex: 1;
  }

  .repo-list {
    display: flex;
    flex-direction: column;
    gap: 0.5rem;
    margin: 0.75rem 0;
  }

  .repo-item {
    border: 2px solid var(--border-color);
    border-radius: var(--radius-md);
    overflow: hidden;
    transition: border-color 0.2s;
  }

  .repo-item:hover {
    border-color: var(--blue-300);
  }

  .repo-header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    padding: 0.75rem;
    cursor: pointer;
    user-select: none;
    transition: background 0.15s;
  }

  .repo-header:hover {
    background: var(--bg-secondary);
  }

  .repo-info {
    display: flex;
    align-items: center;
    gap: 0.5rem;
  }

  .repo-name {
    font-weight: 600;
    font-size: 0.875rem;
    color: var(--text-primary);
  }

  .repo-badge {
    font-size: 0.625rem;
    padding: 0.125rem 0.5rem;
    background: var(--blue-500);
    color: white;
    border-radius: 999px;
    font-weight: 500;
  }

  .repo-header-right {
    display: flex;
    align-items: center;
    gap: 0.5rem;
  }

  .repo-summary {
    font-size: 0.75rem;
    color: var(--text-tertiary);
    font-family: monospace;
  }

  .repo-arrow {
    transition: transform 0.2s;
    color: var(--text-tertiary);
    flex-shrink: 0;
  }

  .repo-arrow.rotated {
    transform: rotate(180deg);
  }

  .repo-body {
    padding: 0.75rem;
    border-top: 1px solid var(--border-color);
    display: flex;
    flex-direction: column;
    gap: 0.5rem;
    background: var(--bg-secondary);
  }

  .field {
    display: flex;
    flex-direction: column;
    gap: 0.25rem;
  }

  .field label {
    font-size: 0.75rem;
    font-weight: 600;
    color: var(--text-secondary);
  }

  .input {
    padding: 0.5rem 0.75rem;
    border: 2px solid var(--border-color);
    border-radius: var(--radius-sm);
    font-size: 0.8125rem;
    background: var(--bg-primary);
    color: var(--text-primary);
    outline: none;
    transition: border-color 0.15s;
  }

  .input:focus {
    border-color: var(--blue-400);
  }

  .checkbox {
    display: flex;
    align-items: center;
    gap: 0.5rem;
    font-size: 0.8125rem;
    color: var(--text-secondary);
    cursor: pointer;
  }

  .checkbox input {
    width: 16px;
    height: 16px;
    accent-color: var(--blue-500);
  }

  .field-hint {
    font-size: 0.6875rem;
    color: var(--text-tertiary);
    margin-top: 0.125rem;
  }

  .repo-btns {
    display: flex;
    gap: 0.5rem;
    margin-top: 0.25rem;
  }

  .repo-empty {
    text-align: center;
    padding: 1.5rem;
    color: var(--text-tertiary);
    border: 2px dashed var(--border-color);
    border-radius: var(--radius-md);
    margin: 0.75rem 0;
  }

  .repo-empty-icon {
    color: var(--text-tertiary);
    margin-bottom: 0.75rem;
  }

  .repo-empty-text {
    font-size: 0.9375rem;
    font-weight: 600;
    color: var(--text-secondary);
    margin-bottom: 0.25rem;
  }

  .repo-empty-hint {
    font-size: 0.8125rem;
    color: var(--text-tertiary);
    margin-bottom: 1rem;
  }

  .add-repo-btn {
    width: 100%;
    display: flex;
    align-items: center;
    justify-content: center;
    gap: 0.375rem;
    padding: 0.625rem;
    border: 2px dashed var(--border-color);
    border-radius: var(--radius-md);
    background: transparent;
    color: var(--text-secondary);
    cursor: pointer;
    transition: all 0.15s;
    font-size: 0.8125rem;
  }

  .add-repo-btn:hover {
    border-color: var(--blue-300);
    color: var(--blue-500);
    background: rgba(59, 130, 246, 0.04);
  }

  .setting-sync-btn {
    width: 100%;
    padding: 0.625rem 0.875rem;
    border: 2px solid var(--border-color);
    border-radius: var(--radius-md);
    font-size: 0.875rem;
    background: var(--bg-secondary);
    color: var(--text-primary);
    outline: none;
    transition: border-color var(--transition);
    cursor: pointer;
  }

  .setting-sync-btn:enabled:hover {
    border-color: var(--blue-400);
  }

  .setting-sync-btn:disabled {
    opacity: 0.5;
    cursor: not-allowed;
  }

  .btn-sm {
    padding: 0.375rem 0.75rem;
    font-size: 0.75rem;
  }

  .btn-danger {
    background: transparent;
    color: #dc2626;
    border: 1px solid rgba(220, 38, 38, 0.3);
  }

  .btn-danger:hover {
    background: rgba(220, 38, 38, 0.08);
  }

  .btn:disabled {
    opacity: 0.5;
    cursor: not-allowed;
  }
</style>
