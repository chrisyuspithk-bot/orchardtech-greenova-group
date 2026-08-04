/* 404 page — bilingual strings rendered together (both languages on one page). */
OG.register("error", {
  zh: {
    "err.title": "找不到此页面",
    "err.body": "您访问的页面可能已被移动、删除，或链接地址有误。",
    "err.btn": "返回首页"
  },
  en: {
    "err.title": "Page Not Found",
    "err.body": "The page you are looking for may have been moved, deleted, or the link may be incorrect.",
    "err.btn": "Back to Home"
  }
});

OG.registerMeta({
  zh: { title: "404 · 找不到此页面 | OrchardTech Greenova", desc: "您访问的页面不存在。" },
  en: { title: "404 · Page Not Found | OrchardTech Greenova", desc: "The page you requested does not exist." }
});
