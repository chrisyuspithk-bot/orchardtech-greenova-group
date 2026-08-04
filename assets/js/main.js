/* ==========================================================================
   OrchardTech Greenova — main.js
   Header state, mobile menu, active nav, scroll reveals, animated counters,
   charts reveal, back-to-top, contact form validation + endpoint submit.
   All motion respects prefers-reduced-motion (design-guide.md §8).
   ========================================================================== */
(function () {
  "use strict";

  var reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

  /* ---------- Mobile menu ---------- */
  var navToggle = document.querySelector(".nav-toggle");
  var mobileMenu = document.querySelector(".mobile-menu");
  function setMenu(open) {
    document.body.classList.toggle("menu-open", open);
    if (navToggle) navToggle.setAttribute("aria-expanded", String(open));
    if (mobileMenu) mobileMenu.setAttribute("aria-hidden", String(!open));
    document.body.style.overflow = open ? "hidden" : "";
  }
  if (navToggle) {
    navToggle.addEventListener("click", function () {
      setMenu(!document.body.classList.contains("menu-open"));
    });
  }
  document.addEventListener("keydown", function (e) {
    if (e.key === "Escape" && document.body.classList.contains("menu-open")) setMenu(false);
  });
  if (mobileMenu) {
    mobileMenu.querySelectorAll("a").forEach(function (a) {
      a.addEventListener("click", function () { setMenu(false); });
    });
  }

  /* ---------- Active nav state ---------- */
  var page = document.body.getAttribute("data-page");
  if (page) {
    document.querySelectorAll("[data-nav]").forEach(function (a) {
      if (a.getAttribute("data-nav") === page) a.setAttribute("aria-current", "page");
    });
  }

  /* ---------- Scroll reveal (§8: fade + 20px, stagger 70ms) ---------- */
  var revealEls = Array.prototype.slice.call(document.querySelectorAll(".reveal"));
  document.querySelectorAll("[data-stagger]").forEach(function (group) {
    Array.prototype.slice.call(group.querySelectorAll(".reveal")).forEach(function (el, i) {
      el.style.setProperty("--reveal-delay", i * 70 + "ms");
    });
  });
  if ("IntersectionObserver" in window && !reduceMotion) {
    var revealIO = new IntersectionObserver(function (entries) {
      entries.forEach(function (entry) {
        if (entry.isIntersecting) {
          entry.target.classList.add("is-visible");
          revealIO.unobserve(entry.target);
        }
      });
    }, { threshold: 0.12, rootMargin: "0px 0px -6% 0px" });
    revealEls.forEach(function (el) { revealIO.observe(el); });
  } else {
    revealEls.forEach(function (el) { el.classList.add("is-visible"); });
  }

  /* ---------- Animated counters (§8: 1.4s ease-out, integer) ---------- */
  function animateCount(el) {
    var target = parseFloat(el.getAttribute("data-count"));
    if (isNaN(target)) return;
    if (reduceMotion) { el.textContent = String(target); return; }
    var duration = 1400;
    var start = null;
    function frame(ts) {
      if (start === null) start = ts;
      var p = Math.min((ts - start) / duration, 1);
      var eased = 1 - Math.pow(1 - p, 3); // ease-out cubic
      el.textContent = String(Math.round(target * eased));
      if (p < 1) requestAnimationFrame(frame);
    }
    requestAnimationFrame(frame);
  }
  var counters = document.querySelectorAll("[data-count]");
  if ("IntersectionObserver" in window) {
    var countIO = new IntersectionObserver(function (entries) {
      entries.forEach(function (entry) {
        if (entry.isIntersecting) {
          animateCount(entry.target);
          countIO.unobserve(entry.target);
        }
      });
    }, { threshold: 0.4 });
    counters.forEach(function (el) { countIO.observe(el); });
  } else {
    counters.forEach(animateCount);
  }

  /* ---------- Use-of-proceeds bar reveal ---------- */
  var uop = document.querySelector(".uop");
  if (uop && "IntersectionObserver" in window) {
    var uopIO = new IntersectionObserver(function (entries) {
      entries.forEach(function (entry) {
        if (entry.isIntersecting) {
          entry.target.classList.add("is-visible");
          uopIO.unobserve(entry.target);
        }
      });
    }, { threshold: 0.35 });
    uopIO.observe(uop);
  } else if (uop) {
    uop.classList.add("is-visible");
  }

  /* ---------- Back to top (§6.10) ---------- */
  var btt = document.querySelector(".back-to-top");
  function onScrollBtt() {
    if (!btt) return;
    btt.classList.toggle("is-visible", window.scrollY > 600);
  }
  window.addEventListener("scroll", onScrollBtt, { passive: true });
  onScrollBtt();
  if (btt) {
    btt.addEventListener("click", function () {
      window.scrollTo({ top: 0, behavior: reduceMotion ? "auto" : "smooth" });
    });
  }

  /* ---------- Contact form: client validation + endpoint submit ---------- */
  var form = document.querySelector("#enquiry-form");
  if (form) {
    var status = document.querySelector("#form-status");

    function fieldOf(input) { return input.closest(".form-field"); }
    function setInvalid(input, invalid) {
      var f = fieldOf(input);
      if (f) f.classList.toggle("is-invalid", invalid);
      input.setAttribute("aria-invalid", String(invalid));
    }
    function validate(input) {
      var value = input.value.trim();
      var ok = true;
      if (input.hasAttribute("required") && !value) ok = false;
      if (ok && input.type === "email" && value) ok = /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value);
      if (ok && input.type === "tel" && value) ok = /^[+\d][\d\s()-]{5,}$/.test(value);
      setInvalid(input, !ok);
      return ok;
    }

    form.querySelectorAll("input, select, textarea").forEach(function (input) {
      input.addEventListener("blur", function () { validate(input); });
      input.addEventListener("input", function () {
        var f = fieldOf(input);
        if (f && f.classList.contains("is-invalid")) validate(input);
      });
    });

    form.addEventListener("submit", function (e) {
      e.preventDefault();
      var inputs = Array.prototype.slice.call(form.querySelectorAll("input, select, textarea"));
      var allOk = inputs.map(validate).every(Boolean);
      if (!allOk) {
        var firstBad = form.querySelector(".is-invalid input, .is-invalid select, .is-invalid textarea");
        if (firstBad) firstBad.focus();
        return;
      }
      var submitBtn = form.querySelector('button[type="submit"]');
      if (submitBtn) { submitBtn.disabled = true; }

      var data = {};
      inputs.forEach(function (i) { data[i.name] = i.value.trim(); });
      data._locale = document.documentElement.getAttribute("lang") || "zh-HK";

      fetch(form.action, {
        method: "POST",
        headers: { "Content-Type": "application/json", "Accept": "application/json" },
        body: JSON.stringify(data)
      }).then(function (res) {
        if (!res.ok) throw new Error("endpoint " + res.status);
        showStatus("success");
        form.reset();
      }).catch(function () {
        showStatus("error");
      }).finally(function () {
        if (submitBtn) { submitBtn.disabled = false; }
      });
    });

    function showStatus(kind) {
      if (!status) return;
      status.classList.remove("form-status--success", "form-status--error", "is-visible");
      var success = kind === "success";
      status.classList.add(success ? "form-status--success" : "form-status--error", "is-visible");
      status.querySelectorAll("[data-status-kind]").forEach(function (el) {
        el.hidden = el.getAttribute("data-status-kind") !== kind;
      });
      status.setAttribute("tabindex", "-1");
      status.focus();
    }
  }
})();
