/**
 * 远程设置管理
 */

import { DEFAULT_SETTINGS } from '../utils/defaults';

const SETTINGS_KEY = 'cf_imgbed_settings';
const SETTINGS_VERSION = 3;

/**
 * 从远程获取设置
 */
export async function fetchRemoteSettings(token) {
  if (!token) throw new Error('缺少认证 token');
  const res = await fetch('/api/settings', { headers: { Authorization: `Bearer ${token}` } });
  if (!res.ok) throw new Error('获取远程设置失败');
  const data = await res.json();
  return sanitizeSettings({ ...DEFAULT_SETTINGS, ...data });
}

/**
 * 保存设置到远程 KV
 */
export async function saveRemoteSettings(token, updates, updateTime) {
  if (!token) {
    throw new Error('缺少认证 token');
  }

  try {
    const res = await fetch('/api/settings', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify({
        ...updates,
        updateTime,
      }),
    });

    const data = await res.json();

    if (!res.ok || !data.success) {
      throw new Error(data.error || `保存失败 (${res.status})`);
    }

    return true;
  } catch (error) {
    if (error.name === 'TypeError' && error.message.includes('fetch')) {
      throw new Error('网络错误，无法连接到服务器');
    }
    throw error;
  }
}

/**
 * 获取设置（优先从 LocalStorage 读取）
 */
export async function getSettings(token) {
  try {
    const remoteSettings = await fetchRemoteSettings(token);
    saveSettings(remoteSettings);
    return remoteSettings;
  } catch (error) {
    console.error('获取远程设置失败，使用本地缓存:', error.message);
    return getCachedSettings();
  }
}

/**
 * 保存设置到 LocalStorage
 */
export function saveSettings(settings, updateTime = Date.now()) {
  try {
    const data = {
      version: SETTINGS_VERSION,
      updateTime,
      ...sanitizeSettings(settings),
    };
    // 确保 repositories 被正确序列化
    if (data.repositories && Array.isArray(data.repositories)) {
      data.repositories = JSON.parse(JSON.stringify(data.repositories));
    }
    localStorage.setItem(SETTINGS_KEY, JSON.stringify(data));
  } catch (e) {
    console.error('保存设置到本地失败:', e);
  }
}

/**
 * 获取缓存的设置
 */
export function getCachedSettings() {
  const cached = localStorage.getItem(SETTINGS_KEY);
  if (cached) {
    try {
      const parsed = JSON.parse(cached);
      // 确保 repositories 是数组
      if (!parsed.repositories || !Array.isArray(parsed.repositories)) {
        parsed.repositories = [];
      }
      const clean = sanitizeSettings({ ...DEFAULT_SETTINGS, ...parsed });
      if (parsed.repositories?.some((repo) => repo.token) || parsed.totp?.secret) {
        localStorage.setItem(SETTINGS_KEY, JSON.stringify(clean));
      }
      return clean;
    } catch (e) {
      // ignore
    }
  }
  return getDefaultSettings();
}

/**
 * 配置信息检查
 */
export async function checkConfiguration() {
  try {
    const res = await fetch('/api/getSettingsUpdateTime');
    const remoteUpdateTime = (await res.json()).updateTime;
    const localUpdateTime = getCachedSettings().updateTime ?? 0;

    if (remoteUpdateTime > localUpdateTime) {
      return 'remoteNewer';
    }
    if (remoteUpdateTime < localUpdateTime) {
      return 'localNewer';
    }
    return 'same';
  } catch (err) {
    return 'error';
  }
}

/**
 * 根据图片所属仓库生成 URL
 * @param {Object} settings - 设置对象
 * @param {string} filename - 文件名
 * @param {string} repoId - 仓库 ID
 * @returns {string} 完整的图片 URL
 */
export function getImageUrl(settings, filename, repoId = null) {
  if (!filename) return '';

  let repo = null;
  const repositories = settings.repositories || [];

  if (repoId) {
    repo = repositories.find((r) => r.id === repoId);
  }
  if (!repo) {
    repo = repositories.find((r) => r.id === settings.activeRepository);
  }
  if (!repo) {
    repo = {
      owner: settings.githubOwner || '',
      repo: settings.githubRepo || '',
      branch: settings.githubBranch || 'main',
      // 不要给默认值 "images"，保持空字符串
      path: settings.githubPath || '',
      isPublic: false,
      cdnBase: settings.cdnBase || 'https://cdn.jsdmirror.com/gh',
    };
  }

  const cdnBase = repo.cdnBase || settings.cdnBase || 'https://cdn.jsdmirror.com/gh';
  const branch = repo.branch || 'main';
  // 使用仓库的 path，如果为空则使用空字符串，不要默认 "images"
  const path = (repo.path || '').replace(/^\/+|\/+$/g, '');

  if (repo.isPublic && repo.owner && repo.repo) {
    const cdn = cdnBase.replace(/\/+$/, '');
    if (path) {
      return `${cdn}/${repo.owner}/${repo.repo}@${branch}/${path}/${filename}`;
    } else {
      return `${cdn}/${repo.owner}/${repo.repo}@${branch}/${filename}`;
    }
  } else {
    const origin = window.location.origin;
    return `${origin}/api/preview/${encodeURIComponent(filename)}?repoId=${encodeURIComponent(repoId || repo.id || 'default')}`;
  }
}

/**
 * 获取默认设置
 */
export function getDefaultSettings() {
  return { ...DEFAULT_SETTINGS };
}

function sanitizeSettings(settings) {
  return {
    ...settings,
    repositories: (Array.isArray(settings.repositories) ? settings.repositories : []).map((repo) => ({
      ...repo,
      token: '',
      hasToken: !!(repo.hasToken || repo.token),
    })),
    totp: { enable: settings.totp?.enable === true },
  };
}
