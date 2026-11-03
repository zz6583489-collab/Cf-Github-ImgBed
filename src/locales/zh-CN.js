export const zh_cn_messages = {
  // 锁屏页
  lock: {
    // 基础信息
    title: 'Cf-Github-ImgBed',
    version: 'v2.0',
    desc: '请输入管理员密码以访问图床',
    // 输入相关
    placeholder: '管理员密码',
    verify: '验证',
    verifying: '验证中...',
    // 验证结果
    welcome: '验证成功，欢迎使用',
    passwordError: '密码错误，请重试',
    totpError: '验证码错误，请重试',
    authFailed: '验证失败，请重试',
    missingKey: '无法获取加密公钥',
    // TOTP二次验证
    setupTotp: '设置二次验证',
    totpDesc: '请输入6位TOTP验证码',
    totpSetupTitle: '设置TOTP二次验证',
    totpSetupDesc: '使用Google Authenticator等应用扫描二维码',
    totpSecret: '密钥',
    totpPlaceholder: '请输入6位验证码',
    totpEnabled: '二次验证已启用',
    totpVerifiedSave: '验证码正确，请保存设置以启用二次验证',
    totpDisabled: '二次验证已关闭',
  },
  // 导航栏
  nav: {
    logout: '退出',
    darkMode: '切换暗色模式',
    lightMode: '切换亮色模式',
  },
  // 上传区域
  upload: {
    // 提示信息
    clickHint: '点击上传图片（支持多选）',
    formatHint: '支持 JPG、PNG、GIF、WebP 格式，单文件最大 20MB，支持批量上传',
    dropHint: '点击或拖拽添加更多文件',
    // 隐私相关
    public: '公开',
    private: '私密',
    privacyQuestion: '此照片是否公开？',
    targetRepo: '目标仓库',
    // 弹窗按钮
    modalTitle: '上传文件',
    confirm: '确认上传',
    cancel: '取消',
    startUpload: '开始上传',
    // 上传状态
    uploading: '上传中...',
    complete: '完成',
    pending: '等待中',
    completed: '完成',
    failed: '失败',
    cancelled: '已取消',
    retry: '重试',
    retryCount: '重试 {count}',
    remove: '从队列移除',
    cancelAll: '取消全部',
    allDone: '全部上传完成',
    // 上传结果
    successSingle: '上传成功！',
    successPublic: '上传成功！(公开)',
    successPrivate: '上传成功！(私密)',
    failType: '不支持的文件类型: {type}',
    failSize: '文件大小超过 20MB 限制',
    failUpload: '上传失败: {name} - {error}',
    successCount: '全部上传成功，共 {count} 张',
    summary: '上传完成：成功 {success} 张，失败 {fail} 张，取消 {cancel} 张',
    // 上传窗口
    minimized: '上传窗口已最小化',
    minimizedTitle: '上传中 {done}/{total}',
    notImage: '不是图片文件',
    overSize: '超过 20MB 限制',
    selectFiles: '请选择要上传的图片文件',
    noPending: '没有需要上传的文件',
  },
  // 随机图片
  random: {
    title: '随机公开图片',
    refresh: '换一张',
    placeholder: '点击上方按钮获取随机公开图片',
    disabled: '随机图片接口未启用',
    noImages: '暂无公开图片',
    fetchFailed: '获取随机图片失败',
  },
  // 图片列表
  gallery: {
    // 基础信息
    title: '图片列表',
    count: '共 {count} 张',
    noImages: '暂无图片，上传一张吧',
    allRepos: '全部仓库',
    // 图片操作
    public: '公开',
    private: '私密',
    copyLink: '复制链接',
    delete: '删除',
    preview: '预览',
    openNew: '新窗口打开',
    // 搜索排序
    search: '搜索图片...',
    sortName: '按名称',
    sortDate: '按时间',
    sortSize: '按大小',
    // 分页
    pageInfo: '{current} / {total}',
    loading: '加载中...',
    pagePrev: '上一页',
    pageNext: '下一页',
    refreshing: '刷新中...',
    // 错误信息
    loadFailed: '获取图片列表失败',
  },
  // 删除确认
  delete: {
    // 单张删除
    title: '删除图片',
    message: '确定要删除「{name}」吗？\n此操作不可撤销。',
    confirm: '确认删除',
    cancel: '取消',
    deleting: '正在删除...',
    success: '删除成功',
    failed: '删除失败',
    // 批量删除
    batchTitle: '批量删除',
    batchMessage: '确定要删除选中的 {count} 张图片吗？\n此操作不可撤销。',
  },
  // 设置
  settings: {
    // 基础设置
    language: '语言 / Language',
    title: '设置',
    siteTitle: '网站标题',
    siteTitlePlaceholder: '网站导航栏标题',
    siteSubtitle: '网站副标题',
    siteSubtitlePlaceholder: '网站副标题',
    themeColor: '主题颜色',
    // 功能设置
    maxRetries: '最大重试次数',
    maxRetriesHint: '当前：{count}',
    pageSize: '每页图片数量',
    pageSizeHint: '当前：{count} 张',
    // 随机图片 API 设置
    allowRandom: '随机图片 API',
    allowRandomOn: '已开启',
    allowRandomOff: '已关闭',
    allowRandomDesc: '开启后可通过 /api/random 获取随机公开图片',
    randomHosts: '允许访问的主机名',
    randomHostsHint: '多个用逗号分隔',
    randomHostsPlaceholder: '例如：example.com,*.test.com',
    randomHostsDesc1: '默认为 * 表示允许所有主机',
    randomHostsDesc2: '设置特定主机名可限制访问来源',
    randomHostsDesc3: '支持通配符：*.example.com 匹配所有子域名',
    // 仓库管理
    addRepoName: '新仓库',
    defaultRepoName: '默认仓库',
    repoManage: '仓库管理',
    repoEmpty: '还没有配置仓库',
    repoEmptyHint: '添加一个 GitHub 仓库来存储图片',
    repoAddFirstText: '添加第一个仓库',
    repoCurrent: '当前使用',
    repoCustomName: '名称',
    repoName: '仓库名',
    repoBranch: '分支',
    repoPath: '路径',
    repoToken: 'Token（可选）',
    repoTokenPlaceholder: '留空使用全局 Token',
    repoIsPublic: '是否公开',
    useThisRepo: '使用此仓库',
    repoCurrentUsing: '当前使用中',
    repoStatusCheck: '检查仓库状态',
    repoStatusChecking: '正在检查仓库是否可用',
    checkRepoAvailableToast: '当前仓库可用',
    checkRepoUnavailableToast: '当前仓库不可用',
    checkRepoErrorNotFound: '仓库不存在',
    checkRepoErrorInvalidToken: 'Token 无效',
    checkRepoErrorNetwork: '网络错误',
    checkRepoErrorUnknown: '未知错误',
    repoDelete: '删除',
    repoAddText: '添加仓库',
    repoCdnBase: 'CDN 加速地址',
    repoCdnHint: '公开仓库将使用此 CDN 地址加速访问',
    cdnBasePlaceholder: 'https://cdn.jsdmirror.com/gh',
    setActiveToast: '已切换仓库',
    removeRepoCheckToast: '至少保留一个仓库',
    removeRepoToast: '仓库已删除',
    // 仓库信息
    repoInfo: '仓库信息',
    owner: 'Owner',
    repo: '仓库',
    branch: '分支',
    path: '路径',
    notSet: '未设置',
    configHint: '请配置完整的仓库信息',
    copySecretToast: '密钥已复制',
    // 保存相关
    save: '保存设置',
    saving: '保存中...',
    saveSuccess: '设置已保存',
    synced: '设置已同步到云端',
    syncFailed: '设置已保存到本地，但云端同步失败: {error}',
    localOnly: '设置已保存到本地（同步到云端时失败）',
    saveError: '保存失败: {error}',
    syncingFromRemote: '正在从云端同步到本地中',
    syncFromRemote: '设置已从云端同步到本地',
    syncFromRemoteFailed: '从云端同步失败: {error}',
    syncingToRemote: '正在将设置同步到云端中',
    syncToRemoteFailed: '同步到云端失败: {error}',
    detectedRemoteNewer: '检测到云端配置较新，已覆盖本地配置',
    detectedLocalNewer: '检测到本地配置较新，请前往设置同步',
    // 其他
    reset: '恢复默认',
    resetDone: '已恢复默认设置',
    settingInfo: '配置信息',
    loadFromRemote: '从云端加载',
    uploadToRemote: '上传到云端',
  },
  // 通用
  common: {
    // 复制相关
    copy: '复制链接',
    copied: '已复制到剪贴板',
    copyFailed: '复制失败，请手动复制',
    copyLink: '复制链接',
    // 窗口操作
    openNew: '新窗口打开',
    close: '关闭',
    // 状态提示
    loading: '加载中...',
    processing: '处理中...',
    inTheProgress: '正在 {action} ...',
    // 按钮文本
    confirm: '确认',
    cancel: '取消',
    // 错误信息
    error: '操作失败',
    networkError: '网络错误',
    notFound: '接口不存在',
    serverError: '服务器内部错误',
    unauthorized: '未授权，请重新登录',
    loginFirst: '请先登录',
    // 其他
    operationCanceled: '操作已取消',
    logout: '已退出登录',
  },
  // 批量操作
  batch: {
    // 选择相关
    selected: '已选择 {count} 张',
    selectAll: '全选',
    deselectAll: '取消全选',
    shortcutsHint: 'Tips: 按住 Ctrl 点击图片进入多选模式',
    // 批量操作
    setPublic: '设为公开',
    setPrivate: '设为私密',
    copyLinks: '复制链接',
    delete: '批量删除',
    deleteSuccess: '已删除 {count} 张图片',
    // 可见性批量操作
    visibilityTitle: '批量{action}',
    visibilityMessage: '确定要将选中的 {count} 张图片{action}吗？',
    visibilitySuccess: '已{action} {count} 张图片',
    visibilityPartial: '{action} 完成：成功 {success} 张，失败 {fail} 张',
    visibilityFailed: '{action} 失败',
  },
  // 导出
  export: {
    title: '导出图片链接',
    // 导出格式
    url: '纯文本链接（每行一个）',
    markdown: 'Markdown 格式',
    html: 'HTML img 标签',
    json: 'JSON 数组',
    csv: 'CSV 格式',
    // 操作按钮
    copyResult: '复制结果',
    download: '下载文件',
  },
  // 编辑图片
  editor: {
    title: '编辑图片',
    // 格式与质量
    format: '格式',
    original: '原格式',
    quality: '质量',
    // 尺寸相关
    maxWidth: '最大宽度',
    originalSize: '原尺寸',
    originalWidth: '原宽度',
    changedDimensions: '更改后尺寸',
    // 处理结果
    process: '处理',
    noChange: '无变化',
    estimatedSize: '预计大小',
    savedSize: '节省空间',
  },
  // API
  api: {
    // 限流与权限
    rateLimit: '请求过于频繁，请稍后再试',
    lackRequiredEnv: '缺少必要的环境变量',
    noKV: '未设置 KV',
    notFound: 'API 不存在',
    notAuthorized: '未授权，请重新登录',
    lackAuthToken: '缺少认证令牌',
    wrongPassword: '密码错误',
    authFailed: '认证失败，请重试',
    totpError: '动态验证码错误',
    totpNotConfigured: '二次验证配置不完整，请联系管理员',
    invalidTotpSecret: '二次验证密钥无效',
    // 随机图片相关
    randomIsDisable: '随机图片接口未启用',
    disallowedHost: '该主机名不被允许访问随机图片接口',
    noPublicImages: '暂无公开图片',
    noMatchingImages: '暂无符合条件的公开图片',
    fetchImageFailed: '获取图片失败',
    // 上传相关
    invalidFormData: '表单数据无效',
    noUploadedImage: '未提供图片文件',
    invalidFileType: '不支持的文件类型，仅允许：JPG、PNG、GIF、WebP',
    fileTooLarge: '文件大小超过限制（最大 20MB）',
    privateImageRequiresPrivateRepo: '私密图片只能存入 GitHub 私有仓库',
    repoVisibilityCheckFailed: '无法核实仓库是否为私有；请检查 GitHub Token 对该仓库的访问权限',
    githubUnavailable: '无法连接 GitHub，或 GitHub 暂时不可用',
    githubPermissionDenied: 'GitHub Token 无法写入目标仓库，请检查权限',
    githubRepoOrBranchNotFound: '未找到目标仓库或分支，请检查仓库配置',
    githubUploadRejected: 'GitHub 拒绝上传，请检查仓库路径和文件限制',
    githubRateLimited: 'GitHub API 已限流，请稍后再试',
    githubSsoRequired: 'GitHub Token 需要通过组织的 SSO 授权',
    repositoryToken: '仓库专用 Token',
    globalToken: '全局 Token',
    internalError: '服务器处理异常，请查看 Cloudflare 日志',
    // 仓库相关
    incompleteRepoConfig: '仓库配置不完整',
    repoNotFound: '仓库不存在',
    notConfiguredRepo: '没有配置仓库',
    notProvidedRepoId: '仓库 ID 未提供',
    // 文件相关
    invalidData: '请求数据无效',
    invalidFilename: '文件名无效',
    fileNotExist: '文件不存在',
    fileNotFound: '文件不存在',
    getFileInfoFailed: '获取文件信息失败',
    emptyFilesList: '请提供文件名列表',
    // 批量操作
    isPublicMustBeBoolean: 'isPublic 必须是布尔值',
    batchFailed: '批量操作失败',
    // 其他
    unknownError: '未知错误',
    saveSettingsFailed: '保存设置失败',
  },
};
