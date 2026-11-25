// ==UserScript==
// @name         Stage1st 企业微信主题
// @namespace    https://stage1st.com/
// @version      0.2.4
// @description  将 Stage1st (S1) 论坛界面切换为企业微信 5.x 桌面端风格，支持浅色/深色/跟随系统、伪装模式与原站互动。
// @match        *://stage1st.com/*
// @match        *://*.stage1st.com/*
// @icon         https://stage1st.com/2b/static/image/s1/bbs.ico
// @grant        none
// @run-at       document-start
// @noframes
// @license      MIT
// ==/UserScript==

(() => {
  "use strict";
  const SCRIPT_VERSION = "0.2.3";

  /* === src/config.js === */
  const STYLE_ID = "s1-wecom-theme";
  const FAVICON_ID = "s1-wecom-favicon";
  const ROOT_ID = "s1-wecom-root";
  const ROOT_CLASS = "s1-wecom-theme";
  const LOCK_CLASS = "s1-wecom-locked";

  const RAIL_WIDTH = 56;
  const DRAWER_WIDTH = 236;
  const LIST_WIDTH = 290;
  const LIST_MIN_WIDTH = 220;
  const LIST_MAX_WIDTH = 460;
  const POSTS_PER_PAGE = 40;

  const BASE_PATH = "/2b/";
  const STATIC_BASE = "https://static.stage1st.com/";
  const AVATAR_BASE = "https://avatar.stage1st.com/";
  const APP_API_BASE = "https://app.stage1st.com/2b/api/app";
  const BLOCKED_REPLY_TEXT = "作者被禁止或删除 内容自动屏蔽";
  const REVIEW_PENDING_TEXT = "内容审核中，即将开放";

  const STORAGE_KEYS = {
    viewMode: "s1-wecom-view",
    themeMode: "s1-wecom-theme-mode",
    listWidth: "s1-wecom-list-width",
    lastFid: "s1-wecom-last-fid",
    hideUnreadBadge: "s1-wecom-hide-unread",
    noImageMode: "s1-wecom-no-image",
    hideChatAvatar: "s1-wecom-hide-chat-avatar",
    hideTail: "s1-wecom-hide-tail",
    pinnedThreads: "s1-wecom-pinned-threads",
    pollConfig: "s1-wecom-poll-config",
    savedAccounts: "s1-wecom-accounts",
    watermark: "s1-wecom-watermark",
    userTags: "s1-wecom-user-tags",
    lastRead: "s1-wecom-last-read",
    history: "s1-wecom-history",
    smilies: "s1-wecom-smilies-v1",
    recentSmilies: "s1-wecom-recent-smilies",
    appSid: "app_sid",
    appUser: "s1-wecom-app-user"
  };

  const FALLBACK_BOARDS = {
    categories: [
      { cid: "1", name: "主论坛", fids: ["157", "75", "6", "4", "48", "51"] },
      { cid: "117", name: "热门新区", fids: ["135", "151", "77", "136", "144", "83"] }
    ],
    forums: [
      { fid: "157", name: "归墟", category: "主论坛", todayposts: 0, threads: 0 },
      { fid: "75", name: "外野", category: "主论坛", todayposts: 0, threads: 0 },
      { fid: "6", name: "动漫论坛", category: "主论坛", todayposts: 0, threads: 0 },
      { fid: "4", name: "游戏论坛", category: "主论坛", todayposts: 0, threads: 0 },
      { fid: "48", name: "影视论坛", category: "主论坛", todayposts: 0, threads: 0 },
      { fid: "51", name: "ＰＣ数码", category: "主论坛", todayposts: 0, threads: 0 },
      { fid: "135", name: "手游页游", category: "热门新区", todayposts: 0, threads: 0 },
      { fid: "151", name: "VTB", category: "热门新区", todayposts: 0, threads: 0 },
      { fid: "77", name: "八卦体育", category: "热门新区", todayposts: 0, threads: 0 },
      { fid: "136", name: "模玩手办", category: "热门新区", todayposts: 0, threads: 0 },
      { fid: "144", name: "欧美动漫", category: "热门新区", todayposts: 0, threads: 0 },
      { fid: "83", name: "动漫鉴赏区", category: "热门新区", todayposts: 0, threads: 0 }
    ]
  };

  const SMILEY_GROUP_ORDER = [
    "face2017",
    "goose2017",
    "animal2017",
    "device2017",
    "bundam2017",
    "carton2017",
    "face",
    "normal",
    "goose",
    "bundam",
    "carton",
    "nq",
    "dym",
    "animal",
    "flash",
    "zdl"
  ];

  const SMILEY_GROUP_LABELS = {
    face2017: "麻将脸",
    goose2017: "鹅",
    animal2017: "动物",
    device2017: "设备",
    bundam2017: "高达",
    carton2017: "动漫",
    face: "经典脸",
    normal: "常规",
    goose: "旧鹅",
    bundam: "旧高达",
    carton: "旧动漫",
    nq: "NQ",
    dym: "DYM",
    animal: "旧动物",
    flash: "闪图",
    zdl: "战斗力"
  };

  const AVATAR_COLORS = [
    "#267EF0", "#1E8E3E", "#D97706", "#7C3AED", "#DB2777", "#0891B2", "#4F46E5", "#DC2626"
  ];

  const ICONS = {
    msg: `<svg width="22" height="22" viewBox="0 0 24 24" fill="currentColor"><path d="M18 3a4 4 0 0 1 4 4v8a4 4 0 0 1 -4 4h-4.724l-4.762 2.857a1 1 0 0 1 -1.502 -.743l-.012 -.114v-2h-1a4 4 0 0 1 -3.995 -3.8l-.005 -.2v-8a4 4 0 0 1 4 -4zm-4 9h-6a1 1 0 0 0 0 2h6a1 1 0 0 0 0 -2m2 -4h-8a1 1 0 1 0 0 2h8a1 1 0 0 0 0 -2"/></svg>`,
    boards: `<svg width="22" height="22" viewBox="0 0 24 24" fill="currentColor"><path d="M9 3a2 2 0 0 1 2 2v4a2 2 0 0 1 -2 2h-4a2 2 0 0 1 -2 -2v-4a2 2 0 0 1 2 -2zm10 0a2 2 0 0 1 2 2v4a2 2 0 0 1 -2 2h-4a2 2 0 0 1 -2 -2v-4a2 2 0 0 1 2 -2zm-10 10a2 2 0 0 1 2 2v4a2 2 0 0 1 -2 2h-4a2 2 0 0 1 -2 -2v-4a2 2 0 0 1 2 -2zm10 0a2 2 0 0 1 2 2v4a2 2 0 0 1 -2 2h-4a2 2 0 0 1 -2 -2v-4a2 2 0 0 1 2 -2z"/></svg>`,
    fav: `<svg width="22" height="22" viewBox="0 0 24 24" fill="currentColor"><path d="M8.243 7.34l-6.38 .925l-.113 .023a1 1 0 0 0 -.44 1.684l4.622 4.499l-1.09 6.355l-.013 .11a1 1 0 0 0 1.464 .944l5.706 -3l5.693 3l.1 .046a1 1 0 0 0 1.352 -1.1l-1.091 -6.355l4.624 -4.5l.078 -.085a1 1 0 0 0 -.633 -1.62l-6.38 -.926l-2.852 -5.78a1 1 0 0 0 -1.794 0z"/></svg>`,
    notif: `<svg width="22" height="22" viewBox="0 0 24 24" fill="currentColor"><path d="M14.235 19c.865 0 1.322 1.024 .745 1.668a3.992 3.992 0 0 1 -2.98 1.332a3.992 3.992 0 0 1 -2.98 -1.332c-.552 -.616 -.158 -1.579 .634 -1.661l.11 -.006h4.471zm-2.235 -17a1 1 0 0 1 .993 .883l.007 .117v.07a7.002 7.002 0 0 1 6 6.93v3l.005 .164a3.001 3.001 0 0 0 1.367 2.345l.154 .091a1 1 0 0 1 .331 1.41l-.066 .092l-.093 .081a1 1 0 0 1 -.712 .222h-16a1 1 0 0 1 -.774 -1.635l.124 -.118l.136 -.089a3 3 0 0 0 1.504 -2.35l.01 -.208v-3a7.002 7.002 0 0 1 6 -6.93v-.07a1 1 0 0 1 1 -1z"/></svg>`,
    history: `<svg width="22" height="22" viewBox="0 0 24 24" fill="currentColor"><path d="M12 2a10 10 0 1 1 -9.995 10.324l-.005 -.324a10 10 0 0 1 10 -10m0 4a1 1 0 0 0 -.993 .883l-.007 .117v5l.009 .131a1 1 0 0 0 .197 .477l.087 .1l3 3a1 1 0 0 0 1.497 -1.32l-.083 -.094l-2.707 -2.707v-4.586a1 1 0 0 0 -1 -1"/></svg>`,
    sun: `<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="4"/><path d="M3 12h1m8 -9v1m8 8h1m-9 8v1m-6.4 -15.4l.7 .7m12.1 -.7l-.7 .7m0 11.4l.7 .7m-12.1 -.7l-.7 .7"/></svg>`,
    moon: `<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><path d="M12 3c.132 0 .263 0 .393 0a7.5 7.5 0 0 0 7.92 12.446a9 9 0 1 1 -8.313 -12.454z"/></svg>`,
    themeAuto: `<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="9"/><path d="M12 3v18"/><path d="M12 12l6.3 -6.3"/><path d="M12 16.5l7.5 -7.5"/><path d="M12 20.5l6.8 -6.8"/></svg>`,
    gear: `<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><path d="M10.325 4.317c.426 -1.756 2.924 -1.756 3.35 0a1.724 1.724 0 0 0 2.573 1.066c1.543 -.94 3.31 .826 2.37 2.37a1.724 1.724 0 0 0 1.065 2.572c1.756 .426 1.756 2.924 0 3.35a1.724 1.724 0 0 0 -1.066 2.573c.94 1.543 -.826 3.31 -2.37 2.37a1.724 1.724 0 0 0 -2.572 1.065c-.426 1.756 -2.924 1.756 -3.35 0a1.724 1.724 0 0 0 -2.573 -1.066c-1.543 .94 -3.31 -.826 -2.37 -2.37a1.724 1.724 0 0 0 -1.065 -2.572c-1.756 -.426 -1.756 -2.924 0 -3.35a1.724 1.724 0 0 0 1.066 -2.573c-.94 -1.543 .826 -3.31 2.37 -2.37c1 .608 2.296 .07 2.572 -1.065z"/><circle cx="12" cy="12" r="3"/></svg>`,
    search: `<svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="10" cy="10" r="7"/><path d="M21 21l-6 -6"/></svg>`,
    plus: `<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M12 5v14M5 12h14"/></svg>`,
    close: `<svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M18 6L6 18M6 6l12 12"/></svg>`,
    eye: `<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.7" stroke-linecap="round" stroke-linejoin="round"><path d="M2 12s3.5 -6 10 -6s10 6 10 6s-3.5 6 -10 6s-10 -6 -10 -6z"/><circle cx="12" cy="12" r="2.5"/></svg>`,
    eyeOff: `<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.7" stroke-linecap="round" stroke-linejoin="round"><path d="M3 3l18 18"/><path d="M10.584 10.587a2 2 0 0 0 2.828 2.83"/><path d="M9.363 5.365a9.466 9.466 0 0 1 2.637 -.365c4 0 7.333 2.333 10 7c-.778 1.361 -1.612 2.524 -2.503 3.488m-2.14 1.861c-1.631 1.1 -3.415 1.651 -5.357 1.651c-4 0 -7.333 -2.333 -10 -7c1.369 -2.395 2.913 -4.175 4.632 -5.341"/></svg>`,
    noImage: `<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.7" stroke-linecap="round" stroke-linejoin="round"><path d="M15 8h.01"/><path d="M19.121 19.122a3 3 0 0 1 -2.121 .878h-10a3 3 0 0 1 -3 -3v-10c0 -.833 .34 -1.587 .888 -2.131m3.112 -.869h9a3 3 0 0 1 3 3v9"/><path d="M4 15l4 -4c.928 -.893 2.072 -.893 3 0l5 5"/><path d="M16.32 12.34c.577 -.059 1.162 .162 1.68 .66l2 2"/><path d="M3 3l18 18"/></svg>`,
    verified: `<svg width="14" height="14" viewBox="0 0 24 24" fill="#18A058"><path d="M12 2l7 3v6c0 5.25 -3.4 9.74 -7 11c-3.6 -1.26 -7 -5.75 -7 -11v-6l7 -3zm3.3 7.3a1 1 0 0 0 -1.4 0l-2.9 2.9l-1.2 -1.2a1 1 0 1 0 -1.4 1.4l1.9 1.9a1 1 0 0 0 1.4 0l3.6 -3.6a1 1 0 0 0 0 -1.4z"/></svg>`,
    chevronRight: `<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M9 6l6 6l-6 6"/></svg>`,
    filterUser: `<svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="7" r="4"/><path d="M6 21v-2a4 4 0 0 1 4 -4h2.5"/><path d="M16 19h6M19 16v6"/></svg>`,
    homeSpace: `<svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><path d="M5 12l-2 0l9 -9l9 9l-2 0"/><path d="M5 12v7a2 2 0 0 0 2 2h10a2 2 0 0 0 2 -2v-7"/><path d="M9 21v-6a2 2 0 0 1 2 -2h2a2 2 0 0 1 2 2v6"/></svg>`,
    refresh: `<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><path d="M20 11a8.1 8.1 0 0 0 -15.5 -2m-.5 -4v4h4"/><path d="M4 13a8.1 8.1 0 0 0 15.5 2m.5 4v-4h-4"/></svg>`,
    star: `<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><path d="M12 17.75l-6.172 3.245l1.179 -6.873l-5 -4.867l6.9 -1l3.086 -6.253l3.086 6.253l6.9 1l-5 4.867l1.179 6.873z"/></svg>`,
    watermark: `<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><path d="M12 3l8 4.5v9l-8 4.5l-8 -4.5v-9l8 -4.5"/><path d="M12 12l8 -4.5M12 12v9M12 12l-8 -4.5"/></svg>`,
    external: `<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><path d="M12 6h-6a2 2 0 0 0 -2 2v10a2 2 0 0 0 2 2h10a2 2 0 0 0 2 -2v-6"/><path d="M11 13l9 -9"/><path d="M15 4h5v5"/></svg>`,
    dots: `<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="1"/><circle cx="12" cy="5" r="1"/><circle cx="12" cy="19" r="1"/></svg>`,
    reply: `<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.9" stroke-linecap="round" stroke-linejoin="round"><path d="M9 14l-4 -4l4 -4"/><path d="M5 10h11a4 4 0 1 1 0 8h-1"/></svg>`,
    goose: `<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.9" stroke-linecap="round" stroke-linejoin="round"><path d="M12 5v14M5 12h14"/></svg>`,
    link: `<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.9" stroke-linecap="round" stroke-linejoin="round"><path d="M9 15l6 -6"/><path d="M11 6l.463 -.536a5 5 0 0 1 7.071 7.072l-.534 .464"/><path d="M13 18l-.397 .534a5.068 5.068 0 0 1 -7.127 0a4.972 4.972 0 0 1 0 -7.071l.524 -.463"/></svg>`,
    tag: `<svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><path d="M7.5 7.5m-1 0a1 1 0 1 0 2 0a1 1 0 1 0 -2 0"/><path d="M3 6v5.172a2 2 0 0 0 .586 1.414l7.71 7.71a2.41 2.41 0 0 0 3.408 0l5.092 -5.092a2.41 2.41 0 0 0 0 -3.408l-7.71 -7.71a2 2 0 0 0 -1.414 -.586h-5.172a3 3 0 0 0 -3 3z"/></svg>`,
    emoji: `<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="9"/><path d="M9 10h.01M15 10h.01"/><path d="M9.5 15a3.5 3.5 0 0 0 5 0"/></svg>`,
    pic: `<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round"><rect x="3" y="4" width="18" height="16" rx="2"/><circle cx="8.5" cy="9.5" r="1.5"/><path d="M21 15l-5 -5l-11 10"/></svg>`,
    attach: `<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round"><path d="M15 7l-6.5 6.5a1.5 1.5 0 0 0 3 3l6.5 -6.5a3 3 0 0 0 -6 -6l-6.5 6.5a4.5 4.5 0 0 0 9 9l6.5 -6.5"/></svg>`,
    whiteout: `<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round"><rect x="3" y="6" width="18" height="12" rx="2"/><path d="M7 10h10M7 14h6"/></svg>`,
    pin: `<svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.9" stroke-linecap="round" stroke-linejoin="round"><path d="M15 4.5l-4 4l-4 1.5l-1.5 1.5l7 7l1.5 -1.5l1.5 -4l4 -4"/><path d="M9 15l-4.5 4.5"/><path d="M14.5 4l5.5 5.5"/></svg>`,
    scrollTop: `<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><path d="M12 5v14M6 11l6 -6l6 6"/></svg>`,
    scrollBottom: `<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><path d="M12 5v14M6 13l6 6l6 -6"/></svg>`,
    chatSearch: `<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round"><path d="M4 21v-4.5a8 8 0 1 1 3.5 3.1l-3.5 1.4z"/><circle cx="11.5" cy="11.5" r="2.5"/><path d="M13.5 13.5l2 2"/></svg>`,
    key: `<svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><path d="M16.555 3.843l3.602 3.602a2.877 2.877 0 0 1 0 4.069l-2.643 2.643a2.877 2.877 0 0 1 -4.069 0l-.301 -.301l-6.558 6.558a2 2 0 0 1 -1.239 .578l-.175 .008h-1.172a1 1 0 0 1 -.993 -.883l-.007 -.117v-1.172a2 2 0 0 1 .467 -1.284l.119 -.13l.414 -.414h2v-2h2v-2l2.144 -2.144l-.301 -.301a2.877 2.877 0 0 1 0 -4.069l2.643 -2.643a2.877 2.877 0 0 1 4.069 0z"/><circle cx="15" cy="9" r="1" fill="currentColor"/></svg>`,
    userOff: `<svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><path d="M8 7a4 4 0 1 0 8 0a4 4 0 0 0 -8 0"/><path d="M6 21v-2a4 4 0 0 1 4 -4h4a4 4 0 0 1 4 4v2"/></svg>`,
    switchUser: `<svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><path d="M16 3l4 4l-4 4"/><path d="M10 7h10"/><path d="M8 13l-4 4l4 4"/><path d="M4 17h10"/></svg>`,
    logout: `<svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><path d="M14 8v-2a2 2 0 0 0 -2 -2h-7a2 2 0 0 0 -2 2v12a2 2 0 0 0 2 2h7a2 2 0 0 0 2 -2v-2"/><path d="M9 12h12l-3 -3"/><path d="M18 15l3 -3"/></svg>`,
    clock: `<svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="9"/><path d="M12 7v5l3 3"/></svg>`
  };

  /* === src/utils.js === */
  function escapeHtml(str) {
    return String(str == null ? "" : str)
      .replace(/&/g, "&amp;")
      .replace(/</g, "&lt;")
      .replace(/>/g, "&gt;")
      .replace(/"/g, "&quot;")
      .replace(/'/g, "&#39;");
  }

  const NAMED_ENTITIES = {
    amp: "&",
    lt: "<",
    gt: ">",
    quot: "\"",
    apos: "'",
    nbsp: " ",
    "#39": "'",
    "#x27": "'"
  };

  function decodeHtmlEntities(input, maxPasses = 2) {
    let text = String(input == null ? "" : input);
    for (let pass = 0; pass < maxPasses; pass++) {
      const next = text.replace(/&(#x[0-9a-fA-F]+|#\d+|[a-zA-Z]+);/g, (full, entity) => {
        const lower = entity.toLowerCase();
        if (NAMED_ENTITIES[lower] !== undefined) return NAMED_ENTITIES[lower];
        if (lower.startsWith("#x")) {
          const cp = parseInt(lower.slice(2), 16);
          return Number.isFinite(cp) ? String.fromCodePoint(cp) : full;
        }
        if (lower.startsWith("#")) {
          const cp = parseInt(lower.slice(1), 10);
          return Number.isFinite(cp) ? String.fromCodePoint(cp) : full;
        }
        return full;
      });
      if (next === text) break;
      text = next;
    }
    return text;
  }

  function stripHtmlTags(html) {
    return decodeHtmlEntities(String(html || "").replace(/<[^>]*>/g, " "))
      .replace(/\s+/g, " ")
      .trim();
  }

  function ucenterAvatarUrl(uid, size = "middle") {
    const num = String(uid || "").replace(/\D/g, "");
    if (!num || num === "0") return "";
    const padded = num.padStart(9, "0");
    const validSize = size === "big" || size === "small" ? size : "middle";
    return `${AVATAR_BASE}${padded.slice(0, 3)}/${padded.slice(3, 5)}/${padded.slice(5, 7)}/${padded.slice(7, 9)}_avatar_${validSize}.jpg`;
  }

  function hashString(input) {
    const s = String(input || "");
    let h = 2166136261;
    for (let i = 0; i < s.length; i++) {
      h ^= s.charCodeAt(i);
      h = Math.imul(h, 16777619);
    }
    return h >>> 0;
  }

  function avatarColor(seed) {
    return AVATAR_COLORS[hashString(seed) % AVATAR_COLORS.length];
  }

  function avatarLetter(name) {
    const cleaned = String(name || "").trim();
    if (!cleaned) return "S";
    return cleaned.slice(0, 1).toUpperCase();
  }

  function parseTimestampMs(val) {
    if (val == null || val === "") return 0;
    if (typeof val === "number") {
      return val < 1e12 ? val * 1000 : val;
    }
    const s = String(val).trim();
    if (/^\d{9,13}$/.test(s)) {
      const n = Number(s);
      return n < 1e12 ? n * 1000 : n;
    }
    const normalized = s
      .replace(/(\d{4})-(\d{1,2})-(\d{1,2})/, (_, y, m, d) =>
        `${y}-${m.padStart(2, "0")}-${d.padStart(2, "0")}`
      )
      .replace(" ", "T");
    const parsed = Date.parse(normalized);
    return Number.isFinite(parsed) ? parsed : 0;
  }

  function formatRelativeTime(val, nowMs = Date.now()) {
    const ms = parseTimestampMs(val);
    if (!ms) return String(val || "");
    const diffSec = Math.floor((nowMs - ms) / 1000);
    if (diffSec < 60 && diffSec >= -60) return "刚刚";
    if (diffSec > 0 && diffSec < 3600) return `${Math.floor(diffSec / 60)} 分钟前`;

    const dt = new Date(ms);
    const now = new Date(nowMs);
    const pad2 = (n) => String(n).padStart(2, "0");
    const hhmm = `${pad2(dt.getHours())}:${pad2(dt.getMinutes())}`;

    const startToday = new Date(now.getFullYear(), now.getMonth(), now.getDate()).getTime();
    const startYesterday = startToday - 86400 * 1000;
    if (ms >= startToday) return hhmm;
    if (ms >= startYesterday) return `昨天 ${hhmm}`;
    if (dt.getFullYear() === now.getFullYear()) {
      return `${pad2(dt.getMonth() + 1)}-${pad2(dt.getDate())}`;
    }
    return `${dt.getFullYear()}-${pad2(dt.getMonth() + 1)}-${pad2(dt.getDate())}`;
  }

  function formatFullTime(val) {
    const ms = parseTimestampMs(val);
    if (!ms) return String(val || "");
    const dt = new Date(ms);
    const pad2 = (n) => String(n).padStart(2, "0");
    return `${dt.getFullYear()}-${pad2(dt.getMonth() + 1)}-${pad2(dt.getDate())} ${pad2(dt.getHours())}:${pad2(dt.getMinutes())}`;
  }

  function clamp(val, min, max) {
    return Math.min(max, Math.max(min, val));
  }

  function debounce(fn, wait = 200) {
    let timer = null;
    return function (...args) {
      clearTimeout(timer);
      timer = setTimeout(() => fn.apply(this, args), wait);
    };
  }

  function safeJsonParse(raw, fallback = null) {
    try {
      return JSON.parse(raw);
    } catch {
      return fallback;
    }
  }

  function getStorage(storage = typeof localStorage !== "undefined" ? localStorage : null) {
    return storage;
  }

  function readStorage(key, fallback = null, storage = getStorage()) {
    if (!storage) return fallback;
    try {
      const val = storage.getItem(key);
      return val === null ? fallback : val;
    } catch {
      return fallback;
    }
  }

  function writeStorage(key, value, storage = getStorage()) {
    if (!storage) return;
    try {
      storage.setItem(key, String(value));
    } catch {
      /* ignore quota errors */
    }
  }

  function readLastReadMap(storage = getStorage()) {
    const parsed = safeJsonParse(readStorage(STORAGE_KEYS.lastRead, "{}", storage), {});
    return parsed && typeof parsed === "object" ? parsed : {};
  }

  function saveLastRead(tid, entry = {}, storage = getStorage()) {
    if (!tid) return;
    const key = String(tid);
    const map = readLastReadMap(storage);
    const prev = map[key] || {};
    const next = {
      replies: entry.replies !== undefined ? Number(entry.replies || 0) : Number(prev.replies || 0),
      page: entry.page !== undefined ? Math.max(1, Number(entry.page || 1)) : Math.max(1, Number(prev.page || 1)),
      pid: entry.pid !== undefined ? String(entry.pid || "") : String(prev.pid || ""),
      floor: entry.floor !== undefined ? Number(entry.floor || 0) : Number(prev.floor || 0),
      updatedAt: Date.now()
    };
    map[key] = next;
    const keys = Object.keys(map);
    if (keys.length > 200) {
      keys.sort((a, b) => (map[a].updatedAt || 0) - (map[b].updatedAt || 0));
      for (let i = 0; i < keys.length - 200; i++) delete map[keys[i]];
    }
    writeStorage(STORAGE_KEYS.lastRead, JSON.stringify(map), storage);
  }

  function readHistory(storage = getStorage()) {
    const list = safeJsonParse(readStorage(STORAGE_KEYS.history, "[]", storage), []);
    return Array.isArray(list) ? list : [];
  }

  function recordHistory(item, storage = getStorage()) {
    if (!item || !item.tid) return;
    const tid = String(item.tid);
    const existing = readHistory(storage).filter((x) => String(x.tid) !== tid);
    existing.unshift({
      tid,
      fid: String(item.fid || ""),
      boardName: String(item.boardName || ""),
      subject: String(item.subject || ""),
      author: String(item.author || ""),
      authorid: String(item.authorid || ""),
      replies: Number(item.replies || 0),
      visitedAt: Date.now()
    });
    writeStorage(STORAGE_KEYS.history, JSON.stringify(existing.slice(0, 200)), storage);
  }

  function clearHistory(storage = getStorage()) {
    writeStorage(STORAGE_KEYS.history, "[]", storage);
  }

  function readUserTags(storage = getStorage()) {
    const parsed = safeJsonParse(readStorage(STORAGE_KEYS.userTags, "{}", storage), {});
    return parsed && typeof parsed === "object" ? parsed : {};
  }

  function saveUserTags(map, storage = getStorage()) {
    writeStorage(STORAGE_KEYS.userTags, JSON.stringify(map || {}), storage);
  }

  function setUserTagRecord(uid, username, tags, note = "", storage = getStorage()) {
    const key = String(uid || username || "").trim();
    if (!key) return readUserTags(storage);
    const map = readUserTags(storage);
    const cleanedTags = (Array.isArray(tags) ? tags : String(tags || "").split(/[,，\s]+/))
      .map((t) => t.trim())
      .filter(Boolean);
    const cleanedNote = String(note || "").trim();
    if (!cleanedTags.length && !cleanedNote) {
      delete map[key];
    } else {
      map[key] = {
        uid: String(uid || ""),
        username: String(username || ""),
        tags: Array.from(new Set(cleanedTags)),
        note: cleanedNote,
        updatedAt: Date.now()
      };
    }
    saveUserTags(map, storage);
    return map;
  }

  function exportUserTagsJson(storage = getStorage()) {
    return JSON.stringify(readUserTags(storage), null, 2);
  }

  function importUserTagsJson(rawJson, mode = "merge", storage = getStorage()) {
    const parsed = safeJsonParse(rawJson, null);
    if (!parsed || typeof parsed !== "object" || Array.isArray(parsed)) {
      throw new Error("无效的用户标签 JSON 格式");
    }
    const base = mode === "replace" ? {} : readUserTags(storage);
    for (const [k, v] of Object.entries(parsed)) {
      if (!v || typeof v !== "object") continue;
      const tags = Array.isArray(v.tags) ? v.tags.map((t) => String(t).trim()).filter(Boolean) : [];
      const note = String(v.note || "").trim();
      if (!tags.length && !note) continue;
      base[String(k)] = {
        uid: String(v.uid || k),
        username: String(v.username || ""),
        tags: Array.from(new Set(tags)),
        note,
        updatedAt: Number(v.updatedAt || Date.now())
      };
    }
    saveUserTags(base, storage);
    return base;
  }

  function readPinnedThreads(storage = getStorage()) {
    const parsed = safeJsonParse(readStorage(STORAGE_KEYS.pinnedThreads, "{}", storage), {});
    return parsed && typeof parsed === "object" && !Array.isArray(parsed) ? parsed : {};
  }

  function togglePinnedThread(tid, meta = {}, storage = getStorage()) {
    const key = String(tid || "").trim();
    if (!key) return readPinnedThreads(storage);
    const map = readPinnedThreads(storage);
    if (map[key]) {
      delete map[key];
    } else {
      map[key] = {
        tid: key,
        fid: String(meta.fid || ""),
        subject: String(meta.subject || ""),
        author: String(meta.author || ""),
        authorid: String(meta.authorid || ""),
        pinnedAt: Date.now()
      };
    }
    writeStorage(STORAGE_KEYS.pinnedThreads, JSON.stringify(map), storage);
    return map;
  }

  function normalizePollSec(val, fallback) {
    if (val === undefined || val === null || val === "") return fallback;
    const n = Number(val);
    if (!Number.isFinite(n)) return fallback;
    if (n <= 0) return 0;
    return clamp(Math.round(n), 5, 3600);
  }

  function readPollConfig(storage = getStorage()) {
    const parsed = safeJsonParse(readStorage(STORAGE_KEYS.pollConfig, "{}", storage), {});
    return {
      boardSec: normalizePollSec(parsed?.boardSec, 30),
      threadSec: normalizePollSec(parsed?.threadSec, 25)
    };
  }

  function savePollConfig({ boardSec, threadSec } = {}, storage = getStorage()) {
    const next = {
      boardSec: normalizePollSec(boardSec, 30),
      threadSec: normalizePollSec(threadSec, 25)
    };
    writeStorage(STORAGE_KEYS.pollConfig, JSON.stringify(next), storage);
    return next;
  }

  function readSavedAccounts(storage = getStorage()) {
    const list = safeJsonParse(readStorage(STORAGE_KEYS.savedAccounts, "[]", storage), []);
    return Array.isArray(list) ? list : [];
  }

  function accountIdentityKey(acc) {
    const uid = String(acc?.uid || "").trim();
    if (uid && uid !== "0") return `uid:${uid}`;
    return `name:${String(acc?.loginName || acc?.username || "").trim().toLowerCase()}`;
  }

  function upsertSavedAccount(account, storage = getStorage()) {
    if (!account) return readSavedAccounts(storage);
    const loginName = String(account.loginName || account.username || "").trim();
    const username = String(account.username || loginName).trim();
    if (!loginName && !username) return readSavedAccounts(storage);

    const nextEntry = {
      uid: String(account.uid || "0"),
      username,
      loginName: loginName || username,
      password: String(account.password || ""),
      questionid: String(account.questionid || "0"),
      answer: String(account.answer || ""),
      avatar: String(account.avatar || ""),
      savedAt: Date.now()
    };

    const nextKey = accountIdentityKey(nextEntry);
    const nextNameKey = `name:${nextEntry.loginName.toLowerCase()}`;
    const list = readSavedAccounts(storage).filter((item) => {
      const k = accountIdentityKey(item);
      const nk = `name:${String(item?.loginName || item?.username || "").trim().toLowerCase()}`;
      return k !== nextKey && nk !== nextNameKey && (nextEntry.uid === "0" || String(item?.uid || "0") !== nextEntry.uid);
    });
    list.unshift(nextEntry);
    const trimmed = list.slice(0, 15);
    writeStorage(STORAGE_KEYS.savedAccounts, JSON.stringify(trimmed), storage);
    return trimmed;
  }

  function removeSavedAccount(key, storage = getStorage()) {
    const target = String(key || "").trim();
    const targetLower = target.toLowerCase();
    const next = readSavedAccounts(storage).filter((item) => {
      const uid = String(item?.uid || "");
      const login = String(item?.loginName || "").toLowerCase();
      const user = String(item?.username || "").toLowerCase();
      return uid !== target && login !== targetLower && user !== targetLower && `uid:${uid}` !== target;
    });
    writeStorage(STORAGE_KEYS.savedAccounts, JSON.stringify(next), storage);
    return next;
  }

  /* === src/parser.js === */
  function parseStage1stRoute(pathname = "", search = "") {
    const path = String(pathname || "");
    const qs = String(search || "");
    const params = new URLSearchParams(qs.startsWith("?") ? qs.slice(1) : qs);

    if (/\/member\.php$/i.test(path)) {
      return { type: "auth", skipLock: true };
    }

    const forumMatch = path.match(/\/forum-(\d+)-(\d+)\.html$/i);
    if (forumMatch) {
      return { type: "board", fid: forumMatch[1], page: Math.max(1, Number(forumMatch[2]) || 1) };
    }

    const threadMatch = path.match(/\/thread-(\d+)-(\d+)(?:-\d+)?\.html$/i);
    if (threadMatch) {
      return { type: "thread", tid: threadMatch[1], page: Math.max(1, Number(threadMatch[2]) || 1) };
    }

    if (/\/forum\.php$/i.test(path)) {
      const mod = params.get("mod") || "";
      if (mod === "forumdisplay" && params.get("fid")) {
        return {
          type: "board",
          fid: params.get("fid"),
          page: Math.max(1, Number(params.get("page")) || 1),
          typeid: params.get("typeid") || ""
        };
      }
      if (mod === "viewthread" && params.get("tid")) {
        return {
          type: "thread",
          tid: params.get("tid"),
          page: Math.max(1, Number(params.get("page")) || 1),
          authorid: params.get("authorid") || ""
        };
      }
      if (mod === "redirect" && params.get("goto") === "findpost") {
        return {
          type: "findpost",
          pid: params.get("pid") || "",
          tid: params.get("ptid") || params.get("tid") || ""
        };
      }
      if (!mod) {
        return { type: "home" };
      }
    }

    if (/\/2b\/?(?:index\.php)?$/i.test(path) || path === "/" || path === "") {
      return { type: "home" };
    }

    return { type: "other", skipLock: true };
  }

  function buildBoardUrl(fid, page = 1) {
    return `${BASE_PATH}forum-${encodeURIComponent(String(fid))}-${Math.max(1, Number(page) || 1)}.html`;
  }

  function buildThreadUrl(tid, page = 1) {
    return `${BASE_PATH}thread-${encodeURIComponent(String(tid))}-${Math.max(1, Number(page) || 1)}-1.html`;
  }

  function unescapeSmileyCode(rawCode) {
    let code = String(rawCode || "").trim();
    if (code.length >= 2 && code.startsWith("/") && code.endsWith("/")) {
      code = code.slice(1, -1);
    }
    return code.replace(/\\(.)/g, "$1");
  }

  function normalizeSmileyGroups(apiData) {
    const rawGroups = apiData?.Variables?.smilies;
    if (!Array.isArray(rawGroups)) return [];
    const byPrefix = new Map();
    for (const group of rawGroups) {
      if (!Array.isArray(group) || !group.length) continue;
      const firstImg = String(group[0]?.image || "");
      const prefix = firstImg.includes("/") ? firstImg.split("/")[0] : "other";
      const items = [];
      for (const item of group) {
        const code = unescapeSmileyCode(item?.code);
        const image = String(item?.image || "").replace(/^\/+/, "");
        if (!code || !image) continue;
        items.push({
          code,
          image,
          url: `${STATIC_BASE}image/smiley/${image}`
        });
      }
      if (items.length) {
        byPrefix.set(prefix, {
          key: prefix,
          label: SMILEY_GROUP_LABELS[prefix] || prefix,
          items
        });
      }
    }
    const ordered = [];
    for (const key of SMILEY_GROUP_ORDER) {
      if (byPrefix.has(key)) {
        ordered.push(byPrefix.get(key));
        byPrefix.delete(key);
      }
    }
    for (const rest of byPrefix.values()) {
      ordered.push(rest);
    }
    return ordered;
  }

  function normalizeForumIndex(apiData) {
    const v = apiData?.Variables || {};
    const uid = String(v.member_uid || "0");
    const username = decodeHtmlEntities(v.member_username || "");
    const notice = v.notice || {};
    const unreadCount =
      (Number(notice.newpm) || 0) +
      (Number(notice.newprompt) || 0) +
      (Number(notice.newmypost) || 0) +
      (Number(notice.newpush) || 0);

    const forumMap = new Map();
    for (const fb of FALLBACK_BOARDS.forums) {
      forumMap.set(String(fb.fid), { ...fb });
    }
    for (const f of Array.isArray(v.forumlist) ? v.forumlist : []) {
      const fid = String(f?.fid || "");
      if (!fid) continue;
      const prev = forumMap.get(fid) || { fid, category: "论坛板块" };
      forumMap.set(fid, {
        ...prev,
        fid,
        name: decodeHtmlEntities(f.name || prev.name || `板块 ${fid}`),
        threads: Number(f.threads || prev.threads || 0),
        posts: Number(f.posts || prev.posts || 0),
        todayposts: Number(f.todayposts || 0),
        description: stripHtmlTags(f.description || "")
      });
    }

    const categories = [];
    const seenFids = new Set();
    const catList = Array.isArray(v.catlist) && v.catlist.length ? v.catlist : FALLBACK_BOARDS.categories;
    for (const cat of catList) {
      const fids = Array.isArray(cat.forums) ? cat.forums.map(String) : (Array.isArray(cat.fids) ? cat.fids.map(String) : []);
      const boards = [];
      for (const fid of fids) {
        const board = forumMap.get(fid);
        if (board) {
          board.category = decodeHtmlEntities(cat.name || board.category || "");
          boards.push(board);
          seenFids.add(fid);
        }
      }
      if (boards.length) {
        categories.push({
          cid: String(cat.fid || cat.cid || categories.length + 1),
          name: decodeHtmlEntities(cat.name || "论坛板块"),
          boards
        });
      }
    }

    const extraBoards = [];
    for (const [fid, board] of forumMap.entries()) {
      if (!seenFids.has(fid)) extraBoards.push(board);
    }
    if (extraBoards.length) {
      categories.push({ cid: "more", name: "更多板块", boards: extraBoards });
    }

    return {
      user: {
        uid,
        username,
        avatar: uid !== "0" ? (v.member_avatar || ucenterAvatarUrl(uid, "middle")) : "",
        formhash: String(v.formhash || ""),
        groupid: String(v.groupid || ""),
        readaccess: Number(v.readaccess || 0),
        credits: Number(v.member_credits || 0),
        unreadCount
      },
      categories,
      boards: Array.from(forumMap.values()),
      message: apiData?.Message?.messagestr || null
    };
  }

  function normalizeForumDisplay(apiData, fid) {
    const v = apiData?.Variables || {};
    const msg = apiData?.Message || null;
    if (msg && (!Array.isArray(v.forum_threadlist) || v.forum_threadlist.length === 0)) {
      return {
        fid: String(fid || ""),
        forumName: decodeHtmlEntities(v.forum?.name || `板块 ${fid}`),
        page: Number(v.page || 1),
        tpp: Number(v.tpp || 50),
        totalThreads: Number(v.forum?.threads || 0),
        threadtypes: [],
        sublist: [],
        threads: [],
        errorMessage: decodeHtmlEntities(String(msg.messagestr || "").replace(/^mobile:/i, "")) || "该板块暂时无法访问"
      };
    }

    const typesMap = v.threadtypes?.types && typeof v.threadtypes.types === "object" ? v.threadtypes.types : {};
    const threadtypes = Object.entries(typesMap).map(([id, name]) => ({
      id: String(id),
      name: decodeHtmlEntities(name)
    }));

    const sublist = Array.isArray(v.sublist)
      ? v.sublist.map((s) => ({
          fid: String(s.fid),
          name: decodeHtmlEntities(s.name || ""),
          todayposts: Number(s.todayposts || 0)
        }))
      : [];

    const threads = (Array.isArray(v.forum_threadlist) ? v.forum_threadlist : []).map((t) => {
      const repliesList = Array.isArray(t.reply) ? t.reply : [];
      const lastReplyObj = repliesList.length ? repliesList[repliesList.length - 1] : null;
      const previewRaw = lastReplyObj?.message || t.message || "";
      const previewText = formatPreviewSnippet(previewRaw, 90);
      const lastpostTs = Number(t.dblastpost || 0) || Math.floor(parseTimestampMs(t.lastpost) / 1000);
      const datelineTs = Number(t.dbdateline || 0) || Math.floor(parseTimestampMs(t.dateline) / 1000);
      const typeid = String(t.typeid || "");
      return {
        tid: String(t.tid || ""),
        fid: String(t.fid || fid || ""),
        typeid,
        typeName: typeid && typesMap[typeid] ? decodeHtmlEntities(typesMap[typeid]) : "",
        subject: decodeHtmlEntities(t.subject || "(无主题)"),
        author: decodeHtmlEntities(t.author || "匿名"),
        authorid: String(t.authorid || "0"),
        avatarUrl: ucenterAvatarUrl(t.authorid, "small"),
        lastposter: decodeHtmlEntities(t.lastposter || t.author || ""),
        lastpostTs,
        datelineTs,
        replies: Number(t.replies || 0),
        views: Number(t.views || 0),
        displayorder: Number(t.displayorder || 0),
        digest: Number(t.digest || 0),
        readperm: Number(t.readperm || 0),
        closed: Number(t.closed || 0),
        lastReplyAuthor: decodeHtmlEntities(lastReplyObj?.author || t.lastposter || ""),
        previewText
      };
    });

    return {
      fid: String(v.forum?.fid || fid || ""),
      forumName: decodeHtmlEntities(v.forum?.name || `板块 ${fid}`),
      page: Math.max(1, Number(v.page || 1)),
      tpp: Math.max(1, Number(v.tpp || 50)),
      totalThreads: Number(v.forum?.threads || threads.length),
      threadtypes,
      sublist,
      threads,
      formhash: v.formhash ? String(v.formhash) : "",
      errorMessage: null
    };
  }

  function parseRgbChannels(colorVal) {
    const c = String(colorVal || "").trim().toLowerCase().replace(/!important/gi, "").trim();
    if (!c) return null;
    if (c === "black") return [0, 0, 0];
    if (c === "white") return [255, 255, 255];
    if (c === "silver") return [192, 192, 192];
    if (c === "gray" || c === "grey") return [128, 128, 128];
    const hex3 = c.match(/^#([0-9a-f]{3})$/);
    if (hex3) {
      return hex3[1].split("").map((ch) => parseInt(ch + ch, 16));
    }
    const hex6 = c.match(/^#([0-9a-f]{6})$/);
    if (hex6) {
      return [
        parseInt(hex6[1].slice(0, 2), 16),
        parseInt(hex6[1].slice(2, 4), 16),
        parseInt(hex6[1].slice(4, 6), 16)
      ];
    }
    const rgb = c.match(/^rgba?\(\s*(\d+)\s*,\s*(\d+)\s*,\s*(\d+)(?:\s*,\s*([\d.]+))?\s*\)/);
    if (rgb) {
      if (rgb[4] !== undefined && Number(rgb[4]) === 0) return null;
      return [Number(rgb[1]), Number(rgb[2]), Number(rgb[3])];
    }
    return null;
  }

  function isNearBlackColor(colorVal) {
    const ch = parseRgbChannels(colorVal);
    if (!ch) return false;
    return ch[0] < 55 && ch[1] < 55 && ch[2] < 55;
  }

  function isNearWhiteColor(colorVal) {
    const ch = parseRgbChannels(colorVal);
    if (!ch) return false;
    return ch[0] > 235 && ch[1] > 235 && ch[2] > 235;
  }

  function colorsEqualForSpoiler(c1, c2) {
    const ch1 = parseRgbChannels(c1);
    const ch2 = parseRgbChannels(c2);
    if (ch1 && ch2) {
      return Math.abs(ch1[0] - ch2[0]) <= 12 && Math.abs(ch1[1] - ch2[1]) <= 12 && Math.abs(ch1[2] - ch2[2]) <= 12;
    }
    const n1 = String(c1 || "").trim().toLowerCase();
    const n2 = String(c2 || "").trim().toLowerCase();
    return Boolean(n1 && n2 && n1 === n2 && n1 !== "transparent");
  }

  function parseStyleDeclarations(styleText) {
    return String(styleText || "")
      .split(";")
      .map((s) => s.trim())
      .filter(Boolean)
      .map((decl) => {
        const colonIdx = decl.indexOf(":");
        if (colonIdx <= 0) return null;
        return {
          prop: decl.slice(0, colonIdx).trim().toLowerCase(),
          val: decl.slice(colonIdx + 1).trim()
        };
      })
      .filter(Boolean);
  }

  const DISALLOWED_INLINE_PROPS = new Set([
    "position",
    "float",
    "clear",
    "z-index",
    "top",
    "left",
    "right",
    "bottom",
    "inset",
    "width",
    "min-width",
    "max-width",
    "height",
    "min-height",
    "max-height",
    "margin",
    "margin-left",
    "margin-right",
    "margin-top",
    "margin-bottom",
    "transform",
    "overflow",
    "overflow-x",
    "overflow-y",
    "display",
    "visibility",
    "clip",
    "clip-path"
  ]);

  function filterInlineStyle(styleText, { keepSpoiler = false } = {}) {
    const decls = parseStyleDeclarations(styleText);
    return decls
      .filter(({ prop, val }) => {
        if (DISALLOWED_INLINE_PROPS.has(prop)) return false;
        if (prop === "background" || prop === "background-color") return false;
        if (prop === "color") {
          if (isNearBlackColor(val)) return false;
          if (!keepSpoiler && isNearWhiteColor(val)) return false;
        }
        return true;
      })
      .map(({ prop, val }) => `${prop}: ${val}`)
      .join("; ");
  }

  function extractColorAndBgFromAttrs(attrText) {
    const s = String(attrText || "");
    let fg = "";
    let bg = "";
    const attrColorM = s.match(/\bcolor\s*=\s*(?:"([^"]*)"|'([^']*)'|([^\s>]+))/i);
    if (attrColorM) fg = attrColorM[1] || attrColorM[2] || attrColorM[3] || "";
    const styleM = s.match(/\bstyle\s*=\s*(?:"([^"]*)"|'([^']*)')/i);
    if (styleM) {
      for (const { prop, val } of parseStyleDeclarations(styleM[1] || styleM[2] || "")) {
        if (prop === "color" && val) fg = val;
        if ((prop === "background" || prop === "background-color") && val) bg = val;
      }
    }
    return { fg, bg };
  }

  function convertInlineSpoilersInHtml(input) {
    let html = String(input || "");
    // Convert paired nested tags e.g. <font style="background-color:white"><font color="white">...</font></font>
    for (let pass = 0; pass < 3; pass++) {
      const next = html.replace(
        /<(font|span|b|strong|i|em)\b([^>]*)>\s*<(font|span)\b([^>]*)>([\s\S]*?)<\/\3>\s*<\/\1>/gi,
        (full, t1, a1, t2, a2, inner) => {
          const outer = extractColorAndBgFromAttrs(a1);
          const child = extractColorAndBgFromAttrs(a2);
          const bg = child.bg || outer.bg;
          const fg = child.fg || outer.fg;
          if (bg && fg && colorsEqualForSpoiler(bg, fg)) {
            return `<span class="s1w-spoiler-mask">${inner}</span>`;
          }
          return full;
        }
      );
      if (next === html) break;
      html = next;
    }
    // Convert single tag with matching color and background-color
    html = html.replace(
      /<(font|span)\b([^>]*)>([\s\S]*?)<\/\1>/gi,
      (full, tag, attrs, inner) => {
        const { fg, bg } = extractColorAndBgFromAttrs(attrs);
        if (fg && bg && colorsEqualForSpoiler(fg, bg)) {
          return `<span class="s1w-spoiler-mask">${inner}</span>`;
        }
        return full;
      }
    );
    return html;
  }

  const SAFE_HTML_TAGS = new Set([
    "a", "b", "strong", "i", "em", "u", "s", "del", "strike", "sub", "sup",
    "br", "hr", "p", "div", "span", "font", "blockquote", "pre", "code",
    "ul", "ol", "li", "h1", "h2", "h3", "h4", "h5", "h6",
    "table", "thead", "tbody", "tfoot", "tr", "th", "td", "caption",
    "img", "details", "summary", "small", "center"
  ]);
  const DROP_WITH_CONTENT_TAGS = new Set([
    "script", "style", "iframe", "object", "embed", "svg", "form", "noscript", "template", "title"
  ]);
  const SAFE_CLASSES = new Set(["s1-smiley", "s1-inline-icon", "s1-content-img", "s1w-spoiler-mask", "s1w-table-wrap"]);
  const BALANCED_CONTAINER_TAGS = new Set([
    "a", "b", "strong", "i", "em", "u", "s", "del", "strike", "sub", "sup",
    "p", "div", "span", "font", "blockquote", "pre", "code",
    "ul", "ol", "li", "h1", "h2", "h3", "h4", "h5", "h6",
    "table", "thead", "tbody", "tfoot", "tr", "th", "td", "caption",
    "details", "summary", "small", "center"
  ]);

  function balanceHtmlTags(html) {
    const tokens = String(html || "").split(/(<\/?[a-zA-Z][a-zA-Z0-9]*(?:\s[^>]*)?>)/g);
    const stack = [];
    const out = [];

    const closeToIndex = (targetIdx) => {
      while (stack.length > targetIdx) {
        const popped = stack.pop();
        out.push(`</${popped}>`);
      }
    };

    for (const tok of tokens) {
      if (!tok) continue;
      const tagM = tok.match(/^<(\/?)([a-zA-Z][a-zA-Z0-9]*)\b([\s\S]*?)(\/?)>$/);
      if (!tagM) {
        out.push(tok);
        continue;
      }
      const isClose = tagM[1] === "/";
      const tag = tagM[2].toLowerCase();
      const selfClose = tagM[4] === "/" || tag === "br" || tag === "hr" || tag === "img";

      if (!SAFE_HTML_TAGS.has(tag)) continue;

      if (isClose) {
        if (!BALANCED_CONTAINER_TAGS.has(tag)) continue;
        const idx = stack.lastIndexOf(tag);
        if (idx === -1) continue;
        closeToIndex(idx);
        continue;
      }

      if (selfClose || !BALANCED_CONTAINER_TAGS.has(tag)) {
        out.push(tok);
        continue;
      }

      // Implicit close for malformed Discuz tables (e.g. unclosed <td> before next <td> or <tr>)
      if (tag === "td" || tag === "th") {
        const top = stack[stack.length - 1];
        if (top === "td" || top === "th") {
          out.push(`</${stack.pop()}>`);
        }
      } else if (tag === "tr") {
        while (stack.length && (stack[stack.length - 1] === "td" || stack[stack.length - 1] === "th" || stack[stack.length - 1] === "tr")) {
          out.push(`</${stack.pop()}>`);
        }
      }

      stack.push(tag);
      out.push(tok);
    }

    closeToIndex(0);
    let balanced = out.join("");
    balanced = balanced.replace(/(?!<div class="s1w-table-wrap">)<table\b[\s\S]*?<\/table>/gi, (tbl) => {
      return `<div class="s1w-table-wrap">${tbl}</div>`;
    });
    return balanced;
  }

  function sanitizeDomTree(html) {
    const doc = new DOMParser().parseFromString(`<body>${html}</body>`, "text/html");
    if (!doc?.body) return null;

    const serializeImg = (el) => {
      const rawSrc = el.getAttribute("zoomfile") || el.getAttribute("file") || el.getAttribute("src") || "";
      const src = sanitizeStage1stUrl(rawSrc);
      if (!src || /\/common\/none\.gif$/i.test(src)) return "";
      const alt = el.getAttribute("alt") || "";
      if (/\/image\/smiley\//i.test(src)) {
        return `<img class="s1-smiley" src="${escapeHtml(src)}" alt="${escapeHtml(alt)}" loading="lazy" />`;
      }
      if (/static\.stage1st\.com\/static\/image\/common\//i.test(src) || /\/image\/filetype\//i.test(src)) {
        return `<img class="s1-inline-icon" src="${escapeHtml(src)}" alt="${escapeHtml(alt)}" loading="lazy" />`;
      }
      return `<img class="s1-content-img" src="${escapeHtml(src)}" alt="${escapeHtml(alt)}" loading="lazy" />`;
    };

    const walk = (node, ctx = { bg: "", fg: "", inSpoiler: false }) => {
      if (!node) return "";
      if (node.nodeType === 3) {
        return escapeHtml(node.nodeValue || "");
      }
      if (node.nodeType !== 1) return "";

      const tag = node.tagName.toLowerCase();
      if (DROP_WITH_CONTENT_TAGS.has(tag)) return "";
      if (tag === "input" || tag === "button" || tag === "select" || tag === "textarea" || tag === "link" || tag === "meta" || tag === "base") {
        return "";
      }
      if (!SAFE_HTML_TAGS.has(tag)) {
        return Array.from(node.childNodes).map((c) => walk(c, ctx)).join("");
      }
      if (tag === "br") return "<br />";
      if (tag === "hr") return "<hr />";
      if (tag === "img") return serializeImg(node);

      const rawStyle = node.getAttribute("style") || "";
      const decls = parseStyleDeclarations(rawStyle);
      let localFg = node.getAttribute("color") || "";
      let localBg = node.getAttribute("bgcolor") || "";
      for (const { prop, val } of decls) {
        if (prop === "color" && val) localFg = val;
        if ((prop === "background" || prop === "background-color") && val) localBg = val;
      }

      const nextBg = localBg || ctx.bg;
      const nextFg = localFg || ctx.fg;
      const existingClasses = Array.from(node.classList || []).filter((c) => SAFE_CLASSES.has(c));
      const isExplicitSpoiler = existingClasses.includes("s1w-spoiler-mask");
      const isMatchedSpoiler = !ctx.inSpoiler && nextBg && nextFg && colorsEqualForSpoiler(nextBg, nextFg);
      const becomesSpoiler = isExplicitSpoiler || isMatchedSpoiler;

      const childCtx = {
        bg: becomesSpoiler ? "" : nextBg,
        fg: becomesSpoiler ? "" : nextFg,
        inSpoiler: ctx.inSpoiler || becomesSpoiler
      };
      const innerHtml = Array.from(node.childNodes).map((c) => walk(c, childCtx)).join("");

      if (becomesSpoiler) {
        return `<span class="s1w-spoiler-mask">${innerHtml}</span>`;
      }

      if (tag === "a") {
        const cleanHref = sanitizeStage1stUrl(node.getAttribute("href") || "");
        if (!cleanHref) return `<a href="#">${innerHtml}</a>`;
        const internalMatch = cleanHref.match(/^https?:\/\/(?:(?:www|bbs)\.)?(?:stage1st|saraba1st)\.com(\/2b\/.*)$/i);
        if (internalMatch) {
          return `<a href="${escapeHtml(cleanHref)}" data-s1-internal="${escapeHtml(internalMatch[1])}">${innerHtml}</a>`;
        }
        return `<a href="${escapeHtml(cleanHref)}" target="_blank" rel="noopener noreferrer">${innerHtml}</a>`;
      }

      const attrs = [];
      if (existingClasses.length) {
        attrs.push(`class="${escapeHtml(existingClasses.join(" "))}"`);
      }
      if (tag === "font") {
        const sizeAttr = node.getAttribute("size");
        if (sizeAttr && /^[+-]?\d+$/.test(sizeAttr.trim())) {
          attrs.push(`size="${escapeHtml(sizeAttr.trim())}"`);
        }
        const colorAttr = node.getAttribute("color");
        if (colorAttr && !isNearBlackColor(colorAttr) && (ctx.inSpoiler || !isNearWhiteColor(colorAttr))) {
          attrs.push(`color="${escapeHtml(colorAttr.trim())}"`);
        }
      }
      if (tag === "td" || tag === "th") {
        const cs = node.getAttribute("colspan");
        const rs = node.getAttribute("rowspan");
        if (cs && /^\d+$/.test(cs)) attrs.push(`colspan="${cs}"`);
        if (rs && /^\d+$/.test(rs)) attrs.push(`rowspan="${rs}"`);
      }
      const alignAttr = node.getAttribute("align");
      if (alignAttr && /^(?:left|center|right)$/i.test(alignAttr.trim())) {
        attrs.push(`align="${escapeHtml(alignAttr.trim().toLowerCase())}"`);
      }

      const cleanStyle = filterInlineStyle(rawStyle, { keepSpoiler: ctx.inSpoiler });
      if (cleanStyle) {
        attrs.push(`style="${escapeHtml(cleanStyle)}"`);
      }

      const openTag = attrs.length ? `<${tag} ${attrs.join(" ")}>` : `<${tag}>`;
      const rendered = `${openTag}${innerHtml}</${tag}>`;
      if (tag === "table") {
        return `<div class="s1w-table-wrap">${rendered}</div>`;
      }
      return rendered;
    };

    return Array.from(doc.body.childNodes).map((c) => walk(c)).join("");
  }

  function parseQuoteBlock(quoteHtml) {
    const decoded = decodeHtmlEntities(quoteHtml);
    const pidMatch = decoded.match(/pid=(\d+)/);
    const tidMatch = decoded.match(/(?:ptid|tid)=(\d+)/);
    const headerMatch = decoded.match(/([^\n<>]{1,60}?)\s+发表于\s+(\d{4}-\d{1,2}-\d{1,2}\s+\d{1,2}:\d{2})/);
    let plain = stripHtmlTags(quoteHtml);
    let author = headerMatch ? headerMatch[1].trim() : "";
    let time = headerMatch ? headerMatch[2].trim() : "";
    if (headerMatch) {
      plain = plain.replace(headerMatch[0], "").trim();
    }
    return {
      pid: pidMatch ? pidMatch[1] : "",
      tid: tidMatch ? tidMatch[1] : "",
      author,
      time,
      excerpt: plain.slice(0, 180)
    };
  }

  function sanitizeStage1stUrl(url) {
    const raw = decodeHtmlEntities(String(url || "").trim());
    if (!raw) return "";
    if (/^(?:javascript|vbscript|data:text\/html):/i.test(raw)) return "";
    if (raw.startsWith("//")) return `https:${raw}`;
    if (/^https?:\/\//i.test(raw)) return raw;
    if (raw.startsWith("/")) return `https://stage1st.com${raw}`;
    return `https://stage1st.com/2b/${raw}`;
  }

  function formatPreviewSnippet(rawHtml, maxLen = 90) {
    let s = String(rawHtml || "");
    s = s
      .replace(/<div\s+class="reply_wrap"[^>]*>[\s\S]*?<\/div>\s*(?:<br\s*\/?>)*/gi, "")
      .replace(/<div\s+class="quote"[^>]*>[\s\S]*?<\/div>\s*(?:<br\s*\/?>)*/gi, "")
      .replace(/\[quote\][\s\S]*?\[\/quote\]/gi, "")
      .replace(/<i\b[^>]*class\s*=\s*["'][^"']*\bpstatus\b[^"']*["'][^>]*>[\s\S]*?<\/i>\s*(?:<br\s*\/?>)*/gi, "")
      .replace(/本帖最后由\s+[^<\r\n]{1,60}?\s+于\s+\d{4}-\d{1,2}-\d{1,2}\s+\d{1,2}:\d{2}(?::\d{2})?\s+编辑/gi, "")
      .replace(/\[img[^\]]*\][\s\S]*?\[\/img\]/gi, " [图片] ")
      .replace(/\[attach\]\s*\d+\s*\[\/attach\]/gi, " [图片] ")
      .replace(/<img\b([^>]*)>/gi, (full, attrs) => {
        if (/\/common\/none\.gif/i.test(attrs) || /\/static\/image\/common\//i.test(attrs)) return "";
        if (/\/image\/smiley\//i.test(attrs)) return " [表情] ";
        return " [图片] ";
      })
      .replace(/<a\b[^>]*>\s*https?:\/\/[^\s<]+?\.(?:png|jpe?g|gif|webp|bmp)(?:\?[^\s<]*)?\s*<\/a>/gi, " [图片] ")
      .replace(/https?:\/\/[^\s<>"']+\.(?:png|jpe?g|gif|webp|bmp)(?:\?[^\s<>"']*)?/gi, " [图片] ");
    return stripHtmlTags(s).replace(/(?:\[图片\]\s*){2,}/g, "[图片] ").trim().slice(0, maxLen);
  }

  function parsePostMessageHtml(rawHtml) {
    let html = String(rawHtml || "").replace(/<!--[\s\S]*?-->/g, "");
    let quote = null;
    let editedInfo = "";

    const pstatusMatch = html.match(/<i\b[^>]*class\s*=\s*["'][^"']*\bpstatus\b[^"']*["'][^>]*>([\s\S]*?)<\/i>\s*(?:<br\s*\/?>)*/i);
    if (pstatusMatch) {
      editedInfo = stripHtmlTags(pstatusMatch[1]).trim();
      html = html.replace(pstatusMatch[0], "");
    } else {
      const plainEditMatch = html.match(/(?:^|<br\s*\/?>|\s|<font\b[^>]*>|<i>)\s*(本帖最后由\s+[^<\r\n]{1,60}?\s+于\s+\d{4}-\d{1,2}-\d{1,2}\s+\d{1,2}:\d{2}(?::\d{2})?\s+编辑)\s*(?:<\/font>|<\/i>)?\s*(?:<br\s*\/?>)*/i);
      if (plainEditMatch) {
        editedInfo = stripHtmlTags(plainEditMatch[1]).trim();
        html = html.replace(plainEditMatch[0], "");
      }
    }

    const replyWrapMatch = html.match(/<div\s+class="reply_wrap"[^>]*>([\s\S]*?)<\/div>\s*(?:<br\s*\/?>)*/i);
    if (replyWrapMatch) {
      quote = parseQuoteBlock(replyWrapMatch[1]);
      html = html.replace(replyWrapMatch[0], "");
    } else {
      const quoteDivMatch = html.match(/<div\s+class="quote"[^>]*>\s*<blockquote[^>]*>([\s\S]*?)<\/blockquote>\s*<\/div>\s*(?:<br\s*\/?>)*/i);
      if (quoteDivMatch) {
        quote = parseQuoteBlock(quoteDivMatch[1]);
        html = html.replace(quoteDivMatch[0], "");
      }
    }

    // Strip dangerous tags and event handlers before DOM/string normalization
    html = html
      .replace(/<script[\s\S]*?<\/script>/gi, "")
      .replace(/<style[\s\S]*?<\/style>/gi, "")
      .replace(/<iframe[\s\S]*?<\/iframe>/gi, "")
      .replace(/<(?:object|embed|svg|form)[\s\S]*?<\/(?:object|embed|svg|form)>/gi, "")
      .replace(/<(?:input|button|select|textarea|link|meta|base)\b[^>]*>/gi, "")
      .replace(/\son[a-z]+\s*=\s*(?:"[^"]*"|'[^']*'|[^\s>]+)/gi, "")
      .replace(/href\s*=\s*(["'])\s*javascript:[^"']*\1/gi, 'href="#"')
      .replace(/src\s*=\s*(["'])\s*javascript:[^"']*\1/gi, 'src=""');

    // Convert S1 [backcolor=White][color=White]...[/color][/backcolor] spoilers
    html = convertInlineSpoilersInHtml(html);

    if (typeof DOMParser !== "undefined") {
      const domHtml = sanitizeDomTree(html);
      if (domHtml !== null) {
        html = domHtml;
      }
    } else {
      // Strip dark/white font colors outside explicit spoiler masks and clean layout-breaking styles
      html = html
        .replace(/(<font\b[^>]*?)\scolor\s*=\s*(["']?)([^"'\s>]+)\2([^>]*>)/gi, (full, before, q, color, after) => {
          return isNearBlackColor(color) || isNearWhiteColor(color) ? `${before}${after}` : full;
        })
        .replace(/\sstyle\s*=\s*"([^"]*)"/gi, (full, styleText) => {
          const cleaned = filterInlineStyle(styleText, { keepSpoiler: false });
          return cleaned ? ` style="${cleaned}"` : "";
        })
        .replace(/\s(?:id|class)\s*=\s*(["'])([^"']*)\1/gi, (full, q, val) => {
          const kept = val
            .split(/\s+/)
            .filter((cls) => SAFE_CLASSES.has(cls))
            .join(" ");
          return kept ? ` class="${kept}"` : "";
        });

      // Tag smilies vs normal content images, upgrade attachment attributes
      html = html.replace(/<img\b([^>]*)>/gi, (full, attrs) => {
        const fileMatch = attrs.match(/\b(?:zoomfile|file)\s*=\s*(["'])([^"']+)\1/i);
        const srcMatch = attrs.match(/\bsrc\s*=\s*(["'])([^"']+)\1/i);
        let src = fileMatch ? fileMatch[2] : (srcMatch ? srcMatch[2] : "");
        src = sanitizeStage1stUrl(src);
        if (!src || /\/common\/none\.gif$/i.test(src)) return "";
        const altMatch = attrs.match(/\balt\s*=\s*(["'])([^"']*)\1/i);
        const alt = altMatch ? altMatch[2] : "";
        if (/\/image\/smiley\//i.test(src)) {
          return `<img class="s1-smiley" src="${escapeHtml(src)}" alt="${escapeHtml(alt)}" loading="lazy" />`;
        }
        if (/static\.stage1st\.com\/static\/image\/common\//i.test(src) || /\/image\/filetype\//i.test(src)) {
          return `<img class="s1-inline-icon" src="${escapeHtml(src)}" alt="${escapeHtml(alt)}" loading="lazy" />`;
        }
        return `<img class="s1-content-img" src="${escapeHtml(src)}" alt="${escapeHtml(alt)}" loading="lazy" />`;
      });

      // Rewrite internal Stage1st links for in-app navigation
      html = html.replace(/<a\b([^>]*?)href\s*=\s*(["'])([^"']*)\2([^>]*)>/gi, (full, pre, q, href, post) => {
        const cleanHref = sanitizeStage1stUrl(href);
        if (!cleanHref) return `<a${pre}href="#"${post}>`;
        const internalMatch = cleanHref.match(/^https?:\/\/(?:(?:www|bbs)\.)?(?:stage1st|saraba1st)\.com(\/2b\/.*)$/i);
        if (internalMatch) {
          return `<a${pre}href="${escapeHtml(cleanHref)}" data-s1-internal="${escapeHtml(internalMatch[1])}"${post}>`;
        }
        return `<a${pre}href="${escapeHtml(cleanHref)}" target="_blank" rel="noopener noreferrer"${post}>`;
      });

      // Balance unclosed container/table tags so complex HTML cannot escape the bubble
      html = balanceHtmlTags(html);
    }

    // Collapse excessive line breaks
    html = html.replace(/(?:\s*<br\s*\/?>\s*){3,}/gi, "<br /><br />").trim();
    html = html.replace(/^(?:\s*<br\s*\/?>\s*)+|(?:\s*<br\s*\/?>\s*)+$/gi, "");

    return { quote, bodyHtml: html, editedInfo };
  }

  function normalizeMobilePoll(specialPoll) {
    if (!specialPoll || typeof specialPoll !== "object") return null;
    const rawOpts = Array.isArray(specialPoll.polloptions)
      ? specialPoll.polloptions
      : (specialPoll.polloptions && typeof specialPoll.polloptions === "object"
          ? Object.values(specialPoll.polloptions)
          : []);

    const options = rawOpts
      .filter((opt) => opt && typeof opt === "object")
      .map((opt, idx) => {
        const hasVotes = opt.votes !== undefined && opt.votes !== null && String(opt.votes).trim() !== "";
        const hasPct = opt.percent !== undefined && opt.percent !== null && String(opt.percent).trim() !== "";
        const rawColor = String(opt.color || "").trim().replace(/^#/, "");
        const imgRaw = opt.imginfo && typeof opt.imginfo === "object"
          ? (opt.imginfo.small || opt.imginfo.big || opt.imginfo.attach || "")
          : "";
        return {
          id: String(opt.polloptionid || opt.id || idx + 1),
          text: decodeHtmlEntities(opt.polloption || opt.text || ""),
          votes: hasVotes && Number.isFinite(Number(opt.votes)) ? Number(opt.votes) : null,
          percent: hasPct && Number.isFinite(Number(opt.percent)) ? Number(opt.percent) : null,
          width: String(opt.width || ""),
          color: /^[0-9a-f]{3,6}$/i.test(rawColor) ? `#${rawColor}` : "",
          img: sanitizeStage1stUrl(imgRaw)
        };
      })
      .filter((opt) => opt.id && (opt.text || opt.img));

    if (!options.length) return null;

    const multiple = String(specialPoll.multiple) === "1" || specialPoll.multiple === true;
    const allowRaw = specialPoll.allowvote;
    const allowvote = Boolean(allowRaw && String(allowRaw) !== "0" && String(allowRaw).toLowerCase() !== "false");
    const expirations = Number(specialPoll.expirations || 0);

    return {
      multiple,
      maxchoices: multiple ? Math.max(1, Number(specialPoll.maxchoices || 1)) : 1,
      voterscount: Math.max(0, Number(specialPoll.voterscount || 0)),
      visiblepoll: String(specialPoll.visiblepoll) === "1" || specialPoll.visiblepoll === true,
      allowvote,
      expirations: Number.isFinite(expirations) ? expirations : 0,
      remaintime: Array.isArray(specialPoll.remaintime) ? specialPoll.remaintime : null,
      statusText: "",
      options
    };
  }

  function parsePollFromHtml(htmlText) {
    const str = String(htmlText || "");
    const formMatch = str.match(/<form\b[^>]*\bid=["']poll["'][^>]*>([\s\S]*?)<\/form>/i);
    if (!formMatch) return null;
    const formHtml = formMatch[1];

    const pinfMatch = formHtml.match(/<div\b[^>]*class=["'][^"']*\bpinf\b[^"']*["'][^>]*>([\s\S]*?)<\/div>/i);
    const pinfText = pinfMatch ? stripHtmlTags(pinfMatch[1]) : "";
    const multiple =
      /多选投票/.test(pinfText) ||
      /<input[^>]+type=["']checkbox["'][^>]+name=["']pollanswers\[\]["']/i.test(formHtml) ||
      /<input[^>]+name=["']pollanswers\[\]["'][^>]+type=["']checkbox["']/i.test(formHtml);
    const maxMatch = pinfText.match(/最多可选\s*(\d+)\s*项/);
    const maxchoices = multiple ? Math.max(1, Number(maxMatch ? maxMatch[1] : 1)) : 1;
    const votersMatch = pinfText.match(/共有\s*(\d+)\s*人参与投票/);
    const voterscount = votersMatch ? Number(votersMatch[1]) : 0;
    const visiblepoll = /投票后结果可见/.test(pinfText);
    const allowvote = /name=["']pollanswers\[\]["']/i.test(formHtml);

    const options = [];
    const rowRegex = /<tr\b([^>]*)>([\s\S]*?)<\/tr>/gi;
    let m;
    let lastOption = null;
    let statusText = "";

    const extractStats = (htmlChunk) => {
      const statMatch = htmlChunk.match(/([\d.]+)%\s*(?:<em[^>]*>)?\s*\((\d+)\)/i);
      if (!statMatch) return null;
      const widthMatch = htmlChunk.match(/style=["'][^"']*width\s*:\s*([\d.]+%)/i);
      const colorMatch = htmlChunk.match(/(?:background(?:-color)?|color)\s*:\s*(#[0-9a-f]{3,6})/i);
      return {
        percent: Number(statMatch[1]),
        votes: Number(statMatch[2]),
        width: widthMatch ? widthMatch[1] : `${Math.min(100, Number(statMatch[1]) || 0)}%`,
        color: colorMatch ? colorMatch[1] : ""
      };
    };

    while ((m = rowRegex.exec(formHtml)) !== null) {
      const rowAttrs = m[1] || "";
      const rowHtml = m[2] || "";
      const isOptRow =
        /class=["'][^"']*\bpvt\b/i.test(rowHtml) ||
        /for=["']option_\d+["']/i.test(rowHtml) ||
        /name=["']pollanswers\[\]["']/i.test(rowHtml);

      if (isOptRow) {
        const valMatch =
          rowHtml.match(/<input[^>]+name=["']pollanswers\[\]["'][^>]*value=["']([^"']*)["']/i) ||
          rowHtml.match(/<input[^>]+value=["']([^"']*)["'][^>]*name=["']pollanswers\[\]["']/i);
        const forMatch = rowHtml.match(/for=["']option_(\d+)["']/i);
        const labelMatch = rowHtml.match(/<label\b[^>]*>([\s\S]*?)<\/label>/i);
        let labelText = labelMatch ? stripHtmlTags(labelMatch[1]) : "";
        labelText = labelText.replace(/^\d+\.\s*/, "").trim();
        if (!labelText) {
          const pvtMatch = rowHtml.match(/<td\b[^>]*class=["'][^"']*\bpvt\b[^"']*["'][^>]*>([\s\S]*?)<\/td>/i);
          labelText = pvtMatch ? stripHtmlTags(pvtMatch[1]).replace(/^\d+\.\s*/, "").trim() : "";
        }
        let optImg = "";
        const imgMatch = rowHtml.match(/<img\b[^>]*(?:zoomfile|file|src)=["']([^"']+)["'][^>]*>/i);
        if (imgMatch && !/\/common\/none\.gif$/i.test(imgMatch[1])) {
          optImg = sanitizeStage1stUrl(imgMatch[1]);
        }

        const inlineStats = extractStats(rowHtml);
        lastOption = {
          id: String(valMatch ? valMatch[1] : (forMatch ? forMatch[1] : options.length + 1)),
          text: labelText,
          votes: inlineStats ? inlineStats.votes : null,
          percent: inlineStats ? inlineStats.percent : null,
          width: inlineStats ? inlineStats.width : "",
          color: inlineStats ? inlineStats.color : "",
          img: optImg
        };
        if (lastOption.text || lastOption.img) {
          options.push(lastOption);
        } else {
          lastOption = null;
        }
        continue;
      }

      if (/<td\b[^>]*colspan=/i.test(rowHtml) && !/id=["']pollsubmit["']/i.test(rowHtml)) {
        const txt = stripHtmlTags(rowHtml);
        if (txt) statusText = txt;
        lastOption = null;
        continue;
      }

      if (lastOption && !/\bpbr\b|\bptl\b/.test(rowAttrs) || (lastOption && /[\d.]+%/.test(rowHtml))) {
        const stats = extractStats(rowHtml);
        if (stats) {
          lastOption.percent = stats.percent;
          lastOption.votes = stats.votes;
          if (!lastOption.width) lastOption.width = stats.width;
          if (!lastOption.color) lastOption.color = stats.color;
          lastOption = null;
        }
      }
    }

    if (!options.length) return null;

    return {
      multiple,
      maxchoices,
      voterscount,
      visiblepoll,
      allowvote,
      expirations: 0,
      remaintime: null,
      statusText: allowvote ? "" : statusText,
      options
    };
  }

  function normalizeViewThread(apiData) {
    const v = apiData?.Variables || {};
    const msg = apiData?.Message || null;
    const thread = v.thread || {};
    const ppp = Math.max(1, Number(v.ppp || POSTS_PER_PAGE));
    const replies = Number(thread.replies || 0);
    const totalPosts = Math.max(1, replies + 1);
    const totalPages = Math.max(1, Math.ceil(totalPosts / ppp));
    const special = Number(thread.special || 0);
    const poll = normalizeMobilePoll(v.special_poll);

    if (msg && (!Array.isArray(v.postlist) || v.postlist.length === 0)) {
      return {
        thread: {
          tid: String(thread.tid || ""),
          fid: String(v.fid || thread.fid || ""),
          forumName: decodeHtmlEntities(v.forum?.name || ""),
          subject: decodeHtmlEntities(thread.subject || "帖子无法查看"),
          author: decodeHtmlEntities(thread.author || ""),
          authorid: String(thread.authorid || "0"),
          replies,
          views: Number(thread.views || 0),
          closed: Number(thread.closed || 0),
          readperm: Number(thread.readperm || 0),
          favtimes: Number(thread.favtimes || 0),
          special,
          poll,
          ppp,
          totalPages
        },
        posts: [],
        formhash: v.formhash ? String(v.formhash) : "",
        errorMessage: decodeHtmlEntities(String(msg.messagestr || "").replace(/^mobile:/i, "")) || "该帖子需要权限或登录查看"
      };
    }

    const posts = (Array.isArray(v.postlist) ? v.postlist : []).map((p, index) => {
      const parsed = parsePostMessageHtml(p.message || "");
      const attachments = [];
      if (p.attachments && typeof p.attachments === "object") {
        for (const att of Object.values(p.attachments)) {
          if (!att) continue;
          const url = att.url ? `${att.url}${att.attachment || ""}` : "";
          if (att.isimage === "1" && url) {
            attachments.push({
              aid: String(att.aid || ""),
              url: sanitizeStage1stUrl(url),
              filename: String(att.filename || "image")
            });
          }
        }
      }
      const authorid = String(p.authorid || "0");
      return {
        pid: String(p.pid || ""),
        tid: String(p.tid || thread.tid || ""),
        first: String(p.first) === "1" || Number(p.position || p.number || index + 1) === 1,
        floor: Number(p.number || p.position || index + 1),
        author: decodeHtmlEntities(p.author || p.username || "匿名"),
        authorid,
        avatarUrl: ucenterAvatarUrl(authorid, "small"),
        groupid: String(p.groupid || ""),
        adminid: String(p.adminid || "0"),
        datelineTs: Number(p.dbdateline || 0) || Math.floor(parseTimestampMs(p.dateline) / 1000),
        datelineText: String(p.dateline || ""),
        quote: parsed.quote,
        editedInfo: parsed.editedInfo || "",
        bodyHtml: parsed.bodyHtml,
        attachments,
        ratelog: null,
        rawHtml: p.message || ""
      };
    });

    return {
      thread: {
        tid: String(thread.tid || ""),
        fid: String(v.fid || thread.fid || ""),
        forumName: decodeHtmlEntities(v.forum?.name || ""),
        subject: decodeHtmlEntities(thread.subject || "(无主题)"),
        author: decodeHtmlEntities(thread.author || ""),
        authorid: String(thread.authorid || "0"),
        replies,
        views: Number(thread.views || 0),
        closed: Number(thread.closed || 0),
        readperm: Number(thread.readperm || 0),
        favtimes: Number(thread.favtimes || 0),
        special,
        poll,
        ppp,
        totalPages
      },
      posts,
      formhash: v.formhash ? String(v.formhash) : "",
      errorMessage: null
    };
  }

  function getDomParser(docImpl) {
    if (docImpl && typeof docImpl.createElement === "function") {
      return (html) => {
        if (typeof DOMParser !== "undefined") {
          return new DOMParser().parseFromString(html, "text/html");
        }
        return null;
      };
    }
    if (typeof DOMParser !== "undefined") {
      return (html) => new DOMParser().parseFromString(html, "text/html");
    }
    return null;
  }

  function parseRatelogFromBlock(blockHtml) {
    const countMatch = blockHtml.match(/参与人数\s*<span[^>]*>\s*(\d+)/);
    const scoreMatch = blockHtml.match(/战斗力[\s\S]*?<span[^>]*>\s*([+-]?\d+)/);
    const rows = [];
    const rowRegex = /<tr[^>]*id="rate_\d+_(\d+)"[^>]*>([\s\S]*?)<\/tr>/gi;
    let m;
    while ((m = rowRegex.exec(blockHtml)) !== null) {
      const tds = Array.from(m[2].matchAll(/<td[^>]*>([\s\S]*?)<\/td>/gi)).map((x) => stripHtmlTags(x[1]));
      if (tds.length >= 2) {
        rows.push({
          uid: m[1],
          user: tds[0] || "",
          score: tds[1] || "",
          reason: tds[2] || ""
        });
      }
    }
    if (!countMatch && !scoreMatch && !rows.length) return null;
    return {
      participants: countMatch ? Number(countMatch[1]) : rows.length,
      totalScore: scoreMatch ? scoreMatch[1] : "",
      rows
    };
  }

  function parseThreadHtml(html, tidHint = "", pageHint = 1) {
    const str = String(html || "");
    const formhashMatch = str.match(/name="formhash"\s+value="([a-f0-9]+)"/i) || str.match(/formhash=([a-f0-9]+)/i);
    const subjectMatch = str.match(/id="thread_subject"[^>]*>([\s\S]*?)<\/span>/i) || str.match(/<title>([\s\S]*?)\s*-\s*[^-]+-\s*Stage1st/i);
    const fidMatch = str.match(/forum-(\d+)-1\.html/);
    const replyCountMatch = str.match(/回复:\s*<\/span>\s*<span class="xi1">(\d+)<\/span>/i);
    const viewCountMatch = str.match(/查看:\s*<\/span>\s*<span class="xi1">(\d+)<\/span>/i);
    const favCountMatch = str.match(/id="favoritenumber"[^>]*>(\d+)<\/span>/i);
    const pageMatches = Array.from(str.matchAll(/thread-\d+-(\d+)-1\.html/g)).map((x) => Number(x[1]));
    const maxPage = pageMatches.length ? Math.max(pageHint, ...pageMatches) : pageHint;

    const posts = [];
    const ratelogsByPid = {};
    const attachmentsByPid = {};

    // Split by <div id="post_12345"
    const postChunks = str.split(/(?=<div\s+id="post_\d+")/);
    for (const chunk of postChunks) {
      const pidMatch = chunk.match(/^<div\s+id="post_(\d+)"/);
      if (!pidMatch) continue;
      const pid = pidMatch[1];

      const authorMatch = chunk.match(/class="authi"[\s\S]*?<a[^>]*space-uid-(\d+)\.html[^>]*>([\s\S]*?)<\/a>/i);
      const authorid = authorMatch ? authorMatch[1] : "0";
      const author = authorMatch ? stripHtmlTags(authorMatch[2]) : "匿名";

      const timeMatch = chunk.match(/id="authorposton\d+"[^>]*>(?:<span[^>]*title="([^"]+)"[^>]*>)?([\s\S]*?)<\/em>/i);
      const datelineText = timeMatch ? stripHtmlTags(timeMatch[1] || timeMatch[2]).replace(/^发表于\s*/, "") : "";
      const datelineTs = Math.floor(parseTimestampMs(datelineText) / 1000);

      const floorMatch = chunk.match(/id="postnum\d+"[^>]*>(?:<em>)?([\s\S]*?)(?:<\/em>)?<\/a>/i);
      let floor = posts.length + 1;
      if (floorMatch) {
        const ft = stripHtmlTags(floorMatch[1]);
        if (/主楼|楼主/.test(ft)) floor = 1;
        else if (/沙发/.test(ft)) floor = 2;
        else if (/板凳/.test(ft)) floor = 3;
        else if (/地板/.test(ft)) floor = 4;
        else {
          const num = ft.match(/\d+/);
          if (num) floor = Number(num[0]);
        }
      }

      const msgMatch = chunk.match(/<td[^>]*id="postmessage_\d+"[^>]*>([\s\S]*?)<\/td>/i);
      const rawMsg = msgMatch ? msgMatch[1] : "";
      const parsed = parsePostMessageHtml(rawMsg);

      const attachImages = [];
      const attSection = chunk.match(/<div\s+class="pattl"[^>]*>([\s\S]*?)(?=<dl\s+id="ratelog_|<div\s+id="ratelog_|<div\s+id="comment_|<\/tr>)/i);
      if (attSection) {
        for (const imgM of attSection[1].matchAll(/\b(?:zoomfile|file)="([^"]+)"/gi)) {
          const url = sanitizeStage1stUrl(imgM[1]);
          if (url && !attachImages.some((x) => x.url === url)) {
            attachImages.push({ aid: "", url, filename: "attachment" });
          }
        }
      }
      if (attachImages.length) attachmentsByPid[pid] = attachImages;

      const rateMatch = chunk.match(/id="ratelog_\d+"[\s\S]*?(?=<\/dl>|<div\s+id="comment_|<div\s+id="post_rate_div_|$)/i);
      const ratelog = rateMatch ? parseRatelogFromBlock(rateMatch[0]) : null;
      if (ratelog) ratelogsByPid[pid] = ratelog;

      posts.push({
        pid,
        tid: String(tidHint || ""),
        first: floor === 1,
        floor,
        author,
        authorid,
        avatarUrl: ucenterAvatarUrl(authorid, "small"),
        datelineTs,
        datelineText,
        quote: parsed.quote,
        editedInfo: parsed.editedInfo || "",
        bodyHtml: parsed.bodyHtml,
        attachments: attachImages,
        ratelog
      });
    }

    const poll = parsePollFromHtml(str);
    const op = posts[0] || {};
    const replyCount = replyCountMatch ? Number(replyCountMatch[1]) : Math.max(0, posts.length - 1);
    // S1 renders only page-1 links on very long threads (and its mobile viewthread
    // API answers 503 on page 1 of some of them), so derive the page total from the
    // reply count instead of trusting the pagination markup alone.
    const fallbackTotalPages = Math.max(1, Math.ceil((replyCount + 1) / POSTS_PER_PAGE));
    const totalPages = Math.max(maxPage, fallbackTotalPages);
    return {
      thread: {
        tid: String(tidHint || ""),
        fid: fidMatch ? fidMatch[1] : "",
        forumName: "",
        subject: subjectMatch ? stripHtmlTags(subjectMatch[1]) : "(无主题)",
        author: op.author || "",
        authorid: op.authorid || "0",
        replies: replyCount,
        views: viewCountMatch ? Number(viewCountMatch[1]) : 0,
        closed: /本主题已关闭/.test(str) ? 1 : 0,
        readperm: 0,
        favtimes: favCountMatch ? Number(favCountMatch[1]) : 0,
        special: poll ? 1 : 0,
        poll,
        ppp: POSTS_PER_PAGE,
        totalPages
      },
      posts,
      poll,
      ratelogsByPid,
      attachmentsByPid,
      formhash: formhashMatch ? formhashMatch[1] : "",
      errorMessage: posts.length ? null : (/您无权|需要登录|不存在/.test(str) ? "该帖子需要登录或权限才能查看" : null)
    };
  }

  function parseForumHtml(html, fidHint = "") {
    const str = String(html || "");
    const formhashMatch = str.match(/name="formhash"\s+value="([a-f0-9]+)"/i) || str.match(/formhash=([a-f0-9]+)/i);
    const titleMatch = str.match(/<title>([\s\S]*?)\s*-\s*Stage1st/i);
    const threads = [];
    const tbodyRegex = /<tbody\s+id="(stickthread|normalthread)_(\d+)"[^>]*>([\s\S]*?)<\/tbody>/gi;
    let m;
    while ((m = tbodyRegex.exec(str)) !== null) {
      const displayorder = m[1] === "stickthread" ? 1 : 0;
      const tid = m[2];
      const body = m[3];
      const subjMatch = body.match(/class="s\s+xst"[^>]*>([\s\S]*?)<\/a>/i);
      const typeMatch = body.match(/<em>\[<a[^>]*typeid=(\d+)[^>]*>([\s\S]*?)<\/a>\]<\/em>/i);
      const authorMatch = body.match(/<td\s+class="by"[\s\S]*?<a[^>]*space-uid-(\d+)\.html[^>]*>([\s\S]*?)<\/a>/i);
      const numMatch = body.match(/<td\s+class="num"[\s\S]*?<a[^>]*>(\d+)<\/a>[\s\S]*?<em>(\d+)<\/em>/i);
      const lastpostMatch = body.match(/goto=lastpost[^"]*"[^>]*>(?:<span[^>]*title="([^"]+)"[^>]*>)?([\s\S]*?)<\/a>/i);
      const lastpostStr = lastpostMatch ? stripHtmlTags(lastpostMatch[1] || lastpostMatch[2]) : "";

      threads.push({
        tid,
        fid: String(fidHint || ""),
        typeid: typeMatch ? typeMatch[1] : "",
        typeName: typeMatch ? stripHtmlTags(typeMatch[2]) : "",
        subject: subjMatch ? stripHtmlTags(subjMatch[1]) : "(无主题)",
        author: authorMatch ? stripHtmlTags(authorMatch[2]) : "匿名",
        authorid: authorMatch ? authorMatch[1] : "0",
        avatarUrl: ucenterAvatarUrl(authorMatch ? authorMatch[1] : "0", "small"),
        lastposter: "",
        lastpostTs: Math.floor(parseTimestampMs(lastpostStr) / 1000),
        datelineTs: 0,
        replies: numMatch ? Number(numMatch[1]) : 0,
        views: numMatch ? Number(numMatch[2]) : 0,
        displayorder,
        digest: /digest/i.test(body) ? 1 : 0,
        readperm: 0,
        closed: 0,
        previewText: ""
      });
    }
    return {
      fid: String(fidHint || ""),
      forumName: titleMatch ? stripHtmlTags(titleMatch[1]) : `板块 ${fidHint}`,
      page: 1,
      tpp: 50,
      totalThreads: threads.length,
      threadtypes: [],
      sublist: [],
      threads,
      formhash: formhashMatch ? formhashMatch[1] : "",
      errorMessage: threads.length ? null : (/维护|无权|登录/.test(str) ? "板块需要登录或权限访问" : null)
    };
  }

  function parseFavoriteHtml(html) {
    const items = [];
    const re = /<li\s+id="fav_(\d+)"[^>]*>([\s\S]*?)<\/li>/gi;
    let m;
    while ((m = re.exec(String(html || ""))) !== null) {
      const block = m[2];
      const linkMatch = block.match(/href="([^"]*thread-(\d+)-\d+-\d+\.html|[^"]*tid=(\d+)[^"]*)"[^>]*>([\s\S]*?)<\/a>/i);
      if (!linkMatch) continue;
      const tid = linkMatch[2] || linkMatch[3];
      const subject = stripHtmlTags(linkMatch[4]);
      const timeMatch = block.match(/<span\s+class="xg1">([\s\S]*?)<\/span>/i);
      items.push({
        favid: m[1],
        tid,
        subject,
        timeText: timeMatch ? stripHtmlTags(timeMatch[1]) : ""
      });
    }
    return items;
  }

  function parseNoticeHtml(html) {
    const items = [];
    const re = /<dl\s+class="cl"[^>]*notice="(\d+)"[^>]*>([\s\S]*?)<\/dl>/gi;
    let m;
    while ((m = re.exec(String(html || ""))) !== null) {
      const block = m[2];
      const ddMatch = block.match(/<dd[^>]*class="ntc_body"[^>]*>([\s\S]*?)<\/dd>/i);
      const timeMatch = block.match(/<span\s+class="xg1\s+xw0"[^>]*>([\s\S]*?)<\/span>/i);
      const tidMatch = block.match(/ptid=(\d+)|thread-(\d+)-/);
      const pidMatch = block.match(/pid=(\d+)/);
      const authorMatch = block.match(/space-uid-(\d+)\.html[^>]*>([\s\S]*?)<\/a>/i);
      items.push({
        id: m[1],
        tid: tidMatch ? (tidMatch[1] || tidMatch[2]) : "",
        pid: pidMatch ? pidMatch[1] : "",
        authorid: authorMatch ? authorMatch[1] : "0",
        author: authorMatch ? stripHtmlTags(authorMatch[2]) : "系统提醒",
        summary: ddMatch ? stripHtmlTags(ddMatch[1]) : stripHtmlTags(block),
        timeText: timeMatch ? stripHtmlTags(timeMatch[1]) : ""
      });
    }
    return items;
  }

  function parseSearchHtml(html) {
    const results = [];
    const re = /<li\s+class="pbw"\s+id="(\d+)"[^>]*>([\s\S]*?)<\/li>/gi;
    let m;
    while ((m = re.exec(String(html || ""))) !== null) {
      const tid = m[1];
      const block = m[2];
      const titleMatch = block.match(/<h3\s+class="xs3"[^>]*>[\s\S]*?<a[^>]*>([\s\S]*?)<\/a>/i);
      const snippetMatch = block.match(/<p>([\s\S]*?)<\/p>/i);
      const metaMatch = block.match(/<span>([\s\S]*?)<\/span>\s*-\s*<span><a[^>]*space-uid-(\d+)\.html[^>]*>([\s\S]*?)<\/a><\/span>\s*-\s*<span><a[^>]*forum-(\d+)-1\.html[^>]*>([\s\S]*?)<\/a>/i);
      results.push({
        tid,
        subject: titleMatch ? stripHtmlTags(titleMatch[1]) : "(无标题)",
        previewText: snippetMatch ? stripHtmlTags(snippetMatch[1]).slice(0, 90) : "",
        datelineText: metaMatch ? stripHtmlTags(metaMatch[1]) : "",
        lastpostTs: metaMatch ? Math.floor(parseTimestampMs(metaMatch[1]) / 1000) : 0,
        authorid: metaMatch ? metaMatch[2] : "0",
        author: metaMatch ? stripHtmlTags(metaMatch[3]) : "",
        fid: metaMatch ? metaMatch[4] : "",
        forumName: metaMatch ? stripHtmlTags(metaMatch[5]) : "",
        avatarUrl: ucenterAvatarUrl(metaMatch ? metaMatch[2] : "0", "small"),
        replies: 0
      });
    }
    return results;
  }

  function parseReplyQuoteFields(xmlOrHtml) {
    const str = String(xmlOrHtml || "");
    const extract = (name) => {
      const m = str.match(new RegExp(`<input[^>]*name=["']${name}["'][^>]*value=["']([^"']*)["']`, "i")) ||
        str.match(new RegExp(`<input[^>]*value=["']([^"']*)["'][^>]*name=["']${name}["']`, "i"));
      return m ? decodeHtmlEntities(m[1]) : "";
    };
    return {
      formhash: extract("formhash"),
      posttime: extract("posttime") || String(Math.floor(Date.now() / 1000)),
      noticeauthor: extract("noticeauthor"),
      noticetrimstr: extract("noticetrimstr"),
      noticeauthormsg: extract("noticeauthormsg"),
      reppid: extract("reppid"),
      reppost: extract("reppost"),
      subject: extract("subject")
    };
  }

  function parseDiscuzAjaxResult(xmlText) {
    const text = String(xmlText || "");
    const cdataMatch = text.match(/<!\[CDATA\[([\s\S]*?)\]\]>/);
    const inner = cdataMatch ? cdataMatch[1] : text;
    const plain = stripHtmlTags(inner);
    const errorLike = /errorhandle_|抱歉|您尚未登录|不能|无权|禁止|太快|字数|验证码|seccode|密码错误|登录失败/i.test(inner);
    const successLike = /succeedhandle_|回复发布成功|发表成功|收藏成功|感谢您的参与|评分成功|已收藏|欢迎您回来|您已退出/i.test(inner);
    return {
      ok: successLike || (!errorLike && plain.length > 0),
      message: plain || (successLike ? "操作成功" : "操作完成"),
      raw: inner
    };
  }

  function parseForumCheckNew(xmlText) {
    const text = String(xmlText || "");
    const cdataMatch = text.match(/<!\[CDATA\[([\s\S]*?)\]\]>/);
    const inner = cdataMatch ? cdataMatch[1] : text;
    const numMatch = inner.match(/\d+/);
    return numMatch ? Math.max(0, Number(numMatch[0]) || 0) : 0;
  }

  function parseUploadHash(htmlText) {
    const str = String(htmlText || "");
    const hashMatch =
      str.match(/\bhash\s*[:=]\s*["']([a-f0-9]{16,})["']/i) ||
      str.match(/name=["']hash["'][^>]*value=["']([a-f0-9]+)["']/i) ||
      str.match(/value=["']([a-f0-9]+)["'][^>]*name=["']hash["']/i);
    const uidMatch =
      str.match(/\buid\s*[:=]\s*["']?(\d+)["']?/i) ||
      str.match(/discuz_uid\s*=\s*["']?(\d+)["']?/i) ||
      str.match(/name=["']uid["'][^>]*value=["'](\d+)["']/i);
    const formhashMatch =
      str.match(/name=["']formhash["'][^>]*value=["']([a-f0-9]+)["']/i) ||
      str.match(/value=["']([a-f0-9]+)["'][^>]*name=["']formhash["']/i);
    return {
      hash: hashMatch ? hashMatch[1] : "",
      uid: uidMatch ? uidMatch[1] : "",
      formhash: formhashMatch ? formhashMatch[1] : ""
    };
  }

  function parseLoginFormFields(htmlText) {
    const str = String(htmlText || "");
    const lhMatch = str.match(/loginhash=([A-Za-z0-9]+)/i);
    const fhMatch =
      str.match(/name=["']formhash["'][^>]*value=["']([a-f0-9]+)["']/i) ||
      str.match(/value=["']([a-f0-9]+)["'][^>]*name=["']formhash["']/i);
    return {
      loginhash: lhMatch ? lhMatch[1] : "",
      formhash: fhMatch ? fhMatch[1] : "",
      hasSeccode: /seccode(?:hash|verify)/i.test(str)
    };
  }

  function bootstrapFromDocument(doc, win) {
    if (!doc) return null;
    const uid = String(win?.discuz_uid || "0");
    const formhashInput = doc.querySelector('input[name="formhash"]');
    const formhash = formhashInput?.value || "";
    const userLink = doc.querySelector("#um .vwmy a, #um strong a");
    const username = userLink ? userLink.textContent.trim() : "";
    const pmBadge = doc.querySelector("#pm_ntc.new");
    const promptBadge = doc.querySelector("#myprompt.new");
    const promptNum = promptBadge?.textContent?.match(/\d+/);

    return {
      user: {
        uid,
        username,
        avatar: uid !== "0" ? ucenterAvatarUrl(uid, "middle") : "",
        formhash,
        unreadCount: (pmBadge ? 1 : 0) + (promptNum ? Number(promptNum[0]) : 0)
      },
      route: parseStage1stRoute(win?.location?.pathname || "", win?.location?.search || "")
    };
  }

  function normalizeAppThreadMeta(appInfo, fallbackTid = "") {
    const info = appInfo || {};
    const replies = Number(info.replies || 0);
    const ppp = POSTS_PER_PAGE;
    const totalPages = Math.max(1, Math.floor(replies / ppp) + 1);
    return {
      tid: String(info.tid || fallbackTid || ""),
      fid: String(info.fid || ""),
      forumName: decodeHtmlEntities(info.fname || ""),
      subject: decodeHtmlEntities(info.subject || "(无主题)"),
      author: decodeHtmlEntities(info.author || ""),
      authorid: String(info.authorid || "0"),
      replies,
      views: Number(info.views || 0),
      closed: Number(info.closed || 0),
      readperm: Number(info.readperm || 0),
      favtimes: 0,
      ppp,
      totalPages
    };
  }

  function normalizeAppThreadPosts(appList, tidHint = "", page = 1) {
    const list = Array.isArray(appList) ? appList : [];
    return list.map((p, index) => {
      const parsed = parsePostMessageHtml(p.message || "");
      const authorid = String(p.authorid || "0");
      const ts = Number(p.dateline || 0);
      const floor = Number(p.position || p.number || (page - 1) * POSTS_PER_PAGE + index + 1);
      return {
        pid: String(p.pid || ""),
        tid: String(p.tid || tidHint || ""),
        page: Math.max(1, Number(page || 1)),
        first: floor === 1 || String(p.first) === "1",
        floor,
        author: decodeHtmlEntities(p.author || p.username || "匿名"),
        authorid,
        avatarUrl: ucenterAvatarUrl(authorid, "small"),
        groupid: String(p.groupid || ""),
        adminid: String(p.adminid || "0"),
        datelineTs: ts,
        datelineText: "",
        quote: parsed.quote,
        editedInfo: parsed.editedInfo || "",
        bodyHtml: parsed.bodyHtml,
        attachments: [],
        ratelog: null,
        recoveredLabel: "审核中"
      };
    });
  }

  function extractPostMedia(posts) {
    const images = [];
    const links = [];
    const seenImgKey = new Set();
    const seenLinkKey = new Set();

    for (const p of Array.isArray(posts) ? posts : []) {
      const baseMeta = {
        pid: String(p.pid || ""),
        page: Math.max(1, Number(p.page || 1)),
        floor: Number(p.floor || 0),
        author: String(p.author || "匿名"),
        datelineTs: Number(p.datelineTs || 0)
      };
      const body = String(p.bodyHtml || "");

      const imgRe = /<img\b([^>]*\bclass="[^"]*\bs1-content-img\b[^"]*"[^>]*)>/gi;
      let m;
      while ((m = imgRe.exec(body)) !== null) {
        const srcM = m[1].match(/\bsrc="([^"]+)"/i);
        if (!srcM) continue;
        const url = decodeHtmlEntities(srcM[1]);
        const key = `${baseMeta.pid}|${url}`;
        if (seenImgKey.has(key)) continue;
        seenImgKey.add(key);
        images.push({ ...baseMeta, url });
      }

      for (const att of Array.isArray(p.attachments) ? p.attachments : []) {
        const url = String(att?.url || "");
        if (!url) continue;
        const key = `${baseMeta.pid}|${url}`;
        if (seenImgKey.has(key)) continue;
        seenImgKey.add(key);
        images.push({ ...baseMeta, url });
      }

      const linkRe = /<a\b([^>]*)href="([^"]+)"([^>]*)>([\s\S]*?)<\/a>/gi;
      while ((m = linkRe.exec(body)) !== null) {
        const url = decodeHtmlEntities(m[2]);
        if (!url || url === "#") continue;
        const text = stripHtmlTags(m[4]) || url;
        const key = `${baseMeta.pid}|${url}`;
        if (seenLinkKey.has(key)) continue;
        seenLinkKey.add(key);
        links.push({ ...baseMeta, url, text });
      }
    }
    return { images, links };
  }

  function stripBbQuotes(val) {
    return String(val || "")
      .trim()
      .replace(/^(?:&quot;|&#39;|["'])+|(?:&quot;|&#39;|["'])+$/g, "")
      .trim();
  }

  function safeBbColor(val) {
    const c = stripBbQuotes(val);
    if (/^(?:#[0-9a-f]{3,8}|[a-z]{3,20}|rgba?\(\s*\d+(?:\s*,\s*\d+){2}(?:\s*,\s*[\d.]+)?\s*\))$/i.test(c)) {
      return c;
    }
    return "";
  }

  function safeBbUrl(raw) {
    const decoded = decodeHtmlEntities(stripBbQuotes(raw));
    if (!decoded || /^(?:javascript|vbscript|data):/i.test(decoded)) return "";
    return sanitizeStage1stUrl(decoded);
  }

  const DISCUZ_SIZE_MAP = {
    "1": "11px",
    "2": "12px",
    "3": "13.5px",
    "4": "16px",
    "5": "19px",
    "6": "23px",
    "7": "28px"
  };

  function renderBbcodePreviewHtml(bbcode, { smilies = [], attachments = [] } = {}) {
    const raw = String(bbcode || "").replace(/\r\n?/g, "\n");
    if (!raw.trim()) {
      return `<span class="s1w-preview-empty">暂无内容可预览</span>`;
    }

    let html = escapeHtml(raw);
    const codeBlocks = [];
    html = html.replace(/\[code\]([\s\S]*?)\[\/code\]/gi, (_, inner) => {
      const token = `\u0000CODE_${codeBlocks.length}\u0000`;
      codeBlocks.push(`<pre class="s1w-preview-code"><code>${inner.replace(/^\n+|\n+$/g, "")}</code></pre>`);
      return token;
    });

    // S1 whiteout spoiler: [backcolor=White][color=White]...[/color][/backcolor]
    const whiteVal = `(?:&quot;|&#39;)?(?:white|#fff|#ffffff)(?:&quot;|&#39;)?`;
    html = html.replace(
      new RegExp(`\\[backcolor=${whiteVal}\\]\\s*\\[color=${whiteVal}\\]([\\s\\S]*?)\\[\\/color\\]\\s*\\[\\/backcolor\\]`, "gi"),
      (_, inner) => `<span class="s1w-spoiler-mask" title="悬停或点击显示反白内容">${inner}</span>`
    );

    // Media & links first so URL attributes are not touched by nested text rules
    html = html.replace(/\[img(?:=\d+,\d+)?\]([^\[\]\s]+?)\[\/img\]/gi, (full, url) => {
      const clean = safeBbUrl(url);
      return clean
        ? `<img class="s1-content-img" src="${escapeHtml(clean)}" alt="" loading="lazy" />`
        : full;
    });
    html = html.replace(/\[url\]([^\[\]\s]+?)\[\/url\]/gi, (full, url) => {
      const clean = safeBbUrl(url);
      return clean
        ? `<a href="${escapeHtml(clean)}" target="_blank" rel="noopener noreferrer">${escapeHtml(decodeHtmlEntities(stripBbQuotes(url)))}</a>`
        : full;
    });
    html = html.replace(/\[url=([^\]]+?)\]([\s\S]*?)\[\/url\]/gi, (full, url, label) => {
      const clean = safeBbUrl(url);
      return clean
        ? `<a href="${escapeHtml(clean)}" target="_blank" rel="noopener noreferrer">${label}</a>`
        : label;
    });

    const attMap = new Map(
      (Array.isArray(attachments) ? attachments : [])
        .filter((a) => a && a.aid !== undefined)
        .map((a) => [String(a.aid), a])
    );
    html = html.replace(/\[attach\](\d+)\[\/attach\]/gi, (_, aid) => {
      const att = attMap.get(String(aid));
      const label = att?.filename ? `${att.filename} (#${aid})` : `附件 #${aid}`;
      return `<span class="s1w-preview-attach">[${escapeHtml(label)}]</span>`;
    });

    html = html.replace(/\[hr\]/gi, "<hr />");

    // Loop inline/container BBCode to resolve nested tags cleanly
    for (let pass = 0; pass < 3; pass++) {
      html = html
        .replace(/\[b\]([\s\S]*?)\[\/b\]/gi, "<strong>$1</strong>")
        .replace(/\[i\]([\s\S]*?)\[\/i\]/gi, "<em>$1</em>")
        .replace(/\[u\]([\s\S]*?)\[\/u\]/gi, "<u>$1</u>")
        .replace(/\[s\]([\s\S]*?)\[\/s\]/gi, "<s>$1</s>")
        .replace(/\[quote\]([\s\S]*?)\[\/quote\]/gi, (_, inner) => `<blockquote>${inner.replace(/^\n+|\n+$/g, "")}</blockquote>`)
        .replace(/\[align=(?:&quot;|&#39;)?(left|center|right)(?:&quot;|&#39;)?\]([\s\S]*?)\[\/align\]/gi, (_, align, inner) => {
          return `<div style="text-align:${align.toLowerCase()};">${inner}</div>`;
        })
        .replace(/\[color=([^\]]+?)\]([\s\S]*?)\[\/color\]/gi, (full, col, inner) => {
          const clean = safeBbColor(col);
          return clean ? `<span style="color:${escapeHtml(clean)};">${inner}</span>` : inner;
        })
        .replace(/\[backcolor=([^\]]+?)\]([\s\S]*?)\[\/backcolor\]/gi, (full, col, inner) => {
          const clean = safeBbColor(col);
          return clean ? `<span style="background-color:${escapeHtml(clean)};padding:0 3px;border-radius:3px;">${inner}</span>` : inner;
        })
        .replace(/\[size=([^\]]+?)\]([\s\S]*?)\[\/size\]/gi, (_, rawSize, inner) => {
          const s = stripBbQuotes(rawSize);
          let px = DISCUZ_SIZE_MAP[s] || "";
          if (!px) {
            const numMatch = s.match(/^(\d+)(?:px)?$/i);
            if (numMatch) px = `${Math.max(11, Math.min(28, Number(numMatch[1])))}px`;
          }
          return px ? `<span style="font-size:${px};">${inner}</span>` : inner;
        });
    }

    html = html.replace(/\[list(?:=([1aA]))?\]([\s\S]*?)\[\/list\]/gi, (_, ordered, body) => {
      const tag = ordered ? "ol" : "ul";
      const items = body
        .split(/\[\*\]/i)
        .map((s) => s.trim())
        .filter(Boolean)
        .map((s) => `<li>${s}</li>`)
        .join("");
      return `<${tag}>${items || body}</${tag}>`;
    });

    // Replace smilies only outside HTML tags
    const smileyMap = new Map();
    for (const g of Array.isArray(smilies) ? smilies : []) {
      const items = Array.isArray(g?.items) ? g.items : (g?.code ? [g] : []);
      for (const item of items) {
        if (item?.code && item?.url && !smileyMap.has(item.code)) {
          smileyMap.set(item.code, item.url);
        }
      }
    }
    const escapedCodes = Array.from(smileyMap.keys())
      .sort((a, b) => b.length - a.length)
      .map((c) => escapeHtml(c).replace(/[.*+?^${}()|[\]\\]/g, "\\$&"));
    const smileyPattern = escapedCodes.length
      ? new RegExp(`${escapedCodes.join("|")}|\\[f:(\\d{1,4})\\]`, "g")
      : /\[f:(\d{1,4})\]/g;

    html = html
      .split(/(<[^>]+>)/)
      .map((seg, i) => {
        if (i % 2 === 1) return seg;
        let textSeg = seg.replace(smileyPattern, (match, fNum) => {
          const rawCode = decodeHtmlEntities(match);
          const url = smileyMap.get(rawCode) || (fNum ? `${STATIC_BASE}image/smiley/face2017/${fNum}.png` : "");
          return url
            ? `<img class="s1-smiley" src="${escapeHtml(url)}" alt="${escapeHtml(rawCode)}" loading="lazy" />`
            : match;
        });
        textSeg = textSeg.replace(/\n/g, "<br />");
        return textSeg;
      })
      .join("");

    html = html.replace(/(?:<br\s*\/?>\s*){3,}/gi, "<br /><br />");
    html = html.replace(/\u0000CODE_(\d+)\u0000/g, (_, idx) => codeBlocks[Number(idx)] || "");
    return html;
  }

  /* === src/api.js === */
  function sleep(ms) {
    return new Promise((resolve) => setTimeout(resolve, ms));
  }

  function createStage1stApi({
    fetchImpl = typeof fetch === "function" ? fetch.bind(globalThis) : null,
    baseUrl = typeof location !== "undefined" && /^https?:$/i.test(location.protocol) ? location.origin : "https://stage1st.com",
    minIntervalMs = 260,
    maxConcurrency = 2,
    maxRetries = 2,
    retryBaseDelayMs = 600,
    storage = typeof localStorage !== "undefined" ? localStorage : null
  } = {}) {
    const ttlCache = new Map();
    const inFlight = new Map();
    let activeCount = 0;
    let lastRequestAt = 0;
    const waitQueue = [];

    function resolveUrl(relPath) {
      if (/^https?:\/\//i.test(relPath)) return relPath;
      const prefix = relPath.startsWith("/") ? "" : BASE_PATH;
      return `${baseUrl}${prefix}${relPath}`;
    }

    async function acquireSlot() {
      while (activeCount >= maxConcurrency) {
        await new Promise((resolve) => waitQueue.push(resolve));
      }
      activeCount += 1;
      const elapsed = Date.now() - lastRequestAt;
      if (elapsed < minIntervalMs) {
        await sleep(minIntervalMs - elapsed);
      }
      lastRequestAt = Date.now();
    }

    function releaseSlot() {
      activeCount = Math.max(0, activeCount - 1);
      const next = waitQueue.shift();
      if (next) next();
    }

    async function requestRaw(relPath, options = {}) {
      if (!fetchImpl) throw new Error("fetch is unavailable");
      const url = resolveUrl(relPath);
      let attempt = 0;
      while (true) {
        await acquireSlot();
        let res;
        try {
          res = await fetchImpl(url, {
            credentials: "include",
            ...options
          });
        } finally {
          releaseSlot();
        }
        if ((res.status === 503 || res.status === 429) && attempt < maxRetries) {
          attempt += 1;
          await sleep(retryBaseDelayMs * Math.pow(2.5, attempt - 1));
          continue;
        }
        if (!res.ok) {
          const err = new Error(`HTTP ${res.status}`);
          err.status = res.status;
          err.url = url;
          throw err;
        }
        return res;
      }
    }

    async function fetchJson(relPath) {
      const res = await requestRaw(relPath, {
        headers: { Accept: "application/json, text/plain, */*" }
      });
      const text = await res.text();
      try {
        return JSON.parse(text);
      } catch {
        const err = new Error("Invalid JSON response");
        err.status = res.status;
        err.bodyPreview = text.slice(0, 120);
        throw err;
      }
    }

    async function fetchText(relPath, options = {}) {
      const res = await requestRaw(relPath, options);
      return await res.text();
    }

    async function cached(key, ttlMs, loader, { force = false } = {}) {
      const now = Date.now();
      if (!force && ttlCache.has(key)) {
        const entry = ttlCache.get(key);
        if (now - entry.ts < ttlMs) return entry.data;
      }
      if (!force && inFlight.has(key)) {
        return inFlight.get(key);
      }
      const promise = (async () => {
        try {
          const data = await loader();
          ttlCache.set(key, { ts: Date.now(), data });
          return data;
        } finally {
          inFlight.delete(key);
        }
      })();
      inFlight.set(key, promise);
      return promise;
    }

    function clearCache(prefix = "") {
      if (!prefix) {
        ttlCache.clear();
        return;
      }
      for (const k of ttlCache.keys()) {
        if (k.startsWith(prefix)) ttlCache.delete(k);
      }
    }

    return {
      clearCache,

      getForumIndex({ force = false } = {}) {
        return cached(
          "forumindex",
          5 * 60 * 1000,
          async () => {
            const json = await fetchJson("api/mobile/index.php?version=4&module=forumindex");
            return normalizeForumIndex(json);
          },
          { force }
        );
      },

      getForumDisplay(fid, { page = 1, typeid = "", filter = "", orderby = "", force = false } = {}) {
        const f = String(fid);
        const p = Math.max(1, Number(page) || 1);
        const key = `forumdisplay:${f}:${p}:${typeid}:${filter}:${orderby}`;
        return cached(
          key,
          30 * 1000,
          async () => {
            const qs = new URLSearchParams({
              version: "4",
              module: "forumdisplay",
              fid: f,
              page: String(p)
            });
            if (typeid) qs.set("typeid", String(typeid));
            if (filter) qs.set("filter", String(filter));
            if (orderby) qs.set("orderby", String(orderby));
            try {
              const json = await fetchJson(`api/mobile/index.php?${qs.toString()}`);
              return normalizeForumDisplay(json, f);
            } catch (err) {
              // Fallback to HTML if Mobile API returns 503 or malformed output
              const htmlQs = new URLSearchParams({
                mod: "forumdisplay",
                fid: f,
                page: String(p)
              });
              if (typeid) {
                htmlQs.set("filter", "typeid");
                htmlQs.set("typeid", String(typeid));
              } else if (filter) {
                htmlQs.set("filter", String(filter));
              }
              if (orderby) htmlQs.set("orderby", String(orderby));
              const html = await fetchText(`forum.php?${htmlQs.toString()}`);
              return parseForumHtml(html, f);
            }
          },
          { force }
        );
      },

      getHotThreads(page = 1, { force = false } = {}) {
        const p = Math.max(1, Number(page) || 1);
        return cached(
          `hotthread:${p}`,
          60 * 1000,
          async () => {
            const json = await fetchJson(`api/mobile/index.php?version=4&module=hotthread&page=${p}`);
            const list = Array.isArray(json?.Variables?.data) ? json.Variables.data : [];
            return normalizeForumDisplay(
              { Variables: { forum: { fid: "hot", name: "全站热门" }, forum_threadlist: list, page: p, tpp: 25 } },
              "hot"
            );
          },
          { force }
        );
      },

      getViewThread(tid, { page = 1, authorid = "", force = false } = {}) {
        const t = String(tid);
        const p = Math.max(1, Number(page) || 1);
        const key = `viewthread:${t}:${p}:${authorid}`;
        return cached(
          key,
          45 * 1000,
          async () => {
            const qs = new URLSearchParams({
              version: "4",
              module: "viewthread",
              tid: t,
              page: String(p),
              ppp: "40"
            });
            if (authorid) qs.set("authorid", String(authorid));
            try {
              const json = await fetchJson(`api/mobile/index.php?${qs.toString()}`);
              return normalizeViewThread(json);
            } catch {
              const htmlQs = new URLSearchParams({ mod: "viewthread", tid: t, page: String(p) });
              if (authorid) htmlQs.set("authorid", String(authorid));
              const html = await fetchText(`forum.php?${htmlQs.toString()}`);
              return parseThreadHtml(html, t, p);
            }
          },
          { force }
        );
      },

      getThreadHtmlEnrichment(tid, page = 1) {
        const t = String(tid);
        const p = Math.max(1, Number(page) || 1);
        return cached(`thread-html:${t}:${p}`, 60 * 1000, async () => {
          const html = await fetchText(`thread-${t}-${p}-1.html`);
          return parseThreadHtml(html, t, p);
        });
      },

      async getSmilies({ force = false } = {}) {
        if (!force) {
          const cachedRaw = readStorage(STORAGE_KEYS.smilies, "", storage);
          const parsed = safeJsonParse(cachedRaw, null);
          if (parsed && Array.isArray(parsed.groups) && Date.now() - Number(parsed.ts || 0) < 24 * 3600 * 1000) {
            return parsed.groups;
          }
        }
        const json = await fetchJson("api/mobile/index.php?version=4&module=smiley");
        const groups = normalizeSmileyGroups(json);
        if (groups.length) {
          writeStorage(STORAGE_KEYS.smilies, JSON.stringify({ ts: Date.now(), groups }), storage);
        }
        return groups;
      },

      getUserProfile(uid) {
        const u = String(uid);
        return cached(`profile:${u}`, 5 * 60 * 1000, async () => {
          const json = await fetchJson(`api/mobile/index.php?version=4&module=profile&uid=${encodeURIComponent(u)}`);
          return json?.Variables || {};
        });
      },

      async getFavorites(page = 1) {
        const p = Math.max(1, Number(page) || 1);
        try {
          const json = await fetchJson(`api/mobile/index.php?version=4&module=myfavthread&page=${p}`);
          const list = Array.isArray(json?.Variables?.list) ? json.Variables.list : null;
          if (list) {
            return list.map((item) => ({
              favid: String(item.favid || ""),
              tid: String(item.id || item.tid || ""),
              subject: item.title || item.subject || "(无主题)",
              replies: Number(item.replies || 0),
              author: item.author || "",
              timeText: item.dateline || ""
            }));
          }
        } catch {
          /* fallback to HTML below */
        }
        const html = await fetchText(`home.php?mod=space&do=favorite&type=thread&page=${p}`);
        return parseFavoriteHtml(html);
      },

      async getNotices(page = 1) {
        const p = Math.max(1, Number(page) || 1);
        const html = await fetchText(`home.php?mod=space&do=notice&view=mypost&page=${p}`);
        return parseNoticeHtml(html);
      },

      async getPms(page = 1) {
        const p = Math.max(1, Number(page) || 1);
        const json = await fetchJson(`api/mobile/index.php?version=4&module=mypm&page=${p}`);
        return {
          list: Array.isArray(json?.Variables?.list) ? json.Variables.list : [],
          message: json?.Message?.messagestr || null
        };
      },

      async searchForum(query, formhash = "") {
        const q = String(query || "").trim();
        if (!q) return [];
        const body = new URLSearchParams({
          mod: "forum",
          srchtxt: q,
          searchsubmit: "yes",
          formhash: String(formhash || "")
        });
        const html = await fetchText("search.php?mod=forum", {
          method: "POST",
          headers: { "Content-Type": "application/x-www-form-urlencoded" },
          body: body.toString()
        });
        return parseSearchHtml(html);
      },

      async checkForumNew(fid, sinceTs = Math.floor(Date.now() / 1000) - 60) {
        const f = encodeURIComponent(String(fid || ""));
        const t = Math.max(0, Math.floor(Number(sinceTs) || 0));
        const xml = await fetchText(`forum.php?mod=ajax&action=forumchecknew&fid=${f}&time=${t}&inajax=yes`);
        return parseForumCheckNew(xml);
      },

      getUploadConfig({ fid, tid = "" }) {
        const f = String(fid || "");
        const key = `uploadcfg:${f}:${tid ? "reply" : "new"}`;
        return cached(key, 5 * 60 * 1000, async () => {
          const qs = new URLSearchParams({
            mod: "post",
            action: tid ? "reply" : "newthread",
            fid: f
          });
          if (tid) qs.set("tid", String(tid));
          const html = await fetchText(`forum.php?${qs.toString()}`);
          return parseUploadHash(html);
        });
      },

      async uploadAttachment({ fid, tid = "", file, uid = "" }) {
        if (!file) throw new Error("请选择要上传的文件");
        if (typeof FormData === "undefined") throw new Error("当前环境不支持 FormData 上传");
        const cfg = await this.getUploadConfig({ fid, tid });
        const uploadUid = uid && String(uid) !== "0" ? String(uid) : String(cfg.uid || "0");
        if (!cfg.hash) throw new Error("未获取到上传校验 hash，请确认已登录且有附件权限");

        const fd = new FormData();
        fd.append("uid", uploadUid);
        fd.append("hash", cfg.hash);
        fd.append("Filedata", file, file.name || "attachment.bin");

        const res = await requestRaw(
          `misc.php?mod=swfupload&action=swfupload&operation=upload&fid=${encodeURIComponent(String(fid || ""))}`,
          { method: "POST", body: fd }
        );
        const rawText = (await res.text()).trim();
        let aid = "";
        let errCode = 0;

        if (/^\d+$/.test(rawText) && Number(rawText) > 0) {
          aid = rawText;
        } else if (/^-\d+$/.test(rawText)) {
          errCode = Number(rawText);
        } else if (rawText.startsWith("DISCUZUPLOAD|")) {
          const parts = rawText.split("|");
          const status = Number(parts[2] ?? parts[1]);
          const maybeAid = String(parts[3] || "");
          if (/^\d+$/.test(maybeAid) && Number(maybeAid) > 0) {
            aid = maybeAid;
          } else {
            errCode = Number.isFinite(status) ? status : -1;
          }
        }

        if (!aid) {
          const errMap = {
            "-1": "服务器内部错误",
            "-2": "当前账号没有上传附件权限",
            "-3": "不支持该文件类型或扩展名",
            "-4": "文件大小超出论坛限制",
            "-7": "图片文件损坏或格式不合法",
            "-8": "已超出今日允许上传数量或大小上限",
            "-9": "附件存储空间不足"
          };
          throw new Error(errMap[String(errCode)] || `上传失败 (${rawText || "未知错误"})`);
        }

        return {
          aid,
          filename: String(file.name || `attach_${aid}`),
          isImage: /^image\//i.test(file.type || "") || /\.(?:png|jpe?g|gif|webp|bmp)$/i.test(file.name || "")
        };
      },

      async sendReply({ fid, tid, message, formhash, quotePid = "", attachIds = [] }) {
        const bodyParams = new URLSearchParams({
          message: String(message || ""),
          formhash: String(formhash || ""),
          usesig: "1",
          subject: ""
        });

        if (quotePid) {
          const quoteXml = await fetchText(
            `forum.php?mod=post&action=reply&fid=${encodeURIComponent(fid)}&tid=${encodeURIComponent(tid)}&repquote=${encodeURIComponent(quotePid)}&infloat=yes&handlekey=reply&inajax=1`
          );
          const qFields = parseReplyQuoteFields(quoteXml);
          if (qFields.formhash) bodyParams.set("formhash", qFields.formhash);
          if (qFields.posttime) bodyParams.set("posttime", qFields.posttime);
          if (qFields.noticeauthor) bodyParams.set("noticeauthor", qFields.noticeauthor);
          if (qFields.noticetrimstr) bodyParams.set("noticetrimstr", qFields.noticetrimstr);
          if (qFields.noticeauthormsg) bodyParams.set("noticeauthormsg", qFields.noticeauthormsg);
          if (qFields.reppid) bodyParams.set("reppid", qFields.reppid);
          if (qFields.reppost) bodyParams.set("reppost", qFields.reppost);
        } else {
          bodyParams.set("posttime", String(Math.floor(Date.now() / 1000)));
        }

        for (const rawAid of Array.isArray(attachIds) ? attachIds : []) {
          const aid = String(rawAid || "").trim();
          if (aid) bodyParams.append(`attachnew[${aid}][description]`, "");
        }

        const xml = await fetchText(
          `forum.php?mod=post&action=reply&fid=${encodeURIComponent(fid)}&tid=${encodeURIComponent(tid)}&extra=&replysubmit=yes&infloat=yes&handlekey=fastpost&inajax=1`,
          {
            method: "POST",
            headers: { "Content-Type": "application/x-www-form-urlencoded" },
            body: bodyParams.toString()
          }
        );
        clearCache(`viewthread:${tid}:`);
        clearCache(`thread-html:${tid}:`);
        return parseDiscuzAjaxResult(xml);
      },

      async createThread({ fid, subject, message, typeid = "", formhash, attachIds = [] }) {
        const bodyParams = new URLSearchParams({
          formhash: String(formhash || ""),
          posttime: String(Math.floor(Date.now() / 1000)),
          wysiwyg: "0",
          subject: String(subject || ""),
          message: String(message || ""),
          usesig: "1",
          allownoticeauthor: "1"
        });
        if (typeid) bodyParams.set("typeid", String(typeid));
        for (const rawAid of Array.isArray(attachIds) ? attachIds : []) {
          const aid = String(rawAid || "").trim();
          if (aid) bodyParams.append(`attachnew[${aid}][description]`, "");
        }

        const xml = await fetchText(
          `forum.php?mod=post&action=newthread&fid=${encodeURIComponent(fid)}&extra=&topicsubmit=yes&infloat=yes&handlekey=newthread&inajax=1`,
          {
            method: "POST",
            headers: { "Content-Type": "application/x-www-form-urlencoded" },
            body: bodyParams.toString()
          }
        );
        clearCache(`forumdisplay:${fid}:`);
        const res = parseDiscuzAjaxResult(xml);
        const tidMatch = xml.match(/thread-(\d+)-1-1\.html|tid=(\d+)/);
        return {
          ...res,
          tid: tidMatch ? (tidMatch[1] || tidMatch[2]) : ""
        };
      },

      async webLogin({ username, password, questionid = "0", answer = "" }) {
        const loginHtml = await fetchText("member.php?mod=logging&action=login&inajax=1");
        const fields = parseLoginFormFields(loginHtml);
        if (fields.hasSeccode) {
          return {
            ok: false,
            requiresSeccode: true,
            message: "登录需要图形验证码，请在原版页面完成登录"
          };
        }

        const bodyParams = new URLSearchParams({
          formhash: fields.formhash || "",
          referer: resolveUrl(""),
          loginfield: "username",
          username: String(username || ""),
          password: String(password || ""),
          questionid: String(questionid || "0"),
          answer: String(answer || ""),
          cookietime: "2592000"
        });
        const qs = new URLSearchParams({
          mod: "logging",
          action: "login",
          loginsubmit: "yes",
          inajax: "1"
        });
        if (fields.loginhash) qs.set("loginhash", fields.loginhash);

        const xml = await fetchText(`member.php?${qs.toString()}`, {
          method: "POST",
          headers: { "Content-Type": "application/x-www-form-urlencoded" },
          body: bodyParams.toString()
        });
        const parsed = parseDiscuzAjaxResult(xml);
        const ok = /succeedhandle_|欢迎您回来/i.test(xml) || parsed.ok;
        if (ok) clearCache();
        return {
          ok,
          message: parsed.message,
          raw: parsed.raw
        };
      },

      async webLogout(formhash = "") {
        const qs = new URLSearchParams({
          mod: "logging",
          action: "logout",
          formhash: String(formhash || ""),
          inajax: "1"
        });
        const xml = await fetchText(`member.php?${qs.toString()}`);
        clearCache();
        return parseDiscuzAjaxResult(xml);
      },

      async toggleFavorite({ tid, formhash }) {
        const xml = await fetchText(
          `home.php?mod=spacecp&ac=favorite&type=thread&id=${encodeURIComponent(tid)}&formhash=${encodeURIComponent(formhash)}&inajax=1`
        );
        return parseDiscuzAjaxResult(xml);
      },

      async votePoll({ fid = "", tid, pollanswers = [], formhash = "" }) {
        const ids = Array.isArray(pollanswers) ? pollanswers.map((x) => String(x || "").trim()).filter(Boolean) : [];
        if (!tid) throw new Error("缺少主题 tid");
        if (!formhash) throw new Error("请先登录后投票");
        if (!ids.length) throw new Error("请至少选择一项投票选项");

        const bodyParams = new URLSearchParams({
          formhash: String(formhash),
          pollsubmit: "yes"
        });
        for (const id of ids) {
          bodyParams.append("pollanswers[]", id);
        }

        const qs = new URLSearchParams({
          mod: "misc",
          action: "votepoll",
          tid: String(tid),
          pollsubmit: "yes",
          inajax: "1"
        });
        if (fid) qs.set("fid", String(fid));

        const xmlOrHtml = await fetchText(`forum.php?${qs.toString()}`, {
          method: "POST",
          headers: { "Content-Type": "application/x-www-form-urlencoded; charset=UTF-8" },
          body: bodyParams.toString()
        });

        const alertMatch =
          xmlOrHtml.match(/<div\b[^>]*class=["'][^"']*alert_error[^"']*["'][^>]*>([\s\S]*?)<\/div>/i) ||
          xmlOrHtml.match(/<div\b[^>]*id=["']messagetext["'][^>]*class=["'][^"']*alert_error[^"']*["'][^>]*>([\s\S]*?)<\/div>/i);
        if (alertMatch) {
          const msg = alertMatch[1].replace(/<[^>]+>/g, " ").replace(/\s+/g, " ").trim();
          throw new Error(msg || "投票失败");
        }

        if (/<(?:!DOCTYPE|html)\b/i.test(xmlOrHtml) && /id=["']poll["']/i.test(xmlOrHtml)) {
          clearCache(`viewthread:${tid}:`);
          clearCache(`thread-html:${tid}:`);
          return { ok: true, message: "投票成功" };
        }

        const parsed = parseDiscuzAjaxResult(xmlOrHtml);
        const pollErrMatch = parsed.raw.match(/(您已经投过票[^<\n]*|您所在的用户组没有投票权限[^<\n]*|此投票已关闭[^<\n]*|超过最大可选数[^<\n]*|最多可选[^<\n]*|请选择[^<\n]*)/i);
        if (!parsed.ok || /errorhandle_/i.test(xmlOrHtml) || pollErrMatch) {
          throw new Error((pollErrMatch && pollErrMatch[1]) || parsed.message || "投票失败");
        }

        clearCache(`viewthread:${tid}:`);
        clearCache(`thread-html:${tid}:`);
        return { ok: true, message: parsed.message || "投票成功" };
      },

      async ratePost({ tid, pid, score1 = 1, reason = "", formhash, sendreasonpm = false }) {
        const bodyParams = new URLSearchParams({
          formhash: String(formhash || ""),
          tid: String(tid),
          pid: String(pid),
          score1: String(score1),
          reason: String(reason || ""),
          ratesubmit: "true",
          referer: resolveUrl(
            `forum.php?mod=viewthread&tid=${encodeURIComponent(tid)}`
          )
        });
        if (sendreasonpm) bodyParams.set("sendreasonpm", "on");
        const xml = await fetchText("forum.php?mod=misc&action=rate&ratesubmit=yes&infloat=yes&inajax=1", {
          method: "POST",
          headers: { "Content-Type": "application/x-www-form-urlencoded" },
          body: bodyParams.toString()
        });
        clearCache(`thread-html:${tid}:`);
        return parseDiscuzAjaxResult(xml);
      },

      async resolveFindPostUrl(pid, tid = "") {
        const qs = new URLSearchParams({ mod: "redirect", goto: "findpost", pid: String(pid) });
        if (tid) qs.set("ptid", String(tid));
        const res = await requestRaw(`forum.php?${qs.toString()}`);
        return res.url || "";
      },

      getAppSid() {
        return readStorage(STORAGE_KEYS.appSid, "", storage) || "";
      },

      clearAppSid() {
        if (!storage) return;
        try {
          storage.removeItem(STORAGE_KEYS.appSid);
        } catch {
          /* ignore */
        }
      },

      async postAppApi(apiPath, params = {}) {
        if (!fetchImpl) throw new Error("fetch is unavailable");
        const body = new URLSearchParams();
        for (const [k, v] of Object.entries(params)) {
          if (v !== undefined && v !== null) body.append(k, String(v));
        }
        const res = await fetchImpl(`${APP_API_BASE}${apiPath}`, {
          method: "POST",
          credentials: "omit",
          headers: { "Content-Type": "application/x-www-form-urlencoded; charset=UTF-8" },
          body: body.toString()
        });
        if (!res.ok) {
          const err = new Error(`HTTP ${res.status}`);
          err.status = res.status;
          throw err;
        }
        const text = await res.text();
        return JSON.parse(text);
      },

      async appLogin({ username, password, questionid = "0", answer = "" }) {
        const payload = { username, password };
        if (questionid && String(questionid) !== "0") {
          payload.questionid = questionid;
          payload.answer = answer;
        }
        const resp = await this.postAppApi("/user/login", payload);
        const code = String(resp?.code ?? "");
        if (!resp || typeof resp !== "object" || code.startsWith("50") || !resp.data?.sid) {
          return {
            ok: false,
            sid: "",
            message: resp?.message || "App 登录失败"
          };
        }
        writeStorage(STORAGE_KEYS.appSid, resp.data.sid, storage);
        writeStorage(STORAGE_KEYS.appUser, String(username || ""), storage);
        return {
          ok: true,
          sid: resp.data.sid,
          message: "App 登录成功"
        };
      },

      async appGetThread(tid, sid = this.getAppSid()) {
        if (!sid) throw new Error("Missing app sid");
        const resp = await this.postAppApi("/thread", { sid, tid });
        const code = String(resp?.code ?? "");
        if (!resp || typeof resp !== "object" || code.startsWith("50")) {
          this.clearAppSid();
          throw new Error(resp?.message || "App 会话已过期");
        }
        return resp.data || {};
      },

      async appGetThreadPage(tid, pageNo = 1, sid = this.getAppSid(), pageSize = POSTS_PER_PAGE) {
        if (!sid) throw new Error("Missing app sid");
        const resp = await this.postAppApi("/thread/page", {
          sid,
          tid,
          pageNo: Math.max(1, Number(pageNo) || 1),
          pageSize
        });
        const code = String(resp?.code ?? "");
        if (!resp || typeof resp !== "object" || code.startsWith("50")) {
          this.clearAppSid();
          throw new Error(resp?.message || "App 会话已过期");
        }
        return resp.data || {};
      }
    };
  }

  /* === src/styles.js === */
  function buildStyles() {
    return String.raw`
      html.${ROOT_CLASS} {
        color-scheme: light;
        --wc-accent: #267EF0;
        --wc-accent-hover: #176BCE;
        --wc-accent-soft: #CCE0FA;
        --wc-text: #1F2329;
        --wc-text-2: #585C60;
        --wc-text-3: #8F959E;
        --wc-text-4: #C5C9CF;
        --wc-rail-bg: #E1EBF5;
        --wc-rail-border: #CFDAE6;
        --wc-rail-icon: #7C8B9D;
        --wc-rail-active-bg: #CCE0FA;
        --wc-list-bg: #EBF0F5;
        --wc-list-border: #D9DFE5;
        --wc-list-active: #3D8AF5;
        --wc-chat-bg: #F5F7FA;
        --wc-composer-bg: #FFFFFF;
        --wc-bubble-other: #FFFFFF;
        --wc-bubble-other-border: #E5E8EC;
        --wc-bubble-other-text: #1F2329;
        --wc-bubble-me: #C9E7FF;
        --wc-bubble-me-text: #1F2329;
        --wc-card-bg: #FFFFFF;
        --wc-surface-2: #F0F3F7;
        --wc-hover: rgba(0, 0, 0, 0.05);
        --wc-border: #E5E8EC;
        --wc-border-strong: #D0D5DD;
        --wc-danger: #FA5151;
        --wc-success: #18A058;
        --wc-spoiler-bg: #26292E;
        --wc-pin-bg: rgba(38, 126, 240, 0.08);
        --wc-nav: ${RAIL_WIDTH}px;
        --wc-drawer: ${DRAWER_WIDTH}px;
        --wc-list: ${LIST_WIDTH}px;
        --wc-font: -apple-system, BlinkMacSystemFont, "Segoe UI", "PingFang SC", "Hiragino Sans GB", "Microsoft YaHei", sans-serif;
      }

      html.${ROOT_CLASS}.wecom-dark {
        color-scheme: dark;
        --wc-accent: #3B8BFF;
        --wc-accent-hover: #5BA0FF;
        --wc-accent-soft: rgba(59, 139, 255, 0.2);
        --wc-text: #E6E8EB;
        --wc-text-2: #959CA6;
        --wc-text-3: #6F7682;
        --wc-text-4: #545B66;
        --wc-rail-bg: #16181C;
        --wc-rail-border: #22252A;
        --wc-rail-icon: #7A8699;
        --wc-rail-active-bg: rgba(30, 111, 255, 0.22);
        --wc-list-bg: #1C1E22;
        --wc-list-border: #26292E;
        --wc-list-active: #1F477A;
        --wc-chat-bg: #202328;
        --wc-composer-bg: #1A1C20;
        --wc-bubble-other: #2B2E34;
        --wc-bubble-other-border: #343840;
        --wc-bubble-other-text: #ECEFF4;
        --wc-bubble-me: #1F4E8C;
        --wc-bubble-me-text: #FFFFFF;
        --wc-card-bg: #23272E;
        --wc-surface-2: #2B3039;
        --wc-hover: rgba(255, 255, 255, 0.06);
        --wc-border: #2A2D33;
        --wc-border-strong: #3A3E46;
        --wc-danger: #F87171;
        --wc-success: #34D399;
        --wc-spoiler-bg: #111317;
        --wc-pin-bg: rgba(59, 139, 255, 0.14);
      }

      /* Hide native Discuz page only when WeCom shell is locked */
      html.${ROOT_CLASS}.${LOCK_CLASS} body {
        overflow: hidden !important;
        margin: 0 !important;
        padding: 0 !important;
        background: var(--wc-chat-bg) !important;
      }
      html.${ROOT_CLASS}.${LOCK_CLASS} body > *:not(#${ROOT_ID}) {
        display: none !important;
      }

      #${ROOT_ID} {
        position: fixed;
        inset: 0;
        z-index: 2147483000;
        display: flex;
        font-family: var(--wc-font);
        font-size: 13px;
        color: var(--wc-text);
        background: var(--wc-chat-bg);
        -webkit-font-smoothing: antialiased;
      }
      #${ROOT_ID}, #${ROOT_ID} * {
        box-sizing: border-box;
      }
      #${ROOT_ID} [hidden],
      .s1w-smiley-popover[hidden],
      .s1w-composer-account-popover[hidden],
      .s1w-bbcode-preview[hidden],
      .s1w-popover-menu[hidden],
      .s1w-self-popover[hidden],
      .s1w-usercard-popover[hidden],
      .s1w-records-panel[hidden] {
        display: none !important;
      }
      html.${ROOT_CLASS}:not(.${LOCK_CLASS}) #${ROOT_ID} {
        position: static;
        inset: auto;
        width: 0;
        height: 0;
        background: transparent;
        pointer-events: none;
      }
      html.${ROOT_CLASS}:not(.${LOCK_CLASS}) #${ROOT_ID} .s1w-shell {
        display: none !important;
      }

      /* Native view return button */
      .s1w-native-fab {
        display: none;
        position: fixed;
        right: 22px;
        bottom: 24px;
        z-index: 2147483100;
        align-items: center;
        gap: 6px;
        height: 36px;
        padding: 0 14px;
        border: 1px solid var(--wc-border-strong);
        border-radius: 999px;
        background: var(--wc-accent);
        color: #fff;
        font-size: 13px;
        font-weight: 600;
        cursor: pointer;
        box-shadow: 0 6px 20px rgba(0, 0, 0, 0.22);
      }
      .s1w-native-fab:hover { background: var(--wc-accent-hover); }
      html.${ROOT_CLASS}:not(.${LOCK_CLASS}) .s1w-native-fab {
        display: inline-flex;
        pointer-events: auto;
      }

      .s1w-shell {
        display: flex;
        width: 100%;
        height: 100%;
        overflow: hidden;
        position: relative;
      }

      /* 1. Left Rail */
      .s1w-rail {
        position: relative;
        width: var(--wc-nav);
        flex: 0 0 var(--wc-nav);
        background: var(--wc-rail-bg);
        border-right: 1px solid var(--wc-rail-border);
        display: flex;
        flex-direction: column;
        align-items: center;
        padding: 12px 0 10px;
        user-select: none;
        z-index: 30;
      }
      .s1w-rail-me {
        position: relative;
        width: 36px;
        height: 36px;
        margin-bottom: 14px;
        border: none;
        padding: 0;
        border-radius: 8px;
        background: transparent;
        cursor: pointer;
        display: flex;
        align-items: center;
        justify-content: center;
      }
      .s1w-rail-me img,
      .s1w-rail-me .s1w-avatar-fallback {
        width: 36px;
        height: 36px;
        border-radius: 8px;
        object-fit: cover;
      }
      .s1w-rail-badge {
        position: absolute;
        top: -4px;
        right: -5px;
        min-width: 16px;
        height: 16px;
        padding: 0 4px;
        border-radius: 999px;
        background: var(--wc-danger);
        color: #fff;
        font-size: 10px;
        font-weight: 700;
        line-height: 16px;
        text-align: center;
        box-shadow: 0 0 0 2px var(--wc-rail-bg);
      }
      .s1w-rail-nav {
        flex: 1;
        display: flex;
        flex-direction: column;
        align-items: center;
        gap: 4px;
        width: 100%;
        padding: 0 6px;
      }
      .s1w-rail-btn {
        position: relative;
        width: 44px;
        height: 46px;
        border: none;
        border-radius: 8px;
        background: transparent;
        color: var(--wc-rail-icon);
        display: flex;
        flex-direction: column;
        align-items: center;
        justify-content: center;
        gap: 2px;
        cursor: pointer;
        transition: background 0.14s, color 0.14s;
        padding: 0;
      }
      .s1w-rail-btn span {
        font-size: 10px;
        line-height: 1.1;
      }
      .s1w-rail-btn:hover {
        background: var(--wc-hover);
        color: var(--wc-text);
      }
      .s1w-rail-btn.active {
        background: var(--wc-rail-active-bg);
        color: var(--wc-accent);
      }
      .s1w-rail-bottom {
        display: flex;
        flex-direction: column;
        align-items: center;
        gap: 4px;
        padding-top: 8px;
        position: relative;
      }
      .s1w-rail-icon-btn {
        width: 38px;
        height: 34px;
        border: none;
        border-radius: 8px;
        background: transparent;
        color: var(--wc-rail-icon);
        display: flex;
        align-items: center;
        justify-content: center;
        cursor: pointer;
      }
      .s1w-rail-icon-btn:hover {
        background: var(--wc-hover);
        color: var(--wc-text);
      }

      /* Slide-out Board Drawer */
      .s1w-drawer {
        position: fixed;
        left: var(--wc-nav);
        top: 0;
        bottom: 0;
        width: var(--wc-drawer);
        background: var(--wc-card-bg);
        border-right: 1px solid var(--wc-border);
        z-index: 25;
        display: flex;
        flex-direction: column;
        transform: translateX(-100%);
        opacity: 0;
        pointer-events: none;
        visibility: hidden;
        transition: transform 0.2s cubic-bezier(0.2, 0.8, 0.2, 1), opacity 0.16s ease, visibility 0.2s;
        box-shadow: 4px 0 18px rgba(0, 0, 0, 0.1);
      }
      .s1w-drawer.open {
        transform: translateX(0);
        opacity: 1;
        pointer-events: auto;
        visibility: visible;
      }
      .s1w-drawer-head {
        height: 48px;
        padding: 0 12px 0 14px;
        border-bottom: 1px solid var(--wc-border);
        display: flex;
        align-items: center;
        justify-content: space-between;
        font-weight: 600;
        font-size: 14px;
      }
      .s1w-drawer-body {
        flex: 1;
        overflow-y: auto;
        padding: 8px;
      }
      .s1w-drawer-cat {
        padding: 8px 8px 4px;
        font-size: 11px;
        font-weight: 600;
        color: var(--wc-text-3);
      }
      .s1w-drawer-board {
        width: 100%;
        border: none;
        background: transparent;
        color: var(--wc-text);
        border-radius: 7px;
        padding: 7px 10px;
        display: flex;
        align-items: center;
        justify-content: space-between;
        font-size: 13px;
        cursor: pointer;
        text-align: left;
      }
      .s1w-drawer-board:hover { background: var(--wc-hover); }
      .s1w-drawer-board.active {
        background: var(--wc-accent-soft);
        color: var(--wc-accent);
        font-weight: 600;
      }
      .s1w-drawer-count {
        font-size: 11px;
        color: var(--wc-text-3);
      }

      /* 2. Middle List Panel */
      .s1w-list-panel {
        width: var(--wc-list);
        flex: 0 0 var(--wc-list);
        background: var(--wc-list-bg);
        border-right: 1px solid var(--wc-list-border);
        display: flex;
        flex-direction: column;
        min-width: 220px;
        max-width: 460px;
        position: relative;
        z-index: 20;
      }
      .s1w-list-resizer {
        position: absolute;
        top: 0;
        right: -3px;
        bottom: 0;
        width: 6px;
        cursor: col-resize;
        z-index: 25;
      }
      .s1w-list-resizer:hover,
      .s1w-list-resizer.dragging {
        background: rgba(38, 126, 240, 0.35);
      }
      .s1w-search-bar {
        padding: 10px 10px 8px;
        display: flex;
        align-items: center;
        gap: 6px;
      }
      .s1w-search-form {
        flex: 1;
        display: flex;
        align-items: center;
        gap: 6px;
        height: 30px;
        padding: 0 8px;
        border-radius: 6px;
        background: var(--wc-composer-bg);
        border: 1px solid var(--wc-border);
        color: var(--wc-text-3);
      }
      .s1w-search-form:focus-within {
        border-color: var(--wc-accent);
      }
      .s1w-search-input {
        flex: 1;
        min-width: 0;
        border: none;
        outline: none;
        background: transparent;
        color: var(--wc-text);
        font-size: 12px;
      }
      .s1w-icon-btn {
        width: 28px;
        height: 28px;
        border: none;
        border-radius: 6px;
        background: transparent;
        color: var(--wc-text-2);
        display: inline-flex;
        align-items: center;
        justify-content: center;
        cursor: pointer;
        flex-shrink: 0;
        padding: 0;
      }
      .s1w-icon-btn:hover {
        background: var(--wc-hover);
        color: var(--wc-text);
      }
      .s1w-icon-btn.active {
        background: var(--wc-accent-soft);
        color: var(--wc-accent);
      }
      .s1w-new-thread-btn {
        width: 30px;
        height: 30px;
        border-radius: 6px;
        background: var(--wc-composer-bg);
        border: 1px solid var(--wc-border);
      }

      .s1w-list-subheader {
        padding: 2px 10px 6px;
        display: flex;
        align-items: center;
        justify-content: space-between;
        gap: 6px;
      }
      .s1w-list-board-name {
        font-size: 13px;
        font-weight: 700;
        color: var(--wc-text);
        white-space: nowrap;
        overflow: hidden;
        text-overflow: ellipsis;
      }
      .s1w-list-toggles {
        display: flex;
        align-items: center;
        gap: 2px;
      }
      .s1w-filter-row {
        padding: 0 10px 8px;
        display: flex;
        align-items: center;
        gap: 4px;
        flex-wrap: wrap;
        border-bottom: 1px solid var(--wc-list-border);
      }
      .s1w-chip {
        border: none;
        border-radius: 5px;
        height: 24px;
        padding: 0 8px;
        background: transparent;
        color: var(--wc-text-2);
        font-size: 12px;
        cursor: pointer;
      }
      .s1w-chip:hover { background: var(--wc-hover); }
      .s1w-chip.active {
        background: var(--wc-accent-soft);
        color: var(--wc-accent);
        font-weight: 600;
      }
      .s1w-type-select {
        margin-left: auto;
        height: 24px;
        max-width: 92px;
        border-radius: 5px;
        border: 1px solid var(--wc-border);
        background: var(--wc-composer-bg);
        color: var(--wc-text-2);
        font-size: 11px;
        padding: 0 4px;
      }

      .s1w-list-scroll {
        flex: 1;
        overflow-y: auto;
        padding: 6px;
      }
      .s1w-conv-item {
        position: relative;
        width: 100%;
        border: none;
        background: transparent;
        color: var(--wc-text);
        border-radius: 7px;
        padding: 9px 9px;
        margin-bottom: 2px;
        display: flex;
        align-items: flex-start;
        gap: 9px;
        cursor: pointer;
        text-align: left;
        transition: background 0.12s;
        user-select: none;
      }
      .s1w-conv-item:hover { background: var(--wc-hover); }
      .s1w-conv-item.is-pinned { background: var(--wc-pin-bg); }
      .s1w-conv-item.active {
        background: var(--wc-list-active);
        color: #fff;
      }
      .s1w-conv-item.active .s1w-conv-time,
      .s1w-conv-item.active .s1w-conv-preview,
      .s1w-conv-item.active .s1w-conv-meta-badge,
      .s1w-conv-item.active .s1w-conv-pin-tag {
        color: rgba(255, 255, 255, 0.85);
      }
      .s1w-conv-item.active .s1w-conv-type-tag {
        background: rgba(255, 255, 255, 0.22);
        color: #fff;
      }
      .s1w-conv-item.active .s1w-unread-badge {
        box-shadow: 0 0 0 1.5px var(--wc-list-active);
      }
      @keyframes s1w-float-pulse {
        0% { background: var(--wc-accent-soft); }
        100% { background: transparent; }
      }
      .s1w-conv-item.s1w-conv-float-up {
        animation: s1w-float-pulse 1.4s ease-out;
      }
      .s1w-conv-pin-tag {
        color: var(--wc-accent);
        display: inline-flex;
        align-items: center;
        flex-shrink: 0;
      }
      .s1w-conv-pin-btn {
        position: absolute;
        right: 6px;
        bottom: 6px;
        width: 22px;
        height: 22px;
        padding: 0;
        border: 1px solid var(--wc-border);
        border-radius: 5px;
        background: var(--wc-card-bg);
        color: var(--wc-text-3);
        display: flex;
        align-items: center;
        justify-content: center;
        cursor: pointer;
        opacity: 0;
        pointer-events: none;
        transition: opacity 0.12s, color 0.12s, border-color 0.12s;
      }
      .s1w-conv-item:hover .s1w-conv-pin-btn,
      .s1w-conv-pin-btn:focus-visible {
        opacity: 1;
        pointer-events: auto;
      }
      .s1w-conv-pin-btn.pinned,
      .s1w-conv-pin-btn:hover {
        color: var(--wc-accent);
        border-color: var(--wc-accent);
      }
      .s1w-conv-avatar {
        position: relative;
        width: 36px;
        height: 36px;
        flex: 0 0 36px;
      }
      .s1w-conv-avatar img,
      .s1w-avatar-fallback {
        width: 36px;
        height: 36px;
        border-radius: 6px;
        object-fit: cover;
        display: flex;
        align-items: center;
        justify-content: center;
        color: #fff;
        font-weight: 700;
        font-size: 14px;
      }
      .s1w-unread-badge {
        position: absolute;
        top: -4px;
        right: -5px;
        min-width: 16px;
        height: 16px;
        padding: 0 4px;
        border-radius: 999px;
        background: var(--wc-danger);
        color: #fff;
        font-size: 10px;
        font-weight: 700;
        line-height: 16px;
        text-align: center;
        box-shadow: 0 0 0 1.5px var(--wc-list-bg);
      }
      .s1w-conv-body {
        flex: 1;
        min-width: 0;
      }
      .s1w-conv-top {
        display: flex;
        align-items: center;
        justify-content: space-between;
        gap: 6px;
        margin-bottom: 3px;
      }
      .s1w-conv-title {
        flex: 1;
        min-width: 0;
        font-size: 13px;
        font-weight: 500;
        white-space: nowrap;
        overflow: hidden;
        text-overflow: ellipsis;
      }
      .s1w-conv-time {
        font-size: 11px;
        color: var(--wc-text-3);
        flex-shrink: 0;
      }
      .s1w-conv-bottom {
        display: flex;
        align-items: center;
        gap: 5px;
      }
      .s1w-conv-type-tag {
        font-size: 10px;
        padding: 1px 4px;
        border-radius: 4px;
        background: var(--wc-accent-soft);
        color: var(--wc-accent);
        flex-shrink: 0;
      }
      .s1w-conv-preview {
        flex: 1;
        min-width: 0;
        font-size: 12px;
        color: var(--wc-text-3);
        white-space: nowrap;
        overflow: hidden;
        text-overflow: ellipsis;
      }
      .s1w-conv-meta-badge {
        font-size: 11px;
        color: var(--wc-text-3);
        flex-shrink: 0;
      }
      .s1w-list-more-btn {
        width: 100%;
        margin: 6px 0 8px;
        height: 32px;
        border-radius: 6px;
        border: 1px solid var(--wc-border);
        background: var(--wc-composer-bg);
        color: var(--wc-text-2);
        font-size: 12px;
        cursor: pointer;
      }
      .s1w-list-more-btn:hover { background: var(--wc-hover); }

      /* 3. Right Chat Panel */
      .s1w-chat-panel {
        flex: 1;
        min-width: 0;
        display: flex;
        flex-direction: column;
        background: var(--wc-chat-bg);
        position: relative;
        overflow: hidden;
      }
      .s1w-chat-header {
        height: 54px;
        padding: 0 14px;
        border-bottom: 1px solid var(--wc-border);
        background: var(--wc-chat-bg);
        display: flex;
        align-items: center;
        justify-content: space-between;
        gap: 12px;
        flex-shrink: 0;
        z-index: 15;
      }
      .s1w-chat-head-main {
        flex: 1;
        min-width: 0;
      }
      .s1w-chat-title-row {
        display: flex;
        align-items: center;
        gap: 8px;
        min-width: 0;
      }
      .s1w-chat-title {
        font-size: 15px;
        font-weight: 700;
        color: var(--wc-text);
        white-space: nowrap;
        overflow: hidden;
        text-overflow: ellipsis;
        user-select: text;
        cursor: text;
      }
      .s1w-chat-count {
        font-size: 12px;
        color: var(--wc-text-3);
        flex-shrink: 0;
      }
      .s1w-chat-sub {
        font-size: 11px;
        color: var(--wc-text-3);
        display: flex;
        align-items: center;
        gap: 8px;
        margin-top: 1px;
      }
      .s1w-chat-tools {
        display: flex;
        align-items: center;
        gap: 4px;
        flex-shrink: 0;
        position: relative;
      }
      .s1w-tool-pill {
        height: 26px;
        padding: 0 9px;
        border-radius: 5px;
        border: 1px solid var(--wc-border);
        background: var(--wc-composer-bg);
        color: var(--wc-text-2);
        font-size: 12px;
        cursor: pointer;
        display: inline-flex;
        align-items: center;
        gap: 4px;
      }
      .s1w-tool-pill:hover { background: var(--wc-hover); color: var(--wc-text); }
      .s1w-tool-pill.active {
        border-color: var(--wc-accent);
        background: var(--wc-accent-soft);
        color: var(--wc-accent);
        font-weight: 600;
      }

      /* Dropdown menus */
      .s1w-popover-menu {
        position: absolute;
        min-width: 156px;
        background: var(--wc-card-bg);
        border: 1px solid var(--wc-border);
        border-radius: 8px;
        padding: 5px;
        box-shadow: 0 10px 28px rgba(0, 0, 0, 0.16);
        z-index: 60;
      }
      .s1w-menu-item {
        width: 100%;
        border: none;
        background: transparent;
        color: var(--wc-text);
        padding: 7px 10px;
        border-radius: 6px;
        font-size: 12px;
        display: flex;
        align-items: center;
        justify-content: space-between;
        gap: 8px;
        cursor: pointer;
        text-align: left;
      }
      .s1w-menu-item:hover { background: var(--wc-hover); }

      /* Chat Body + Watermark */
      .s1w-chat-body-wrap {
        flex: 1;
        min-height: 0;
        position: relative;
        display: flex;
        flex-direction: column;
      }
      .s1w-watermark {
        position: absolute;
        inset: 0;
        pointer-events: none;
        z-index: 1;
        opacity: 0.7;
        background-repeat: repeat;
      }
      .s1w-chat-scroll {
        flex: 1;
        overflow-y: auto;
        padding: 14px 18px 20px;
        position: relative;
        z-index: 2;
      }
      .s1w-empty-state {
        height: 100%;
        display: flex;
        flex-direction: column;
        align-items: center;
        justify-content: center;
        color: var(--wc-text-3);
        gap: 10px;
        text-align: center;
        padding: 24px;
      }
      .s1w-msg-row {
        display: flex;
        align-items: flex-start;
        gap: 10px;
        margin-bottom: 14px;
        position: relative;
        isolation: isolate;
        contain: layout style;
      }
      .s1w-msg-row.is-me {
        flex-direction: row-reverse;
      }
      .s1w-msg-row.hide-avatar .s1w-msg-avatar-btn {
        display: none;
      }
      .s1w-msg-avatar-btn {
        width: 34px;
        height: 34px;
        flex: 0 0 34px;
        border: none;
        padding: 0;
        border-radius: 6px;
        background: transparent;
        cursor: pointer;
        overflow: hidden;
      }
      .s1w-msg-avatar-btn img,
      .s1w-msg-avatar-btn .s1w-avatar-fallback {
        width: 34px;
        height: 34px;
        border-radius: 6px;
        object-fit: cover;
      }
      .s1w-msg-col {
        max-width: min(76%, 720px);
        min-width: 120px;
        display: flex;
        flex-direction: column;
        align-items: flex-start;
      }
      .s1w-msg-row.is-me .s1w-msg-col {
        align-items: flex-end;
      }
      .s1w-msg-meta {
        display: flex;
        align-items: center;
        gap: 6px;
        margin-bottom: 4px;
        font-size: 11px;
        color: var(--wc-text-3);
        flex-wrap: wrap;
      }
      .s1w-msg-row.is-me .s1w-msg-meta {
        flex-direction: row-reverse;
      }
      .s1w-msg-author {
        font-weight: 600;
        color: var(--wc-text-2);
        cursor: pointer;
      }
      .s1w-msg-author:hover { color: var(--wc-accent); }
      .s1w-badge-op {
        padding: 0 5px;
        border-radius: 4px;
        background: var(--wc-accent-soft);
        color: var(--wc-accent);
        font-weight: 600;
        font-size: 10px;
      }
      .s1w-user-tag-badge {
        padding: 0 5px;
        border-radius: 4px;
        background: rgba(245, 158, 11, 0.16);
        color: #D97706;
        font-size: 10px;
        font-weight: 600;
      }
      html.${ROOT_CLASS}.wecom-dark .s1w-user-tag-badge {
        color: #FBBF24;
      }
      .s1w-bubble-wrap {
        position: relative;
        display: flex;
        align-items: flex-end;
        gap: 6px;
      }
      .s1w-msg-row.is-me .s1w-bubble-wrap {
        flex-direction: row-reverse;
      }
      .s1w-bubble {
        background: var(--wc-bubble-other);
        color: var(--wc-bubble-other-text);
        border: 1px solid var(--wc-bubble-other-border);
        border-radius: 8px;
        padding: 9px 12px;
        font-size: 13.5px;
        line-height: 1.6;
        max-width: 100%;
        word-break: break-word;
        overflow-wrap: anywhere;
        isolation: isolate;
        contain: layout style;
      }
      .s1w-bubble.is-banned-recovered,
      .s1w-msg-row.is-me .s1w-bubble.is-banned-recovered {
        border: 1.5px dashed rgba(250, 81, 81, 0.72);
      }
      .s1w-edited-mark {
        font-size: 10.5px;
        color: var(--wc-text-3);
        cursor: help;
      }
      .s1w-edited-mark:hover {
        color: var(--wc-text-2);
      }
      .s1w-bubble-content {
        max-width: 100%;
        overflow-x: auto;
      }
      .s1w-table-wrap {
        max-width: 100%;
        overflow-x: auto;
        margin: 6px 0;
      }
      .s1w-bubble table {
        border-collapse: collapse;
        width: max-content;
        min-width: 100%;
        font-size: 12.5px;
      }
      .s1w-bubble th,
      .s1w-bubble td {
        border: 1px solid var(--wc-border);
        padding: 5px 8px;
        text-align: left;
        vertical-align: top;
      }
      .s1w-bubble th {
        background: var(--wc-surface-2);
        font-weight: 600;
      }
      .s1w-bubble hr {
        border: none;
        border-top: 1px solid var(--wc-border);
        margin: 8px 0;
      }
      .s1w-bubble ul,
      .s1w-bubble ol {
        margin: 4px 0;
        padding-left: 20px;
      }
      .s1w-spoiler-mask {
        display: inline;
        padding: 0 3px;
        border-radius: 3px;
        background: var(--wc-spoiler-bg);
        color: transparent !important;
        cursor: pointer;
        transition: color 0.14s, background 0.14s;
      }
      .s1w-spoiler-mask * {
        color: inherit !important;
      }
      .s1w-spoiler-mask:hover,
      .s1w-spoiler-mask.revealed {
        color: var(--wc-text) !important;
        background: rgba(127, 140, 160, 0.18);
      }
      .s1w-msg-row.is-me .s1w-spoiler-mask:hover,
      .s1w-msg-row.is-me .s1w-spoiler-mask.revealed {
        color: var(--wc-bubble-me-text) !important;
      }
      .s1w-spoiler-mask::selection,
      .s1w-spoiler-mask *::selection {
        background: var(--wc-accent);
        color: #fff !important;
      }
      .s1w-msg-row.is-me .s1w-bubble {
        background: var(--wc-bubble-me);
        color: var(--wc-bubble-me-text);
        border-color: transparent;
      }
      .s1w-quote-card {
        margin-bottom: 8px;
        padding: 6px 9px;
        border-left: 3px solid var(--wc-accent);
        border-radius: 4px;
        background: rgba(127, 140, 160, 0.1);
        font-size: 12px;
        color: var(--wc-text-2);
        cursor: pointer;
      }
      .s1w-quote-card:hover { background: rgba(38, 126, 240, 0.12); }
      .s1w-quote-head {
        font-weight: 600;
        margin-bottom: 2px;
        font-size: 11px;
      }
      .s1w-bubble img.s1-smiley {
        display: inline-block;
        vertical-align: middle;
        max-height: 36px;
        margin: 0 1px;
      }
      .s1w-bubble img.s1-content-img {
        display: block;
        max-width: 320px;
        max-height: 320px;
        border-radius: 6px;
        margin: 6px 0;
        cursor: zoom-in;
        object-fit: contain;
      }
      .s1w-img-placeholder {
        display: inline-flex;
        align-items: center;
        gap: 5px;
        height: 26px;
        padding: 0 10px;
        margin: 4px 4px 4px 0;
        border-radius: 6px;
        border: 1px solid var(--wc-border);
        background: var(--wc-surface-2);
        color: var(--wc-text-2);
        font-size: 12px;
        cursor: pointer;
      }
      .s1w-img-placeholder:hover {
        border-color: var(--wc-accent);
        color: var(--wc-accent);
      }
      .s1w-page-divider {
        display: flex;
        align-items: center;
        gap: 10px;
        margin: 14px 0;
        color: var(--wc-text-3);
        font-size: 11px;
      }
      .s1w-page-divider::before,
      .s1w-page-divider::after {
        content: "";
        flex: 1;
        height: 1px;
        background: var(--wc-border);
      }
      .s1w-append-status {
        text-align: center;
        padding: 8px 0 4px;
        font-size: 12px;
        color: var(--wc-text-3);
      }
      .s1w-prev-hint {
        padding: 4px 0 12px;
        cursor: pointer;
      }
      .s1w-prev-hint:hover {
        color: var(--wc-accent);
      }
      /* Poll Card inside Topic Bubble */
      .s1w-poll-card {
        margin-top: 10px;
        padding: 10px 12px;
        border-radius: 8px;
        border: 1px solid var(--wc-border);
        background: var(--wc-surface-2);
        min-width: min(300px, 100%);
        max-width: 520px;
      }
      .s1w-poll-head {
        display: flex;
        align-items: center;
        gap: 8px;
        margin-bottom: 8px;
        flex-wrap: wrap;
      }
      .s1w-poll-badge {
        padding: 1px 6px;
        border-radius: 4px;
        background: var(--wc-accent-soft);
        color: var(--wc-accent);
        font-size: 11px;
        font-weight: 600;
      }
      .s1w-poll-meta {
        font-size: 11.5px;
        color: var(--wc-text-2);
      }
      .s1w-poll-list {
        display: flex;
        flex-direction: column;
        gap: 6px;
      }
      .s1w-poll-opt {
        display: flex;
        flex-direction: column;
        gap: 4px;
        padding: 6px 8px;
        border-radius: 6px;
        background: var(--wc-card-bg);
        border: 1px solid var(--wc-border);
      }
      .s1w-poll-opt.is-votable {
        cursor: pointer;
      }
      .s1w-poll-opt.is-votable:hover {
        border-color: var(--wc-accent);
      }
      .s1w-poll-opt-row {
        display: flex;
        align-items: center;
        gap: 8px;
        font-size: 12.5px;
        color: var(--wc-text);
      }
      .s1w-poll-input {
        margin: 0;
        flex-shrink: 0;
        accent-color: var(--wc-accent);
        cursor: pointer;
      }
      .s1w-poll-opt-img {
        max-width: 44px !important;
        max-height: 44px !important;
        margin: 0 !important;
        border-radius: 4px;
        flex-shrink: 0;
      }
      .s1w-poll-opt-text {
        flex: 1;
        min-width: 0;
        word-break: break-word;
      }
      .s1w-poll-votes {
        font-size: 11px;
        color: var(--wc-text-2);
        white-space: nowrap;
        flex-shrink: 0;
      }
      .s1w-poll-bar-track {
        width: 100%;
        height: 5px;
        border-radius: 999px;
        background: var(--wc-surface-2);
        overflow: hidden;
      }
      .s1w-poll-bar-fill {
        height: 100%;
        border-radius: 999px;
        background: var(--wc-accent);
        transition: width 0.25s ease;
      }
      .s1w-poll-foot {
        margin-top: 9px;
        display: flex;
        align-items: center;
        gap: 10px;
        flex-wrap: wrap;
      }
      .s1w-poll-submit {
        height: 28px;
        padding: 0 12px;
        font-size: 12px;
      }
      .s1w-poll-status {
        font-size: 11.5px;
        color: var(--wc-text-3);
      }
      .s1w-bubble a {
        color: var(--wc-accent);
        text-decoration: underline;
      }
      .s1w-msg-row.is-me .s1w-bubble a {
        color: inherit;
      }
      .s1w-bubble blockquote, .s1w-bubble pre {
        margin: 6px 0;
        padding: 6px 8px;
        border-radius: 5px;
        background: rgba(127, 140, 160, 0.12);
        overflow-x: auto;
        font-size: 12px;
      }
      .s1w-ratelog {
        margin-top: 7px;
        padding-top: 6px;
        border-top: 1px dashed var(--wc-border);
        font-size: 11.5px;
        color: var(--wc-text-2);
        display: flex;
        flex-wrap: wrap;
        gap: 6px;
        align-items: center;
      }
      .s1w-ratelog-pill {
        padding: 1px 6px;
        border-radius: 4px;
        background: var(--wc-accent-soft);
        color: var(--wc-accent);
        font-weight: 600;
      }
      .s1w-msg-actions {
        opacity: 0;
        display: flex;
        align-items: center;
        gap: 2px;
        transition: opacity 0.12s;
        flex-shrink: 0;
      }
      .s1w-msg-row:hover .s1w-msg-actions,
      .s1w-msg-actions:focus-within {
        opacity: 1;
      }
      .s1w-msg-highlight .s1w-bubble {
        box-shadow: 0 0 0 2px var(--wc-accent);
      }
      .s1w-recovered-badge {
        padding: 0 5px;
        border-radius: 4px;
        background: rgba(24, 160, 88, 0.16);
        color: var(--wc-success);
        font-size: 10px;
        font-weight: 600;
      }
      .s1w-blocked-cta {
        height: 24px;
        padding: 0 10px;
        border-radius: 5px;
        border: 1px solid var(--wc-accent);
        background: transparent;
        color: var(--wc-accent);
        font-size: 11.5px;
        cursor: pointer;
      }
      .s1w-blocked-cta:hover {
        background: var(--wc-accent-soft);
      }

      /* Docked Records Search Panel (查找聊天记录) */
      #${ROOT_ID} .s1w-records-panel {
        width: 360px;
        flex: 0 0 360px;
        min-width: 320px;
        max-width: 44vw;
        height: 100%;
        background: var(--wc-card-bg);
        border-left: 1px solid var(--wc-border);
        display: flex;
        flex-direction: column;
        overflow: hidden;
        z-index: 22;
      }
      #${ROOT_ID} .s1w-records-head {
        height: 46px;
        padding: 0 12px 0 16px;
        display: flex;
        align-items: center;
        justify-content: space-between;
        font-size: 14px;
        font-weight: 700;
        color: var(--wc-text);
        flex-shrink: 0;
      }
      #${ROOT_ID} .s1w-records-tabs {
        display: flex;
        align-items: center;
        gap: 18px;
        padding: 0 16px;
        border-bottom: 1px solid var(--wc-border);
        flex-shrink: 0;
      }
      #${ROOT_ID} .s1w-records-tab {
        position: relative;
        appearance: none;
        -webkit-appearance: none;
        border: none;
        outline: none;
        box-shadow: none;
        margin: 0;
        font-family: inherit;
        background: transparent;
        color: var(--wc-text-2);
        padding: 7px 2px 9px;
        font-size: 13px;
        line-height: 1.3;
        cursor: pointer;
      }
      #${ROOT_ID} .s1w-records-tab.active {
        color: var(--wc-accent);
        font-weight: 600;
      }
      #${ROOT_ID} .s1w-records-tab.active::after {
        content: "";
        position: absolute;
        left: 0;
        right: 0;
        bottom: 0;
        height: 2px;
        border-radius: 2px;
        background: var(--wc-accent);
      }
      #${ROOT_ID} .s1w-records-controls {
        padding: 10px 14px;
        border-bottom: 1px solid var(--wc-border);
        display: flex;
        flex-direction: column;
        gap: 8px;
        flex-shrink: 0;
      }
      #${ROOT_ID} .s1w-records-search-box {
        display: flex;
        align-items: center;
        gap: 6px;
        height: 30px;
        padding: 0 9px;
        border-radius: 6px;
        border: 1px solid var(--wc-accent);
        background: var(--wc-composer-bg);
        color: var(--wc-text-3);
      }
      #${ROOT_ID} .s1w-records-search-box svg {
        width: 14px;
        height: 14px;
        flex-shrink: 0;
      }
      #${ROOT_ID} .s1w-records-search-input {
        appearance: none;
        -webkit-appearance: none;
        flex: 1;
        min-width: 0;
        border: none;
        outline: none;
        box-shadow: none;
        margin: 0;
        padding: 0;
        background: transparent;
        color: var(--wc-text);
        font-family: inherit;
        font-size: 12.5px;
      }
      #${ROOT_ID} .s1w-records-filters {
        display: flex;
        align-items: center;
        gap: 6px;
        width: 100%;
      }
      #${ROOT_ID} .s1w-records-select {
        flex: 1;
        min-width: 0;
        height: 28px;
        margin: 0;
        border-radius: 5px;
        border: 1px solid var(--wc-border);
        background: var(--wc-surface-2);
        color: var(--wc-text-2);
        font-family: inherit;
        font-size: 11.5px;
        padding: 0 6px;
        cursor: pointer;
      }
      #${ROOT_ID} .s1w-records-jump-bar {
        display: flex;
        align-items: center;
        gap: 6px 10px;
        flex-wrap: wrap;
        font-size: 11.5px;
        color: var(--wc-text-2);
      }
      #${ROOT_ID} .s1w-records-jump-group {
        display: inline-flex;
        align-items: center;
        gap: 5px;
        flex-wrap: nowrap;
      }
      #${ROOT_ID} .s1w-records-num {
        width: 46px;
        height: 24px;
        padding: 0 4px;
        margin: 0;
        border-radius: 5px;
        border: 1px solid var(--wc-border);
        background: var(--wc-composer-bg);
        color: var(--wc-text);
        text-align: center;
        font-family: inherit;
        font-size: 12px;
      }
      #${ROOT_ID} .s1w-records-mini-btn {
        appearance: none;
        -webkit-appearance: none;
        height: 24px;
        padding: 0 8px;
        margin: 0;
        border-radius: 5px;
        border: 1px solid var(--wc-border);
        background: var(--wc-composer-bg);
        color: var(--wc-text);
        font-family: inherit;
        font-size: 11.5px;
        white-space: nowrap;
        flex-shrink: 0;
        cursor: pointer;
      }
      #${ROOT_ID} .s1w-records-mini-btn:hover {
        border-color: var(--wc-accent);
        color: var(--wc-accent);
      }
      #${ROOT_ID} .s1w-records-body {
        flex: 1;
        min-height: 0;
        overflow-y: auto;
        overflow-x: hidden;
        padding: 8px 12px 14px;
        display: flex;
        flex-direction: column;
        gap: 2px;
      }
      #${ROOT_ID} .s1w-rec-date-sep {
        display: flex;
        align-items: center;
        gap: 8px;
        flex-shrink: 0;
        text-align: center;
        font-size: 11px;
        color: var(--wc-text-3);
        margin: 8px 0 4px;
      }
      #${ROOT_ID} .s1w-rec-date-sep::before,
      #${ROOT_ID} .s1w-rec-date-sep::after {
        content: "";
        flex: 1;
        height: 1px;
        background: var(--wc-border);
      }
      #${ROOT_ID} .s1w-rec-item {
        appearance: none;
        -webkit-appearance: none;
        display: flex;
        align-items: flex-start;
        gap: 10px;
        width: 100%;
        flex-shrink: 0;
        border: none;
        outline: none;
        box-shadow: none;
        margin: 0;
        font-family: inherit;
        background: transparent;
        color: var(--wc-text);
        border-radius: 7px;
        padding: 8px;
        text-align: left;
        cursor: pointer;
      }
      #${ROOT_ID} .s1w-rec-item:hover { background: var(--wc-hover); }
      #${ROOT_ID} .s1w-rec-item-avatar {
        width: 32px;
        height: 32px;
        flex: 0 0 32px;
        border-radius: 6px;
        overflow: hidden;
      }
      #${ROOT_ID} .s1w-rec-item-avatar img,
      #${ROOT_ID} .s1w-rec-item-avatar .s1w-avatar-fallback {
        width: 32px !important;
        height: 32px !important;
        max-width: 32px;
        max-height: 32px;
        border-radius: 6px;
        object-fit: cover;
        display: flex;
        align-items: center;
        justify-content: center;
        font-size: 12px;
      }
      #${ROOT_ID} .s1w-rec-item-main {
        flex: 1;
        min-width: 0;
      }
      #${ROOT_ID} .s1w-rec-item-head {
        display: flex;
        align-items: center;
        justify-content: space-between;
        gap: 6px;
        font-size: 11.5px;
        color: var(--wc-text-3);
        margin-bottom: 3px;
      }
      #${ROOT_ID} .s1w-rec-item-author {
        color: var(--wc-text-2);
        font-weight: 600;
        overflow: hidden;
        text-overflow: ellipsis;
        white-space: nowrap;
      }
      #${ROOT_ID} .s1w-rec-item-meta {
        flex-shrink: 0;
        white-space: nowrap;
      }
      #${ROOT_ID} .s1w-rec-item-text {
        font-size: 12.5px;
        color: var(--wc-text);
        line-height: 1.45;
        display: -webkit-box;
        -webkit-line-clamp: 2;
        -webkit-box-orient: vertical;
        overflow: hidden;
        word-break: break-word;
      }
      #${ROOT_ID} .s1w-rec-img-grid {
        display: grid;
        grid-template-columns: repeat(3, 1fr);
        gap: 6px;
        padding-top: 6px;
      }
      #${ROOT_ID} .s1w-rec-img-card {
        position: relative;
        aspect-ratio: 1 / 1;
        border-radius: 6px;
        overflow: hidden;
        border: 1px solid var(--wc-border);
        background: var(--wc-surface-2);
        cursor: pointer;
      }
      #${ROOT_ID} .s1w-rec-img-card img {
        width: 100%;
        height: 100%;
        object-fit: cover;
        display: block;
      }
      #${ROOT_ID} .s1w-rec-img-floor {
        position: absolute;
        right: 4px;
        bottom: 4px;
        padding: 1px 5px;
        border-radius: 4px;
        background: rgba(0, 0, 0, 0.65);
        color: #fff;
        font-size: 10px;
        border: none;
        cursor: pointer;
      }
      #${ROOT_ID} .s1w-rec-link-row {
        padding: 8px 6px;
        border-bottom: 1px solid var(--wc-border);
        display: flex;
        flex-direction: column;
        gap: 3px;
        flex-shrink: 0;
      }
      #${ROOT_ID} .s1w-rec-link-url {
        font-size: 12.5px;
        color: var(--wc-accent);
        text-decoration: none;
        word-break: break-all;
      }
      #${ROOT_ID} .s1w-rec-link-url:hover { text-decoration: underline; }

      /* New reply floating pill (↓ N 条新消息) */
      .s1w-new-msg-pill {
        position: absolute;
        right: 18px;
        bottom: 92px;
        z-index: 14;
        height: 30px;
        padding: 0 13px;
        border-radius: 999px;
        border: 1px solid var(--wc-border);
        background: var(--wc-card-bg);
        color: var(--wc-accent);
        font-size: 12px;
        font-weight: 600;
        display: inline-flex;
        align-items: center;
        gap: 4px;
        cursor: pointer;
        box-shadow: 0 4px 14px rgba(0, 0, 0, 0.14);
      }
      .s1w-new-msg-pill:hover {
        background: var(--wc-accent);
        border-color: var(--wc-accent);
        color: #fff;
      }

      /* Floating scroll buttons */
      .s1w-float-nav {
        position: absolute;
        right: 16px;
        bottom: 14px;
        display: flex;
        flex-direction: column;
        gap: 6px;
        z-index: 12;
      }
      .s1w-float-btn {
        width: 32px;
        height: 32px;
        border-radius: 50%;
        border: 1px solid var(--wc-border);
        background: var(--wc-card-bg);
        color: var(--wc-text-2);
        display: flex;
        align-items: center;
        justify-content: center;
        cursor: pointer;
        box-shadow: 0 3px 10px rgba(0, 0, 0, 0.12);
      }
      .s1w-float-btn:hover { color: var(--wc-accent); }

      /* Composer */
      .s1w-composer {
        border-top: 1px solid var(--wc-border);
        background: var(--wc-composer-bg);
        padding: 6px 14px 10px;
        display: flex;
        flex-direction: column;
        gap: 6px;
        z-index: 15;
        position: relative;
      }
      .s1w-attach-bar {
        display: flex;
        align-items: center;
        flex-wrap: wrap;
        gap: 6px;
        padding: 2px 0;
      }
      .s1w-attach-chip {
        display: inline-flex;
        align-items: center;
        gap: 5px;
        height: 24px;
        padding: 0 8px;
        border-radius: 5px;
        border: 1px solid var(--wc-border);
        background: var(--wc-surface-2);
        color: var(--wc-text-2);
        font-size: 11.5px;
        max-width: 240px;
      }
      .s1w-attach-name {
        overflow: hidden;
        text-overflow: ellipsis;
        white-space: nowrap;
      }
      .s1w-attach-chip button {
        border: none;
        background: transparent;
        color: var(--wc-accent);
        font-size: 11px;
        padding: 0 2px;
        cursor: pointer;
        flex-shrink: 0;
      }
      .s1w-attach-chip button[data-remove-aid] {
        color: var(--wc-text-3);
      }
      .s1w-reply-preview {
        display: none;
        align-items: center;
        justify-content: space-between;
        gap: 8px;
        padding: 5px 9px;
        border-radius: 6px;
        background: var(--wc-surface-2);
        font-size: 12px;
        color: var(--wc-text-2);
      }
      .s1w-reply-preview.visible { display: flex; }
      .s1w-composer-toolbar {
        display: flex;
        align-items: center;
        gap: 4px;
      }
      .s1w-textarea {
        width: 100%;
        min-height: 64px;
        max-height: 180px;
        resize: vertical;
        border: none;
        outline: none;
        background: transparent;
        color: var(--wc-text);
        font-family: inherit;
        font-size: 13.5px;
        line-height: 1.5;
      }
      .s1w-bbcode-preview {
        width: 100%;
        min-height: 64px;
        max-height: 180px;
        overflow-y: auto;
        padding: 6px 10px;
        border-radius: 6px;
        border: 1px dashed var(--wc-border-strong);
        background: var(--wc-surface-2);
        color: var(--wc-text);
        font-size: 13.5px;
        line-height: 1.6;
        word-break: break-word;
        overflow-wrap: anywhere;
      }
      .s1w-bbcode-preview img.s1-smiley {
        max-height: 28px;
        vertical-align: -5px;
        margin: 0 2px;
      }
      .s1w-bbcode-preview img.s1-content-img {
        display: block;
        max-width: min(260px, 100%);
        max-height: 140px;
        margin: 5px 0;
        border-radius: 6px;
      }
      .s1w-bbcode-preview blockquote,
      .s1w-bbcode-preview pre.s1w-preview-code {
        margin: 5px 0;
        padding: 6px 8px;
        border-radius: 5px;
        background: rgba(127, 140, 160, 0.14);
        font-size: 12px;
        overflow-x: auto;
      }
      .s1w-bbcode-preview a {
        color: var(--wc-accent);
        text-decoration: underline;
      }
      .s1w-bbcode-preview hr {
        border: none;
        border-top: 1px solid var(--wc-border);
        margin: 6px 0;
      }
      .s1w-preview-empty {
        color: var(--wc-text-3);
        font-size: 12.5px;
      }
      .s1w-preview-attach {
        display: inline-block;
        padding: 1px 7px;
        border-radius: 4px;
        background: var(--wc-accent-soft);
        color: var(--wc-accent);
        font-size: 12px;
      }
      .s1w-composer-bottom {
        display: flex;
        align-items: center;
        justify-content: space-between;
        gap: 8px;
      }
      .s1w-composer-status {
        font-size: 11px;
        color: var(--wc-text-3);
        display: inline-flex;
        align-items: center;
      }
      .s1w-composer-account-btn {
        border: none;
        border-radius: 5px;
        background: transparent;
        color: var(--wc-text-2);
        padding: 2px 6px;
        margin-left: -6px;
        font-family: inherit;
        font-size: 11.5px;
        display: inline-flex;
        align-items: center;
        gap: 4px;
        cursor: pointer;
      }
      .s1w-composer-account-btn:hover {
        background: var(--wc-hover);
        color: var(--wc-accent);
      }
      .s1w-composer-account-popover {
        position: absolute;
        left: 14px;
        bottom: 42px;
        width: 228px;
        max-height: 260px;
        overflow-y: auto;
        background: var(--wc-card-bg);
        color: var(--wc-text);
        border: 1px solid var(--wc-border);
        border-radius: 10px;
        box-shadow: 0 10px 28px rgba(0, 0, 0, 0.18);
        padding: 8px 0 6px;
        z-index: 72;
        font-size: 12.5px;
      }
      .s1w-send-btn {
        height: 30px;
        padding: 0 18px;
        border: none;
        border-radius: 6px;
        background: var(--wc-accent);
        color: #fff;
        font-size: 13px;
        font-weight: 600;
        cursor: pointer;
      }
      .s1w-send-btn:hover { background: var(--wc-accent-hover); }
      .s1w-send-btn:disabled { opacity: 0.5; cursor: not-allowed; }

      /* Smiley Picker */
      .s1w-smiley-popover {
        position: absolute;
        left: 14px;
        bottom: calc(100% + 6px);
        width: min(410px, calc(100vw - 90px));
        height: 300px;
        background: var(--wc-card-bg);
        border: 1px solid var(--wc-border);
        border-radius: 10px;
        box-shadow: 0 12px 32px rgba(0, 0, 0, 0.2);
        display: flex;
        flex-direction: column;
        z-index: 70;
        overflow: hidden;
      }
      .s1w-smiley-tabs {
        display: flex;
        gap: 2px;
        padding: 6px 8px;
        border-bottom: 1px solid var(--wc-border);
        overflow-x: auto;
        flex-shrink: 0;
      }
      .s1w-smiley-tab {
        border: none;
        border-radius: 5px;
        padding: 4px 8px;
        background: transparent;
        color: var(--wc-text-2);
        font-size: 11.5px;
        cursor: pointer;
        white-space: nowrap;
      }
      .s1w-smiley-tab.active {
        background: var(--wc-accent-soft);
        color: var(--wc-accent);
        font-weight: 600;
      }
      .s1w-smiley-grid {
        flex: 1;
        overflow-y: auto;
        padding: 8px;
        display: grid;
        grid-template-columns: repeat(auto-fill, minmax(38px, 1fr));
        gap: 4px;
        align-content: start;
      }
      .s1w-smiley-cell {
        height: 38px;
        border: none;
        border-radius: 6px;
        background: transparent;
        display: flex;
        align-items: center;
        justify-content: center;
        cursor: pointer;
        padding: 2px;
      }
      .s1w-smiley-cell:hover { background: var(--wc-hover); }
      .s1w-smiley-cell img {
        max-width: 30px;
        max-height: 30px;
      }

      /* WeCom-Native Self Popover & User Contact Card Popover */
      .s1w-self-popover {
        position: fixed;
        left: 62px;
        top: 10px;
        width: 268px;
        max-height: calc(100vh - 24px);
        overflow-y: auto;
        background: var(--wc-card-bg);
        color: var(--wc-text);
        border: 1px solid var(--wc-border);
        border-radius: 10px;
        box-shadow: 0 12px 34px rgba(0, 0, 0, 0.18);
        z-index: 2147483220;
        padding: 14px 0 6px;
        font-size: 13px;
      }
      .s1w-self-accounts {
        padding: 4px 10px 6px;
        display: flex;
        flex-direction: column;
        gap: 4px;
      }
      .s1w-self-sec-title {
        padding: 0 6px 2px;
        font-size: 11px;
        color: var(--wc-text-3);
        font-weight: 600;
      }
      .s1w-account-row {
        display: flex;
        align-items: center;
        gap: 4px;
        border-radius: 6px;
        padding-right: 4px;
      }
      .s1w-account-row:hover { background: var(--wc-hover); }
      .s1w-account-row.current { background: var(--wc-accent-soft); }
      .s1w-account-switch {
        flex: 1;
        min-width: 0;
        border: none;
        background: transparent;
        color: var(--wc-text);
        padding: 5px 6px;
        display: flex;
        align-items: center;
        gap: 8px;
        cursor: pointer;
        text-align: left;
        font-size: 12.5px;
      }
      .s1w-account-switch img,
      .s1w-account-switch .s1w-avatar-fallback {
        width: 24px;
        height: 24px;
        border-radius: 5px;
        font-size: 11px;
        flex-shrink: 0;
        object-fit: cover;
      }
      .s1w-account-name {
        flex: 1;
        min-width: 0;
        overflow: hidden;
        text-overflow: ellipsis;
        white-space: nowrap;
        font-weight: 500;
      }
      .s1w-account-tag {
        font-size: 10.5px;
        color: var(--wc-accent);
        font-weight: 600;
        flex-shrink: 0;
      }
      .s1w-account-remove {
        border: none;
        background: transparent;
        color: var(--wc-text-3);
        width: 22px;
        height: 22px;
        border-radius: 4px;
        cursor: pointer;
        font-size: 13px;
        line-height: 1;
        flex-shrink: 0;
      }
      .s1w-account-remove:hover {
        color: var(--wc-danger);
        background: var(--wc-hover);
      }
      .s1w-self-head {
        display: flex;
        align-items: center;
        gap: 11px;
        padding: 0 16px 10px;
      }
      .s1w-self-head img,
      .s1w-self-head .s1w-avatar-fallback {
        width: 46px;
        height: 46px;
        border-radius: 8px;
        object-fit: cover;
        flex-shrink: 0;
      }
      .s1w-self-name {
        font-size: 15px;
        font-weight: 700;
        color: var(--wc-text);
        line-height: 1.3;
      }
      .s1w-self-org {
        margin-top: 2px;
        font-size: 12px;
        color: var(--wc-text-3);
        display: flex;
        align-items: center;
        gap: 4px;
      }
      .s1w-self-status-pill {
        margin: 0 14px 10px;
        padding: 7px 10px;
        border-radius: 6px;
        background: var(--wc-surface-2);
        color: var(--wc-text-2);
        font-size: 12px;
        white-space: nowrap;
        overflow: hidden;
        text-overflow: ellipsis;
      }
      .s1w-pop-divider {
        height: 1px;
        background: var(--wc-border);
        margin: 4px 0;
      }
      .s1w-pop-item {
        width: 100%;
        border: none;
        background: transparent;
        color: var(--wc-text);
        padding: 8px 16px;
        display: flex;
        align-items: center;
        justify-content: space-between;
        gap: 10px;
        font-size: 13px;
        cursor: pointer;
        text-decoration: none;
        text-align: left;
      }
      .s1w-pop-item:hover {
        background: var(--wc-hover);
        color: var(--wc-text);
      }
      .s1w-pop-item-left {
        display: flex;
        align-items: center;
        gap: 9px;
        min-width: 0;
      }
      .s1w-pop-item-sub {
        font-size: 12px;
        color: var(--wc-text-3);
        flex-shrink: 0;
      }
      .s1w-pop-badge {
        padding: 0 6px;
        height: 17px;
        line-height: 17px;
        border-radius: 999px;
        background: var(--wc-danger);
        color: #fff;
        font-size: 11px;
        font-weight: 600;
      }

      .s1w-usercard-popover {
        position: fixed;
        width: 304px;
        background: var(--wc-card-bg);
        color: var(--wc-text);
        border: 1px solid var(--wc-border);
        border-radius: 10px;
        box-shadow: 0 14px 38px rgba(0, 0, 0, 0.22);
        z-index: 2147483220;
        padding: 16px;
        font-size: 13px;
        overflow: hidden;
      }
      .s1w-uc-wm {
        position: absolute;
        inset: 0;
        pointer-events: none;
        opacity: 0.45;
        background-repeat: repeat;
      }
      .s1w-uc-inner {
        position: relative;
        z-index: 1;
      }
      .s1w-uc-head {
        display: flex;
        align-items: center;
        gap: 12px;
        padding-bottom: 12px;
      }
      .s1w-uc-head img,
      .s1w-uc-head .s1w-avatar-fallback {
        width: 54px;
        height: 54px;
        border-radius: 8px;
        object-fit: cover;
        flex-shrink: 0;
      }
      .s1w-uc-title-row {
        display: flex;
        align-items: center;
        gap: 6px;
        flex-wrap: wrap;
      }
      .s1w-uc-name {
        font-size: 16px;
        font-weight: 700;
        color: var(--wc-text);
      }
      .s1w-uc-sub {
        margin-top: 3px;
        font-size: 12px;
        color: var(--wc-text-3);
      }
      .s1w-uc-quick-row {
        display: grid;
        grid-template-columns: 1fr 1fr;
        gap: 6px;
        padding: 8px 0;
      }
      .s1w-uc-quick-btn {
        border: none;
        background: transparent;
        color: var(--wc-text);
        border-radius: 6px;
        padding: 6px 8px;
        font-size: 12.5px;
        display: inline-flex;
        align-items: center;
        justify-content: center;
        gap: 6px;
        cursor: pointer;
        text-decoration: none;
      }
      .s1w-uc-quick-btn:hover {
        background: var(--wc-hover);
        color: var(--wc-accent);
      }
      .s1w-uc-tag-toggle {
        width: 100%;
        border: none;
        background: transparent;
        color: var(--wc-text);
        padding: 9px 2px;
        display: flex;
        align-items: center;
        justify-content: space-between;
        gap: 8px;
        font-size: 13px;
        cursor: pointer;
      }
      .s1w-uc-tag-toggle:hover {
        color: var(--wc-accent);
      }
      .s1w-uc-tag-editor {
        padding: 8px 0 6px;
        display: flex;
        flex-direction: column;
        gap: 6px;
      }
      .s1w-uc-kv-list {
        padding: 8px 0 12px;
        display: flex;
        flex-direction: column;
        gap: 7px;
        font-size: 12.5px;
      }
      .s1w-uc-kv-row {
        display: flex;
        align-items: baseline;
        gap: 12px;
      }
      .s1w-uc-kv-label {
        width: 54px;
        flex-shrink: 0;
        color: var(--wc-text-3);
      }
      .s1w-uc-kv-val {
        flex: 1;
        min-width: 0;
        color: var(--wc-text);
        display: flex;
        align-items: center;
        gap: 5px;
        word-break: break-word;
      }
      .s1w-uc-footer {
        display: flex;
        align-items: center;
        gap: 8px;
        padding-top: 4px;
      }
      .s1w-uc-footer > * {
        flex: 1;
        text-align: center;
        display: inline-flex;
        align-items: center;
        justify-content: center;
        text-decoration: none;
      }

      /* Modals */
      .s1w-modal-backdrop {
        position: fixed;
        inset: 0;
        background: rgba(0, 0, 0, 0.45);
        display: flex;
        align-items: center;
        justify-content: center;
        z-index: 2147483200;
        padding: 16px;
      }
      .s1w-modal {
        width: min(460px, 100%);
        max-height: 85vh;
        background: var(--wc-card-bg);
        color: var(--wc-text);
        border: 1px solid var(--wc-border);
        border-radius: 10px;
        box-shadow: 0 18px 46px rgba(0, 0, 0, 0.25);
        display: flex;
        flex-direction: column;
        overflow: hidden;
      }
      .s1w-modal-head {
        padding: 12px 16px;
        border-bottom: 1px solid var(--wc-border);
        display: flex;
        align-items: center;
        justify-content: space-between;
        font-weight: 700;
        font-size: 14px;
      }
      .s1w-modal-body {
        padding: 14px 16px;
        overflow-y: auto;
        display: flex;
        flex-direction: column;
        gap: 10px;
      }
      .s1w-modal-foot {
        padding: 10px 16px;
        border-top: 1px solid var(--wc-border);
        display: flex;
        justify-content: flex-end;
        gap: 8px;
      }
      .s1w-field-label {
        font-size: 12px;
        font-weight: 600;
        color: var(--wc-text-2);
        margin-bottom: 4px;
        display: block;
      }
      .s1w-input, .s1w-select, .s1w-modal-textarea {
        width: 100%;
        border: 1px solid var(--wc-border);
        border-radius: 6px;
        background: var(--wc-composer-bg);
        color: var(--wc-text);
        padding: 7px 10px;
        font-family: inherit;
        font-size: 13px;
      }
      .s1w-btn-primary {
        height: 32px;
        padding: 0 14px;
        border: none;
        border-radius: 6px;
        background: var(--wc-accent);
        color: #fff;
        font-size: 12.5px;
        font-weight: 600;
        cursor: pointer;
      }
      .s1w-btn-secondary {
        height: 32px;
        padding: 0 14px;
        border: 1px solid var(--wc-border);
        border-radius: 6px;
        background: var(--wc-composer-bg);
        color: var(--wc-text);
        font-size: 12.5px;
        cursor: pointer;
      }

      /* Profile Grid */
      .s1w-profile-top {
        display: flex;
        align-items: center;
        gap: 12px;
      }
      .s1w-profile-top img {
        width: 52px;
        height: 52px;
        border-radius: 10px;
        object-fit: cover;
      }
      .s1w-stat-grid {
        display: grid;
        grid-template-columns: repeat(3, 1fr);
        gap: 8px;
      }
      .s1w-stat-box {
        padding: 8px;
        border-radius: 7px;
        background: var(--wc-surface-2);
        text-align: center;
      }
      .s1w-stat-val { font-size: 14px; font-weight: 700; }
      .s1w-stat-lbl { font-size: 11px; color: var(--wc-text-3); margin-top: 2px; }

      /* Image Lightbox */
      .s1w-lightbox {
        position: fixed;
        inset: 0;
        background: rgba(0, 0, 0, 0.85);
        z-index: 2147483300;
        display: flex;
        align-items: center;
        justify-content: center;
        overflow: hidden;
        user-select: none;
      }
      .s1w-lightbox img {
        max-width: 90vw;
        max-height: 86vh;
        transition: transform 0.08s ease-out;
        cursor: grab;
      }
      .s1w-lightbox-bar {
        position: fixed;
        bottom: 20px;
        left: 50%;
        transform: translateX(-50%);
        display: flex;
        align-items: center;
        gap: 8px;
        background: rgba(20, 22, 26, 0.82);
        color: #fff;
        padding: 6px 12px;
        border-radius: 999px;
        font-size: 12px;
      }
      .s1w-lightbox-bar button {
        border: none;
        background: rgba(255, 255, 255, 0.14);
        color: #fff;
        border-radius: 5px;
        padding: 4px 8px;
        cursor: pointer;
      }

      /* Toast */
      .s1w-toast-wrap {
        position: fixed;
        top: 18px;
        left: 50%;
        transform: translateX(-50%);
        z-index: 2147483400;
        display: flex;
        flex-direction: column;
        gap: 6px;
        pointer-events: none;
      }
      .s1w-toast {
        padding: 7px 14px;
        border-radius: 7px;
        background: rgba(24, 28, 34, 0.9);
        color: #fff;
        font-size: 12.5px;
        box-shadow: 0 6px 18px rgba(0, 0, 0, 0.22);
      }

      @media (max-width: 1080px) {
        #${ROOT_ID} .s1w-records-panel {
          position: absolute;
          top: 0;
          right: 0;
          bottom: 0;
          width: min(380px, 86vw);
          max-width: none;
          box-shadow: -8px 0 24px rgba(0, 0, 0, 0.16);
        }
      }
      @media (max-width: 780px) {
        .s1w-list-panel { width: 220px !important; min-width: 180px; }
      }
    `;
  }

  /* === src/ui-shell.js === */
  function renderAvatarHtml({
    uid = "0",
    name = "",
    avatarUrl = "",
    size = "small"
  }) {
    const resolved = avatarUrl || ucenterAvatarUrl(uid, size);
    const bg = avatarColor(uid || name);
    const letter = avatarLetter(name);
    if (!resolved) {
      return `<span class="s1w-avatar-fallback" style="background:${bg}">${escapeHtml(letter)}</span>`;
    }
    return `<img src="${escapeHtml(resolved)}" alt="${escapeHtml(name)}" loading="lazy" data-fallback-bg="${escapeHtml(bg)}" data-fallback-letter="${escapeHtml(letter)}" />`;
  }

  function formatPollSummaryText(pollConfig) {
    const b = Number(pollConfig?.boardSec ?? 30);
    const t = Number(pollConfig?.threadSec ?? 25);
    return `${b > 0 ? `${b}s` : "关"} / ${t > 0 ? `${t}s` : "关"}`;
  }

  function renderShellHtml(state) {
    const myName = state.user?.username || "未登录";
    const unread = Number(state.user?.unreadCount || 0);
    const unreadText = unread > 99 ? "99+" : (unread > 0 ? String(unread) : "");
    const themeIcon = state.themeMode === "dark" ? ICONS.moon : (state.themeMode === "light" ? ICONS.sun : ICONS.themeAuto);
    const themeTitle = state.themeMode === "dark" ? "深色主题" : (state.themeMode === "light" ? "浅色主题" : "跟随系统");
    const pollSummary = formatPollSummaryText(state.pollConfig);

    return `
      <div class="s1w-shell">
        <nav class="s1w-rail" aria-label="主导航">
          <button type="button" class="s1w-rail-me" data-action="me" title="${escapeHtml(myName)}">
            ${renderAvatarHtml({ uid: state.user?.uid, name: myName, avatarUrl: state.user?.avatar })}
            <span class="s1w-rail-badge" style="display:${unreadText ? "inline-block" : "none"}">${escapeHtml(unreadText)}</span>
          </button>
          <div class="s1w-rail-nav">
            <button type="button" class="s1w-rail-btn ${state.navTab === "msg" ? "active" : ""}" data-rail-tab="msg" title="消息">
              ${ICONS.msg}<span>消息</span>
            </button>
            <button type="button" class="s1w-rail-btn ${state.drawerOpen ? "active" : ""}" data-rail-tab="boards" title="板块">
              ${ICONS.boards}<span>板块</span>
            </button>
            <button type="button" class="s1w-rail-btn ${state.navTab === "fav" ? "active" : ""}" data-rail-tab="fav" title="收藏">
              ${ICONS.fav}<span>收藏</span>
            </button>
            <button type="button" class="s1w-rail-btn ${state.navTab === "notif" ? "active" : ""}" data-rail-tab="notif" title="提醒">
              ${ICONS.notif}<span>提醒</span>
            </button>
            <button type="button" class="s1w-rail-btn ${state.navTab === "history" ? "active" : ""}" data-rail-tab="history" title="历史">
              ${ICONS.history}<span>历史</span>
            </button>
          </div>
          <div class="s1w-rail-bottom">
            <button type="button" class="s1w-rail-icon-btn" data-action="cycle-theme" title="${themeTitle}">${themeIcon}</button>
            <button type="button" class="s1w-rail-icon-btn" data-action="rail-settings" title="设置">${ICONS.gear}</button>
            <div class="s1w-popover-menu s1w-rail-menu" hidden style="left:58px;bottom:8px;">
              <button type="button" class="s1w-menu-item" data-menu-action="poll-settings"><span>监控与刷新频率</span><span data-poll-summary>${escapeHtml(pollSummary)}</span></button>
              <button type="button" class="s1w-menu-item" data-menu-action="tags-manager"><span>用户标签</span></button>
              <button type="button" class="s1w-menu-item" data-menu-action="app-login"><span>App 接口登录</span><span data-app-login-state>${state.appSid ? "已登录" : "未配置"}</span></button>
              <button type="button" class="s1w-menu-item" data-menu-action="toggle-hide-tail"><span>隐藏小尾巴</span><span data-hide-tail-state>${state.hideTail !== false ? "开" : "关"}</span></button>
              <button type="button" class="s1w-menu-item" data-menu-action="native-view"><span>切回原版页面</span></button>
            </div>
          </div>
        </nav>

        <aside class="s1w-drawer ${state.drawerOpen ? "open" : ""}" aria-label="板块列表">
          <div class="s1w-drawer-head">
            <span>板块导航</span>
            <button type="button" class="s1w-icon-btn" data-action="close-drawer" title="关闭">${ICONS.close}</button>
          </div>
          <div class="s1w-drawer-body"></div>
        </aside>

        <section class="s1w-list-panel" aria-label="主题列表">
          <div class="s1w-search-bar">
            <form class="s1w-search-form" role="search">
              ${ICONS.search}
              <input type="search" class="s1w-search-input" placeholder="搜索帖子" autocomplete="off" />
            </form>
            <button type="button" class="s1w-icon-btn s1w-new-thread-btn" data-action="new-thread" title="发新帖">${ICONS.plus}</button>
          </div>
          <div class="s1w-list-subheader">
            <span class="s1w-list-board-name">加载中</span>
            <div class="s1w-list-toggles">
              <button type="button" class="s1w-icon-btn ${state.hideUnreadBadge ? "active" : ""}" data-action="toggle-hide-unread" title="${state.hideUnreadBadge ? "显示未读数字" : "隐藏未读数字"}">${state.hideUnreadBadge ? ICONS.eyeOff : ICONS.eye}</button>
              <button type="button" class="s1w-icon-btn ${state.noImageMode ? "active" : ""}" data-action="toggle-no-image" title="帖子无图模式">${ICONS.noImage}</button>
            </div>
          </div>
          <div class="s1w-filter-row"></div>
          <div class="s1w-list-scroll"></div>
          <div class="s1w-list-resizer" title="拖动调整宽度"></div>
        </section>

        <main class="s1w-chat-panel" aria-label="帖子内容">
          <header class="s1w-chat-header">
            <div class="s1w-chat-head-main">
              <div class="s1w-chat-title-row">
                <span class="s1w-chat-title">Stage1st</span>
                <span class="s1w-chat-count"></span>
              </div>
              <div class="s1w-chat-sub"></div>
            </div>
            <div class="s1w-chat-tools">
              <button type="button" class="s1w-tool-pill" data-action="only-op" title="只看楼主">只看楼主</button>
              <button type="button" class="s1w-icon-btn" data-action="fav-thread" title="收藏本帖">${ICONS.star}</button>
              <button type="button" class="s1w-icon-btn" data-action="refresh-thread" title="刷新">${ICONS.refresh}</button>
              <button type="button" class="s1w-icon-btn" data-action="watermark-modal" title="背景水印">${ICONS.watermark}</button>
              <button type="button" class="s1w-icon-btn" data-action="more-chat-menu" title="更多">${ICONS.dots}</button>
              <div class="s1w-popover-menu s1w-chat-menu" hidden style="right:0;top:34px;">
                <button type="button" class="s1w-menu-item" data-menu-action="copy-thread-link"><span>复制帖子链接</span></button>
                <button type="button" class="s1w-menu-item" data-menu-action="toggle-chat-avatar"><span>隐藏楼层头像</span><span data-chat-avatar-state>${state.hideChatAvatar ? "开" : "关"}</span></button>
                <button type="button" class="s1w-menu-item" data-menu-action="tags-manager"><span>用户标签</span></button>
              </div>
            </div>
          </header>

          <div class="s1w-chat-body-wrap">
            <div class="s1w-watermark"></div>
            <div class="s1w-chat-scroll"></div>
            <button type="button" class="s1w-new-msg-pill" data-action="jump-new-replies" hidden></button>
            <div class="s1w-float-nav">
              <button type="button" class="s1w-float-btn" data-action="jump-first-floor" title="跳到首页/顶楼">${ICONS.scrollTop}</button>
              <button type="button" class="s1w-float-btn" data-action="jump-last-floor" title="跳到最后一楼">${ICONS.scrollBottom}</button>
            </div>
          </div>

          <footer class="s1w-composer">
            <div class="s1w-reply-preview">
              <span class="s1w-reply-preview-text"></span>
              <button type="button" class="s1w-icon-btn" data-action="clear-quote" title="取消引用">${ICONS.close}</button>
            </div>
            <div class="s1w-attach-bar" hidden></div>
            <div class="s1w-composer-toolbar">
              <button type="button" class="s1w-icon-btn" data-composer-tool="emoji" title="麻将脸表情">${ICONS.emoji}</button>
              <button type="button" class="s1w-icon-btn" data-composer-tool="img" title="插入图片链接">${ICONS.pic}</button>
              <button type="button" class="s1w-icon-btn" data-composer-tool="attach" title="上传附件">${ICONS.attach}</button>
              <input type="file" class="s1w-attach-input" multiple hidden />
              <button type="button" class="s1w-icon-btn" data-composer-tool="whiteout" title="插入反白文字">${ICONS.whiteout}</button>
              <button type="button" class="s1w-icon-btn" data-composer-tool="preview" title="预览效果">${ICONS.eye}</button>
              <button type="button" class="s1w-icon-btn" data-composer-tool="chat-records" title="查找聊天记录" style="margin-left:auto;">${ICONS.chatSearch}</button>
            </div>
            <textarea class="s1w-textarea" placeholder="输入回复，Enter 发送，Shift+Enter 换行"></textarea>
            <div class="s1w-bbcode-preview" hidden></div>
            <div class="s1w-composer-bottom">
              <span class="s1w-composer-status"></span>
              <button type="button" class="s1w-send-btn" data-action="send-reply">发送</button>
            </div>
            <div class="s1w-smiley-popover" hidden>
              <div class="s1w-smiley-tabs"></div>
              <div class="s1w-smiley-grid"></div>
            </div>
            <div class="s1w-composer-account-popover" hidden></div>
          </footer>
        </main>
        <aside class="s1w-records-panel" hidden aria-label="查找聊天记录"></aside>
      </div>

      <button type="button" class="s1w-native-fab" data-action="wecom-view">企微视图</button>
      <div class="s1w-self-popover" hidden></div>
      <div class="s1w-usercard-popover" hidden></div>
      <div class="s1w-modal-host"></div>
      <div class="s1w-toast-wrap"></div>
    `;
  }

  function renderDrawerHtml(categories, activeFid) {
    return (categories || [])
      .map((cat) => {
        const boardsHtml = (cat.boards || [])
          .map((b) => {
            const count = Number(b.todayposts || 0);
            return `
              <button type="button" class="s1w-drawer-board ${String(b.fid) === String(activeFid) ? "active" : ""}" data-fid="${escapeHtml(b.fid)}">
                <span>${escapeHtml(b.name)}</span>
                ${count > 0 ? `<span class="s1w-drawer-count">${count}</span>` : ""}
              </button>
            `;
          })
          .join("");
        return `<div class="s1w-drawer-cat">${escapeHtml(cat.name)}</div>${boardsHtml}`;
      })
      .join("");
  }

  function renderFilterBarHtml(state) {
    if (state.navTab === "history") {
      return `
        <span class="s1w-conv-time">共 ${state.historyItems.length} 条记录</span>
        <button type="button" class="s1w-chip" data-action="clear-history" style="margin-left:auto;">清空</button>
      `;
    }
    if (state.navTab === "fav") {
      return `<span class="s1w-conv-time">帖子收藏</span>`;
    }
    if (state.navTab === "notif") {
      return `<span class="s1w-conv-time">站内提醒</span>`;
    }
    if (state.navTab === "search") {
      return `
        <span class="s1w-conv-time">搜索结果</span>
        <button type="button" class="s1w-chip" data-action="exit-search" style="margin-left:auto;">返回列表</button>
      `;
    }
    const chips = [
      { key: "all", label: "全部" },
      { key: "latest", label: "最新" },
      { key: "digest", label: "精华" },
      { key: "hot", label: "热门" }
    ];
    const chipsHtml = chips
      .map((c) => `<button type="button" class="s1w-chip ${state.listFilter === c.key ? "active" : ""}" data-list-filter="${c.key}">${c.label}</button>`)
      .join("");
    const types = state.threadtypes || [];
    const typeSelect = types.length
      ? `<select class="s1w-type-select" aria-label="主题分类">
           <option value="">全部分类</option>
           ${types.map((t) => `<option value="${escapeHtml(t.id)}" ${String(state.activeTypeId) === String(t.id) ? "selected" : ""}>${escapeHtml(t.name)}</option>`).join("")}
         </select>`
      : "";
    return `${chipsHtml}${typeSelect}`;
  }

  function renderThreadListHtml(state) {
    if (state.listLoading && !state.listItems.length) {
      return `<div class="s1w-empty-state">加载中…</div>`;
    }
    if (state.listError) {
      return `<div class="s1w-empty-state"><span>${escapeHtml(state.listError)}</span></div>`;
    }
    const items = state.listItems || [];
    if (!items.length) {
      return `<div class="s1w-empty-state">暂无内容</div>`;
    }

    const lastReadMap = state.lastReadMap || {};
    const pinnedMap = state.pinnedThreads || {};
    const hideUnread = Boolean(state.hideUnreadBadge);
    const floatSet = state.floatingTids instanceof Set ? state.floatingTids : new Set(state.floatingTids || []);

    const rowsHtml = items
      .map((item) => {
        const tid = String(item.tid || "");
        const active = tid && tid === String(state.activeTid);
        const displayTitle = item.subject;
        const lastRead = tid ? lastReadMap[tid] : null;
        const unreadCount = tid && lastRead ? Math.max(0, Number(item.replies || 0) - Number(lastRead.replies || 0)) : 0;
        const showBadge = !hideUnread && unreadCount > 0;
        const badgeText = unreadCount > 99 ? "99+" : String(unreadCount);
        const isPinned = Boolean(tid && pinnedMap[tid]);
        const isFloating = Boolean(tid && floatSet.has(tid));
        const timeLabel = item.lastpostTs ? formatRelativeTime(item.lastpostTs) : (item.timeText || "");
        const preview = item.previewText || (item.author ? `${item.author}` : "");
        const typeBadge = item.typeName ? `<span class="s1w-conv-type-tag">${escapeHtml(item.typeName)}</span>` : "";

        return `
          <div role="button" tabindex="0" class="s1w-conv-item ${active ? "active" : ""} ${isPinned ? "is-pinned" : ""} ${isFloating ? "s1w-conv-float-up" : ""}" data-tid="${escapeHtml(tid)}" data-fid="${escapeHtml(item.fid || "")}" data-pid="${escapeHtml(item.pid || "")}">
            <div class="s1w-conv-avatar">
              ${renderAvatarHtml({
                uid: item.authorid,
                name: item.author || displayTitle,
                avatarUrl: item.avatarUrl,
                size: "small"
              })}
              ${showBadge ? `<span class="s1w-unread-badge">${badgeText}</span>` : ""}
            </div>
            <div class="s1w-conv-body">
              <div class="s1w-conv-top">
                ${isPinned ? `<span class="s1w-conv-pin-tag" title="已置顶">${ICONS.pin}</span>` : ""}
                <span class="s1w-conv-title" title="${escapeHtml(displayTitle)}">${escapeHtml(displayTitle)}</span>
                <span class="s1w-conv-time" data-ts="${escapeHtml(String(item.lastpostTs || ""))}">${escapeHtml(timeLabel)}</span>
              </div>
              <div class="s1w-conv-bottom">
                ${typeBadge}
                <span class="s1w-conv-preview">${escapeHtml(preview)}</span>
                ${item.replies ? `<span class="s1w-conv-meta-badge">${item.replies}</span>` : ""}
              </div>
            </div>
            ${tid
              ? `<button type="button" class="s1w-conv-pin-btn ${isPinned ? "pinned" : ""}" data-pin-tid="${escapeHtml(tid)}" title="${isPinned ? "取消置顶" : "置顶帖子"}">${ICONS.pin}</button>`
              : ""}
          </div>
        `;
      })
      .join("");

    const moreBtn = state.hasMoreList
      ? `<button type="button" class="s1w-list-more-btn" data-action="load-more-list">${state.listLoading ? "加载中…" : "加载更多"}</button>`
      : "";
    return `${rowsHtml}${moreBtn}`;
  }

  const TAIL_STARTER_RE = /(?:(?:——|—|--{1,2}|&mdash;&mdash;|&mdash;)\s*(?:来自|來自|from\b)|发自我的[^<\r\n]{1,40}\bvia\b)/gi;
  const TAIL_TRAILING_RE = /((?:\s|&nbsp;|<br\s*\/?>|<\/(?:font|span|i|small|em|strong|p|div)>)*)$/i;
  const TAIL_MARKER_RE = /(?:鹅球|论坛助手|S1\s*Next|S1Next|S1\s*Orange|S1\s*Nyan|S1Fun|S1N|Stage1st|Goose|Android|iOS|iPhone|iPad|OpenHarmony|HarmonyOS|Windows|macOS|客户端|鹅版|pgyer\.com\/GcUxKd4w|S1-Next|\bv?\d+\.\d+(?:\.\d+)?)/i;
  const ASSISTANT_ANCHOR_RE = /((?:(?:——|—|--{1,2}|&mdash;&mdash;|&mdash;)\s*(?:来自|來自|发自|from\b)?\s*|(?:来自|來自|发自)\s*)?)(<a\b[^>]*>(?:(?!<\/a>|<a\b)[\s\S]){1,180}<\/a>(?:\s*v?\d+(?:\.\d+)*)?)$/i;
  const ASSISTANT_LABEL_RE = /^论坛助手\s*[,，/|·\-\s]\s*(?:iPhone|iPad|iPod|iOS|Android|HarmonyOS|OpenHarmony|macOS|Windows|[\w.-]{2,20})$/i;
  const ASSISTANT_PLAIN_RE = /((?:(?:——|—|--{1,2}|&mdash;&mdash;|&mdash;)\s*(?:来自|來自|发自|from\b)?\s*|(?:来自|來自|发自)\s*)?)(论坛助手\s*[,，]\s*(?:iPhone|iPad|iPod|iOS|Android|HarmonyOS|OpenHarmony|macOS|Windows)(?:\s+v?\d+(?:\.\d+)*)?)$/i;

  function isInsideQuoteBlock(before) {
    if (/class="[^"]*\breply_wrap\b/i.test(before)) {
      const afterQuote = before.slice(before.toLowerCase().lastIndexOf("reply_wrap"));
      if (1 + (afterQuote.match(/<div\b/gi)?.length || 0) > (afterQuote.match(/<\/div>/gi)?.length || 0)) {
        return true;
      }
    }
    return (before.match(/<blockquote\b/gi)?.length || 0) > (before.match(/<\/blockquote>/gi)?.length || 0);
  }

  function finalizeStrippedTail(raw, before, tailClose) {
    let cleanBefore = before;
    let after = tailClose.replace(/(?:\s|&nbsp;|<br\s*\/?>)+/gi, "");
    while (true) {
      cleanBefore = cleanBefore.replace(/(?:\s|&nbsp;|<br\s*\/?>)+$/gi, "");
      const openM = cleanBefore.match(/<(font|span|i|small|em|strong|p|div)\b[^>]*>$/i);
      const closeM = after.match(/^<\/(font|span|i|small|em|strong|p|div)>/i);
      if (openM && closeM && openM[1].toLowerCase() === closeM[1].toLowerCase()) {
        cleanBefore = cleanBefore.slice(0, openM.index);
        after = after.slice(closeM[0].length);
        continue;
      }
      break;
    }

    const cleaned = `${cleanBefore}${after}`.trim();
    if (!stripHtmlTags(cleaned).trim() && !/<img\b/i.test(cleaned)) {
      return raw;
    }
    return cleaned;
  }

  function stripClientTail(html, hideTail = true) {
    const raw = String(html || "");
    if (!hideTail || !raw) return raw;

    // Pass 1: tails starting with —— 来自 / — from / 发自我的... via ...
    TAIL_STARTER_RE.lastIndex = 0;
    let lastMatch = null;
    let match;
    while ((match = TAIL_STARTER_RE.exec(raw)) !== null) {
      lastMatch = match;
    }
    if (lastMatch && !(lastMatch[0].startsWith("-") && lastMatch.index > 0 && !/[>\s\u00a0;]/.test(raw[lastMatch.index - 1]))) {
      const before = raw.slice(0, lastMatch.index);
      const rest = raw.slice(lastMatch.index);
      const closeMatch = rest.match(TAIL_TRAILING_RE);
      const tailClose = closeMatch ? closeMatch[0] : "";
      const tailBody = rest.slice(0, rest.length - tailClose.length);
      const tailPlain = stripHtmlTags(tailBody).trim();

      if (
        !/\r|\n|<(?:br|p|div|blockquote|hr)\b/i.test(tailBody) &&
        !isInsideQuoteBlock(before) &&
        tailPlain &&
        tailPlain.length <= 180 &&
        TAIL_MARKER_RE.test(tailBody)
      ) {
        return finalizeStrippedTail(raw, before, tailClose);
      }
    }

    // Pass 2: standalone trailing [论坛助手,iPhone] / plain 论坛助手 tails
    const endCloseMatch = raw.match(TAIL_TRAILING_RE);
    const endClose = endCloseMatch ? endCloseMatch[0] : "";
    const body = raw.slice(0, raw.length - endClose.length);

    const anchorMatch = body.match(ASSISTANT_ANCHOR_RE);
    if (anchorMatch) {
      const idx = anchorMatch.index ?? (body.length - anchorMatch[0].length);
      const prefix = anchorMatch[1] || "";
      const anchorHtml = anchorMatch[2] || "";
      if (!(prefix.startsWith("-") && idx > 0 && !/[>\s\u00a0;]/.test(body[idx - 1]))) {
        const before = body.slice(0, idx);
        if (!isInsideQuoteBlock(before)) {
          const label = stripHtmlTags(anchorHtml).trim();
          const isDeviceLabel = ASSISTANT_LABEL_RE.test(label);
          const isStandaloneAssistant =
            /^论坛助手$/i.test(label) &&
            /(?:tid=2029836|thread-2029836)/i.test(anchorHtml) &&
            (prefix.trim().length > 0 ||
              !before.trim() ||
              /(?:<br\s*\/?>|\r|\n|>)$/i.test(before.replace(/(?:[\s\u00a0]|&nbsp;)+$/gi, "")));
          if (isDeviceLabel || isStandaloneAssistant) {
            return finalizeStrippedTail(raw, before, endClose);
          }
        }
      }
    }

    const plainMatch = body.match(ASSISTANT_PLAIN_RE);
    if (plainMatch) {
      const idx = plainMatch.index ?? (body.length - plainMatch[0].length);
      const prefix = plainMatch[1] || "";
      if (!(idx > 0 && !prefix && !/[>\s\u00a0;]/.test(body[idx - 1])) &&
          !(prefix.startsWith("-") && idx > 0 && !/[>\s\u00a0;]/.test(body[idx - 1]))) {
        const before = body.slice(0, idx);
        if (!isInsideQuoteBlock(before)) {
          return finalizeStrippedTail(raw, before, endClose);
        }
      }
    }

    return raw;
  }

  function transformPostImages(html, noImageMode = false) {
    const raw = String(html || "");
    if (!noImageMode) return raw;
    return raw.replace(/<img\b([^>]*\bclass="[^"]*\bs1-content-img\b[^"]*"[^>]*)>/gi, (full, attrs) => {
      const srcMatch = attrs.match(/\bsrc="([^"]+)"/i);
      if (!srcMatch) return full;
      const url = srcMatch[1];
      return `<button type="button" class="s1w-img-placeholder" data-preview-img="${url}" title="点击查看图片">${ICONS.pic}<span>查看图片</span></button>`;
    });
  }

  function clampNumber(n, min, max) {
    return Math.max(min, Math.min(max, n));
  }

  function renderPollCardHtml(thread, user = null) {
    const poll = thread?.poll;
    if (!poll || !Array.isArray(poll.options) || !poll.options.length) return "";
    const tid = escapeHtml(thread.tid || "");
    const isGuest = !user?.uid || String(user.uid) === "0";
    const expired = Number(poll.expirations || 0) > 0 && Date.now() / 1000 >= Number(poll.expirations);
    const canVote = Boolean(poll.allowvote && !expired);
    const hasVoteStats = poll.options.some((opt) => opt.votes !== null || opt.percent !== null);
    const showResults = hasVoteStats && (!poll.visiblepoll || !canVote);
    const inputType = poll.multiple ? "checkbox" : "radio";
    const modeLabel = poll.multiple ? `多选 · 最多 ${Math.max(1, Number(poll.maxchoices || 1))} 项` : "单选";
    const expText = Number(poll.expirations || 0) > 0
      ? (expired ? " · 已截止" : ` · 截止 ${formatFullTime(poll.expirations)}`)
      : "";

    const optsHtml = poll.options
      .map((opt) => {
        const pct = opt.percent !== null && Number.isFinite(Number(opt.percent))
          ? clampNumber(Number(opt.percent), 0, 100)
          : 0;
        const barWidth = opt.percent !== null ? pct : 0;
        const barColor = opt.color || "var(--wc-accent)";
        const pctLabel = opt.percent !== null ? `${pct % 1 === 0 ? pct.toFixed(0) : pct.toFixed(2)}%` : "";
        const votesText = showResults
          ? `<span class="s1w-poll-votes">${opt.votes !== null ? `${opt.votes} 票` : ""}${pctLabel ? ` (${pctLabel})` : ""}</span>`
          : "";
        const imgHtml = opt.img
          ? `<img class="s1-content-img s1w-poll-opt-img" src="${escapeHtml(opt.img)}" alt="" loading="lazy" />`
          : "";
        const inputHtml = canVote
          ? `<input type="${inputType}" class="s1w-poll-input" name="s1w-poll-${tid}" value="${escapeHtml(opt.id)}" data-poll-max="${Math.max(1, Number(poll.maxchoices || 1))}" />`
          : "";
        const barHtml = showResults
          ? `<div class="s1w-poll-bar-track"><div class="s1w-poll-bar-fill" style="width:${barWidth}%;background:${escapeHtml(barColor)};"></div></div>`
          : "";

        if (canVote) {
          return `
            <label class="s1w-poll-opt is-votable">
              <div class="s1w-poll-opt-row">
                ${inputHtml}
                ${imgHtml}
                <span class="s1w-poll-opt-text">${escapeHtml(opt.text)}</span>
                ${votesText}
              </div>
              ${barHtml}
            </label>
          `;
        }
        return `
          <div class="s1w-poll-opt">
            <div class="s1w-poll-opt-row">
              ${imgHtml}
              <span class="s1w-poll-opt-text">${escapeHtml(opt.text)}</span>
              ${votesText}
            </div>
            ${barHtml}
          </div>
        `;
      })
      .join("");

    const statusText = poll.statusText || (expired ? "投票已结束" : (isGuest ? "登录后可参与投票" : "已完成投票或暂无投票权限"));
    const footHtml = canVote
      ? `<button type="button" class="s1w-btn-primary s1w-poll-submit" data-action="submit-poll">提交投票</button>${poll.visiblepoll ? `<span class="s1w-poll-status">投票后可见结果</span>` : ""}`
      : `<span class="s1w-poll-status">${escapeHtml(statusText)}</span>`;

    return `
      <div class="s1w-poll-card" data-poll-tid="${tid}">
        <div class="s1w-poll-head">
          <span class="s1w-poll-badge">投票</span>
          <span class="s1w-poll-meta">${escapeHtml(modeLabel)} · 共 ${Math.max(0, Number(poll.voterscount || 0))} 人参与${escapeHtml(expText)}</span>
        </div>
        <div class="s1w-poll-list">${optsHtml}</div>
        <div class="s1w-poll-foot">${footHtml}</div>
      </div>
    `;
  }

  function renderChatMessagesHtml(state) {
    if (state.chatLoading) {
      return `<div class="s1w-empty-state">加载帖子中…</div>`;
    }
    if (state.chatError) {
      const isPending = String(state.chatError).includes(REVIEW_PENDING_TEXT);
      const appPrompt = isPending && !state.appSid
        ? `<button type="button" class="s1w-btn-primary" data-action="app-login">配置 App 登录查看</button>`
        : "";
      return `<div class="s1w-empty-state"><span>${escapeHtml(state.chatError)}</span>${appPrompt}</div>`;
    }
    const thread = state.activeThread;
    const posts = state.posts || [];
    if (!thread || !posts.length) {
      return `<div class="s1w-empty-state">选择左侧帖子开始浏览</div>`;
    }

    const myUid = String(state.user?.uid || "0");
    const userTags = state.userTags || {};
    const minPage = Math.max(1, Number(state.loadedMinPage || state.threadPage || 1));
    const maxLoadedPage = Math.max(minPage, Number(state.loadedMaxPage || state.threadPage || 1));
    const topPrevHint = state.chatPrepending
      ? `<div class="s1w-append-status s1w-prev-hint">正在加载第 ${minPage - 1} 页…</div>`
      : (minPage > 1
        ? `<div class="s1w-append-status s1w-prev-hint" data-action="load-prev-page">向上滚动加载第 ${minPage - 1} 页</div>`
        : "");

    let lastRenderedPage = null;
    const msgsHtml = posts
      .map((p) => {
        const postPage = Math.max(1, Number(p.page || state.threadPage || 1));
        const pageDivider = lastRenderedPage !== null && postPage !== lastRenderedPage
          ? `<div class="s1w-page-divider"><span>第 ${postPage} 页</span></div>`
          : "";
        lastRenderedPage = postPage;

        const isMe = myUid !== "0" && String(p.authorid) === myUid;
        const isOp = thread.authorid && String(p.authorid) === String(thread.authorid);
        const tagRecord = userTags[String(p.authorid)] || userTags[String(p.author)];
        const tagBadges = (tagRecord?.tags || [])
          .map((t) => `<span class="s1w-user-tag-badge">${escapeHtml(t)}</span>`)
          .join("");
        const recoveredBadge = p.recoveredLabel
          ? `<span class="s1w-recovered-badge">${escapeHtml(p.recoveredLabel)}</span>`
          : "";
        const timeText = p.datelineTs ? formatRelativeTime(p.datelineTs) : p.datelineText;
        const fullTime = p.datelineTs ? formatFullTime(p.datelineTs) : p.datelineText;

        const quoteHtml = p.quote
          ? `<div class="s1w-quote-card" data-jump-pid="${escapeHtml(p.quote.pid || "")}" data-jump-tid="${escapeHtml(p.quote.tid || thread.tid)}">
               <div class="s1w-quote-head">${escapeHtml(p.quote.author || "引用")} ${escapeHtml(p.quote.time || "")}</div>
               <div>${escapeHtml(p.quote.excerpt || "")}</div>
             </div>`
          : "";

        const bodyHtml = transformPostImages(stripClientTail(p.bodyHtml, state.hideTail !== false), state.noImageMode);
        const pollHtml = p.first && thread.poll ? renderPollCardHtml(thread, state.user) : "";
        const isBlocked = !state.appSid && String(p.bodyHtml || "").includes(BLOCKED_REPLY_TEXT);
        const blockedCtaHtml = isBlocked
          ? `<div style="margin-top:6px;"><button type="button" class="s1w-blocked-cta" data-action="app-login">配置 App 登录查看</button></div>`
          : "";
        const attachHtml = (p.attachments || [])
          .filter((att) => !p.bodyHtml.includes(att.url))
          .map((att) =>
            state.noImageMode
              ? `<button type="button" class="s1w-img-placeholder" data-preview-img="${escapeHtml(att.url)}" title="点击查看图片">${ICONS.pic}<span>查看图片</span></button>`
              : `<img class="s1-content-img" src="${escapeHtml(att.url)}" alt="${escapeHtml(att.filename || "图片")}" loading="lazy" />`
          )
          .join("");

        const rateHtml = p.ratelog
          ? `<div class="s1w-ratelog">
               <span class="s1w-ratelog-pill">鹅 ${escapeHtml(p.ratelog.totalScore || p.ratelog.participants)}</span>
               ${(p.ratelog.rows || []).slice(0, 4).map((r) => `<span>${escapeHtml(r.user)} ${escapeHtml(r.score)}${r.reason ? `(${escapeHtml(r.reason)})` : ""}</span>`).join(" · ")}
             </div>`
          : "";

        const hideAvatarCls = state.hideChatAvatar ? "hide-avatar" : "";

        return `${pageDivider}
          <article class="s1w-msg-row ${isMe ? "is-me" : ""} ${hideAvatarCls}" id="s1w-post-${escapeHtml(p.pid)}" data-pid="${escapeHtml(p.pid)}" data-page="${postPage}" data-floor="${p.floor}" data-author="${escapeHtml(p.author)}" data-authorid="${escapeHtml(p.authorid)}">
            <button type="button" class="s1w-msg-avatar-btn" data-profile-uid="${escapeHtml(p.authorid)}" data-profile-name="${escapeHtml(p.author)}" title="查看资料">
              ${renderAvatarHtml({
                uid: p.authorid,
                name: p.author,
                avatarUrl: p.avatarUrl,
                size: "small"
              })}
            </button>
            <div class="s1w-msg-col">
              <div class="s1w-msg-meta">
                <span class="s1w-msg-author" data-profile-uid="${escapeHtml(p.authorid)}" data-profile-name="${escapeHtml(p.author)}">${escapeHtml(p.author)}</span>
                ${isOp ? `<span class="s1w-badge-op">楼主</span>` : ""}
                ${recoveredBadge}
                ${tagBadges}
                <span>#${p.floor}</span>
                <span title="${escapeHtml(fullTime)}" data-ts="${escapeHtml(String(p.datelineTs || ""))}">${escapeHtml(timeText)}</span>
                ${p.editedInfo ? `<span class="s1w-edited-mark" title="${escapeHtml(p.editedInfo)}">已编辑</span>` : ""}
              </div>
              <div class="s1w-bubble-wrap">
                <div class="s1w-bubble${p.isBannedRecovered ? " is-banned-recovered" : ""}"${p.isBannedRecovered ? ' title="已封禁用户"' : ""}>
                  ${quoteHtml}
                  <div class="s1w-bubble-content">${bodyHtml || "<span style='color:var(--wc-text-3)'>(无文本内容)</span>"}</div>
                  ${pollHtml}
                  ${blockedCtaHtml}
                  ${attachHtml}
                  ${rateHtml}
                </div>
                <div class="s1w-msg-actions">
                  <button type="button" class="s1w-icon-btn" data-post-action="quote" title="引用回复">${ICONS.reply}</button>
                  <button type="button" class="s1w-icon-btn" data-post-action="rate" title="加减鹅">${ICONS.goose}</button>
                  <button type="button" class="s1w-icon-btn" data-post-action="copy-link" title="复制楼层链接">${ICONS.link}</button>
                </div>
              </div>
            </div>
          </article>
        `;
      })
      .join("");

    const curPage = Math.max(1, Number(state.threadPage || 1));
    const totalPages = Math.max(curPage, maxLoadedPage, Number(thread.totalPages || 1));
    const statusText = state.chatAppending
      ? `正在加载第 ${maxLoadedPage + 1} 页…`
      : (totalPages > 1 ? `已加载第 ${minPage}–${maxLoadedPage} 页 / 共 ${totalPages} 页` : "");
    const appendStatusHtml = statusText ? `<div class="s1w-append-status">${statusText}</div>` : "";

    return `${topPrevHint}${msgsHtml}${appendStatusHtml}`;
  }

  function formatDayKey(tsSeconds) {
    if (!tsSeconds) return "";
    const dt = new Date(Number(tsSeconds) * 1000);
    if (Number.isNaN(dt.getTime())) return "";
    const p2 = (n) => String(n).padStart(2, "0");
    return `${dt.getFullYear()}-${p2(dt.getMonth() + 1)}-${p2(dt.getDate())}`;
  }

  function renderRecordsPanelHtml(state) {
    const thread = state.activeThread;
    const posts = state.posts || [];
    const tab = state.recordsTab || "all";
    const query = String(state.recordsQuery || "").trim().toLowerCase();
    const filterAuthor = String(state.recordsAuthor || "");
    const filterDate = String(state.recordsDate || "");
    const totalPages = Math.max(1, Number(thread?.totalPages || 1));
    const loadedMin = Math.max(1, Number(state.loadedMinPage || 1));
    const loadedMax = Math.max(loadedMin, Number(state.loadedMaxPage || 1));

    const normalizedPosts = posts.map((p) => ({
      ...p,
      bodyHtml: stripClientTail(p.bodyHtml, state.hideTail !== false)
    }));
    const authors = Array.from(new Set(normalizedPosts.map((p) => p.author).filter(Boolean)));
    const dates = Array.from(new Set(normalizedPosts.map((p) => formatDayKey(p.datelineTs)).filter(Boolean))).sort().reverse();
    const media = extractPostMedia(normalizedPosts);

    const matchesTextAndFilter = (itemAuthor, ts, text) => {
      if (filterAuthor && itemAuthor !== filterAuthor) return false;
      if (filterDate && formatDayKey(ts) !== filterDate) return false;
      if (!query) return true;
      const floorMatch = query.startsWith("#") ? query.slice(1) : "";
      if (floorMatch && String(text).includes(`#${floorMatch}`)) return true;
      return String(text || "").toLowerCase().includes(query) || String(itemAuthor || "").toLowerCase().includes(query);
    };

    let bodyHtml = "";
    if (!thread) {
      bodyHtml = `<div class="s1w-empty-state">请先选择一个帖子</div>`;
    } else if (tab === "images") {
      const imgs = media.images.filter((img) =>
        matchesTextAndFilter(img.author, img.datelineTs, `#${img.floor} ${img.url}`)
      );
      bodyHtml = imgs.length
        ? `<div class="s1w-rec-img-grid">${imgs
            .map(
              (img) => `
                <div class="s1w-rec-img-card" data-rec-preview-img="${escapeHtml(img.url)}" title="#${img.floor} ${escapeHtml(img.author)}">
                  <img src="${escapeHtml(img.url)}" alt="#${img.floor}" loading="lazy" />
                  <button type="button" class="s1w-rec-img-floor" data-rec-jump-pid="${escapeHtml(img.pid)}" title="跳转到该楼层">#${img.floor}</button>
                </div>
              `
            )
            .join("")}</div>`
        : `<div class="s1w-empty-state">已加载楼层中暂无图片</div>`;
    } else if (tab === "links") {
      const linkList = media.links.filter((lk) =>
        matchesTextAndFilter(lk.author, lk.datelineTs, `#${lk.floor} ${lk.text} ${lk.url}`)
      );
      bodyHtml = linkList.length
        ? linkList
            .map(
              (lk) => `
                <div class="s1w-rec-link-row">
                  <div class="s1w-rec-item-head">
                    <span class="s1w-rec-item-author">${escapeHtml(lk.author)}</span>
                    <button type="button" class="s1w-records-mini-btn" data-rec-jump-pid="${escapeHtml(lk.pid)}">#${lk.floor}</button>
                  </div>
                  <a class="s1w-rec-link-url" href="${escapeHtml(lk.url)}" target="_blank" rel="noopener noreferrer">${escapeHtml(lk.text)}</a>
                </div>
              `
            )
            .join("")
        : `<div class="s1w-empty-state">已加载楼层中暂无链接</div>`;
    } else {
      const filteredPosts = normalizedPosts.filter((p) => {
        const plain = stripHtmlTags(p.bodyHtml || "");
        return matchesTextAndFilter(p.author, p.datelineTs, `#${p.floor} ${plain}`);
      });
      let lastDay = "";
      bodyHtml = filteredPosts.length
        ? filteredPosts
            .map((p) => {
              const day = formatDayKey(p.datelineTs);
              const daySep = day && day !== lastDay ? `<div class="s1w-rec-date-sep">${escapeHtml(day.slice(5).replace("-", "/"))}</div>` : "";
              if (day) lastDay = day;
              const plain = stripHtmlTags(p.bodyHtml || "") || (p.attachments?.length ? "[图片]" : "(无文本)");
              const timeStr = p.datelineTs ? formatFullTime(p.datelineTs).slice(5) : p.datelineText;
              return `${daySep}
                <button type="button" class="s1w-rec-item" data-rec-jump-pid="${escapeHtml(p.pid)}">
                  <div class="s1w-rec-item-avatar">
                    ${renderAvatarHtml({ uid: p.authorid, name: p.author, avatarUrl: p.avatarUrl, size: "small" })}
                  </div>
                  <div class="s1w-rec-item-main">
                    <div class="s1w-rec-item-head">
                      <span class="s1w-rec-item-author">${escapeHtml(p.author)}</span>
                      <span class="s1w-rec-item-meta">#${p.floor} · ${escapeHtml(timeStr)}</span>
                    </div>
                    <div class="s1w-rec-item-text">${escapeHtml(plain)}</div>
                  </div>
                </button>
              `;
            })
            .join("")
        : `<div class="s1w-empty-state">未找到匹配的楼层</div>`;
    }

    return `
      <div class="s1w-records-head">
        <span>查找聊天记录</span>
        <button type="button" class="s1w-icon-btn" data-action="close-records" title="关闭">${ICONS.close}</button>
      </div>
      <div class="s1w-records-tabs">
        <button type="button" class="s1w-records-tab ${tab === "all" ? "active" : ""}" data-records-tab="all">全部</button>
        <button type="button" class="s1w-records-tab ${tab === "images" ? "active" : ""}" data-records-tab="images">图片 (${media.images.length})</button>
        <button type="button" class="s1w-records-tab ${tab === "links" ? "active" : ""}" data-records-tab="links">链接 (${media.links.length})</button>
      </div>
      <div class="s1w-records-controls">
        <div class="s1w-records-search-box">
          ${ICONS.search}
          <input type="search" class="s1w-records-search-input" value="${escapeHtml(state.recordsQuery || "")}" placeholder="搜索贴内内容、发送人或 #楼层" />
        </div>
        <div class="s1w-records-filters">
          <select class="s1w-records-select s1w-rec-author-select" aria-label="按发送人筛选">
            <option value="">全部发送人</option>
            ${authors.map((a) => `<option value="${escapeHtml(a)}" ${filterAuthor === a ? "selected" : ""}>${escapeHtml(a)}</option>`).join("")}
          </select>
          <select class="s1w-records-select s1w-rec-date-select" aria-label="按日期筛选">
            <option value="">全部日期</option>
            ${dates.map((d) => `<option value="${escapeHtml(d)}" ${filterDate === d ? "selected" : ""}>${escapeHtml(d)}</option>`).join("")}
          </select>
        </div>
        ${thread
          ? `<div class="s1w-records-jump-bar">
               <span class="s1w-records-jump-group">
                 <span>第</span>
                 <input type="number" class="s1w-records-num s1w-rec-page-input" min="1" max="${totalPages}" value="${Math.max(1, Number(state.threadPage || 1))}" aria-label="页码" />
                 <span>/ ${totalPages} 页</span>
                 <button type="button" class="s1w-records-mini-btn" data-rec-jump="page">跳页</button>
                 <button type="button" class="s1w-records-mini-btn" data-rec-jump="last">末页</button>
               </span>
               <span class="s1w-records-jump-group">
                 <span>#</span>
                 <input type="number" class="s1w-records-num s1w-rec-floor-input" min="1" placeholder="楼" aria-label="楼层" />
                 <button type="button" class="s1w-records-mini-btn" data-rec-jump="floor">跳楼</button>
                 ${loadedMax < totalPages ? `<button type="button" class="s1w-records-mini-btn" data-rec-jump="load-more">加载下页</button>` : ""}
               </span>
             </div>`
          : ""}
      </div>
      <div class="s1w-records-body">${bodyHtml}</div>
    `;
  }

  function renderSavedAccountsBlockHtml(state, activeName = "") {
    const uid = String(state.user?.uid || "0");
    const isGuest = !uid || uid === "0";
    const name = activeName || (isGuest ? "" : (state.user?.username || `UID ${uid}`));
    const accounts = Array.isArray(state.savedAccounts) ? state.savedAccounts : [];
    if (!accounts.length) return "";
    return `
      <div class="s1w-self-accounts">
        <div class="s1w-self-sec-title">已保存账号</div>
        ${accounts
          .map((acc) => {
            const accKey = acc.uid && acc.uid !== "0" ? String(acc.uid) : String(acc.loginName || acc.username);
            const accName = acc.username || acc.loginName || `UID ${accKey}`;
            const isCurrent = !isGuest && ((acc.uid && String(acc.uid) === uid) || accName === name);
            return `
              <div class="s1w-account-row ${isCurrent ? "current" : ""}">
                <button type="button" class="s1w-account-switch" data-switch-account="${escapeHtml(accKey)}" title="${isCurrent ? "当前登录账号" : "切换到此账号"}">
                  ${renderAvatarHtml({ uid: acc.uid, name: accName, avatarUrl: acc.avatar, size: "small" })}
                  <span class="s1w-account-name">${escapeHtml(accName)}</span>
                  <span class="s1w-account-tag">${isCurrent ? "当前" : "切换"}</span>
                </button>
                <button type="button" class="s1w-account-remove" data-remove-account="${escapeHtml(accKey)}" title="移除记录">×</button>
              </div>
            `;
          })
          .join("")}
      </div>
    `;
  }

  function renderComposerAccountPopoverHtml(state) {
    const uid = String(state.user?.uid || "0");
    const isGuest = !uid || uid === "0";
    const name = isGuest ? "未登录（游客）" : (state.user?.username || `UID ${uid}`);
    const accountsListHtml = renderSavedAccountsBlockHtml(state, name);
    return `
      <div class="s1w-self-sec-title" style="padding:2px 12px 6px;">当前发帖人：${escapeHtml(name)}</div>
      <div class="s1w-pop-divider"></div>
      ${accountsListHtml}
      <button type="button" class="s1w-pop-item" data-self-action="account-login">
        <span class="s1w-pop-item-left">${ICONS.switchUser}<span>${isGuest ? "登录账号" : "添加 / 切换账号"}</span></span>
      </button>
      ${!isGuest
        ? `<button type="button" class="s1w-pop-item" data-self-action="web-logout">
             <span class="s1w-pop-item-left">${ICONS.logout}<span>退出当前账号</span></span>
           </button>`
        : ""}
    `;
  }

  function renderSelfPopoverHtml(state, profileSpace = null) {
    const uid = String(state.user?.uid || "0");
    const isGuest = !uid || uid === "0";
    const name = isGuest ? "未登录" : (profileSpace?.username || state.user?.username || `UID ${uid}`);
    const groupTitle = isGuest ? "游客模式" : (profileSpace?.group?.grouptitle || "Stage1st 坛友");
    const statusLine = isGuest
      ? "游客浏览 · 点击下方登录账号"
      : `战斗力 ${profileSpace?.extcredits1 ?? "0"} 鹅 · 死鱼 ${profileSpace?.extcredits5 ?? "0"} · 积分 ${profileSpace?.credits ?? state.user?.credits ?? "0"}`;
    const unread = Number(state.user?.unreadCount || 0);
    const themeLabel = state.themeMode === "dark" ? "深色" : (state.themeMode === "light" ? "浅色" : "跟随系统");
    const accountsListHtml = renderSavedAccountsBlockHtml(state, name);

    return `
      <div class="s1w-self-head">
        ${renderAvatarHtml({ uid, name, avatarUrl: state.user?.avatar, size: "middle" })}
        <div style="min-width:0;flex:1;">
          <div class="s1w-self-name">${escapeHtml(name)}</div>
          <div class="s1w-self-org">
            <span>${escapeHtml(groupTitle)}</span>
            ${!isGuest ? ICONS.verified : ""}
          </div>
        </div>
      </div>
      <div class="s1w-self-status-pill" title="${escapeHtml(statusLine)}">${escapeHtml(statusLine)}</div>
      <div class="s1w-pop-divider"></div>
      ${accountsListHtml}
      <button type="button" class="s1w-pop-item" data-self-action="account-login">
        <span class="s1w-pop-item-left">${ICONS.switchUser}<span>${isGuest ? "登录账号" : "添加 / 切换账号"}</span></span>
      </button>
      ${!isGuest
        ? `<button type="button" class="s1w-pop-item" data-self-action="web-logout">
             <span class="s1w-pop-item-left">${ICONS.logout}<span>退出当前账号</span></span>
           </button>`
        : ""}
      <div class="s1w-pop-divider"></div>
      <button type="button" class="s1w-pop-item" data-self-action="fav">
        <span class="s1w-pop-item-left">${ICONS.fav}<span>收藏</span></span>
      </button>
      <button type="button" class="s1w-pop-item" data-self-action="notif">
        <span class="s1w-pop-item-left">${ICONS.notif}<span>提醒</span></span>
        ${unread > 0 ? `<span class="s1w-pop-badge">${unread > 99 ? "99+" : unread}</span>` : ""}
      </button>
      <button type="button" class="s1w-pop-item" data-self-action="history">
        <span class="s1w-pop-item-left">${ICONS.history}<span>浏览历史</span></span>
      </button>
      <div class="s1w-pop-divider"></div>
      <button type="button" class="s1w-pop-item" data-self-action="tags-manager">
        <span class="s1w-pop-item-left">${ICONS.tag}<span>用户标签管理</span></span>
        <span class="s1w-pop-item-sub">${ICONS.chevronRight}</span>
      </button>
      <button type="button" class="s1w-pop-item" data-self-action="app-login">
        <span class="s1w-pop-item-left">${ICONS.key}<span>App 接口登录</span></span>
        <span class="s1w-pop-item-sub">${state.appSid ? "已登录" : "未配置"}</span>
      </button>
      <button type="button" class="s1w-pop-item" data-self-action="watermark">
        <span class="s1w-pop-item-left">${ICONS.watermark}<span>背景水印</span></span>
        <span class="s1w-pop-item-sub">${state.watermark?.enabled ? "已开启" : "已关闭"}</span>
      </button>
      <button type="button" class="s1w-pop-item" data-self-action="cycle-theme">
        <span class="s1w-pop-item-left">${state.themeMode === "dark" ? ICONS.moon : ICONS.sun}<span>主题模式</span></span>
        <span class="s1w-pop-item-sub">${themeLabel}</span>
      </button>
      <div class="s1w-pop-divider"></div>
      ${isGuest
        ? `<a class="s1w-pop-item" href="/2b/member.php?mod=logging&action=login"><span class="s1w-pop-item-left">${ICONS.homeSpace}<span>前往原版登录页</span></span></a>`
        : `<a class="s1w-pop-item" href="/2b/space-uid-${escapeHtml(uid)}.html" target="_blank" rel="noopener noreferrer"><span class="s1w-pop-item-left">${ICONS.homeSpace}<span>打开个人主页</span></span></a>`}
      <button type="button" class="s1w-pop-item" data-self-action="native-view">
        <span class="s1w-pop-item-left">${ICONS.external}<span>切回原版页面</span></span>
      </button>
    `;
  }

  function renderUserCardPopoverHtml({
    uid = "0",
    username = "",
    isOp = false,
    space = null,
    tagRecord = null,
    filterActive = false,
    watermarkBg = "",
    loading = false
  }) {
    const sp = space || {};
    const displayName = sp.username || username || `UID ${uid}`;
    const groupTitle = sp.group?.grouptitle || (loading ? "资料加载中…" : "Stage1st 坛友");
    const tags = tagRecord?.tags || [];
    const note = tagRecord?.note || "";
    const tagSummary = [tags.join(" · "), note].filter(Boolean).join(" — ");

    return `
      ${watermarkBg ? `<div class="s1w-uc-wm" style="background-image:${watermarkBg}"></div>` : ""}
      <div class="s1w-uc-inner">
        <div class="s1w-uc-head">
          ${renderAvatarHtml({ uid, name: displayName, size: "middle" })}
          <div style="min-width:0;flex:1;">
            <div class="s1w-uc-title-row">
              <span class="s1w-uc-name">${escapeHtml(displayName)}</span>
              ${isOp ? `<span class="s1w-badge-op">楼主</span>` : ""}
            </div>
            <div class="s1w-uc-sub">${escapeHtml(groupTitle)}</div>
          </div>
        </div>
        <div class="s1w-pop-divider"></div>
        <div class="s1w-uc-quick-row">
          <button type="button" class="s1w-uc-quick-btn" data-uc-action="filter-author">
            ${ICONS.filterUser}<span>${filterActive ? "取消只看" : "只看Ta的发言"}</span>
          </button>
          <a class="s1w-uc-quick-btn" href="/2b/space-uid-${escapeHtml(uid)}.html" target="_blank" rel="noopener noreferrer">
            ${ICONS.homeSpace}<span>个人主页</span>
          </a>
        </div>
        <div class="s1w-pop-divider"></div>
        <button type="button" class="s1w-uc-tag-toggle" data-uc-action="toggle-tag-editor">
          <span>${tagSummary ? `备注：${escapeHtml(tagSummary)}` : "设置标签和备注"}</span>
          ${ICONS.chevronRight}
        </button>
        <div class="s1w-uc-tag-editor" hidden>
          <input type="text" class="s1w-input s1w-uc-tags-input" value="${escapeHtml(tags.join(" "))}" placeholder="标签（空格或逗号分隔）" />
          <input type="text" class="s1w-input s1w-uc-note-input" value="${escapeHtml(note)}" placeholder="备注说明（仅保存在本地）" />
          <button type="button" class="s1w-btn-primary" data-uc-action="save-tag" style="height:28px;">保存标签</button>
        </div>
        <div class="s1w-pop-divider"></div>
        <div class="s1w-uc-kv-list">
          <div class="s1w-uc-kv-row"><span class="s1w-uc-kv-label">UID</span><span class="s1w-uc-kv-val">${escapeHtml(uid)}</span></div>
          <div class="s1w-uc-kv-row"><span class="s1w-uc-kv-label">战斗力</span><span class="s1w-uc-kv-val">${escapeHtml(sp.extcredits1 ?? "-")} 鹅</span></div>
          <div class="s1w-uc-kv-row"><span class="s1w-uc-kv-label">死鱼</span><span class="s1w-uc-kv-val">${escapeHtml(sp.extcredits5 ?? "-")} 条</span></div>
          <div class="s1w-uc-kv-row"><span class="s1w-uc-kv-label">发帖</span><span class="s1w-uc-kv-val">${escapeHtml(sp.posts ?? "-")} 帖</span></div>
          <div class="s1w-uc-kv-row"><span class="s1w-uc-kv-label">积分</span><span class="s1w-uc-kv-val">${escapeHtml(sp.credits ?? "-")}</span></div>
          <div class="s1w-uc-kv-row"><span class="s1w-uc-kv-label">人品</span><span class="s1w-uc-kv-val">${escapeHtml(sp.extcredits4 ?? "-")} RP</span></div>
          <div class="s1w-uc-kv-row"><span class="s1w-uc-kv-label">在线</span><span class="s1w-uc-kv-val">${escapeHtml(sp.oltime ?? "-")}h</span></div>
        </div>
        <div class="s1w-uc-footer">
          <button type="button" class="s1w-btn-primary" data-uc-action="filter-author">${filterActive ? "查看全部" : "只看 Ta"}</button>
          <a class="s1w-btn-secondary" href="/2b/space-uid-${escapeHtml(uid)}.html" target="_blank" rel="noopener noreferrer">打开空间</a>
        </div>
      </div>
    `;
  }

  function buildWatermarkDataUri(text) {
    const clean = String(text || "").trim();
    if (!clean) return "";
    const svg = `<svg xmlns="http://www.w3.org/2000/svg" width="240" height="160"><text x="20" y="90" transform="rotate(-24 120 80)" fill="rgba(128,136,150,0.14)" font-size="15" font-family="sans-serif">${escapeHtml(clean)}</text></svg>`;
    return `url("data:image/svg+xml;charset=utf-8,${encodeURIComponent(svg)}")`;
  }

  function formatThreadLink(tid, page = 1) {
    return `https://stage1st.com${buildThreadUrl(tid, page)}`;
  }

  /* === src/app.js === */
  function startStage1stWeComApp() {
    if (typeof window === "undefined" || typeof document === "undefined") return;
    if (window.self !== window.top) return;

    const api = createStage1stApi();
    const isLiveHost = /(?:^|\.)(?:stage1st|saraba1st)\.com$/i.test(location.hostname);
    const initialHref = location.href;
    const initialRoute = parseStage1stRoute(location.pathname, location.search);

    const state = {
      viewMode: readStorage(STORAGE_KEYS.viewMode, "im") === "native" ? "native" : "im",
      themeMode: readStorage(STORAGE_KEYS.themeMode, "auto") || "auto",
      listWidth: clamp(Number(readStorage(STORAGE_KEYS.listWidth, LIST_WIDTH)) || LIST_WIDTH, LIST_MIN_WIDTH, LIST_MAX_WIDTH),
      hideUnreadBadge: readStorage(STORAGE_KEYS.hideUnreadBadge, "0") === "1",
      noImageMode: readStorage(STORAGE_KEYS.noImageMode, "0") === "1",
      hideChatAvatar: readStorage(STORAGE_KEYS.hideChatAvatar, "0") === "1",
      hideTail: readStorage(STORAGE_KEYS.hideTail, "1") !== "0",
      pinnedThreads: readPinnedThreads(),
      floatingTids: new Set(),
      pollConfig: readPollConfig(),
      savedAccounts: readSavedAccounts(),
      pendingAttachments: [],
      pendingNewRepliesCount: 0,
      lastBoardCheckTs: Math.floor(Date.now() / 1000),
      appSid: api.getAppSid(),
      watermark: safeJsonParse(readStorage(STORAGE_KEYS.watermark, '{"enabled":false,"text":"内部沟通 · 请勿外传"}'), {
        enabled: false,
        text: "内部沟通 · 请勿外传"
      }),
      user: { uid: "0", username: "", avatar: "", formhash: "", unreadCount: 0 },
      categories: [],
      boards: [...FALLBACK_BOARDS.forums],
      drawerOpen: false,
      navTab: "msg",
      activeFid: initialRoute.fid || readStorage(STORAGE_KEYS.lastFid, "6") || "6",
      listFid: initialRoute.fid || readStorage(STORAGE_KEYS.lastFid, "6") || "6",
      activeBoardName: "动漫论坛",
      listFilter: "all",
      activeTypeId: initialRoute.typeid || "",
      threadtypes: [],
      listPage: 1,
      hasMoreList: false,
      listItems: [],
      listLoading: false,
      listError: null,
      activeTid: initialRoute.tid || "",
      threadPage: initialRoute.page || 1,
      loadedMinPage: initialRoute.page || 1,
      loadedMaxPage: initialRoute.page || 1,
      chatPrepending: false,
      chatAppending: false,
      filterAuthorId: initialRoute.authorid ? String(initialRoute.authorid) : "",
      filterAuthorName: "",
      activeThread: null,
      posts: [],
      chatLoading: false,
      chatError: null,
      quoteReply: null,
      composerPreview: false,
      selfProfile: null,
      recordsOpen: false,
      recordsTab: "all",
      recordsQuery: "",
      recordsAuthor: "",
      recordsDate: "",
      smilies: [],
      activeSmileyGroup: "face2017",
      recentSmilies: safeJsonParse(readStorage(STORAGE_KEYS.recentSmilies, "[]"), []),
      lastReadMap: readLastReadMap(),
      historyItems: readHistory(),
      userTags: readUserTags()
    };

    let rootEl = null;
    let originalTitle = document.title || "Stage1st";
    let originalFaviconHref = "";
    let suppressPrevAutoLoadUntil = 0;

    async function copyTextToClipboard(text) {
      const value = String(text ?? "");
      if (!value) return false;
      try {
        if (navigator.clipboard?.writeText) {
          await navigator.clipboard.writeText(value);
          return true;
        }
      } catch {
        /* fallback below */
      }
      try {
        const ta = document.createElement("textarea");
        ta.value = value;
        ta.setAttribute("readonly", "");
        ta.style.position = "fixed";
        ta.style.opacity = "0";
        document.body.appendChild(ta);
        ta.select();
        const ok = document.execCommand("copy");
        ta.remove();
        return Boolean(ok);
      } catch {
        return false;
      }
    }
    const mql = window.matchMedia ? window.matchMedia("(prefers-color-scheme: dark)") : null;
    const WECOM_FAVICON =
      "data:image/svg+xml;charset=utf-8," +
      encodeURIComponent(
        '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 64 64">' +
          '<rect width="64" height="64" rx="14" fill="#267EF0"/>' +
          '<circle cx="24" cy="30" r="8" fill="#fff"/>' +
          '<circle cx="42" cy="34" r="7" fill="#D8EAFF"/>' +
          '<path d="M18 44c0-5 12-5 12 0" fill="#fff"/>' +
        "</svg>"
      );

    function isDarkActive() {
      if (state.themeMode === "dark") return true;
      if (state.themeMode === "light") return false;
      return Boolean(mql && mql.matches);
    }

    function syncFavicon() {
      const head = document.head || document.documentElement;
      if (!head) return;
      let custom = document.getElementById(FAVICON_ID);
      const nativeIcons = Array.from(document.querySelectorAll('link[rel*="icon"]:not(#' + FAVICON_ID + ")"));
      if (state.viewMode === "im") {
        if (!originalFaviconHref && nativeIcons[0]) {
          originalFaviconHref = nativeIcons[0].getAttribute("href") || "";
        }
        nativeIcons.forEach((el) => {
          el.dataset.s1OrigHref = el.getAttribute("href") || "";
          el.setAttribute("href", WECOM_FAVICON);
        });
        if (!custom) {
          custom = document.createElement("link");
          custom.id = FAVICON_ID;
          custom.rel = "icon";
          custom.type = "image/svg+xml";
          custom.href = WECOM_FAVICON;
          head.appendChild(custom);
        }
      } else {
        if (custom) custom.remove();
        nativeIcons.forEach((el) => {
          if (el.dataset.s1OrigHref) el.setAttribute("href", el.dataset.s1OrigHref);
        });
      }
    }

    function applyThemeAndLock() {
      const route = parseStage1stRoute(location.pathname, location.search);
      const allowShell = !route.skipLock || Boolean(window.__S1_WECOM_PREVIEW__);
      const shouldLock = state.viewMode === "im" && allowShell;
      const html = document.documentElement;
      html.classList.add(ROOT_CLASS);
      html.classList.toggle(LOCK_CLASS, shouldLock);
      html.classList.toggle("wecom-dark", isDarkActive());
      html.style.setProperty("--wc-list", `${state.listWidth}px`);
      syncFavicon();
      updatePageTitle();
    }

    function updatePageTitle() {
      if (state.viewMode !== "im") {
        document.title = originalTitle;
        return;
      }
      if (state.activeThread) {
        document.title = `${state.activeThread.subject} - 企业微信`;
      } else {
        document.title = "企业微信";
      }
    }

    function injectStyle() {
      let style = document.getElementById(STYLE_ID);
      const cssText = buildStyles();
      if (!style) {
        style = document.createElement("style");
        style.id = STYLE_ID;
      }
      if (style.textContent !== cssText) {
        style.textContent = cssText;
      }
      style.dataset.s1wVersion = typeof SCRIPT_VERSION !== "undefined" ? SCRIPT_VERSION : "";
      const host = document.head || document.documentElement;
      if (host && style.parentNode !== host) {
        host.appendChild(style);
      } else if (document.head && document.head.lastElementChild !== style) {
        // Ensure script styles remain after Discuz stylesheets loaded later in <head>.
        document.head.appendChild(style);
      }
    }

    function showToast(msg) {
      const wrap = rootEl?.querySelector(".s1w-toast-wrap");
      if (!wrap) return;
      const el = document.createElement("div");
      el.className = "s1w-toast";
      el.textContent = msg;
      wrap.appendChild(el);
      setTimeout(() => el.remove(), 2600);
    }

    function refreshHeaderAndWatermark() {
      if (!rootEl) return;
      const wm = rootEl.querySelector(".s1w-watermark");
      if (wm) {
        wm.style.backgroundImage = state.watermark?.enabled ? buildWatermarkDataUri(state.watermark.text) : "none";
      }
      const titleEl = rootEl.querySelector(".s1w-chat-title");
      const countEl = rootEl.querySelector(".s1w-chat-count");
      const subEl = rootEl.querySelector(".s1w-chat-sub");
      const opBtn = rootEl.querySelector('[data-action="only-op"]');
      if (opBtn) {
        const isFiltering = Boolean(state.filterAuthorId);
        const isOpFilter = isFiltering && state.filterAuthorId === state.activeThread?.authorid;
        opBtn.classList.toggle("active", isFiltering);
        opBtn.textContent = isFiltering && !isOpFilter
          ? `只看: ${state.filterAuthorName || state.filterAuthorId} ×`
          : "只看楼主";
      }

      if (!state.activeThread) {
        if (titleEl) titleEl.textContent = "Stage1st";
        if (countEl) countEl.textContent = "";
        if (subEl) subEl.textContent = "";
        return;
      }
      const t = state.activeThread;
      if (titleEl) {
        titleEl.textContent = t.subject;
        titleEl.title = t.subject;
      }
      if (countEl) {
        countEl.textContent = t.replies ? `(${t.replies})` : "";
      }
      if (subEl) {
        const board = state.boards.find((b) => String(b.fid) === String(t.fid));
        const bName = t.forumName || board?.name || "";
        subEl.textContent = [bName, t.author ? `楼主: ${t.author}` : "", t.views ? `${t.views} 查看` : ""].filter(Boolean).join(" · ");
      }
    }

    function updateComposerStatus() {
      if (!rootEl) return;
      const statusEl = rootEl.querySelector(".s1w-composer-status");
      const sendBtn = rootEl.querySelector('[data-action="send-reply"]');
      const textarea = rootEl.querySelector(".s1w-textarea");
      const quoteBar = rootEl.querySelector(".s1w-reply-preview");
      const quoteText = rootEl.querySelector(".s1w-reply-preview-text");

      if (quoteBar && quoteText) {
        if (state.quoteReply) {
          quoteBar.classList.add("visible");
          quoteText.textContent = `引用 #${state.quoteReply.floor} ${state.quoteReply.author}`;
        } else {
          quoteBar.classList.remove("visible");
          quoteText.textContent = "";
        }
      }

      const isLoggedIn = state.user?.uid && state.user.uid !== "0";
      if (!state.activeThread) {
        if (textarea) textarea.disabled = true;
        if (sendBtn) {
          sendBtn.disabled = true;
          sendBtn.textContent = "发送";
        }
        if (statusEl) statusEl.textContent = "请先选择帖子";
        return;
      }
      if (state.activeThread.closed) {
        if (textarea) textarea.disabled = true;
        if (sendBtn) {
          sendBtn.disabled = true;
          sendBtn.textContent = "已关闭";
        }
        if (statusEl) statusEl.textContent = "本主题已关闭回复";
        return;
      }
      if (!isLoggedIn) {
        if (textarea) {
          textarea.disabled = false;
          textarea.placeholder = "登录后即可发送回复";
        }
        if (sendBtn) {
          sendBtn.disabled = false;
          sendBtn.textContent = "登录";
        }
        if (statusEl) {
          statusEl.innerHTML = `<button type="button" class="s1w-composer-account-btn" data-action="composer-account-menu" title="登录 / 切换发帖账号">当前为游客浏览 · 点击登录/切换 ▾</button>`;
        }
        return;
      }
      if (textarea) {
        textarea.disabled = false;
        textarea.placeholder = "输入回复，Enter 发送，Shift+Enter 换行";
      }
      if (sendBtn) {
        sendBtn.disabled = false;
        sendBtn.textContent = "发送";
      }
      if (statusEl) {
        statusEl.innerHTML = `<button type="button" class="s1w-composer-account-btn" data-action="composer-account-menu" title="切换发帖账号">${escapeHtml(state.user.username)} ▾</button>`;
      }
    }

    function renderComposerPreview() {
      if (!rootEl) return;
      const ta = rootEl.querySelector(".s1w-textarea");
      const previewEl = rootEl.querySelector(".s1w-bbcode-preview");
      const btn = rootEl.querySelector('[data-composer-tool="preview"]');
      if (!ta || !previewEl) return;
      const active = Boolean(state.composerPreview);
      if (btn) btn.classList.toggle("active", active);
      if (!active) {
        previewEl.setAttribute("hidden", "");
        ta.removeAttribute("hidden");
        return;
      }
      previewEl.innerHTML = renderBbcodePreviewHtml(ta.value, {
        smilies: [
          ...(Array.isArray(state.smilies) ? state.smilies : []),
          ...(state.recentSmilies?.length ? [{ items: state.recentSmilies }] : [])
        ],
        attachments: state.pendingAttachments || []
      });
      ta.setAttribute("hidden", "");
      previewEl.removeAttribute("hidden");
    }

    function updateUnreadToggleButton() {
      const btn = rootEl?.querySelector('[data-action="toggle-hide-unread"]');
      if (!btn) return;
      btn.classList.toggle("active", state.hideUnreadBadge);
      btn.title = state.hideUnreadBadge ? "显示未读数字" : "隐藏未读数字";
      btn.innerHTML = state.hideUnreadBadge ? ICONS.eyeOff : ICONS.eye;
    }

    function updateNewMsgPill() {
      const pill = rootEl?.querySelector(".s1w-new-msg-pill");
      if (!pill) return;
      if (state.pendingNewRepliesCount > 0 && state.activeThread) {
        pill.textContent = `↓ ${state.pendingNewRepliesCount} 条新消息`;
        pill.removeAttribute("hidden");
      } else {
        pill.setAttribute("hidden", "");
      }
    }

    function renderAttachBar() {
      const bar = rootEl?.querySelector(".s1w-attach-bar");
      if (!bar) return;
      if (!state.pendingAttachments.length) {
        bar.setAttribute("hidden", "");
        bar.innerHTML = "";
        return;
      }
      bar.removeAttribute("hidden");
      bar.innerHTML = state.pendingAttachments
        .map((att) => `
          <span class="s1w-attach-chip">
            <span class="s1w-attach-name" title="${escapeHtml(att.filename)}">${escapeHtml(att.filename)}</span>
            <button type="button" data-insert-aid="${escapeHtml(att.aid)}" title="插入到正文">插入</button>
            <button type="button" data-remove-aid="${escapeHtml(att.aid)}" title="移除">×</button>
          </span>
        `)
        .join("");
    }

    function renderAllPanels() {
      if (!rootEl) return;
      // Update rail active & avatar
      const meBtn = rootEl.querySelector(".s1w-rail-me");
      if (meBtn) {
        const unread = Number(state.user?.unreadCount || 0);
        const unreadText = unread > 99 ? "99+" : (unread > 0 ? String(unread) : "");
        meBtn.title = state.user?.username || "未登录";
        meBtn.innerHTML = `
          ${renderAvatarHtml({ uid: state.user?.uid, name: state.user?.username || "S", avatarUrl: state.user?.avatar })}
          <span class="s1w-rail-badge" style="display:${unreadText ? "inline-block" : "none"}">${escapeHtml(unreadText)}</span>
        `;
      }
      rootEl.querySelectorAll("[data-rail-tab]").forEach((btn) => {
        const k = btn.getAttribute("data-rail-tab");
        btn.classList.toggle("active", k === "boards" ? state.drawerOpen : k === state.navTab);
      });
      const drawer = rootEl.querySelector(".s1w-drawer");
      if (drawer) {
        drawer.classList.toggle("open", state.drawerOpen);
        const body = drawer.querySelector(".s1w-drawer-body");
        if (body) body.innerHTML = renderDrawerHtml(state.categories, state.listFid || state.activeFid);
      }

      const bNameEl = rootEl.querySelector(".s1w-list-board-name");
      if (bNameEl) {
        const titles = { fav: "我的收藏", notif: "站内提醒", history: "浏览历史", search: "全站搜索" };
        bNameEl.textContent = titles[state.navTab] || state.activeBoardName || "帖子列表";
      }
      updateUnreadToggleButton();
      const noImgBtn = rootEl.querySelector('[data-action="toggle-no-image"]');
      if (noImgBtn) noImgBtn.classList.toggle("active", state.noImageMode);

      const filterRow = rootEl.querySelector(".s1w-filter-row");
      if (filterRow) filterRow.innerHTML = renderFilterBarHtml(state);
      const listScroll = rootEl.querySelector(".s1w-list-scroll");
      if (listScroll) listScroll.innerHTML = renderThreadListHtml(state);

      refreshHeaderAndWatermark();
      const chatScroll = rootEl.querySelector(".s1w-chat-scroll");
      if (chatScroll) chatScroll.innerHTML = renderChatMessagesHtml(state);
      updateNewMsgPill();
      renderAttachBar();
      updateComposerStatus();
      updatePageTitle();
    }

    function renderListOnly({ preserveScroll = false } = {}) {
      if (!rootEl) return;
      const bNameEl = rootEl.querySelector(".s1w-list-board-name");
      if (bNameEl) {
        const titles = { fav: "我的收藏", notif: "站内提醒", history: "浏览历史", search: "全站搜索" };
        bNameEl.textContent = titles[state.navTab] || state.activeBoardName || "帖子列表";
      }
      const filterRow = rootEl.querySelector(".s1w-filter-row");
      if (filterRow) filterRow.innerHTML = renderFilterBarHtml(state);
      const listScroll = rootEl.querySelector(".s1w-list-scroll");
      if (listScroll) {
        const prevTop = preserveScroll ? listScroll.scrollTop : 0;
        listScroll.innerHTML = renderThreadListHtml(state);
        if (preserveScroll) listScroll.scrollTop = prevTop;
      }
    }

    function renderChatOnly({ preserveScroll = false } = {}) {
      if (!rootEl) return;
      refreshHeaderAndWatermark();
      const chatScroll = rootEl.querySelector(".s1w-chat-scroll");
      if (chatScroll) {
        const prevTop = preserveScroll ? chatScroll.scrollTop : 0;
        chatScroll.innerHTML = renderChatMessagesHtml(state);
        chatScroll.scrollTop = preserveScroll ? prevTop : 0;
      }
      updateNewMsgPill();
      renderAttachBar();
      updateComposerStatus();
      updatePageTitle();
      renderRecordsPanelIfOpen();
    }

    function renderRecordsPanelIfOpen() {
      if (!rootEl) return;
      const panel = rootEl.querySelector(".s1w-records-panel");
      const btn = rootEl.querySelector('[data-composer-tool="chat-records"]');
      if (btn) btn.classList.toggle("active", state.recordsOpen);
      if (!panel) return;
      if (!state.recordsOpen) {
        panel.setAttribute("hidden", "");
        return;
      }
      const prevScroll = panel.querySelector(".s1w-records-body")?.scrollTop || 0;
      const activeEl = document.activeElement;
      const wasTypingSearch = Boolean(activeEl && activeEl.classList?.contains("s1w-records-search-input"));
      const selStart = wasTypingSearch ? activeEl.selectionStart : null;
      const selEnd = wasTypingSearch ? activeEl.selectionEnd : null;

      panel.removeAttribute("hidden");
      panel.innerHTML = renderRecordsPanelHtml(state);

      const newBody = panel.querySelector(".s1w-records-body");
      if (newBody && prevScroll) newBody.scrollTop = prevScroll;
      if (wasTypingSearch) {
        const nextInput = panel.querySelector(".s1w-records-search-input");
        if (nextInput) {
          nextInput.focus();
          if (selStart !== null && selEnd !== null) nextInput.setSelectionRange(selStart, selEnd);
        }
      }
    }

    function syncAppLoginState() {
      state.appSid = api.getAppSid();
      const badge = rootEl?.querySelector("[data-app-login-state]");
      if (badge) badge.textContent = state.appSid ? "已登录" : "未配置";
    }

    function switchToNativeView() {
      state.viewMode = "native";
      writeStorage(STORAGE_KEYS.viewMode, "native");
      applyThemeAndLock();
      if (isLiveHost && location.href !== initialHref) {
        location.reload();
      }
    }

    function captureReadingProgress() {
      if (!rootEl || !state.activeTid || !state.activeThread || state.chatLoading || !state.posts.length) return;
      const sc = rootEl.querySelector(".s1w-chat-scroll");
      if (!sc) return;
      const rows = sc.querySelectorAll(".s1w-msg-row[data-pid]");
      if (!rows.length) return;
      const viewTop = sc.getBoundingClientRect().top + 8;
      let target = rows[rows.length - 1];
      for (const row of rows) {
        if (row.getBoundingClientRect().bottom > viewTop) {
          target = row;
          break;
        }
      }
      const pid = target.getAttribute("data-pid") || "";
      const floor = Number(target.getAttribute("data-floor") || 0);
      const page = Math.max(1, Number(target.getAttribute("data-page") || state.threadPage || 1));
      state.threadPage = page;
      const recPageInput = rootEl.querySelector(".s1w-rec-page-input");
      if (recPageInput && document.activeElement !== recPageInput) {
        recPageInput.value = String(page);
      }
      saveLastRead(state.activeTid, {
        replies: state.activeThread.replies,
        page,
        pid,
        floor
      });
      state.lastReadMap = readLastReadMap();
    }

    const scheduleCaptureProgress = debounce(captureReadingProgress, 250);

    function sortBoardThreads(items, fid = state.activeFid, filter = state.listFilter) {
      const raw = Array.isArray(items) ? items : [];
      const byTid = new Map(raw.map((x) => [String(x.tid), x]));
      const pinnedEntries = Object.values(state.pinnedThreads || {})
        .filter((p) => p?.tid && (!fid || !p.fid || String(p.fid) === String(fid) || byTid.has(String(p.tid))))
        .sort((a, b) => Number(b.pinnedAt || 0) - Number(a.pinnedAt || 0));

      const pinnedTids = new Set();
      const pinnedRows = [];
      for (const p of pinnedEntries) {
        const tid = String(p.tid);
        pinnedTids.add(tid);
        const live = byTid.get(tid);
        if (live) {
          pinnedRows.push(live);
        } else if (filter === "all" && !state.activeTypeId) {
          pinnedRows.push({
            tid,
            fid: String(p.fid || fid || ""),
            subject: p.subject || "(已置顶帖子)",
            author: p.author || "",
            authorid: String(p.authorid || "0"),
            avatarUrl: "",
            replies: 0,
            lastpostTs: 0,
            datelineTs: 0,
            displayorder: 0,
            previewText: p.author || ""
          });
        }
      }

      const regular = raw.filter((x) => !pinnedTids.has(String(x.tid)));
      if (filter === "all" || filter === "latest") {
        regular.sort((a, b) => {
          const keyA = filter === "latest" ? Number(a.datelineTs || a.lastpostTs || 0) : Number(a.lastpostTs || a.datelineTs || 0);
          const keyB = filter === "latest" ? Number(b.datelineTs || b.lastpostTs || 0) : Number(b.lastpostTs || b.datelineTs || 0);
          return keyB - keyA;
        });
      }
      return [...pinnedRows, ...regular];
    }

    function togglePinForTid(tid) {
      const t = String(tid || "").trim();
      if (!t) return;
      const row = state.listItems.find((x) => String(x.tid) === t) || (state.activeThread?.tid === t ? state.activeThread : null) || {};
      const wasPinned = Boolean(state.pinnedThreads?.[t]);
      const listFid = state.listFid || state.activeFid;
      state.pinnedThreads = togglePinnedThread(t, {
        fid: row.fid || listFid,
        subject: row.subject || "",
        author: row.author || "",
        authorid: row.authorid || "0"
      });
      if (state.navTab === "msg") {
        state.listItems = sortBoardThreads(state.listItems, listFid, state.listFilter);
      }
      renderListOnly({ preserveScroll: true });
      showToast(wasPinned ? "已取消置顶" : "已置顶帖子");
    }

    function animateBoardListReorder(prevTopMap, risenTids) {
      const listScroll = rootEl?.querySelector(".s1w-list-scroll");
      if (!listScroll) return;
      const items = Array.from(listScroll.querySelectorAll(".s1w-conv-item[data-tid]"));
      const moved = [];
      for (const el of items) {
        const tid = el.getAttribute("data-tid");
        const prevTop = prevTopMap.get(tid);
        if (prevTop === undefined) continue;
        const nextTop = el.getBoundingClientRect().top;
        const dy = prevTop - nextTop;
        if (Math.abs(dy) > 2 || risenTids.has(tid)) {
          el.style.transition = "none";
          el.style.transform = `translateY(${dy}px)`;
          moved.push(el);
        }
      }
      if (!moved.length) return;
      void listScroll.offsetHeight;
      requestAnimationFrame(() => {
        for (const el of moved) {
          el.style.transition = "transform 320ms cubic-bezier(0.22, 1, 0.36, 1)";
          el.style.transform = "translateY(0)";
        }
        setTimeout(() => {
          for (const el of moved) {
            el.style.transition = "";
            el.style.transform = "";
          }
        }, 360);
      });
    }

    let pollingBoard = false;
    async function pollBoardUpdates() {
      if (pollingBoard || state.viewMode !== "im" || document.visibilityState !== "visible") return;
      if (state.navTab !== "msg" || state.listFilter !== "all" || state.listLoading) return;
      const targetFid = String(state.listFid || state.activeFid || "");
      if (!targetFid || state.pollConfig.boardSec <= 0) return;

      pollingBoard = true;
      const sinceTs = state.lastBoardCheckTs || Math.floor(Date.now() / 1000) - state.pollConfig.boardSec;
      try {
        const newCount = await api.checkForumNew(targetFid, sinceTs);
        state.lastBoardCheckTs = Math.floor(Date.now() / 1000);
        if (!newCount || String(state.listFid || state.activeFid || "") !== targetFid || state.navTab !== "msg") return;

        const listScroll = rootEl?.querySelector(".s1w-list-scroll");
        const prevTopMap = new Map();
        if (listScroll) {
          listScroll.querySelectorAll(".s1w-conv-item[data-tid]").forEach((el) => {
            prevTopMap.set(el.getAttribute("data-tid"), el.getBoundingClientRect().top);
          });
        }
        const prevByTid = new Map(state.listItems.map((x) => [String(x.tid), x]));

        const res = await api.getForumDisplay(targetFid, {
          page: 1,
          typeid: state.activeTypeId || "",
          force: true
        });
        if (String(state.listFid || state.activeFid || "") !== targetFid || state.navTab !== "msg" || res.errorMessage) return;

        const seen = new Set();
        const merged = [...res.threads, ...state.listItems].filter((x) => {
          if (!x?.tid || seen.has(x.tid)) return false;
          if (x.fid && String(x.fid) !== targetFid) return false;
          seen.add(x.tid);
          return true;
        });
        const risenTids = new Set();
        for (const item of res.threads) {
          if (item.fid && String(item.fid) !== targetFid) continue;
          const prev = prevByTid.get(String(item.tid));
          if (!prev || Number(item.replies || 0) > Number(prev.replies || 0) || Number(item.lastpostTs || 0) > Number(prev.lastpostTs || 0)) {
            risenTids.add(String(item.tid));
          }
        }

        state.listItems = sortBoardThreads(merged, targetFid, state.listFilter);
        state.floatingTids = risenTids;
        renderListOnly({ preserveScroll: true });
        animateBoardListReorder(prevTopMap, risenTids);
        setTimeout(() => {
          state.floatingTids = new Set();
        }, 1500);
      } catch {
        /* ignore */
      } finally {
        pollingBoard = false;
      }
    }

    async function loadBoardList(fid, { append = false, force = false } = {}) {
      const requestedFid = String(fid);
      state.navTab = "msg";
      state.activeFid = requestedFid;
      state.listFid = requestedFid;
      writeStorage(STORAGE_KEYS.lastFid, state.listFid);
      const boardMeta = state.boards.find((b) => String(b.fid) === state.listFid);
      if (boardMeta) state.activeBoardName = boardMeta.name;
      if (!append) {
        state.listPage = 1;
        state.listItems = [];
        state.lastBoardCheckTs = Math.floor(Date.now() / 1000);
      }
      state.listLoading = true;
      state.listError = null;
      renderListOnly({ preserveScroll: append });

      try {
        let res;
        if (state.listFilter === "hot") {
          res = await api.getHotThreads(state.listPage, { force });
          if (state.navTab !== "msg" || state.listFid !== requestedFid) return;
          state.activeBoardName = "全站热门";
        } else {
          const opts = { page: state.listPage, force };
          if (state.activeTypeId) opts.typeid = state.activeTypeId;
          if (state.listFilter === "latest") opts.orderby = "dateline";
          if (state.listFilter === "digest") opts.filter = "digest";
          res = await api.getForumDisplay(requestedFid, opts);
          if (state.navTab !== "msg" || state.listFid !== requestedFid) return;
          if (res.forumName) state.activeBoardName = res.forumName;
        }
        if (res.formhash && !state.user.formhash) state.user.formhash = res.formhash;
        state.threadtypes = res.threadtypes || [];
        if (res.errorMessage) {
          state.listError = res.errorMessage;
          state.hasMoreList = false;
        } else {
          const merged = append ? [...state.listItems, ...res.threads] : res.threads;
          const seen = new Set();
          const deduped = merged.filter((x) => {
            if (seen.has(x.tid)) return false;
            seen.add(x.tid);
            return true;
          });
          state.listItems = sortBoardThreads(deduped, requestedFid, state.listFilter);
          state.hasMoreList = res.threads.length >= Math.min(20, res.tpp || 50);
        }
      } catch (err) {
        if (state.listFid === requestedFid) {
          state.listError = `加载失败: ${err.message || "网络异常"}`;
          state.hasMoreList = false;
        }
      } finally {
        if (state.listFid === requestedFid) {
          state.listLoading = false;
          renderListOnly({ preserveScroll: append });
        }
      }
    }

    async function loadSpecialTab(tab) {
      state.navTab = tab;
      state.drawerOpen = false;
      state.listError = null;
      state.hasMoreList = false;

      if (tab === "history") {
        state.historyItems = readHistory();
        state.listItems = state.historyItems.map((h) => ({
          tid: h.tid,
          fid: h.fid,
          subject: h.subject,
          author: h.author,
          authorid: h.authorid,
          avatarUrl: "",
          replies: h.replies,
          lastpostTs: Math.floor((h.visitedAt || 0) / 1000),
          previewText: h.boardName || h.author || ""
        }));
        renderAllPanels();
        return;
      }

      state.listLoading = true;
      state.listItems = [];
      renderAllPanels();

      try {
        if (tab === "fav") {
          const favs = await api.getFavorites(1);
          state.listItems = favs.map((f) => ({
            tid: f.tid,
            fid: "",
            subject: f.subject,
            author: f.author,
            authorid: "0",
            replies: f.replies || 0,
            timeText: f.timeText,
            previewText: f.author || "已收藏主题"
          }));
        } else if (tab === "notif") {
          const notices = await api.getNotices(1);
          state.listItems = notices.map((n) => ({
            tid: n.tid,
            pid: n.pid,
            subject: n.author || "系统提醒",
            author: n.author,
            authorid: n.authorid,
            timeText: n.timeText,
            previewText: n.summary
          }));
        }
      } catch (err) {
        state.listError = state.user.uid === "0" ? "请先登录查看" : `加载失败: ${err.message}`;
      } finally {
        state.listLoading = false;
        renderListOnly();
      }
    }

    function enrichThreadPageInBackground(curTid, targetPage) {
      if (typeof api.getThreadHtmlEnrichment !== "function") return;
      api.getThreadHtmlEnrichment(curTid, targetPage).then((htmlData) => {
        if (state.activeTid !== curTid) return;
        let changed = false;
        if (targetPage === 1 && state.activeThread && htmlData.poll) {
          if (!state.activeThread.poll) {
            state.activeThread.poll = htmlData.poll;
            changed = true;
          } else {
            const curPoll = state.activeThread.poll;
            const nextPoll = { ...curPoll };
            if (!curPoll.allowvote && htmlData.poll.allowvote) {
              nextPoll.allowvote = true;
              changed = true;
            }
            if (!nextPoll.allowvote && htmlData.poll.statusText && nextPoll.statusText !== htmlData.poll.statusText) {
              nextPoll.statusText = htmlData.poll.statusText;
              changed = true;
            }
            if (changed) state.activeThread.poll = nextPoll;
          }
        }
        for (const post of state.posts) {
          if (htmlData.ratelogsByPid?.[post.pid] && !post.ratelog) {
            post.ratelog = htmlData.ratelogsByPid[post.pid];
            changed = true;
          }
          if (htmlData.attachmentsByPid?.[post.pid]?.length && !post.attachments?.length) {
            post.attachments = htmlData.attachmentsByPid[post.pid];
            changed = true;
          }
        }
        if (changed) renderChatOnly({ preserveScroll: true });
      }).catch(() => {});
    }

    function prefetchAdjacentPages(tid) {
      const t = String(tid || "");
      if (!t || state.activeTid !== t || !state.activeThread) return;
      const totalPages = Math.max(1, Number(state.activeThread.totalPages || 1));
      const authorid = state.filterAuthorId || "";
      if (state.loadedMinPage > 1) {
        api.getViewThread(t, { page: state.loadedMinPage - 1, authorid }).catch(() => {});
      }
      if (state.loadedMaxPage < totalPages) {
        api.getViewThread(t, { page: state.loadedMaxPage + 1, authorid }).catch(() => {});
      }
    }

    async function recoverInvisibleContent(tid, page, posts, errorMessage = null) {
      state.appSid = api.getAppSid();
      if (!state.appSid) return null;

      if (errorMessage && String(errorMessage).includes(REVIEW_PENDING_TEXT)) {
        try {
          const [info, pageData] = await Promise.all([
            api.appGetThread(tid, state.appSid),
            api.appGetThreadPage(tid, page, state.appSid)
          ]);
          return {
            thread: normalizeAppThreadMeta(info, tid),
            posts: normalizeAppThreadPosts(pageData?.list || [], tid, page),
            errorMessage: null
          };
        } catch {
          syncAppLoginState();
          return null;
        }
      }

      const hasBlocked = (posts || []).some(
        (p) => String(p.bodyHtml || "").includes(BLOCKED_REPLY_TEXT) || String(p.rawHtml || "").includes(BLOCKED_REPLY_TEXT)
      );
      if (!hasBlocked) return null;

      try {
        const pageData = await api.appGetThreadPage(tid, page, state.appSid);
        const appMap = new Map((pageData?.list || []).map((item) => [String(item.pid), item]));
        let changed = false;
        const updated = posts.map((p) => {
          const isBlocked = String(p.bodyHtml || "").includes(BLOCKED_REPLY_TEXT) || String(p.rawHtml || "").includes(BLOCKED_REPLY_TEXT);
          if (!isBlocked) return p;
          const match = appMap.get(String(p.pid));
          if (!match || !match.message) return p;
          const parsed = parsePostMessageHtml(match.message);
          changed = true;
          return {
            ...p,
            quote: parsed.quote,
            editedInfo: parsed.editedInfo || "",
            bodyHtml: parsed.bodyHtml,
            isBannedRecovered: true,
            recoveredLabel: ""
          };
        });
        return changed ? { posts: updated } : null;
      } catch {
        syncAppLoginState();
        return null;
      }
    }

    function syncThreadListRowPreview(tid, latestPost) {
      if (!tid || !latestPost) return;
      const listRow = state.listItems.find((x) => String(x.tid) === String(tid));
      if (!listRow) return;
      const snippet =
        formatPreviewSnippet(latestPost.bodyHtml || latestPost.rawHtml || "") ||
        (latestPost.attachments?.length ? "[图片]" : "");
      if (snippet) listRow.previewText = snippet;
      if (latestPost.datelineTs) listRow.lastpostTs = latestPost.datelineTs;
      else listRow.lastpostTs = Math.floor(Date.now() / 1000);
      if (latestPost.author) listRow.lastReplyAuthor = latestPost.author;
    }

    async function loadThread(tid, page = 1, { pushUrl = true, force = false, highlightPid = "", restorePid = "", highlightFloor = 0, scrollToBottom = false } = {}) {
      if (!tid) return;
      if (state.activeTid && !state.chatLoading) {
        captureReadingProgress();
      }
      const nextTid = String(tid);
      if (nextTid !== String(state.activeTid)) {
        state.filterAuthorId = "";
        state.filterAuthorName = "";
        state.composerPreview = false;
        renderComposerPreview();
      }
      state.activeTid = nextTid;
      state.threadPage = Math.max(1, Number(page) || 1);
      state.loadedMinPage = state.threadPage;
      state.loadedMaxPage = state.threadPage;
      state.chatPrepending = false;
      state.chatAppending = false;
      state.pendingNewRepliesCount = 0;
      state.quoteReply = null;
      state.chatLoading = true;
      state.chatError = null;
      renderChatOnly();

      if (pushUrl && isLiveHost) {
        try {
          const nextUrl = buildThreadUrl(state.activeTid, state.threadPage);
          if (location.pathname !== nextUrl) history.pushState({ tid: state.activeTid, page: state.threadPage }, "", nextUrl);
        } catch {
          /* ignore */
        }
      }

      try {
        let res = await api.getViewThread(state.activeTid, {
          page: state.threadPage,
          authorid: state.filterAuthorId || "",
          force
        });
        if (res.formhash && !state.user.formhash) state.user.formhash = res.formhash;

        if (res.errorMessage) {
          const recoveredThread = await recoverInvisibleContent(state.activeTid, state.threadPage, [], res.errorMessage);
          if (recoveredThread) {
            res = { ...res, ...recoveredThread };
          }
        }

        if (res.errorMessage) {
          state.chatError = res.errorMessage;
          state.activeThread = res.thread || null;
          state.posts = [];
        } else {
          state.activeThread = res.thread;
          state.posts = (res.posts || []).map((p) => ({ ...p, page: state.threadPage }));
          const recoveredPosts = await recoverInvisibleContent(state.activeTid, state.threadPage, state.posts);
          if (recoveredPosts?.posts) {
            state.posts = recoveredPosts.posts;
          }
          if (res.thread?.fid && (!state.activeFid || (!state.listItems.length && !state.listFid))) {
            state.activeFid = String(res.thread.fid);
          }
          saveLastRead(state.activeTid, {
            replies: res.thread.replies,
            page: state.threadPage,
            ...(restorePid ? { pid: restorePid } : {})
          });
          state.lastReadMap = readLastReadMap();
          const b = state.boards.find((x) => String(x.fid) === String(res.thread.fid));
          recordHistory({
            tid: state.activeTid,
            fid: res.thread.fid,
            boardName: res.thread.forumName || b?.name || "",
            subject: res.thread.subject,
            author: res.thread.author,
            authorid: res.thread.authorid,
            replies: res.thread.replies
          });
          state.historyItems = readHistory();
          enrichThreadPageInBackground(state.activeTid, state.threadPage);

          // Preload adjacent pages and the last page gently so jumping/scrolling feels instant
          const totalPages = Math.max(1, Number(res.thread?.totalPages || 1));
          if (state.threadPage >= totalPages && state.posts.length) {
            syncThreadListRowPreview(state.activeTid, state.posts[state.posts.length - 1]);
          }
          if (totalPages > 1 && state.threadPage < totalPages && !state.filterAuthorId) {
            setTimeout(() => {
              if (state.activeTid === nextTid) {
                api.getViewThread(nextTid, { page: totalPages }).catch(() => {});
              }
            }, 150);
          }
          setTimeout(() => prefetchAdjacentPages(nextTid), 120);
        }
      } catch (err) {
        state.chatError = `加载帖子失败: ${err.message || "网络异常"}`;
      } finally {
        state.chatLoading = false;
        suppressPrevAutoLoadUntil = Date.now() + 350;
        renderChatOnly();
        renderListOnly({ preserveScroll: true });
        const chatScroll = rootEl?.querySelector(".s1w-chat-scroll");
        let targetPid = highlightPid || restorePid;
        if (!targetPid && highlightFloor > 0 && state.posts.length) {
          const found = state.posts.find((p) => Number(p.floor) >= Number(highlightFloor)) || state.posts[0];
          targetPid = found?.pid || "";
        }
        if (targetPid) {
          const targetEl = rootEl?.querySelector(`#s1w-post-${CSS.escape(String(targetPid))}`);
          if (targetEl && chatScroll) {
            chatScroll.scrollTop = Math.max(0, targetEl.offsetTop - 12);
            targetEl.classList.add("s1w-msg-highlight");
            setTimeout(() => targetEl.classList.remove("s1w-msg-highlight"), 2000);
          }
        } else if (scrollToBottom && chatScroll && state.posts.length) {
          chatScroll.scrollTop = chatScroll.scrollHeight;
          const lastPid = state.posts[state.posts.length - 1]?.pid;
          const lastEl = lastPid ? rootEl?.querySelector(`#s1w-post-${CSS.escape(String(lastPid))}`) : null;
          if (lastEl) {
            lastEl.classList.add("s1w-msg-highlight");
            setTimeout(() => lastEl.classList.remove("s1w-msg-highlight"), 2000);
          }
        }
        if (scrollToBottom && state.loadedMinPage > 1 && chatScroll && chatScroll.scrollHeight <= chatScroll.clientHeight + 40) {
          loadPrevThreadPage({ keepBottom: true });
        }
      }
    }

    async function loadNextThreadPage() {
      if (state.chatLoading || state.chatAppending || state.chatPrepending || !state.activeThread) return;
      const totalPages = Math.max(1, Number(state.activeThread.totalPages || 1));
      if (state.loadedMaxPage >= totalPages) return;
      const curTid = state.activeTid;
      const nextPage = state.loadedMaxPage + 1;
      state.chatAppending = true;
      renderChatOnly({ preserveScroll: true });

      try {
        const res = await api.getViewThread(curTid, {
          page: nextPage,
          authorid: state.filterAuthorId || ""
        });
        if (state.activeTid !== curTid) return;
        if (res.thread?.totalPages) {
          state.activeThread.totalPages = Math.max(state.activeThread.totalPages || 1, res.thread.totalPages);
        }
        const seen = new Set(state.posts.map((p) => String(p.pid)));
        let incoming = (res.posts || [])
          .filter((p) => !seen.has(String(p.pid)))
          .map((p) => ({ ...p, page: nextPage }));
        const recovered = await recoverInvisibleContent(curTid, nextPage, incoming);
        if (recovered?.posts) incoming = recovered.posts;
        state.posts = [...state.posts, ...incoming];
        state.loadedMaxPage = nextPage;
        state.threadPage = nextPage;
        enrichThreadPageInBackground(curTid, nextPage);
      } catch (err) {
        showToast(`加载第 ${nextPage} 页失败: ${err.message}`);
      } finally {
        state.chatAppending = false;
        if (state.activeTid === curTid) {
          renderChatOnly({ preserveScroll: true });
          setTimeout(() => prefetchAdjacentPages(curTid), 80);
        }
      }
    }

    async function loadPrevThreadPage({ keepBottom = false } = {}) {
      if (state.chatLoading || state.chatAppending || state.chatPrepending || !state.activeThread || state.loadedMinPage <= 1) return;
      const curTid = state.activeTid;
      const prevPage = state.loadedMinPage - 1;
      state.chatPrepending = true;
      renderChatOnly({ preserveScroll: true });

      try {
        const res = await api.getViewThread(curTid, {
          page: prevPage,
          authorid: state.filterAuthorId || ""
        });
        if (state.activeTid !== curTid) return;
        const seen = new Set(state.posts.map((p) => String(p.pid)));
        let incoming = (res.posts || [])
          .filter((p) => !seen.has(String(p.pid)))
          .map((p) => ({ ...p, page: prevPage }));
        const recovered = await recoverInvisibleContent(curTid, prevPage, incoming);
        if (recovered?.posts) incoming = recovered.posts;
        if (prevPage === 1 && res.thread?.poll && !state.activeThread.poll) {
          state.activeThread.poll = res.thread.poll;
        }
        const chatScroll = rootEl?.querySelector(".s1w-chat-scroll");
        const prevHeight = chatScroll ? chatScroll.scrollHeight : 0;
        const prevTop = chatScroll ? chatScroll.scrollTop : 0;
        state.posts = [...incoming, ...state.posts];
        state.loadedMinPage = prevPage;
        state.threadPage = prevPage;
        state.chatPrepending = false;
        renderChatOnly();
        if (chatScroll) {
          chatScroll.scrollTop = keepBottom
            ? chatScroll.scrollHeight
            : prevTop + Math.max(0, chatScroll.scrollHeight - prevHeight);
        }
        enrichThreadPageInBackground(curTid, prevPage);
        suppressPrevAutoLoadUntil = Date.now() + 250;
        setTimeout(() => prefetchAdjacentPages(curTid), 80);
      } catch (err) {
        state.chatPrepending = false;
        if (state.activeTid === curTid) renderChatOnly({ preserveScroll: true });
        showToast(`加载第 ${prevPage} 页失败: ${err.message}`);
      } finally {
        state.chatPrepending = false;
      }
    }

    async function submitPollVote(btn) {
      if (!state.activeThread) return;
      const card = btn?.closest(".s1w-poll-card") || rootEl?.querySelector(".s1w-poll-card");
      if (!card) return;
      const pollanswers = Array.from(card.querySelectorAll(".s1w-poll-input:checked"))
        .map((el) => el.value)
        .filter(Boolean);
      if (!pollanswers.length) {
        showToast("请先选择投票选项");
        return;
      }
      if (!state.user.formhash) {
        showToast("请先登录后参与投票");
        return;
      }
      if (btn) btn.disabled = true;
      try {
        const res = await api.votePoll({
          fid: state.activeThread.fid,
          tid: state.activeThread.tid,
          pollanswers,
          formhash: state.user.formhash
        });
        showToast(res.message || "投票成功");
        await loadThread(state.activeThread.tid, 1, { force: true, pushUrl: false });
      } catch (err) {
        showToast(err.message || "投票失败");
      } finally {
        if (btn && btn.isConnected) btn.disabled = false;
      }
    }

    function jumpToFirstFloor() {
      if (!state.activeTid) return;
      if (state.loadedMinPage === 1 && state.posts.length) {
        const chatScroll = rootEl?.querySelector(".s1w-chat-scroll");
        if (chatScroll) chatScroll.scrollTo({ top: 0, behavior: "smooth" });
        const firstPid = state.posts[0]?.pid;
        const firstEl = firstPid ? rootEl?.querySelector(`#s1w-post-${CSS.escape(String(firstPid))}`) : null;
        if (firstEl) {
          firstEl.classList.add("s1w-msg-highlight");
          setTimeout(() => firstEl.classList.remove("s1w-msg-highlight"), 2000);
        }
        return;
      }
      loadThread(state.activeTid, 1, { highlightFloor: 1 });
    }

    function jumpToLastFloor() {
      state.pendingNewRepliesCount = 0;
      updateNewMsgPill();
      if (!state.activeThread) return;
      const totalPages = Math.max(1, Number(state.activeThread.totalPages || 1));
      if (state.loadedMaxPage >= totalPages && state.posts.length) {
        const chatScroll = rootEl?.querySelector(".s1w-chat-scroll");
        if (chatScroll) chatScroll.scrollTo({ top: chatScroll.scrollHeight, behavior: "smooth" });
        const lastPid = state.posts[state.posts.length - 1]?.pid;
        const lastEl = lastPid ? rootEl?.querySelector(`#s1w-post-${CSS.escape(String(lastPid))}`) : null;
        if (lastEl) {
          lastEl.classList.add("s1w-msg-highlight");
          setTimeout(() => lastEl.classList.remove("s1w-msg-highlight"), 2000);
        }
        saveLastRead(state.activeTid, { replies: state.activeThread.replies });
        state.lastReadMap = readLastReadMap();
        renderListOnly({ preserveScroll: true });
        return;
      }
      loadThread(state.activeThread.tid, totalPages, { scrollToBottom: true });
    }

    function jumpToFloorNumber(floorNum) {
      if (!state.activeThread) return;
      const floor = Math.max(1, Number(floorNum) || 1);
      const ppp = Math.max(1, Number(state.activeThread.ppp || POSTS_PER_PAGE));
      const totalPages = Math.max(1, Number(state.activeThread.totalPages || 1));
      const targetPage = clamp(Math.ceil(floor / ppp), 1, totalPages);
      if (targetPage >= state.loadedMinPage && targetPage <= state.loadedMaxPage) {
        const found = state.posts.find((p) => Number(p.floor) >= floor) || state.posts[state.posts.length - 1];
        if (found) {
          const chatScroll = rootEl?.querySelector(".s1w-chat-scroll");
          const targetEl = rootEl?.querySelector(`#s1w-post-${CSS.escape(String(found.pid))}`);
          if (targetEl && chatScroll) {
            chatScroll.scrollTop = Math.max(0, targetEl.offsetTop - 12);
            targetEl.classList.add("s1w-msg-highlight");
            setTimeout(() => targetEl.classList.remove("s1w-msg-highlight"), 2000);
          }
        }
        return;
      }
      loadThread(state.activeThread.tid, targetPage, { highlightFloor: floor });
    }

    let pollingThread = false;
    async function pollCurrentThreadUpdates() {
      if (pollingThread || state.viewMode !== "im" || document.visibilityState !== "visible") return;
      if (state.pollConfig.threadSec <= 0) return;
      if (!state.activeThread || state.chatLoading || state.chatAppending || state.filterAuthorId || state.activeThread.closed) return;

      const curTid = state.activeTid;
      const prevTotalPages = Math.max(1, Number(state.activeThread.totalPages || 1));
      const prevReplies = Number(state.activeThread.replies || 0);
      const checkPage = Math.max(state.loadedMaxPage, prevTotalPages);
      pollingThread = true;

      try {
        const res = await api.getViewThread(curTid, { page: checkPage, force: true });
        if (state.activeTid !== curTid || !state.activeThread || res.errorMessage) return;

        const latestTotalPages = Math.max(1, Number(res.thread?.totalPages || prevTotalPages));
        const latestReplies = Number(res.thread?.replies ?? state.activeThread.replies ?? 0);
        state.activeThread.replies = Math.max(state.activeThread.replies || 0, latestReplies);
        if (res.thread?.views) state.activeThread.views = res.thread.views;
        state.activeThread.totalPages = Math.max(state.activeThread.totalPages || 1, latestTotalPages);

        const listRow = state.listItems.find((x) => String(x.tid) === String(curTid));
        if (listRow) listRow.replies = state.activeThread.replies;

        if (state.loadedMaxPage < prevTotalPages) {
          const delta = Math.max(0, latestReplies - prevReplies);
          if (delta > 0) {
            state.pendingNewRepliesCount += delta;
            updateNewMsgPill();
            let tailPosts = res.posts || [];
            if (latestTotalPages > checkPage) {
              const extraRes = await api.getViewThread(curTid, { page: latestTotalPages, force: true }).catch(() => null);
              if (state.activeTid !== curTid) return;
              if (extraRes?.posts?.length) tailPosts = extraRes.posts;
            }
            if (tailPosts.length) syncThreadListRowPreview(curTid, tailPosts[tailPosts.length - 1]);
          }
          refreshHeaderAndWatermark();
          renderListOnly({ preserveScroll: true });
          return;
        }

        let tailPage = checkPage;
        let incoming = (res.posts || []).map((p) => ({ ...p, page: tailPage }));

        if (latestTotalPages > checkPage) {
          const extraRes = await api.getViewThread(curTid, { page: latestTotalPages, force: true });
          if (state.activeTid !== curTid) return;
          tailPage = latestTotalPages;
          incoming = [
            ...incoming,
            ...(extraRes.posts || []).map((p) => ({ ...p, page: latestTotalPages }))
          ];
        }

        const seen = new Set(state.posts.map((p) => String(p.pid)));
        let fresh = incoming.filter((p) => p.pid && !seen.has(String(p.pid)));
        if (!fresh.length) {
          refreshHeaderAndWatermark();
          return;
        }

        const recovered = await recoverInvisibleContent(curTid, tailPage, fresh);
        if (recovered?.posts) fresh = recovered.posts;

        const chatScroll = rootEl?.querySelector(".s1w-chat-scroll");
        const wasNearBottom = chatScroll
          ? (chatScroll.scrollHeight - chatScroll.scrollTop - chatScroll.clientHeight < 120)
          : false;

        state.posts = [...state.posts, ...fresh];
        state.loadedMaxPage = Math.max(state.loadedMaxPage, tailPage);
        state.threadPage = state.loadedMaxPage;
        syncThreadListRowPreview(curTid, fresh[fresh.length - 1]);

        if (wasNearBottom) {
          state.pendingNewRepliesCount = 0;
          saveLastRead(curTid, { replies: state.activeThread.replies });
          state.lastReadMap = readLastReadMap();
        } else {
          state.pendingNewRepliesCount += fresh.length;
        }

        renderChatOnly({ preserveScroll: true });
        renderListOnly({ preserveScroll: true });
        if (wasNearBottom && chatScroll) {
          chatScroll.scrollTo({ top: chatScroll.scrollHeight, behavior: "smooth" });
        }
      } catch {
        /* ignore transient poll failures */
      } finally {
        pollingThread = false;
      }
    }

    function insertIntoTextarea(text) {
      const ta = rootEl?.querySelector(".s1w-textarea");
      if (!ta) return;
      const start = ta.selectionStart ?? ta.value.length;
      const end = ta.selectionEnd ?? ta.value.length;
      ta.value = ta.value.slice(0, start) + text + ta.value.slice(end);
      const nextPos = start + text.length;
      if (state.composerPreview) {
        renderComposerPreview();
      } else {
        ta.focus();
        ta.setSelectionRange(nextPos, nextPos);
      }
    }

    function closeModal() {
      const host = rootEl?.querySelector(".s1w-modal-host");
      if (host) host.innerHTML = "";
    }

    function openModal(title, bodyHtml, footHtml = "") {
      const host = rootEl?.querySelector(".s1w-modal-host");
      if (!host) return null;
      host.innerHTML = `
        <div class="s1w-modal-backdrop" role="dialog" aria-modal="true">
          <div class="s1w-modal">
            <div class="s1w-modal-head">
              <span>${escapeHtml(title)}</span>
              <button type="button" class="s1w-icon-btn" data-modal-close="1" title="关闭">✕</button>
            </div>
            <div class="s1w-modal-body">${bodyHtml}</div>
            ${footHtml ? `<div class="s1w-modal-foot">${footHtml}</div>` : ""}
          </div>
        </div>
      `;
      const backdrop = host.querySelector(".s1w-modal-backdrop");
      backdrop.addEventListener("click", (e) => {
        if (e.target === backdrop || e.target.closest("[data-modal-close]")) closeModal();
      });
      return host.querySelector(".s1w-modal");
    }

    function closePopovers() {
      rootEl?.querySelector(".s1w-self-popover")?.setAttribute("hidden", "");
      rootEl?.querySelector(".s1w-composer-account-popover")?.setAttribute("hidden", "");
      rootEl?.querySelector(".s1w-usercard-popover")?.setAttribute("hidden", "");
      rootEl?.querySelector(".s1w-rail-menu")?.setAttribute("hidden", "");
      rootEl?.querySelector(".s1w-chat-menu")?.setAttribute("hidden", "");
      rootEl?.querySelector(".s1w-smiley-popover")?.setAttribute("hidden", "");
    }

    function wrapWhiteoutSelection(fallback = "反白内容") {
      const ta = rootEl?.querySelector(".s1w-textarea");
      if (!ta) return;
      const start = ta.selectionStart ?? ta.value.length;
      const end = ta.selectionEnd ?? ta.value.length;
      const selected = ta.value.slice(start, end) || fallback;
      const wrapped = `[backcolor=White][color=White]${selected}[/color][/backcolor]`;
      ta.value = ta.value.slice(0, start) + wrapped + ta.value.slice(end);
      const selStart = start + "[backcolor=White][color=White]".length;
      if (state.composerPreview) {
        renderComposerPreview();
      } else {
        ta.focus();
        ta.setSelectionRange(selStart, selStart + selected.length);
      }
    }

    let boardPollTimer = null;
    let threadPollTimer = null;
    function restartPollTimers() {
      if (boardPollTimer) clearInterval(boardPollTimer);
      if (threadPollTimer) clearInterval(threadPollTimer);
      boardPollTimer = null;
      threadPollTimer = null;
      if (state.pollConfig.boardSec > 0) {
        boardPollTimer = setInterval(() => {
          pollBoardUpdates();
        }, state.pollConfig.boardSec * 1000);
      }
      if (state.pollConfig.threadSec > 0) {
        threadPollTimer = setInterval(() => {
          pollCurrentThreadUpdates();
        }, state.pollConfig.threadSec * 1000);
      }
    }

    function bindAccountPopoverEvents(pop, rerenderFn) {
      if (!pop || pop.dataset.bound) return;
      pop.dataset.bound = "1";
      pop.addEventListener("click", (e) => {
        e.stopPropagation();
        const removeAcc = e.target.closest("[data-remove-account]");
        if (removeAcc) {
          const key = removeAcc.getAttribute("data-remove-account");
          state.savedAccounts = removeSavedAccount(key);
          rerenderFn();
          showToast("已移除保存的账号记录");
          return;
        }
        const switchAcc = e.target.closest("[data-switch-account]");
        if (switchAcc) {
          const key = switchAcc.getAttribute("data-switch-account");
          pop.setAttribute("hidden", "");
          switchToSavedAccount(key);
          return;
        }
        const btn = e.target.closest("[data-self-action]");
        if (!btn) return;
        const act = btn.getAttribute("data-self-action");
        pop.setAttribute("hidden", "");
        if (act === "fav" || act === "notif" || act === "history") {
          loadSpecialTab(act);
        } else if (act === "tags-manager") {
          openTagsManagerModal();
        } else if (act === "app-login") {
          openAppLoginModal();
        } else if (act === "account-login") {
          openAccountLoginModal();
        } else if (act === "web-logout") {
          logoutCurrentAccount();
        } else if (act === "watermark") {
          openWatermarkModal();
        } else if (act === "cycle-theme") {
          const order = ["auto", "light", "dark"];
          state.themeMode = order[(order.indexOf(state.themeMode) + 1) % order.length];
          writeStorage(STORAGE_KEYS.themeMode, state.themeMode);
          applyThemeAndLock();
          renderAllPanels();
        } else if (act === "native-view") {
          switchToNativeView();
        }
      });
    }

    function toggleComposerAccountPopover() {
      const pop = rootEl?.querySelector(".s1w-composer-account-popover");
      if (!pop) return;
      const willOpen = pop.hasAttribute("hidden");
      closePopovers();
      if (!willOpen) return;
      const renderCompAcc = () => {
        pop.innerHTML = renderComposerAccountPopoverHtml(state);
      };
      renderCompAcc();
      pop.removeAttribute("hidden");
      bindAccountPopoverEvents(pop, renderCompAcc);
    }

    async function toggleSelfPopover() {
      const pop = rootEl?.querySelector(".s1w-self-popover");
      if (!pop) return;
      const willOpen = pop.hasAttribute("hidden");
      closePopovers();
      if (!willOpen) return;

      const renderSelf = () => {
        pop.innerHTML = renderSelfPopoverHtml(state, state.selfProfile);
      };
      renderSelf();
      pop.removeAttribute("hidden");
      bindAccountPopoverEvents(pop, renderSelf);

      if (state.user.uid && state.user.uid !== "0" && !state.selfProfile) {
        try {
          const data = await api.getUserProfile(state.user.uid);
          if (data?.space) {
            state.selfProfile = data.space;
            if (!pop.hasAttribute("hidden")) renderSelf();
          }
        } catch {
          /* keep fallback display */
        }
      }
    }

    async function openUserCardPopover(uid, fallbackName = "", anchorEl = null) {
      const targetUid = String(uid || "0");
      const pop = rootEl?.querySelector(".s1w-usercard-popover");
      if (!pop) return;
      closePopovers();

      const isOp = Boolean(state.activeThread?.authorid && targetUid === String(state.activeThread.authorid));
      const wmBg = state.watermark?.enabled ? buildWatermarkDataUri(state.watermark.text) : "";
      let loadedSpace = null;

      const renderCard = (loading = false) => {
        const uname = loadedSpace?.username || fallbackName || `UID ${targetUid}`;
        const tagRecord = state.userTags[targetUid] || state.userTags[uname] || { tags: [], note: "" };
        pop.innerHTML = renderUserCardPopoverHtml({
          uid: targetUid,
          username: uname,
          isOp,
          space: loadedSpace,
          tagRecord,
          filterActive: Boolean(state.filterAuthorId && state.filterAuthorId === targetUid),
          watermarkBg: wmBg,
          loading
        });
      };

      renderCard(targetUid !== "0");
      pop.removeAttribute("hidden");

      // Position anchored next to avatar/author trigger
      const rect = anchorEl?.getBoundingClientRect?.() || { right: 160, left: 160, top: 120, bottom: 150 };
      const cardW = 304;
      const cardH = Math.min(440, pop.offsetHeight || 400);
      let left = rect.right + 10;
      if (left + cardW > window.innerWidth - 12) {
        left = Math.max(12, rect.left - cardW - 10);
      }
      const top = clamp(rect.top - 12, 12, Math.max(12, window.innerHeight - cardH - 12));
      pop.style.left = `${left}px`;
      pop.style.top = `${top}px`;

      pop.dataset.uid = targetUid;
      pop.dataset.uname = fallbackName;

      if (!pop.dataset.bound) {
        pop.dataset.bound = "1";
        pop.addEventListener("click", (e) => {
          const btn = e.target.closest("[data-uc-action]");
          if (!btn) return;
          const act = btn.getAttribute("data-uc-action");
          const curUid = pop.dataset.uid || "0";
          const curName = pop.dataset.uname || `UID ${curUid}`;
          if (act === "toggle-tag-editor") {
            const editor = pop.querySelector(".s1w-uc-tag-editor");
            if (editor) {
              if (editor.hasAttribute("hidden")) editor.removeAttribute("hidden");
              else editor.setAttribute("hidden", "");
            }
          } else if (act === "save-tag") {
            const tagsVal = pop.querySelector(".s1w-uc-tags-input")?.value || "";
            const noteVal = pop.querySelector(".s1w-uc-note-input")?.value || "";
            state.userTags = setUserTagRecord(curUid, curName, tagsVal, noteVal);
            renderChatOnly({ preserveScroll: true });
            showToast("已保存标签");
            pop.setAttribute("hidden", "");
          } else if (act === "filter-author" && state.activeThread) {
            if (state.filterAuthorId === curUid) {
              state.filterAuthorId = "";
              state.filterAuthorName = "";
            } else {
              state.filterAuthorId = curUid;
              state.filterAuthorName = curName;
            }
            pop.setAttribute("hidden", "");
            loadThread(state.activeThread.tid, 1);
          }
        });
      }

      if (targetUid !== "0") {
        try {
          const data = await api.getUserProfile(targetUid);
          if (pop.hasAttribute("hidden") || pop.dataset.uid !== targetUid) return;
          loadedSpace = data?.space || {};
          if (loadedSpace.username) pop.dataset.uname = loadedSpace.username;
          renderCard(false);
        } catch {
          if (!pop.hasAttribute("hidden") && pop.dataset.uid === targetUid) renderCard(false);
        }
      }
    }

    function openRateModal(pid) {
      if (!state.user.uid || state.user.uid === "0") {
        showToast("请先登录后再评分");
        return;
      }
      const modal = openModal(
        "楼层评分 (加减鹅)",
        `
          <div>
            <label class="s1w-field-label">战斗力分值</label>
            <select class="s1w-select s1w-rate-score">
              <option value="2">+2 鹅</option>
              <option value="1" selected>+1 鹅</option>
              <option value="-1">-1 鹅</option>
              <option value="-2">-2 鹅</option>
            </select>
          </div>
          <div>
            <label class="s1w-field-label">评分理由</label>
            <input type="text" class="s1w-input s1w-rate-reason" placeholder="选填理由" />
          </div>
        `,
        `<button type="button" class="s1w-btn-secondary" data-modal-close="1">取消</button>
         <button type="button" class="s1w-btn-primary s1w-rate-submit">提交评分</button>`
      );
      modal.querySelector(".s1w-rate-submit").addEventListener("click", async () => {
        const score1 = modal.querySelector(".s1w-rate-score").value;
        const reason = modal.querySelector(".s1w-rate-reason").value;
        try {
          const res = await api.ratePost({
            tid: state.activeTid,
            pid,
            score1,
            reason,
            formhash: state.user.formhash
          });
          showToast(res.message || "评分完成");
          closeModal();
        } catch (err) {
          showToast(`评分失败: ${err.message}`);
        }
      });
    }

    function openNewThreadModal() {
      if (!state.user.uid || state.user.uid === "0") {
        showToast("请先登录后发帖");
        return;
      }
      const types = state.threadtypes || [];
      const typeSelectHtml = types.length
        ? `<div>
             <label class="s1w-field-label">主题分类</label>
             <select class="s1w-select s1w-nt-type">
               ${types.map((t) => `<option value="${escapeHtml(t.id)}">${escapeHtml(t.name)}</option>`).join("")}
             </select>
           </div>`
        : "";
      const modal = openModal(
        `发新帖 · ${state.activeBoardName}`,
        `
          ${typeSelectHtml}
          <div>
            <label class="s1w-field-label">标题</label>
            <input type="text" class="s1w-input s1w-nt-subject" placeholder="输入帖子标题" maxlength="80" />
          </div>
          <div>
            <label class="s1w-field-label">正文 (支持 BBCode 与表情代码)</label>
            <textarea class="s1w-modal-textarea s1w-nt-body" rows="6" placeholder="输入正文内容"></textarea>
          </div>
        `,
        `<button type="button" class="s1w-btn-secondary" data-modal-close="1">取消</button>
         <button type="button" class="s1w-btn-primary s1w-nt-submit">发表主题</button>`
      );
      modal.querySelector(".s1w-nt-submit").addEventListener("click", async () => {
        const subject = modal.querySelector(".s1w-nt-subject").value.trim();
        const message = modal.querySelector(".s1w-nt-body").value.trim();
        const typeid = modal.querySelector(".s1w-nt-type")?.value || "";
        if (!subject || !message) {
          showToast("标题和正文不能为空");
          return;
        }
        try {
          const targetFid = state.listFid || state.activeFid;
          const res = await api.createThread({
            fid: targetFid,
            subject,
            message,
            typeid,
            formhash: state.user.formhash
          });
          if (!res.ok) {
            showToast(res.message || "发帖失败");
            return;
          }
          showToast("发表成功");
          closeModal();
          if (res.tid) await loadThread(res.tid, 1, { force: true });
          await loadBoardList(targetFid, { force: true });
        } catch (err) {
          showToast(`发帖失败: ${err.message}`);
        }
      });
    }

    function openWatermarkModal() {
      const modal = openModal(
        "背景水印设置",
        `
          <label style="display:flex;align-items:center;gap:8px;cursor:pointer;">
            <input type="checkbox" class="s1w-wm-enable" ${state.watermark?.enabled ? "checked" : ""} />
            <span>启用聊天背景水印</span>
          </label>
          <div>
            <label class="s1w-field-label">水印文字</label>
            <input type="text" class="s1w-input s1w-wm-text" maxlength="32" value="${escapeHtml(state.watermark?.text || "")}" />
          </div>
        `,
        `<button type="button" class="s1w-btn-secondary" data-modal-close="1">取消</button>
         <button type="button" class="s1w-btn-primary s1w-wm-save">保存</button>`
      );
      modal.querySelector(".s1w-wm-save").addEventListener("click", () => {
        state.watermark = {
          enabled: modal.querySelector(".s1w-wm-enable").checked,
          text: modal.querySelector(".s1w-wm-text").value.trim() || "内部沟通 · 请勿外传"
        };
        writeStorage(STORAGE_KEYS.watermark, JSON.stringify(state.watermark));
        refreshHeaderAndWatermark();
        closeModal();
      });
    }

    function openAppLoginModal() {
      const savedUser = readStorage(STORAGE_KEYS.appUser, state.user?.username || "");
      const loggedIn = Boolean(api.getAppSid());
      const modal = openModal(
        "App 接口登录（查看审核中/屏蔽内容）",
        `
          <div style="font-size:12px;color:var(--wc-text-2);">
            当前状态：<strong>${loggedIn ? "已登录" : "未配置"}</strong>
            ${loggedIn ? `<button type="button" class="s1w-btn-secondary s1w-app-logout" style="margin-left:8px;height:24px;padding:0 10px;">退出登录</button>` : ""}
          </div>
          <div>
            <label class="s1w-field-label">用户名</label>
            <input type="text" class="s1w-input s1w-app-user" value="${escapeHtml(savedUser)}" placeholder="Stage1st 用户名" />
          </div>
          <div>
            <label class="s1w-field-label">密码</label>
            <input type="password" class="s1w-input s1w-app-pass" placeholder="仅用于获取 App 接口 sid，不会保存在本地" />
          </div>
          <div>
            <label class="s1w-field-label">安全提问</label>
            <select class="s1w-select s1w-app-qid">
              <option value="0">安全提问（未设置请忽略）</option>
              <option value="1">母亲的名字</option>
              <option value="2">爷爷的名字</option>
              <option value="3">父亲出生的城市</option>
              <option value="4">您其中一位老师的名字</option>
              <option value="5">您个人计算机的型号</option>
              <option value="6">您最喜欢的餐馆名称</option>
              <option value="7">驾驶执照最后四位数字</option>
            </select>
          </div>
          <div class="s1w-app-answer-row" hidden>
            <label class="s1w-field-label">答案</label>
            <input type="text" class="s1w-input s1w-app-answer" placeholder="安全提问答案" />
          </div>
        `,
        `<button type="button" class="s1w-btn-secondary" data-modal-close="1">取消</button>
         <button type="button" class="s1w-btn-primary s1w-app-submit">登录并保存会话</button>`
      );

      const qidSel = modal.querySelector(".s1w-app-qid");
      const ansRow = modal.querySelector(".s1w-app-answer-row");
      qidSel.addEventListener("change", () => {
        if (qidSel.value === "0") ansRow.setAttribute("hidden", "");
        else ansRow.removeAttribute("hidden");
      });

      modal.querySelector(".s1w-app-logout")?.addEventListener("click", () => {
        api.clearAppSid();
        syncAppLoginState();
        showToast("已清除 App 登录会话");
        closeModal();
        if (state.activeTid) loadThread(state.activeTid, state.loadedMinPage || 1, { pushUrl: false, force: true });
      });

      modal.querySelector(".s1w-app-submit").addEventListener("click", async () => {
        const username = modal.querySelector(".s1w-app-user").value.trim();
        const password = modal.querySelector(".s1w-app-pass").value;
        const questionid = qidSel.value;
        const answer = modal.querySelector(".s1w-app-answer").value.trim();
        if (!username || !password) {
          showToast("请输入用户名和密码");
          return;
        }
        const btn = modal.querySelector(".s1w-app-submit");
        btn.disabled = true;
        try {
          const res = await api.appLogin({ username, password, questionid, answer });
          if (!res.ok) {
            showToast(res.message || "App 登录失败");
            return;
          }
          syncAppLoginState();
          showToast("App 登录成功");
          closeModal();
          if (state.activeTid) {
            await loadThread(state.activeTid, state.loadedMinPage || 1, { pushUrl: false, force: true });
          }
        } catch (err) {
          showToast(`App 登录请求失败: ${err.message}`);
        } finally {
          btn.disabled = false;
        }
      });
    }

    function openPollSettingsModal() {
      const cur = state.pollConfig || { boardSec: 30, threadSec: 25 };
      const modal = openModal(
        "监控与刷新频率设置",
        `
          <div>
            <label class="s1w-field-label">板块列表新回复监控频率（秒，填 0 关闭；开启后 5～3600 秒）</label>
            <input type="number" class="s1w-input s1w-poll-board" min="0" max="3600" value="${cur.boardSec}" />
          </div>
          <div>
            <label class="s1w-field-label">帖子内新楼层刷新频率（秒，填 0 关闭；开启后 5～3600 秒）</label>
            <input type="number" class="s1w-input s1w-poll-thread" min="0" max="3600" value="${cur.threadSec}" />
          </div>
        `,
        `<button type="button" class="s1w-btn-secondary" data-modal-close="1">取消</button>
         <button type="button" class="s1w-btn-primary s1w-poll-save">保存并应用</button>`
      );
      modal.querySelector(".s1w-poll-save").addEventListener("click", () => {
        const boardVal = modal.querySelector(".s1w-poll-board").value;
        const threadVal = modal.querySelector(".s1w-poll-thread").value;
        state.pollConfig = savePollConfig({ boardSec: boardVal, threadSec: threadVal });
        const summaryEl = rootEl?.querySelector("[data-poll-summary]");
        if (summaryEl) summaryEl.textContent = formatPollSummaryText(state.pollConfig);
        restartPollTimers();
        closeModal();
        showToast(`已更新频率：板块 ${state.pollConfig.boardSec ? `${state.pollConfig.boardSec}s` : "关闭"} / 帖内 ${state.pollConfig.threadSec ? `${state.pollConfig.threadSec}s` : "关闭"}`);
      });
    }

    async function refreshSessionAfterAuthChange() {
      state.selfProfile = null;
      try {
        const idx = await api.getForumIndex({ force: true });
        if (idx?.user) state.user = idx.user;
        if (idx?.categories?.length) state.categories = idx.categories;
        if (idx?.boards?.length) state.boards = idx.boards;
      } catch {
        state.user = { uid: "0", username: "", avatar: "", formhash: "", unreadCount: 0 };
      }
      renderAllPanels();
      const curListFid = state.listFid || state.activeFid;
      if (state.navTab === "msg" && curListFid) {
        await loadBoardList(curListFid, { force: true });
      }
      if (state.activeTid) {
        await loadThread(state.activeTid, state.loadedMinPage || 1, { pushUrl: false, force: true });
      }
    }

    function openAccountLoginModal(prefillName = "") {
      const modal = openModal(
        "登录 / 添加 Stage1st 账号",
        `
          <div>
            <label class="s1w-field-label">用户名</label>
            <input type="text" class="s1w-input s1w-web-user" value="${escapeHtml(prefillName)}" placeholder="Stage1st 用户名" />
          </div>
          <div>
            <label class="s1w-field-label">密码</label>
            <input type="password" class="s1w-input s1w-web-pass" placeholder="论坛登录密码" />
          </div>
          <div>
            <label class="s1w-field-label">安全提问</label>
            <select class="s1w-select s1w-web-qid">
              <option value="0">安全提问（未设置请忽略）</option>
              <option value="1">母亲的名字</option>
              <option value="2">爷爷的名字</option>
              <option value="3">父亲出生的城市</option>
              <option value="4">您其中一位老师的名字</option>
              <option value="5">您个人计算机的型号</option>
              <option value="6">您最喜欢的餐馆名称</option>
              <option value="7">驾驶执照最后四位数字</option>
            </select>
          </div>
          <div class="s1w-web-answer-row" hidden>
            <label class="s1w-field-label">答案</label>
            <input type="text" class="s1w-input s1w-web-answer" placeholder="安全提问答案" />
          </div>
          <label style="display:flex;align-items:center;gap:8px;cursor:pointer;font-size:12px;">
            <input type="checkbox" class="s1w-web-save" checked />
            <span>保存登录凭据到本机浏览器以便一键切换</span>
          </label>
        `,
        `<button type="button" class="s1w-btn-secondary" data-modal-close="1">取消</button>
         <button type="button" class="s1w-btn-primary s1w-web-submit">登录账号</button>`
      );

      const qidSel = modal.querySelector(".s1w-web-qid");
      const ansRow = modal.querySelector(".s1w-web-answer-row");
      qidSel.addEventListener("change", () => {
        if (qidSel.value === "0") ansRow.setAttribute("hidden", "");
        else ansRow.removeAttribute("hidden");
      });

      modal.querySelector(".s1w-web-submit").addEventListener("click", async () => {
        const username = modal.querySelector(".s1w-web-user").value.trim();
        const password = modal.querySelector(".s1w-web-pass").value;
        const questionid = qidSel.value;
        const answer = modal.querySelector(".s1w-web-answer").value.trim();
        const shouldSave = modal.querySelector(".s1w-web-save").checked;
        if (!username || !password) {
          showToast("请输入用户名和密码");
          return;
        }
        const btn = modal.querySelector(".s1w-web-submit");
        btn.disabled = true;
        try {
          if (state.user.uid && state.user.uid !== "0") {
            await api.webLogout(state.user.formhash).catch(() => {});
          }
          const res = await api.webLogin({ username, password, questionid, answer });
          if (!res.ok) {
            showToast(res.message || "登录失败");
            if (res.requiresSeccode) {
              setTimeout(() => {
                location.href = "/2b/member.php?mod=logging&action=login";
              }, 900);
            }
            return;
          }
          closeModal();
          await refreshSessionAfterAuthChange();
          if (shouldSave) {
            state.savedAccounts = upsertSavedAccount({
              uid: state.user.uid || "0",
              username: state.user.username || username,
              loginName: username,
              password,
              questionid,
              answer,
              avatar: state.user.avatar || ""
            });
          }
          showToast(`已登录 ${state.user.username || username}`);
        } catch (err) {
          showToast(`登录失败: ${err.message}`);
        } finally {
          btn.disabled = false;
        }
      });
    }

    async function switchToSavedAccount(accKey) {
      const target = (state.savedAccounts || []).find((a) => {
        const k = a.uid && a.uid !== "0" ? String(a.uid) : String(a.loginName || a.username);
        return k === String(accKey) || String(a.loginName) === String(accKey);
      });
      if (!target || !target.password) {
        openAccountLoginModal(target?.loginName || target?.username || "");
        return;
      }
      if (state.user.uid && state.user.uid !== "0" && String(state.user.uid) === String(target.uid)) {
        showToast(`当前已是 ${state.user.username}`);
        return;
      }
      showToast(`正在切换到 ${target.username || target.loginName}…`);
      try {
        if (state.user.uid && state.user.uid !== "0") {
          await api.webLogout(state.user.formhash).catch(() => {});
        }
        const res = await api.webLogin({
          username: target.loginName || target.username,
          password: target.password,
          questionid: target.questionid || "0",
          answer: target.answer || ""
        });
        if (!res.ok) {
          showToast(res.message || "切换账号失败");
          if (!res.requiresSeccode) openAccountLoginModal(target.loginName || target.username);
          return;
        }
        await refreshSessionAfterAuthChange();
        state.savedAccounts = upsertSavedAccount({
          ...target,
          uid: state.user.uid || target.uid,
          username: state.user.username || target.username,
          avatar: state.user.avatar || target.avatar
        });
        showToast(`已切换到 ${state.user.username || target.username}`);
      } catch (err) {
        showToast(`切换失败: ${err.message}`);
      }
    }

    async function logoutCurrentAccount() {
      try {
        await api.webLogout(state.user.formhash);
      } catch {
        /* proceed with state reset */
      }
      state.user = { uid: "0", username: "", avatar: "", formhash: "", unreadCount: 0 };
      state.selfProfile = null;
      await refreshSessionAfterAuthChange();
      showToast("已退出当前账号");
    }

    async function handleFileUploads(fileList) {
      const files = Array.from(fileList || []).filter(Boolean);
      if (!files.length) return;
      if (!state.user.uid || state.user.uid === "0") {
        showToast("请先登录后再上传附件");
        return;
      }
      const fid = state.activeThread?.fid || state.activeFid;
      const tid = state.activeThread?.tid || "";
      if (!fid) {
        showToast("未识别当前板块，无法上传");
        return;
      }

      for (const file of files) {
        showToast(`正在上传 ${file.name || "附件"}…`);
        try {
          const uploaded = await api.uploadAttachment({ fid, tid, file, uid: state.user.uid });
          state.pendingAttachments.push(uploaded);
          insertIntoTextarea(`[attach]${uploaded.aid}[/attach]\n`);
          renderAttachBar();
          showToast(`上传成功: ${uploaded.filename}`);
        } catch (err) {
          showToast(err.message || `上传 ${file.name} 失败`);
        }
      }
    }

    function openTagsManagerModal() {
      const renderRows = (query = "") => {
        const q = query.trim().toLowerCase();
        const entries = Object.entries(state.userTags || {}).filter(([k, rec]) => {
          if (!q) return true;
          return (
            k.toLowerCase().includes(q) ||
            String(rec.username || "").toLowerCase().includes(q) ||
            (rec.tags || []).some((t) => t.toLowerCase().includes(q)) ||
            String(rec.note || "").toLowerCase().includes(q)
          );
        });
        if (!entries.length) return `<div style="color:var(--wc-text-3);padding:12px 0;">暂无匹配标签</div>`;
        return entries
          .map(([k, rec]) => `
            <div style="display:flex;justify-content:space-between;align-items:center;padding:7px 0;border-bottom:1px solid var(--wc-border);">
              <div>
                <strong>${escapeHtml(rec.username || k)}</strong>
                <div style="font-size:11.5px;color:var(--wc-text-3)">${escapeHtml((rec.tags || []).join(" · "))}${rec.note ? ` — ${escapeHtml(rec.note)}` : ""}</div>
              </div>
              <button type="button" class="s1w-btn-secondary" data-del-tag="${escapeHtml(k)}">删除</button>
            </div>
          `)
          .join("");
      };

      const modal = openModal(
        "用户标签管理",
        `
          <input type="search" class="s1w-input s1w-tm-search" placeholder="搜索用户名、标签或备注" />
          <div class="s1w-tm-list">${renderRows()}</div>
          <div style="display:flex;gap:8px;flex-wrap:wrap;padding-top:4px;">
            <button type="button" class="s1w-btn-secondary s1w-tm-export">导出 JSON</button>
            <button type="button" class="s1w-btn-secondary s1w-tm-import">导入 JSON 文件</button>
            <input type="file" class="s1w-tm-file" accept=".json,application/json" hidden />
          </div>
        `
      );
      const listEl = modal.querySelector(".s1w-tm-list");
      const searchEl = modal.querySelector(".s1w-tm-search");
      const fileEl = modal.querySelector(".s1w-tm-file");
      searchEl.addEventListener("input", () => {
        listEl.innerHTML = renderRows(searchEl.value);
      });
      listEl.addEventListener("click", (e) => {
        const delBtn = e.target.closest("[data-del-tag]");
        if (!delBtn) return;
        const key = delBtn.getAttribute("data-del-tag");
        state.userTags = setUserTagRecord(key, "", "", "");
        listEl.innerHTML = renderRows(searchEl.value);
        renderChatOnly();
      });
      modal.querySelector(".s1w-tm-export").addEventListener("click", () => {
        navigator.clipboard?.writeText(exportUserTagsJson()).then(
          () => showToast("已复制标签 JSON 到剪贴板"),
          () => showToast("复制失败")
        );
      });
      modal.querySelector(".s1w-tm-import").addEventListener("click", () => {
        fileEl?.click();
      });
      fileEl?.addEventListener("change", async () => {
        const file = fileEl.files?.[0];
        if (!file) return;
        try {
          const raw = await file.text();
          state.userTags = importUserTagsJson(raw, "merge");
          listEl.innerHTML = renderRows(searchEl.value);
          renderChatOnly({ preserveScroll: true });
          showToast("标签导入成功");
        } catch (err) {
          showToast(err.message || "导入失败");
        } finally {
          fileEl.value = "";
        }
      });
    }

    function openLightbox(src, images = [src]) {
      let idx = Math.max(0, images.indexOf(src));
      let scale = 1;
      let tx = 0;
      let ty = 0;
      let dragging = false;
      let startX = 0;
      let startY = 0;

      const overlay = document.createElement("div");
      overlay.className = "s1w-lightbox";
      overlay.innerHTML = `
        <img src="${escapeHtml(images[idx])}" alt="图片预览" />
        <div class="s1w-lightbox-bar">
          <button type="button" data-lb="prev">上一张</button>
          <span data-lb-zoom>100%</span>
          <button type="button" data-lb="next">下一张</button>
          <button type="button" data-lb="reset">还原</button>
          <button type="button" data-lb="close">关闭</button>
        </div>
      `;
      const imgEl = overlay.querySelector("img");
      const zoomLabel = overlay.querySelector("[data-lb-zoom]");
      const applyTransform = () => {
        imgEl.style.transform = `translate(${tx}px, ${ty}px) scale(${scale})`;
        zoomLabel.textContent = `${Math.round(scale * 100)}%`;
      };
      const showIndex = (nextIdx) => {
        idx = (nextIdx + images.length) % images.length;
        imgEl.src = images[idx];
        scale = 1;
        tx = 0;
        ty = 0;
        applyTransform();
      };
      overlay.addEventListener("wheel", (e) => {
        e.preventDefault();
        scale = clamp(scale * (e.deltaY < 0 ? 1.15 : 0.87), 0.25, 5);
        applyTransform();
      }, { passive: false });
      imgEl.addEventListener("mousedown", (e) => {
        dragging = true;
        startX = e.clientX - tx;
        startY = e.clientY - ty;
        imgEl.style.cursor = "grabbing";
      });
      const onMove = (e) => {
        if (!dragging) return;
        tx = e.clientX - startX;
        ty = e.clientY - startY;
        applyTransform();
      };
      const onUp = () => {
        dragging = false;
        imgEl.style.cursor = "grab";
      };
      window.addEventListener("mousemove", onMove);
      window.addEventListener("mouseup", onUp);
      const closeLb = () => {
        window.removeEventListener("mousemove", onMove);
        window.removeEventListener("mouseup", onUp);
        overlay.remove();
      };
      overlay.addEventListener("click", (e) => {
        const btn = e.target.closest("[data-lb]");
        if (btn) {
          const act = btn.getAttribute("data-lb");
          if (act === "prev") showIndex(idx - 1);
          else if (act === "next") showIndex(idx + 1);
          else if (act === "reset") { scale = 1; tx = 0; ty = 0; applyTransform(); }
          else if (act === "close") closeLb();
          return;
        }
        if (e.target === overlay) closeLb();
      });
      rootEl.appendChild(overlay);
    }

    async function toggleSmileyPicker() {
      const popover = rootEl?.querySelector(".s1w-smiley-popover");
      if (!popover) return;
      const isHidden = popover.hasAttribute("hidden");
      if (!isHidden) {
        popover.setAttribute("hidden", "");
        return;
      }
      popover.removeAttribute("hidden");
      const grid = popover.querySelector(".s1w-smiley-grid");
      const tabs = popover.querySelector(".s1w-smiley-tabs");

      if (!state.smilies.length) {
        grid.innerHTML = `<div style="grid-column:1/-1;text-align:center;padding:24px;color:var(--wc-text-3)">加载表情中…</div>`;
        try {
          state.smilies = await api.getSmilies();
        } catch {
          grid.innerHTML = `<div style="grid-column:1/-1;text-align:center;padding:24px;color:var(--wc-text-3)">加载表情失败</div>`;
          return;
        }
      }

      const renderSmilies = () => {
        const groups = [
          ...(state.recentSmilies.length ? [{ key: "_recent", label: "常用", items: state.recentSmilies }] : []),
          ...state.smilies
        ];
        if (!groups.some((g) => g.key === state.activeSmileyGroup)) {
          state.activeSmileyGroup = groups[0]?.key || "face2017";
        }
        tabs.innerHTML = groups
          .map((g) => `<button type="button" class="s1w-smiley-tab ${g.key === state.activeSmileyGroup ? "active" : ""}" data-smiley-group="${escapeHtml(g.key)}">${escapeHtml(g.label)}</button>`)
          .join("");
        const activeGroup = groups.find((g) => g.key === state.activeSmileyGroup) || groups[0];
        grid.innerHTML = (activeGroup?.items || [])
          .map((item) => `<button type="button" class="s1w-smiley-cell" data-smiley-code="${escapeHtml(item.code)}" data-smiley-url="${escapeHtml(item.url)}" title="${escapeHtml(item.code)}"><img src="${escapeHtml(item.url)}" alt="${escapeHtml(item.code)}" loading="lazy" /></button>`)
          .join("");
      };
      renderSmilies();

      if (!popover.dataset.bound) {
        popover.dataset.bound = "1";
        popover.addEventListener("click", (e) => {
          e.stopPropagation();
          const tabBtn = e.target.closest("[data-smiley-group]");
          if (tabBtn) {
            state.activeSmileyGroup = tabBtn.getAttribute("data-smiley-group");
            renderSmilies();
            return;
          }
          const cell = e.target.closest("[data-smiley-code]");
          if (cell) {
            const code = cell.getAttribute("data-smiley-code");
            const url = cell.getAttribute("data-smiley-url");
            insertIntoTextarea(code);
            state.recentSmilies = [{ code, url }, ...state.recentSmilies.filter((x) => x.code !== code)].slice(0, 24);
            writeStorage(STORAGE_KEYS.recentSmilies, JSON.stringify(state.recentSmilies));
            popover.setAttribute("hidden", "");
          }
        });
      }
    }

    async function submitReply() {
      if (!state.user.uid || state.user.uid === "0") {
        location.href = "/2b/member.php?mod=logging&action=login";
        return;
      }
      const ta = rootEl?.querySelector(".s1w-textarea");
      const msg = ta?.value.trim() || "";
      if (!msg || !state.activeThread) return;

      const sendBtn = rootEl.querySelector('[data-action="send-reply"]');
      if (sendBtn) sendBtn.disabled = true;
      try {
        const res = await api.sendReply({
          fid: state.activeThread.fid || state.activeFid,
          tid: state.activeThread.tid,
          message: msg,
          formhash: state.user.formhash,
          quotePid: state.quoteReply?.pid || "",
          attachIds: state.pendingAttachments.map((a) => a.aid)
        });
        if (!res.ok) {
          showToast(res.message || "发送失败");
          return;
        }
        ta.value = "";
        state.quoteReply = null;
        state.pendingAttachments = [];
        state.composerPreview = false;
        renderAttachBar();
        renderComposerPreview();
        showToast("回复已发送");
        await loadThread(state.activeThread.tid, state.activeThread.totalPages || state.threadPage, {
          pushUrl: false,
          force: true
        });
      } catch (err) {
        showToast(`发送失败: ${err.message}`);
      } finally {
        updateComposerStatus();
      }
    }

    function bindEvents() {
      const closeConvContextMenu = () => {
        rootEl?.querySelector(".s1w-context-menu")?.remove();
      };

      // Avatar fallback handler when UCenter avatar returns 404
      rootEl.addEventListener("error", (e) => {
        const img = e.target;
        if (!img || img.tagName !== "IMG") return;
        const letter = img.getAttribute("data-fallback-letter");
        const bg = img.getAttribute("data-fallback-bg");
        if (!letter) return;
        const span = document.createElement("span");
        span.className = "s1w-avatar-fallback";
        if (bg) span.style.background = bg;
        span.textContent = letter;
        img.replaceWith(span);
      }, true);

      rootEl.addEventListener("contextmenu", (e) => {
        const convItem = e.target.closest(".s1w-conv-item[data-tid]");
        if (!convItem) return;
        e.preventDefault();
        closeConvContextMenu();
        const tid = convItem.getAttribute("data-tid");
        if (!tid) return;
        const listItem = state.listItems.find((x) => String(x.tid) === String(tid))
          || state.historyItems.find((x) => String(x.tid) === String(tid));
        const title = listItem?.subject || convItem.querySelector(".s1w-conv-title")?.textContent?.trim() || "";
        const isPinned = Boolean(state.pinnedThreads?.[tid]);
        const menu = document.createElement("div");
        menu.className = "s1w-popover-menu s1w-context-menu";
        menu.style.position = "fixed";
        menu.style.left = `${clamp(e.clientX, 8, window.innerWidth - 160)}px`;
        menu.style.top = `${clamp(e.clientY, 8, window.innerHeight - 132)}px`;
        menu.innerHTML = `
          <button type="button" class="s1w-menu-item" data-ctx-pin="${escapeHtml(tid)}"><span>${isPinned ? "取消置顶" : "置顶该帖"}</span></button>
          <button type="button" class="s1w-menu-item" data-ctx-copy-title="${escapeHtml(title)}"><span>复制帖子标题</span></button>
          <button type="button" class="s1w-menu-item" data-ctx-copy-link="${escapeHtml(tid)}"><span>复制帖子链接</span></button>
        `;
        rootEl.appendChild(menu);
      });

      rootEl.addEventListener("click", async (e) => {
        const ctxPin = e.target.closest("[data-ctx-pin]");
        if (ctxPin) {
          const tid = ctxPin.getAttribute("data-ctx-pin");
          closeConvContextMenu();
          togglePinForTid(tid);
          return;
        }
        const ctxCopyTitle = e.target.closest("[data-ctx-copy-title]");
        if (ctxCopyTitle) {
          const title = ctxCopyTitle.getAttribute("data-ctx-copy-title") || "";
          closeConvContextMenu();
          copyTextToClipboard(title).then((ok) => showToast(ok ? "已复制帖子标题" : "复制失败"));
          return;
        }
        const ctxCopyLink = e.target.closest("[data-ctx-copy-link]");
        if (ctxCopyLink) {
          const tid = ctxCopyLink.getAttribute("data-ctx-copy-link") || "";
          closeConvContextMenu();
          copyTextToClipboard(formatThreadLink(tid, 1)).then((ok) => showToast(ok ? "已复制帖子链接" : "复制失败"));
          return;
        }
        if (!e.target.closest(".s1w-context-menu")) {
          closeConvContextMenu();
        }

        const railMenu = rootEl.querySelector(".s1w-rail-menu");
        const chatMenu = rootEl.querySelector(".s1w-chat-menu");
        const selfPop = rootEl.querySelector(".s1w-self-popover");
        const userCardPop = rootEl.querySelector(".s1w-usercard-popover");
        if (railMenu && !e.target.closest('[data-action="rail-settings"]') && !e.target.closest(".s1w-rail-menu")) {
          railMenu.setAttribute("hidden", "");
        }
        if (chatMenu && !e.target.closest('[data-action="more-chat-menu"]') && !e.target.closest(".s1w-chat-menu")) {
          chatMenu.setAttribute("hidden", "");
        }
        const smileyPop = rootEl.querySelector(".s1w-smiley-popover");
        const compAccPop = rootEl.querySelector(".s1w-composer-account-popover");
        if (smileyPop && !e.target.closest('[data-composer-tool="emoji"]') && !e.target.closest(".s1w-smiley-popover")) {
          smileyPop.setAttribute("hidden", "");
        }
        if (compAccPop && !e.target.closest('[data-action="composer-account-menu"]') && !e.target.closest(".s1w-composer-account-popover")) {
          compAccPop.setAttribute("hidden", "");
        }
        if (selfPop && !e.target.closest('[data-action="me"]') && !e.target.closest(".s1w-self-popover")) {
          selfPop.setAttribute("hidden", "");
        }
        if (userCardPop && !e.target.closest("[data-profile-uid]") && !e.target.closest(".s1w-usercard-popover")) {
          userCardPop.setAttribute("hidden", "");
        }

        const spoilerEl = e.target.closest(".s1w-spoiler-mask");
        if (spoilerEl && !window.getSelection?.()?.toString().trim()) {
          spoilerEl.classList.toggle("revealed");
          return;
        }

        const insertAidBtn = e.target.closest("[data-insert-aid]");
        if (insertAidBtn) {
          const aid = insertAidBtn.getAttribute("data-insert-aid");
          if (aid) insertIntoTextarea(`[attach]${aid}[/attach]\n`);
          return;
        }

        const removeAidBtn = e.target.closest("[data-remove-aid]");
        if (removeAidBtn) {
          const aid = removeAidBtn.getAttribute("data-remove-aid");
          state.pendingAttachments = state.pendingAttachments.filter((a) => String(a.aid) !== String(aid));
          renderAttachBar();
          if (state.composerPreview) renderComposerPreview();
          return;
        }

        const pinBtn = e.target.closest("[data-pin-tid]");
        if (pinBtn) {
          e.stopPropagation();
          togglePinForTid(pinBtn.getAttribute("data-pin-tid"));
          return;
        }

        const internalLink = e.target.closest("a[data-s1-internal]");
        if (internalLink) {
          e.preventDefault();
          const url = new URL(internalLink.getAttribute("data-s1-internal"), location.origin);
          const r = parseStage1stRoute(url.pathname, url.search);
          if (r.type === "thread") {
            loadThread(r.tid, r.page);
          } else if (r.type === "board") {
            loadBoardList(r.fid);
          } else if (r.type === "findpost" && r.pid) {
            const resolved = await api.resolveFindPostUrl(r.pid, r.tid).catch(() => "");
            const rr = resolved ? parseStage1stRoute(new URL(resolved).pathname, new URL(resolved).search) : null;
            if (rr?.tid) loadThread(rr.tid, rr.page || 1, { highlightPid: r.pid });
            else if (r.tid) loadThread(r.tid, 1, { highlightPid: r.pid });
          }
          return;
        }

        const quoteCard = e.target.closest(".s1w-quote-card[data-jump-pid]");
        if (quoteCard) {
          const pid = quoteCard.getAttribute("data-jump-pid");
          const local = pid ? rootEl.querySelector(`#s1w-post-${CSS.escape(pid)}`) : null;
          if (local) {
            local.scrollIntoView({ block: "center" });
            local.classList.add("s1w-msg-highlight");
            setTimeout(() => local.classList.remove("s1w-msg-highlight"), 2000);
          } else if (pid) {
            const tid = quoteCard.getAttribute("data-jump-tid") || state.activeTid;
            const resolved = await api.resolveFindPostUrl(pid, tid).catch(() => "");
            if (resolved) {
              const rr = parseStage1stRoute(new URL(resolved).pathname, new URL(resolved).search);
              if (rr.tid) loadThread(rr.tid, rr.page || 1, { highlightPid: pid });
            }
          }
          return;
        }

        const img = e.target.closest(".s1-content-img, [data-preview-img]");
        if (img) {
          const url = img.getAttribute("data-preview-img") || img.src;
          const allImgs = Array.from(rootEl.querySelectorAll(".s1-content-img, [data-preview-img]"))
            .map((el) => el.getAttribute("data-preview-img") || el.src)
            .filter(Boolean);
          openLightbox(url, allImgs);
          return;
        }

        const profEl = e.target.closest("[data-profile-uid]");
        if (profEl) {
          openUserCardPopover(
            profEl.getAttribute("data-profile-uid"),
            profEl.getAttribute("data-profile-name"),
            profEl
          );
          return;
        }

        const postBtn = e.target.closest("[data-post-action]");
        if (postBtn) {
          const row = postBtn.closest(".s1w-msg-row");
          const pid = row?.getAttribute("data-pid");
          const act = postBtn.getAttribute("data-post-action");
          if (act === "quote" && row) {
            state.quoteReply = {
              pid,
              floor: row.getAttribute("data-floor"),
              author: row.getAttribute("data-author")
            };
            updateComposerStatus();
            rootEl.querySelector(".s1w-textarea")?.focus();
          } else if (act === "rate" && pid) {
            openRateModal(pid);
          } else if (act === "copy-link" && pid) {
            const link = `https://stage1st.com/2b/forum.php?mod=redirect&goto=findpost&pid=${pid}&ptid=${state.activeTid}`;
            copyTextToClipboard(link).then((ok) => showToast(ok ? "已复制楼层链接" : "复制失败"));
          }
          return;
        }

        const railTab = e.target.closest("[data-rail-tab]");
        if (railTab) {
          const tab = railTab.getAttribute("data-rail-tab");
          if (tab === "boards") {
            state.drawerOpen = !state.drawerOpen;
            renderAllPanels();
          } else if (tab === "msg") {
            state.drawerOpen = false;
            loadBoardList(state.listFid || state.activeFid);
            renderAllPanels();
          } else {
            loadSpecialTab(tab);
          }
          return;
        }

        const boardBtn = e.target.closest(".s1w-drawer-board[data-fid]");
        if (boardBtn) {
          const fid = boardBtn.getAttribute("data-fid");
          state.drawerOpen = false;
          state.activeTypeId = "";
          state.listFilter = "all";
          if (isLiveHost) {
            try { history.pushState({ fid }, "", buildBoardUrl(fid, 1)); } catch {}
          }
          loadBoardList(fid);
          renderAllPanels();
          return;
        }

        const filterBtn = e.target.closest("[data-list-filter]");
        if (filterBtn) {
          state.listFilter = filterBtn.getAttribute("data-list-filter");
          loadBoardList(state.listFid || state.activeFid);
          return;
        }

        const convBtn = e.target.closest(".s1w-conv-item[data-tid]");
        if (convBtn) {
          const tid = convBtn.getAttribute("data-tid");
          const pid = convBtn.getAttribute("data-pid");
          if (tid) {
            if (pid) {
              loadThread(tid, 1, { highlightPid: pid });
            } else {
              const saved = state.lastReadMap?.[String(tid)];
              loadThread(tid, saved?.page || 1, { restorePid: saved?.pid || "" });
            }
          }
          return;
        }

        const recTab = e.target.closest("[data-records-tab]");
        if (recTab) {
          state.recordsTab = recTab.getAttribute("data-records-tab");
          renderRecordsPanelIfOpen();
          return;
        }

        const recJumpPidBtn = e.target.closest("[data-rec-jump-pid]");
        if (recJumpPidBtn) {
          const pid = recJumpPidBtn.getAttribute("data-rec-jump-pid");
          const chatScroll = rootEl.querySelector(".s1w-chat-scroll");
          const targetEl = pid ? rootEl.querySelector(`#s1w-post-${CSS.escape(pid)}`) : null;
          if (targetEl && chatScroll) {
            chatScroll.scrollTop = Math.max(0, targetEl.offsetTop - 12);
            targetEl.classList.add("s1w-msg-highlight");
            setTimeout(() => targetEl.classList.remove("s1w-msg-highlight"), 2000);
          }
          return;
        }

        const recImgCard = e.target.closest("[data-rec-preview-img]");
        if (recImgCard && !e.target.closest("[data-rec-jump-pid]")) {
          const url = recImgCard.getAttribute("data-rec-preview-img");
          const allImgs = Array.from(rootEl.querySelectorAll("[data-rec-preview-img]"))
            .map((el) => el.getAttribute("data-rec-preview-img"))
            .filter(Boolean);
          openLightbox(url, allImgs);
          return;
        }

        const recJumpBtn = e.target.closest("[data-rec-jump]");
        if (recJumpBtn && state.activeThread) {
          const act = recJumpBtn.getAttribute("data-rec-jump");
          const maxP = Math.max(1, Number(state.activeThread.totalPages || 1));
          if (act === "page") {
            const val = clamp(Number(rootEl.querySelector(".s1w-rec-page-input")?.value) || 1, 1, maxP);
            loadThread(state.activeThread.tid, val);
          } else if (act === "last") {
            loadThread(state.activeThread.tid, maxP);
          } else if (act === "floor") {
            const fl = Number(rootEl.querySelector(".s1w-rec-floor-input")?.value) || 1;
            jumpToFloorNumber(fl);
          } else if (act === "load-more") {
            loadNextThreadPage();
          }
          return;
        }

        const toolBtn = e.target.closest("[data-composer-tool]");
        if (toolBtn) {
          const tool = toolBtn.getAttribute("data-composer-tool");
          if (tool === "emoji") toggleSmileyPicker();
          else if (tool === "img") {
            const url = window.prompt("输入图片地址:");
            if (url && url.trim()) insertIntoTextarea(`[img]${url.trim()}[/img]`);
          } else if (tool === "attach") {
            rootEl.querySelector(".s1w-attach-input")?.click();
          } else if (tool === "whiteout") {
            wrapWhiteoutSelection();
          } else if (tool === "preview") {
            state.composerPreview = !state.composerPreview;
            renderComposerPreview();
          } else if (tool === "chat-records") {
            state.recordsOpen = !state.recordsOpen;
            renderRecordsPanelIfOpen();
            if (state.recordsOpen) rootEl.querySelector(".s1w-records-search-input")?.focus();
          }
          return;
        }

        const menuAct = e.target.closest("[data-menu-action]");
        if (menuAct) {
          const act = menuAct.getAttribute("data-menu-action");
          if (act === "native-view") {
            switchToNativeView();
          } else if (act === "poll-settings") {
            openPollSettingsModal();
          } else if (act === "tags-manager") {
            openTagsManagerModal();
          } else if (act === "app-login") {
            openAppLoginModal();
          } else if (act === "copy-thread-link" && state.activeThread) {
            copyTextToClipboard(formatThreadLink(state.activeThread.tid, state.threadPage)).then((ok) => showToast(ok ? "已复制帖子链接" : "复制失败"));
          } else if (act === "toggle-hide-tail") {
            state.hideTail = !state.hideTail;
            writeStorage(STORAGE_KEYS.hideTail, state.hideTail ? "1" : "0");
            const s = rootEl.querySelector("[data-hide-tail-state]");
            if (s) s.textContent = state.hideTail ? "开" : "关";
            showToast(state.hideTail ? "已开启隐藏小尾巴" : "已关闭隐藏小尾巴");
            renderChatOnly({ preserveScroll: true });
          } else if (act === "toggle-chat-avatar") {
            state.hideChatAvatar = !state.hideChatAvatar;
            writeStorage(STORAGE_KEYS.hideChatAvatar, state.hideChatAvatar ? "1" : "0");
            const s = rootEl.querySelector("[data-chat-avatar-state]");
            if (s) s.textContent = state.hideChatAvatar ? "开" : "关";
            renderChatOnly({ preserveScroll: true });
          }
          railMenu?.setAttribute("hidden", "");
          chatMenu?.setAttribute("hidden", "");
          return;
        }

        const actEl = e.target.closest("[data-action]");
        if (!actEl) return;
        const act = actEl.getAttribute("data-action");
        if (act === "me") toggleSelfPopover();
        else if (act === "composer-account-menu") toggleComposerAccountPopover();
        else if (act === "cycle-theme") {
          const order = ["auto", "light", "dark"];
          state.themeMode = order[(order.indexOf(state.themeMode) + 1) % order.length];
          writeStorage(STORAGE_KEYS.themeMode, state.themeMode);
          applyThemeAndLock();
          renderAllPanels();
        } else if (act === "rail-settings") {
          if (railMenu.hasAttribute("hidden")) railMenu.removeAttribute("hidden");
          else railMenu.setAttribute("hidden", "");
        } else if (act === "more-chat-menu") {
          if (chatMenu.hasAttribute("hidden")) chatMenu.removeAttribute("hidden");
          else chatMenu.setAttribute("hidden", "");
        } else if (act === "close-drawer") {
          state.drawerOpen = false;
          renderAllPanels();
        } else if (act === "close-records") {
          state.recordsOpen = false;
          renderRecordsPanelIfOpen();
        } else if (act === "app-login") {
          openAppLoginModal();
        } else if (act === "jump-first-floor") {
          jumpToFirstFloor();
        } else if (act === "jump-last-floor" || act === "jump-new-replies") {
          jumpToLastFloor();
        } else if (act === "new-thread") {
          openNewThreadModal();
        } else if (act === "toggle-hide-unread") {
          state.hideUnreadBadge = !state.hideUnreadBadge;
          writeStorage(STORAGE_KEYS.hideUnreadBadge, state.hideUnreadBadge ? "1" : "0");
          updateUnreadToggleButton();
          renderListOnly({ preserveScroll: true });
          showToast(state.hideUnreadBadge ? "已隐藏列表未读数字" : "已显示列表未读数字");
        } else if (act === "toggle-no-image") {
          state.noImageMode = !state.noImageMode;
          writeStorage(STORAGE_KEYS.noImageMode, state.noImageMode ? "1" : "0");
          const btn = rootEl.querySelector('[data-action="toggle-no-image"]');
          if (btn) btn.classList.toggle("active", state.noImageMode);
          showToast(state.noImageMode ? "已开启帖子无图模式" : "已关闭帖子无图模式");
          renderChatOnly({ preserveScroll: true });
        } else if (act === "load-prev-page") {
          loadPrevThreadPage();
        } else if (act === "submit-poll") {
          submitPollVote(actEl);
        } else if (act === "clear-history") {
          clearHistory();
          loadSpecialTab("history");
        } else if (act === "exit-search") {
          loadBoardList(state.listFid || state.activeFid);
        } else if (act === "load-more-list") {
          state.listPage += 1;
          loadBoardList(state.listFid || state.activeFid, { append: true });
        } else if (act === "only-op" && state.activeThread) {
          if (state.filterAuthorId) {
            state.filterAuthorId = "";
            state.filterAuthorName = "";
          } else if (state.activeThread.authorid) {
            state.filterAuthorId = String(state.activeThread.authorid);
            state.filterAuthorName = state.activeThread.author || "";
          }
          loadThread(state.activeThread.tid, 1);
        } else if (act === "fav-thread" && state.activeThread) {
          if (!state.user.uid || state.user.uid === "0") {
            showToast("请先登录后收藏");
            return;
          }
          api.toggleFavorite({ tid: state.activeThread.tid, formhash: state.user.formhash })
            .then((res) => showToast(res.message || "已收藏"))
            .catch((err) => showToast(`收藏失败: ${err.message}`));
        } else if (act === "refresh-thread" && state.activeThread) {
          loadThread(state.activeThread.tid, state.loadedMinPage || state.threadPage, { pushUrl: false, force: true });
        } else if (act === "watermark-modal") {
          openWatermarkModal();
        } else if (act === "native-view") {
          switchToNativeView();
        } else if (act === "wecom-view") {
          state.viewMode = "im";
          writeStorage(STORAGE_KEYS.viewMode, "im");
          applyThemeAndLock();
        } else if (act === "clear-quote") {
          state.quoteReply = null;
          updateComposerStatus();
        } else if (act === "send-reply") {
          submitReply();
        }
      });

      rootEl.addEventListener("input", (e) => {
        if (e.target.matches(".s1w-records-search-input")) {
          state.recordsQuery = e.target.value;
          renderRecordsPanelIfOpen();
        }
      });

      rootEl.addEventListener("change", (e) => {
        if (e.target.matches(".s1w-type-select")) {
          state.activeTypeId = e.target.value;
          loadBoardList(state.listFid || state.activeFid);
        } else if (e.target.matches(".s1w-rec-author-select")) {
          state.recordsAuthor = e.target.value;
          renderRecordsPanelIfOpen();
        } else if (e.target.matches(".s1w-rec-date-select")) {
          state.recordsDate = e.target.value;
          renderRecordsPanelIfOpen();
        } else if (e.target.matches(".s1w-attach-input")) {
          handleFileUploads(e.target.files);
          e.target.value = "";
        } else if (e.target.matches('.s1w-poll-input[type="checkbox"]')) {
          const card = e.target.closest(".s1w-poll-card");
          const maxChoices = Math.max(1, Number(e.target.getAttribute("data-poll-max") || 1));
          const checkedCount = card ? card.querySelectorAll('.s1w-poll-input[type="checkbox"]:checked').length : 0;
          if (e.target.checked && checkedCount > maxChoices) {
            e.target.checked = false;
            showToast(`最多只能选择 ${maxChoices} 项`);
          }
        }
      });

      rootEl.addEventListener("paste", (e) => {
        if (!e.target.matches?.(".s1w-textarea")) return;
        const files = Array.from(e.clipboardData?.files || []).filter((f) => /^image\//i.test(f.type || ""));
        if (files.length) {
          e.preventDefault();
          handleFileUploads(files);
        }
      });

      rootEl.addEventListener("submit", async (e) => {
        if (!e.target.matches(".s1w-search-form")) return;
        e.preventDefault();
        const q = e.target.querySelector(".s1w-search-input")?.value.trim() || "";
        if (!q) return;
        state.navTab = "search";
        state.listLoading = true;
        state.listItems = [];
        renderListOnly();
        try {
          state.listItems = await api.searchForum(q, state.user.formhash);
        } catch (err) {
          state.listError = `搜索失败: ${err.message}`;
        } finally {
          state.listLoading = false;
          renderListOnly();
        }
      });

      rootEl.addEventListener("keydown", (e) => {
        if (e.target.matches(".s1w-textarea") && e.key === "Enter" && !e.shiftKey) {
          e.preventDefault();
          submitReply();
        } else if (e.target.matches(".s1w-rec-page-input") && e.key === "Enter" && state.activeThread) {
          e.preventDefault();
          const maxP = Math.max(1, Number(state.activeThread.totalPages || 1));
          loadThread(state.activeThread.tid, clamp(Number(e.target.value) || 1, 1, maxP));
        } else if (e.target.matches(".s1w-rec-floor-input") && e.key === "Enter" && state.activeThread) {
          e.preventDefault();
          jumpToFloorNumber(Number(e.target.value) || 1);
        } else if (e.target.matches(".s1w-conv-item[data-tid]") && (e.key === "Enter" || e.key === " ")) {
          e.preventDefault();
          e.target.click();
        }
      });

      // Auto-load next page when scrolling near bottom of list or chat stream + save reading progress
      const listScrollEl = rootEl.querySelector(".s1w-list-scroll");
      if (listScrollEl) {
        listScrollEl.addEventListener("scroll", () => {
          if (state.navTab !== "msg" || !state.hasMoreList || state.listLoading) return;
          const remaining = listScrollEl.scrollHeight - listScrollEl.scrollTop - listScrollEl.clientHeight;
          if (remaining < 140) {
            state.listPage += 1;
            loadBoardList(state.listFid || state.activeFid, { append: true });
          }
        }, { passive: true });
      }

      const chatScrollEl = rootEl.querySelector(".s1w-chat-scroll");
      if (chatScrollEl) {
        chatScrollEl.addEventListener("scroll", () => {
          scheduleCaptureProgress();
          if (state.chatLoading || state.chatAppending || state.chatPrepending || !state.activeThread) return;
          if (
            chatScrollEl.scrollTop < 220 &&
            state.loadedMinPage > 1 &&
            Date.now() > suppressPrevAutoLoadUntil &&
            chatScrollEl.scrollHeight > chatScrollEl.clientHeight + 40
          ) {
            loadPrevThreadPage();
            return;
          }
          const remaining = chatScrollEl.scrollHeight - chatScrollEl.scrollTop - chatScrollEl.clientHeight;
          if (state.loadedMaxPage >= (state.activeThread.totalPages || 1)) {
            if (remaining < 80 && state.pendingNewRepliesCount > 0) {
              state.pendingNewRepliesCount = 0;
              updateNewMsgPill();
              saveLastRead(state.activeTid, { replies: state.activeThread.replies });
              state.lastReadMap = readLastReadMap();
              renderListOnly({ preserveScroll: true });
            }
            return;
          }
          if (remaining < 220) {
            loadNextThreadPage();
          }
        }, { passive: true });
        chatScrollEl.addEventListener("wheel", (e) => {
          if (e.deltaY >= 0) return;
          if (state.chatLoading || state.chatAppending || state.chatPrepending || !state.activeThread) return;
          if (state.loadedMinPage <= 1 || Date.now() <= suppressPrevAutoLoadUntil) return;
          if (chatScrollEl.scrollTop <= 12) {
            loadPrevThreadPage();
          }
        }, { passive: true });
      }

      document.addEventListener("visibilitychange", () => {
        if (document.visibilityState === "hidden") captureReadingProgress();
      });
      window.addEventListener("pagehide", captureReadingProgress);

      // Drag resize middle list panel
      const resizer = rootEl.querySelector(".s1w-list-resizer");
      if (resizer) {
        let resizing = false;
        resizer.addEventListener("mousedown", (e) => {
          e.preventDefault();
          resizing = true;
          resizer.classList.add("dragging");
        });
        window.addEventListener("mousemove", (e) => {
          if (!resizing) return;
          const railOffset = rootEl.querySelector(".s1w-rail")?.offsetWidth || 56;
          const w = clamp(e.clientX - railOffset, LIST_MIN_WIDTH, LIST_MAX_WIDTH);
          state.listWidth = w;
          document.documentElement.style.setProperty("--wc-list", `${w}px`);
        });
        window.addEventListener("mouseup", () => {
          if (!resizing) return;
          resizing = false;
          resizer.classList.remove("dragging");
          writeStorage(STORAGE_KEYS.listWidth, state.listWidth);
        });
      }

      window.addEventListener("keydown", (e) => {
        if (e.altKey && (e.key === "w" || e.key === "W" || e.key === "o" || e.key === "O")) {
          e.preventDefault();
          if (state.viewMode === "im") {
            switchToNativeView();
          } else {
            state.viewMode = "im";
            writeStorage(STORAGE_KEYS.viewMode, "im");
            applyThemeAndLock();
          }
        } else if (e.key === "Escape") {
          closeModal();
          closePopovers();
          closeConvContextMenu();
          rootEl.querySelector(".s1w-lightbox")?.remove();
          if (state.recordsOpen) {
            state.recordsOpen = false;
            renderRecordsPanelIfOpen();
          }
        }
      });

      window.addEventListener("popstate", () => {
        const r = parseStage1stRoute(location.pathname, location.search);
        applyThemeAndLock();
        if (r.type === "thread") loadThread(r.tid, r.page, { pushUrl: false });
        else if (r.type === "board") loadBoardList(r.fid);
      });

      if (mql) {
        mql.addEventListener?.("change", () => {
          if (state.themeMode === "auto") applyThemeAndLock();
        });
      }

      // Guard document.title from being overwritten by native forum scripts
      const titleEl = document.querySelector("title");
      if (titleEl && typeof MutationObserver !== "undefined") {
        new MutationObserver(() => {
          if (state.viewMode === "im" && !document.title.endsWith("企业微信")) {
            originalTitle = document.title;
            updatePageTitle();
          }
        }).observe(titleEl, { childList: true });
      }

      // Refresh relative timestamps every 60 seconds
      setInterval(() => {
        if (!rootEl || state.viewMode !== "im") return;
        rootEl.querySelectorAll("[data-ts]").forEach((el) => {
          const ts = Number(el.getAttribute("data-ts"));
          if (ts) el.textContent = formatRelativeTime(ts);
        });
      }, 60 * 1000);

      restartPollTimers();
    }

    async function mount() {
      injectStyle();
      applyThemeAndLock();
      if (!document.body) return;

      const boot = bootstrapFromDocument(document, window);
      if (boot?.user) {
        state.user = { ...state.user, ...boot.user };
      }

      rootEl = document.getElementById(ROOT_ID);
      if (!rootEl) {
        rootEl = document.createElement("div");
        rootEl.id = ROOT_ID;
        document.body.appendChild(rootEl);
      }
      rootEl.innerHTML = renderShellHtml(state);
      bindEvents();
      renderAllPanels();

      // Load initial data sequentially/gently to avoid 503 rate limits
      try {
        const idx = await api.getForumIndex();
        if (idx.user?.uid && idx.user.uid !== "0") {
          state.user = idx.user;
        } else if (idx.user?.formhash) {
          state.user.formhash = idx.user.formhash;
        }
        if (idx.categories?.length) state.categories = idx.categories;
        if (idx.boards?.length) state.boards = idx.boards;
        renderAllPanels();
      } catch {
        state.categories = FALLBACK_BOARDS.categories.map((c) => ({
          cid: c.cid,
          name: c.name,
          boards: c.fids.map((fid) => state.boards.find((b) => b.fid === fid)).filter(Boolean)
        }));
      }

      await loadBoardList(state.activeFid);
      if (initialRoute.type === "thread" && initialRoute.tid) {
        const saved = initialRoute.page === 1 ? state.lastReadMap?.[String(initialRoute.tid)] : null;
        await loadThread(initialRoute.tid, saved?.page || initialRoute.page, {
          pushUrl: false,
          restorePid: saved?.pid || ""
        });
      } else if (initialRoute.type === "findpost" && initialRoute.pid) {
        const resolved = await api.resolveFindPostUrl(initialRoute.pid, initialRoute.tid).catch(() => "");
        const rr = resolved ? parseStage1stRoute(new URL(resolved).pathname, new URL(resolved).search) : null;
        if (rr?.tid) await loadThread(rr.tid, rr.page || 1, { pushUrl: false, highlightPid: initialRoute.pid });
      } else if (window.__S1_WECOM_PREVIEW__ && !state.activeTid && state.listItems.length) {
        const firstTid = state.listItems[0].tid;
        const saved = state.lastReadMap?.[String(firstTid)];
        await loadThread(firstTid, saved?.page || 1, { pushUrl: false, restorePid: saved?.pid || "" });
      }
    }

    injectStyle();
    applyThemeAndLock();
    if (document.readyState === "loading") {
      document.addEventListener("DOMContentLoaded", mount, { once: true });
    } else {
      mount();
    }
  }

  if (typeof window !== "undefined" && typeof document !== "undefined" && !window.__S1_WECOM_MANUAL_START__) {
    startStage1stWeComApp();
  }
})();
