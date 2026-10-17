/* ============================================================
 *  诡序档案馆 · 交互脚本
 *  路由 / 渲染 / 筛选 / 弹窗 / 留言板
 * ============================================================ */
(function () {
  "use strict";

  var CFG = window.SITE_CONFIG || {};

  /* ---------- 状态 ---------- */
  var state = {
    route: "home",
    camp: "全部",
    status: "全部",
    keyword: ""
  };

  var $ = function (id) { return document.getElementById(id); };

  /* ---------- 站点信息填充 ---------- */
  function applySiteInfo() {
    var name = CFG.siteName || "诡序档案馆";
    var world = CFG.worldName || name;
    var tagline = CFG.tagline || "";
    var group = CFG.groupName || "";
    $("brandName").textContent = name;
    $("heroWorldName").textContent = world;
    $("heroTagline").textContent = tagline;
    $("footerName").textContent = name;
    $("footerGroup").textContent = group ? "群：" + group : "";
    document.title = name + " · 群世界观";
  }

  /* ---------- 世界观主页渲染 ---------- */
  function renderWorld() {
    var core = window.WORLD_CORE || [];
    var camps = window.WORLD_CAMPS || [];
    var rules = window.PLAYER_RULES || [];

    var coreHtml = core.map(function (c, i) {
      return '<div class="core-card">' +
        '<span class="card-no">0' + (i + 1) + '</span>' +
        '<h3>' + esc(c.title) + '</h3>' +
        '<p>' + esc(c.desc) + '</p></div>';
    }).join("");

    var campHtml = camps.map(function (c) {
      return '<div class="camp-card">' +
        '<span class="camp-tag">' + esc(c.tag) + '</span>' +
        '<h3>' + esc(c.name) + '</h3>' +
        '<p>' + esc(c.desc) + '</p></div>';
    }).join("");

    var rulesHtml = rules.map(function (r, i) {
      return '<div class="rule-item">' +
        '<span class="rule-no">' + (i + 1) + '</span>' +
        '<span class="rule-text">' + esc(r) + '</span></div>';
    }).join("");

    $("coreCards").innerHTML = coreHtml;
    $("campCards").innerHTML = campHtml;
    $("rulesList").innerHTML = rulesHtml;
  }

  /* ---------- 人设档案渲染 ---------- */
  var STATUS_MAP = {
    alive: { label: "存活", cls: "status-alive" },
    missing: { label: "失踪", cls: "status-missing" },
    fallen: { label: "陨落", cls: "status-fallen" },
    anomaly: { label: "异常化", cls: "status-anomaly" }
  };

  function statusInfo(s) {
    return STATUS_MAP[s] || { label: s || "未知", cls: "status-default" };
  }

  function avatarMarkup(c, sizeCls) {
    var src = c.avatar;
    var ch = (c.name || "?").charAt(0);
    if (src) {
      return '<div class="char-avatar ' + (sizeCls || "") + '" style="background-image:url(' + src + ');background-size:cover;background-position:center;"><img src="' + src + '" alt="" style="display:none" onerror="this.parentElement.textContent=\'' + esc(ch) + '\'"></div>';
    }
    return '<div class="char-avatar ' + (sizeCls || "") + '">' + esc(ch) + '</div>';
  }

  function filteredChars() {
    var all = window.CHARACTERS || [];
    return all.filter(function (c) {
      var st = statusInfo(c.status).label;
      if (state.camp !== "全部" && c.camp !== state.camp) return false;
      if (state.status !== "全部" && st !== state.status) return false;
      if (state.keyword) {
        var kw = state.keyword.toLowerCase();
        var hay = [c.name, c.title, c.camp, c.ability || "", c.qq || ""].join(" ").toLowerCase();
        if (hay.indexOf(kw) === -1) return false;
      }
      return true;
    });
  }

  function renderFilters() {
    var all = window.CHARACTERS || [];
    var camps = ["全部"].concat(unique(all.map(function (c) { return c.camp; })));
    var statuses = ["全部"].concat(unique(all.map(function (c) { return statusInfo(c.status).label; })));

    $("campChips").innerHTML = camps.map(function (c) {
      return '<button class="chip' + (state.camp === c ? " active" : "") + '" data-camp="' + esc(c) + '">' + esc(c) + '</button>';
    }).join("");
    $("statusChips").innerHTML = statuses.map(function (s) {
      return '<button class="chip' + (state.status === s ? " active" : "") + '" data-status="' + esc(s) + '">' + esc(s) + '</button>';
    }).join("");
  }

  function renderChars() {
    var list = filteredChars();
    var grid = $("charGrid");
    if (!list.length) {
      grid.innerHTML = "";
      $("emptyHint").hidden = false;
      return;
    }
    $("emptyHint").hidden = true;
    grid.innerHTML = list.map(function (c) {
      var st = statusInfo(c.status);
      return '<div class="char-card" data-idx="' + window.CHARACTERS.indexOf(c) + '">' +
        avatarMarkup(c) +
        '<div class="char-top">' +
        '<div><div class="char-name">' + esc(c.name) + '</div>' +
        '<div class="char-title">' + esc(c.title) + '</div></div>' +
        '<span class="char-status ' + st.cls + '">' + st.label + '</span></div>' +
        '<p class="char-ability">' + esc(c.ability || "") + '</p>' +
        '<div class="char-meta">' +
        '<span>' + esc(c.camp || "未定阵营") + '</span>' +
        '<span class="danger-level">Lv.' + esc(c.level || "?") + '</span>' +
        (c.qq ? '<span>' + esc(c.qq) + '</span>' : "") +
        '</div></div>';
    }).join("");
  }

  /* ---------- 详情弹窗 ---------- */
  function openModal(idx) {
    var all = window.CHARACTERS || [];
    var c = all[idx];
    if (!c) return;
    var st = statusInfo(c.status);
    var details = (c.details && c.details.length)
      ? '<div class="modal-block"><h4>补充记录</h4><ul>' +
        c.details.map(function (d) { return "<li>" + esc(d) + "</li>"; }).join("") +
        "</ul></div>"
      : "";

    $("modalBody").innerHTML =
      '<div class="modal-head">' +
      avatarMarkup(c, "modal-avatar") +
      '<div><div class="modal-name">' + esc(c.name) + '</div>' +
      '<div class="modal-title">' + esc(c.title) + '</div></div></div>' +
      '<div class="modal-stats">' +
      '<span class="stat">阵营：' + esc(c.camp || "未定") + '</span>' +
      '<span class="stat">状态：' + st.label + '</span>' +
      '<span class="stat">危险等级：Lv.' + esc(c.level || "?") + '</span>' +
      (c.qq ? '<span class="stat">' + esc(c.qq) + '</span>' : "") +
      '</div>' +
      (c.ability ? '<div class="modal-block"><h4>能力 / 异常特征</h4><p>' + esc(c.ability) + '</p></div>' : "") +
      (c.story ? '<div class="modal-block"><h4>背景故事</h4><p>' + esc(c.story).replace(/\n/g, "<br>") + '</p></div>' : "") +
      details +
      (c.quote ? '<div class="modal-quote">“' + esc(c.quote) + '”</div>' : "");

    $("charModal").hidden = false;
    document.body.style.overflow = "hidden";
  }

  function closeModal() {
    $("charModal").hidden = true;
    document.body.style.overflow = "";
  }

  /* ---------- 留言板 ---------- */
  function initGuestbook() {
    var g = CFG.giscus || {};
    if (!g.enabled) return;
    if (!g.repo || !g.repoId || !g.categoryId) return;

    var box = document.querySelector(".guestbook-box");
    $("giscus-placeholder").hidden = true;

    var s = document.createElement("script");
    s.src = "https://giscus.app/client.js";
    s.setAttribute("data-repo", g.repo);
    s.setAttribute("data-repo-id", g.repoId);
    s.setAttribute("data-category", g.category || "Announcements");
    s.setAttribute("data-category-id", g.categoryId);
    s.setAttribute("data-mapping", g.mapping || "pathname");
    s.setAttribute("data-strict", "0");
    s.setAttribute("data-reactions-enabled", "1");
    s.setAttribute("data-emit-metadata", "0");
    s.setAttribute("data-input-position", "bottom");
    s.setAttribute("data-theme", "dark");
    s.setAttribute("data-lang", g.lang || "zh-CN");
    s.crossOrigin = "anonymous";
    s.async = true;
    box.appendChild(s);
  }

  /* ---------- 路由 ---------- */
  var ROUTES = { home: "view-home", characters: "view-characters", guestbook: "view-guestbook" };

  function parseRoute() {
    var h = location.hash.replace(/^#\/?/, "") || "home";
    return ROUTES[h] ? h : "home";
  }

  function navigate() {
    var route = parseRoute();
    state.route = route;
    Object.keys(ROUTES).forEach(function (k) {
      var el = $(ROUTES[k]);
      if (el) el.classList.toggle("active", k === route);
    });
    document.querySelectorAll(".nav-link").forEach(function (a) {
      a.classList.toggle("active", a.getAttribute("data-view") === route);
    });
    window.scrollTo(0, 0);

    if (route === "characters") {
      renderFilters();
      renderChars();
    }
  }

  /* ---------- 工具 ---------- */
  function esc(s) {
    return String(s == null ? "" : s)
      .replace(/&/g, "&amp;")
      .replace(/</g, "&lt;")
      .replace(/>/g, "&gt;")
      .replace(/"/g, "&quot;");
  }

  function unique(arr) {
    var seen = {}, out = [];
    arr.forEach(function (x) {
      if (x && !seen[x]) { seen[x] = 1; out.push(x); }
    });
    return out;
  }

  /* ---------- 事件绑定 ---------- */
  function bindEvents() {
    // 筛选 chips（事件委托）
    $("campChips").addEventListener("click", function (e) {
      var b = e.target.closest(".chip");
      if (!b) return;
      state.camp = b.getAttribute("data-camp");
      renderFilters();
      renderChars();
    });
    $("statusChips").addEventListener("click", function (e) {
      var b = e.target.closest(".chip");
      if (!b) return;
      state.status = b.getAttribute("data-status");
      renderFilters();
      renderChars();
    });

    // 搜索
    $("searchInput").addEventListener("input", function (e) {
      state.keyword = e.target.value.trim();
      renderChars();
    });

    // 角色卡片 → 弹窗（事件委托）
    $("charGrid").addEventListener("click", function (e) {
      var card = e.target.closest(".char-card");
      if (!card) return;
      openModal(parseInt(card.getAttribute("data-idx"), 10));
    });

    // 弹窗关闭
    document.querySelectorAll("[data-close]").forEach(function (el) {
      el.addEventListener("click", closeModal);
    });
    document.addEventListener("keydown", function (e) {
      if (e.key === "Escape" && !$("charModal").hidden) closeModal();
    });

    window.addEventListener("hashchange", navigate);
  }

  /* ---------- 启动 ---------- */
  function init() {
    applySiteInfo();
    renderWorld();
    initGuestbook();
    bindEvents();
    navigate();
  }

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", init);
  } else {
    init();
  }
})();
