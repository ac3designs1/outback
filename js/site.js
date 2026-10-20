(function () {
  var JOIN = "y994rg5";
  var STORE_URL = "";

  function setText(sel, value) {
    document.querySelectorAll(sel).forEach(function (node) {
      node.textContent = value;
    });
  }

  async function loadStatus() {
    if (!document.querySelector("[data-status]")) return;
    try {
      var response = await fetch("https://frontend.cfx-services.net/api/servers/single/" + JOIN);
      if (!response.ok) throw new Error("status");
      var payload = await response.json();
      var data = payload && payload.Data;
      if (!data) throw new Error("nodata");
      var players = data.clients != null ? data.clients : 0;
      var max = data.sv_maxclients || 200;
      setText("[data-players]", String(players));
      setText("[data-max]", String(max));
      setText("[data-status-label]", "Online");
      document.querySelectorAll("[data-status-dot]").forEach(function (dot) {
        dot.classList.remove("status-checking", "status-unknown");
        dot.classList.add("status-online");
      });
      if (data.vars && data.vars.peak_players) setText("[data-peak]", String(data.vars.peak_players));
    } catch (err) {
      setText("[data-status-label]", "Status unavailable");
      document.querySelectorAll("[data-status-dot]").forEach(function (dot) {
        dot.classList.remove("status-checking", "status-online");
        dot.classList.add("status-unknown");
      });
    }
  }

  function copyText(value) {
    if (navigator.clipboard && window.isSecureContext) {
      return navigator.clipboard.writeText(value);
    }
    return new Promise(function (resolve, reject) {
      var area = document.createElement("textarea");
      area.value = value;
      area.setAttribute("readonly", "");
      area.style.position = "fixed";
      area.style.left = "-9999px";
      document.body.appendChild(area);
      area.select();
      try {
        document.execCommand("copy") ? resolve() : reject();
      } catch (err) {
        reject(err);
      } finally {
        area.remove();
      }
    });
  }

  document.querySelectorAll("[data-copy]").forEach(function (button) {
    button.addEventListener("click", function () {
      var value = button.getAttribute("data-copy");
      var original = button.textContent;
      copyText(value).then(function () {
        button.textContent = "Copied";
        setTimeout(function () { button.textContent = original; }, 1400);
      }).catch(function () {
        button.textContent = "Select the command";
        setTimeout(function () { button.textContent = original; }, 1600);
      });
    });
  });

  var toggle = document.querySelector("[data-nav-toggle]");
  var menu = document.querySelector("[data-mobile-nav]");
  if (toggle && menu) {
    toggle.addEventListener("click", function () {
      var open = menu.classList.toggle("is-open");
      toggle.setAttribute("aria-expanded", open ? "true" : "false");
    });
  }

  var docsToggle = document.querySelector("[data-docs-toggle]");
  var sidebar = document.querySelector("[data-docs-sidebar]");
  if (docsToggle && sidebar) {
    docsToggle.addEventListener("click", function () {
      var open = sidebar.classList.toggle("is-open");
      docsToggle.setAttribute("aria-expanded", open ? "true" : "false");
    });
    document.addEventListener("click", function (event) {
      if (!sidebar.classList.contains("is-open")) return;
      if (sidebar.contains(event.target) || docsToggle.contains(event.target)) return;
      sidebar.classList.remove("is-open");
      docsToggle.setAttribute("aria-expanded", "false");
    });
  }

  document.querySelectorAll("[data-filter]").forEach(function (input) {
    var root = document.querySelector(input.getAttribute("data-filter"));
    var count = document.querySelector("[data-filter-count]");
    if (!root) return;
    input.addEventListener("input", function () {
      var query = input.value.trim().toLowerCase();
      var shown = 0;
      root.querySelectorAll("[data-item]").forEach(function (item) {
        var match = !query || item.textContent.toLowerCase().indexOf(query) !== -1;
        item.hidden = !match;
        if (match) shown += 1;
      });
      if (count) count.textContent = query ? shown + " match" + (shown === 1 ? "" : "es") : "";
    });
  });

  async function loadDiscord() {
    var slot = document.querySelector("[data-discord]");
    if (!slot) return;
    try {
      var response = await fetch("https://discord.com/api/guilds/1357267503478345758/widget.json");
      if (!response.ok) throw new Error("discord");
      var data = await response.json();
      if (data.presence_count == null) throw new Error("count");
      setText("[data-discord-count]", String(data.presence_count));
      slot.hidden = false;
    } catch (err) {
      slot.hidden = true;
    }
  }

  var sideNav = document.querySelector(".sidebar-nav");
  if (sideNav) {
    var searchWrap = document.createElement("div");
    searchWrap.className = "side-search";
    searchWrap.innerHTML = '<input type="search" placeholder="Search docs" aria-label="Search docs">';
    sideNav.insertBefore(searchWrap, sideNav.firstChild);
    searchWrap.querySelector("input").addEventListener("input", function (event) {
      var query = event.target.value.trim().toLowerCase();
      sideNav.querySelectorAll(".side-group").forEach(function (group) {
        var any = false;
        group.querySelectorAll(".side-link").forEach(function (link) {
          var show = !query || link.textContent.toLowerCase().indexOf(query) !== -1;
          link.hidden = !show;
          if (show) any = true;
        });
        group.hidden = !any;
        if (query && any) group.open = true;
      });
    });
    sideNav.querySelectorAll("a").forEach(function (link) {
      link.addEventListener("click", function () {
        if (sidebar) sidebar.classList.remove("is-open");
      });
    });
  }

  var path = location.pathname;
  document.querySelectorAll(".landing-nav-pill a, .mobile-nav a").forEach(function (link) {
    var href = link.getAttribute("href") || "";
    var current = false;
    if (href.indexOf("/store") === 0) current = path.indexOf("/store") === 0;
    else if (href.indexOf("/docs/rules") === 0) current = path.indexOf("/docs/rules") === 0 || path.indexOf("/gangs") !== -1;
    else if (href.indexOf("/docs/factions") === 0) current = path.indexOf("/docs/factions") === 0 && path.indexOf("/gangs") === -1;
    else if (href.indexOf("/docs") === 0) current = path.indexOf("/docs") === 0 && path.indexOf("/docs/rules") !== 0 && path.indexOf("/docs/factions") !== 0;
    if (current) link.setAttribute("aria-current", "page");
  });

  if (STORE_URL) {
    document.querySelectorAll("[data-store]").forEach(function (link) {
      link.href = STORE_URL;
      if (link.hasAttribute("data-store-label")) link.textContent = "Visit the store";
    });
    setText("[data-store-title]", "Support OutbackRP");
    setText("[data-store-text]", "Every purchase helps keep the server running.");
  }

  loadStatus();
  loadDiscord();
  setInterval(loadStatus, 60000);
  setInterval(loadDiscord, 60000);
})();
