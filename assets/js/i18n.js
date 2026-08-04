/* ==========================================================================
   OrchardTech Greenova — i18n.js
   Client-side locale engine: zh-HK 繁體 (default) / zh-CN 简体 / en.
   - Content registers via OG.register(scope, {zh:{...}, cn:{...}, en:{...}})
   - Elements opt in with [data-i18n="key"]; attribute swaps via
     [data-i18n-attr="placeholder:form.name.ph,aria-label:nav.home"]
   - Choice persists in localStorage("og-locale"); ?lang=zh|cn|en overrides;
     falls back to navigator.language (Hans regions -> cn, else zh / en).
   ========================================================================== */
(function () {
  "use strict";

  var OG = (window.OG = window.OG || {});
  var LOCALES = ["zh", "cn", "en"];
  var HTML_LANG = { zh: "zh-HK", cn: "zh-CN", en: "en" };
  var OG_LOCALE = { zh: "zh_HK", cn: "zh_CN", en: "en_US" };
  var store = { common: { zh: {}, cn: {}, en: {} } };
  var meta = {
    zh: { title: "", desc: "" },
    cn: { title: "", desc: "" },
    en: { title: "", desc: "" }
  };

  OG.register = function (scope, dict) {
    store[scope] = dict;
  };

  OG.registerMeta = function (m) {
    meta = m;
  };

  function valid(locale) {
    return LOCALES.indexOf(locale) !== -1;
  }

  // Map arbitrary language tags ("zh-Hans-CN", "zh-tw", "en-GB"...) to a locale
  function normalise(tag) {
    if (!tag) return null;
    var t = String(tag).toLowerCase();
    if (t === "cn") return "cn";
    if (t.indexOf("en") === 0) return "en";
    if (t.indexOf("zh") === 0) {
      if (t.indexOf("hans") !== -1 || t.indexOf("cn") !== -1 ||
          t.indexOf("sg") !== -1 || t.indexOf("my") !== -1) return "cn";
      return "zh";
    }
    return null;
  }

  function lookup(locale, key) {
    var scopes = Object.keys(store);
    // page scope first (registered last wins for duplicates)
    for (var i = scopes.length - 1; i >= 0; i--) {
      var dict = store[scopes[i]] && store[scopes[i]][locale];
      if (dict && Object.prototype.hasOwnProperty.call(dict, key)) return dict[key];
    }
    return null;
  }

  OG.detectLocale = function () {
    var params = new URLSearchParams(window.location.search);
    var q = normalise(params.get("lang"));
    if (q) return q;
    try {
      var saved = localStorage.getItem("og-locale");
      if (saved && valid(saved)) return saved;
    } catch (e) { /* storage unavailable */ }
    return normalise(navigator.language || "zh") || "zh";
  };

  OG.getLocale = function () {
    return normalise(document.documentElement.getAttribute("lang")) || "zh";
  };

  OG.applyLocale = function (locale) {
    if (!valid(locale)) locale = "zh";
    var html = document.documentElement;
    html.setAttribute("lang", HTML_LANG[locale]);

    // Text nodes
    document.querySelectorAll("[data-i18n]").forEach(function (el) {
      var value = lookup(locale, el.getAttribute("data-i18n"));
      if (value != null) el.textContent = value;
    });

    // Attribute swaps: data-i18n-attr="attr:key, attr:key"
    document.querySelectorAll("[data-i18n-attr]").forEach(function (el) {
      el.getAttribute("data-i18n-attr").split(",").forEach(function (pair) {
        var parts = pair.split(":");
        if (parts.length < 2) return;
        var attr = parts[0].trim();
        var key = parts.slice(1).join(":").trim();
        var value = lookup(locale, key);
        if (value != null) el.setAttribute(attr, value);
      });
    });

    // Meta + Open Graph
    var m = meta[locale] || meta.zh;
    if (m && m.title) document.title = m.title;
    setMeta('name', 'description', m.desc);
    setMeta('property', 'og:title', m.title);
    setMeta('property', 'og:description', m.desc);
    setMeta('property', 'og:locale', OG_LOCALE[locale]);
    setMeta('name', 'twitter:title', m.title);
    setMeta('name', 'twitter:description', m.desc);

    // Toggle UI
    document.querySelectorAll(".lang-toggle button").forEach(function (btn) {
      btn.setAttribute("aria-pressed", String(btn.getAttribute("data-lang") === locale));
    });

    try { localStorage.setItem("og-locale", locale); } catch (e) { /* ignore */ }
    document.dispatchEvent(new CustomEvent("og:locale", { detail: { locale: locale } }));
  };

  function setMeta(kind, key, value) {
    if (!value) return;
    var el = document.querySelector('meta[' + kind + '="' + key + '"]');
    if (el) el.setAttribute("content", value);
  }

  OG.initI18n = function () {
    document.querySelectorAll(".lang-toggle button").forEach(function (btn) {
      btn.addEventListener("click", function () {
        OG.applyLocale(btn.getAttribute("data-lang"));
      });
    });
    OG.applyLocale(OG.detectLocale());
  };

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", OG.initI18n);
  } else {
    OG.initI18n();
  }
})();
